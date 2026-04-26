# Bidpanion ↔ AI service — API contract (v1 draft)

**Audience:** Ervin (AI service) and Metin (Bidpanion frontend).
**Status:** draft, MVP. Pin a version and iterate before locking.
**Goal:** define the boundary between the Bidpanion product and the AI tender-analysis service so both sides can ship in parallel.

---

## 1. Scope

The AI service exposes two capabilities to Bidpanion:

1. **Tender Analysis** (a.k.a. "Zip to One Pager") — takes a tender ZIP / PDF / DOCX bundle and returns a structured `TenderSummary`.
2. **Tender Intake** (scraping) — exposes scraped tender metadata + downloadable documents from public portals (DTVP, ANKÖ, TED, etc.).

Both run as separate concerns. v1 prioritizes Analysis. Intake is sketched and can ship later.

This document is the source of truth for shapes that flow over the wire. The TypeScript representation lives in `src/data/tender-summary-schema.ts` and **must stay in sync**.

---

## 2. Auth & transport

- **Transport:** HTTPS, JSON.
- **Auth:** shared API key in `Authorization: Bearer <BIDPANION_AI_API_KEY>` header. Rotate via env, no per-user tokens in v1.
- **Idempotency:** `Idempotency-Key` header on `POST /v1/analyses` (Bidpanion-generated UUID v4). The server should dedupe within a 24h window.
- **Versioning:** path prefix `/v1`. Breaking changes → `/v2`.
- **Errors:** standard problem+json:
  ```json
  { "code": "INVALID_FILE", "message": "ZIP could not be opened", "details": { "file": "bundle.zip" } }
  ```

---

## 3. Tender Analysis

### 3.1 Job lifecycle

Async — analysis takes minutes for large tenders. Bidpanion does **not** block on the request.

```
queued → parsing → chunking → summarizing → completed
                                          ↘ failed
```

Bidpanion can either **poll** `GET /v1/analyses/:jobId` or **receive a webhook** when status hits `completed` / `failed`. Webhook is preferred to avoid polling cost.

### 3.2 File handoff — pick one

**Option A (recommended): presigned URLs.**
Bidpanion uploads the user's files to its own object storage (R2/S3) and passes presigned `GET` URLs to Ervin. Ervin downloads, processes, discards. No file ownership question, smaller AI server, no double upload.

**Option B (fallback): direct multipart upload.**
Multipart `POST /v1/analyses` with files in the request body. Simpler to start, but Ervin then owns storage of large blobs, and Bidpanion has to re-stream files from its own storage. Use only if presigning is blocked by infra.

The endpoint shape below covers Option A. Switch to multipart if needed.

### 3.3 Endpoints

#### `POST /v1/analyses`

Create a new analysis job.

Request:
```json
{
  "callbackUrl": "https://app.bidpanion.com/api/ai/webhook",
  "language": "EN",
  "profile": "standard",
  "files": [
    {
      "name": "00_Bewerbungsunterlage.pdf",
      "url": "https://r2.bidpanion.com/uploads/abc123/00_Bewerbungsunterlage.pdf?X-Amz-...",
      "contentType": "application/pdf",
      "sizeBytes": 4521233
    },
    {
      "name": "Antwortbogen.xlsx",
      "url": "https://r2.bidpanion.com/uploads/abc123/Antwortbogen.xlsx?X-Amz-...",
      "contentType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "sizeBytes": 91200
    }
  ]
}
```

Fields:
- `callbackUrl` — optional. If provided, Ervin POSTs the final `TenderAnalysisJob` here on completion or failure. Bidpanion verifies via `X-Bidpanion-Signature: sha256=<hmac>` header (HMAC of body with shared secret).
- `language` — `"EN"` or `"DE"` (default `"EN"`).
- `profile` — `"tight"` | `"standard"` | `"rich"` (default `"standard"`). Maps to summarizer.py profile.
- `files[]` — at least one. URLs must be reachable for at least 1 hour. ZIPs are unpacked server-side.

Response `202 Accepted`:
```json
{ "jobId": "01HZ7AQK2P3WX8Z9VYB6TM4K8R", "status": "queued" }
```

Errors:
- `400 INVALID_FILE` — unreachable URL, unsupported type
- `400 PAYLOAD_TOO_LARGE` — exceeds limit (suggest 250 MB total)
- `401 UNAUTHORIZED`
- `429 RATE_LIMITED` — `Retry-After` header set

#### `GET /v1/analyses/:jobId`

Poll a job. Returns the full `TenderAnalysisJob`.

Response `200`:
```json
{
  "jobId": "01HZ7AQK2P3WX8Z9VYB6TM4K8R",
  "status": "summarizing",
  "createdAt": "2026-04-26T10:11:00.000Z",
  "updatedAt": "2026-04-26T10:13:42.000Z",
  "progress": 0.62,
  "language": "EN",
  "profile": "standard"
}
```

When `status === "completed"`, the body also contains `result: TenderSummary` (see §4).
When `status === "failed"`, the body contains `error: { code, message }`.

#### Webhook: `POST <callbackUrl>`

Sent by Ervin on terminal status. Body is the full `TenderAnalysisJob`.

Headers:
- `X-Bidpanion-Signature: sha256=<hex hmac of raw body>`
- `Content-Type: application/json`

Bidpanion responds `200` on success. Ervin retries with exponential backoff up to 5× over 30 minutes on non-2xx.

---

## 4. The `TenderSummary` schema

The output schema is defined in `src/data/tender-summary-schema.ts` and produced by `src/summarizer.py` in the Tendr prototype. **30 real reference outputs** sit in `src/data/mock-tender-summaries/` and are the canonical examples — Ervin's pipeline must produce JSON in that exact shape.

Top-level fields (required unless noted):

| Field | Type | Notes |
|---|---|---|
| `Contracting Authority` | string | One line. Authority name + address. |
| `Project Description` | string | Bullets/markdown ok. Subject of contract, lots, term. |
| `Submission Deadline` | string | **Only** the offer deadline (Angebotsfrist). Other dates go in `Important Dates`. |
| `Important Dates` | string? | Question deadlines, binding period, etc. |
| `Scope & Requirements` | object | See §4.1 |
| `Supplier Eligibility` | object | See §4.2 |
| `Technical & Professional Ability` | object? | Personnel, headcount, references |
| `Company Referrals` | string? | Bidder reference projects |
| `Award Criteria` | string | MEAT, weights, etc. |
| `citations` | `Citation[]` | At least one per top-level field; required |

### 4.1 `Scope & Requirements`

```ts
{
  "Scope & Requirements": string,           // required, lot-structured if multiple lots
  "Contract Volume"?: string,
  "Place of Performance"?: string,
  "Standards & Certifications"?: string,
  "Subcontracting & Consortia"?: string,
  "Forms & e-Submission"?: string
}
```

**Lot rule (critical):** if the tender has lots, `Scope & Requirements` MUST be structured per lot (`Lot 1 — …`, `Lot 2 — …`), each with deliverables, key requirements, numeric thresholds, tools/years, SLAs. Don't just say "there are 3 lots".

### 4.2 `Supplier Eligibility`

```ts
{
  "Offer Submission Documents"?: string[],  // forms to fill, max 30 items
  "List of Documents"?: string[],           // eligibility proofs
  "Economic & Financial Standing"?: { "Minimum Turnover"?: string, "Turnover in Comparable Services"?: string },
  "Legal & Registration"?: {
    "Trade/Professional Register Entry"?: string,
    "Self-declarations (GWB §§123/124 or equivalent)"?: string,
    "Subcontractor Identification & Reliance"?: string
  }
}
```

### 4.3 `citations`

Every top-level field should map to at least one citation. Without citations, downstream UI can't render the "jump to source" chips that make the summary trustworthy.

```ts
type Citation = {
  field: string;     // e.g. "Scope & Requirements → Place of Performance"
  locator: string;   // e.g. "00 Bewerbungsunterlage SAP RPA geänd.pdf, p.4"
}
```

### 4.4 Hard rules (from summarizer.py)

- Never drop numeric thresholds (≥/≤), SLAs, mandatory annex references, exclusions.
- `Submission Deadline` is **only** the offer deadline. Other dates → `Important Dates`.
- Separate bidder/company references vs key-personnel references.
- Empty values are `""`, never `"N/A"` or `null`.
- Respect schema `maxLength` and `maxItems` (see `summarizer.py:schema_for_profile`).

### 4.5 Reference payload

See `src/data/mock-tender-summaries/_samples/sample-evn-sap-rpa.json` (and 2 siblings). These are real outputs and represent the agreed shape.

---

## 5. Tender Intake (scraping) — sketch for v2

Lower priority; ship after Analysis is solid. Expose scraped tender metadata so Bidpanion can populate the Dashboard / Board without an upload.

### 5.1 Endpoints

#### `GET /v1/tenders`

List scraped tenders. Query params:
- `source` — `DTVP` | `ANKÖ` | `TED` | `Vergabe24` | `eTendering` | `SIMAP` (multi-valued)
- `since` — ISO-8601, only tenders scraped after this time
- `limit` — default 50, max 200
- `cursor` — opaque pagination token

Response:
```json
{
  "items": [
    {
      "externalId": "DTVP-2026-001234",
      "title": "IT System Management and Helpdesk Services 2026–2028",
      "authority": "Federal Ministry for Digitalization",
      "source": "DTVP",
      "sourceUrl": "https://www.dtvp.de/example",
      "country": "DE",
      "cpvCode": "72253200-5",
      "noticeType": "Contract Notice",
      "deadline": "2026-02-26T12:00:00Z",
      "publishedAt": "2026-01-15T08:30:00Z",
      "estimatedValue": "€ 450,000 – 620,000",
      "scoreKeywords": [{ "keyword": "iam", "weight": 100 }]
    }
  ],
  "nextCursor": "eyJvZmZzZXQiOjUwfQ=="
}
```

#### `GET /v1/tenders/:externalId/documents`

Returns presigned URLs for the tender's documents (PDFs, annexes). Bidpanion stores them and feeds them back into `POST /v1/analyses` for processing.

```json
{
  "items": [
    { "name": "Bewerbungsunterlage.pdf", "url": "https://...", "sizeBytes": 4521233, "contentType": "application/pdf" }
  ]
}
```

Some sources redirect to external portals — flag those with `external: true` so Bidpanion can prompt the user.

### 5.2 Notes for Ervin

- Existing keyword ranking lives at `src/data/mock-tender-summaries/_scraping_keyword_ranking.json` — reuse the weights (most = 100, edge cases = 70).
- The scraper covers ANKÖ, Auftrag.at, DTVP, Provia, E-Vergabe, USP, WSTW. Extend incrementally.
- Polite scrape cadence: weekly per source is fine for MVP. Document each source's quirks (auth walls, captchas, redirect chains) in a separate `INTAKE_SOURCES.md`.

---

## 6. Open questions

Decide these before implementation locks in:

1. **Storage ownership** — confirm Option A (presigned URLs) vs Option B (multipart). Recommend A.
2. **PII / confidentiality** — tender documents may contain bidder data. Where does Ervin's service run? GDPR-friendly region?
3. **Webhook security** — confirm HMAC-SHA256 with shared secret is acceptable, or use signed JWT instead.
4. **Languages** — only EN/DE in v1? Some tenders are FR/IT.
5. **Retention** — how long does Ervin keep job results? Suggest 30 days for re-fetch, then purge.
6. **Rate limits** — typical concurrent jobs? Any per-tenant cap needed?
7. **Fit scoring** — is it part of this service, or does Bidpanion own it (the SoW lists it as a separate MVP item)? If Ervin: add a `POST /v1/fit-score` endpoint accepting `{ summary, companyProfile }`.

---

## 7. Change log

- **2026-04-26** — initial draft. Schema mirrors Tendr's `summarizer.py` v3.
