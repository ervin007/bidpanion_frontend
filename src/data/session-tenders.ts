"use client";

import { useCallback, useEffect, useState } from "react";
import type { Tender } from "./bidpanion";
import type { TenderSummary } from "./tender-summary-schema";
import { MOCK_TENDERS } from "./bidpanion";

const STORAGE_KEY = "bidpanion:session-tenders:v1";
const OVERRIDES_KEY = "bidpanion:tender-overrides:v1";
const SUMMARIES_KEY = "bidpanion:tender-summaries:v1";

type TenderOverride = Partial<Pick<Tender, "boardColumn" | "status" | "deleted">>;

interface PersistedState {
  sessionTenders: Tender[];
  overrides: Record<string, TenderOverride>;
  summaries: Record<string, TenderSummary>;
}

function emptyState(): PersistedState {
  return { sessionTenders: [], overrides: {}, summaries: {} };
}

function readState(): PersistedState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      sessionTenders: parsed.sessionTenders ?? [],
      overrides: parsed.overrides ?? {},
      summaries: parsed.summaries ?? {},
    };
  } catch {
    return emptyState();
  }
}

function writeState(state: PersistedState) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent("bidpanion:tenders-changed"));
}

// Legacy keys cleanup — single combined key wins.
function migrate() {
  if (typeof window === "undefined") return;
  if (
    window.sessionStorage.getItem(OVERRIDES_KEY) ||
    window.sessionStorage.getItem(SUMMARIES_KEY)
  ) {
    window.sessionStorage.removeItem(OVERRIDES_KEY);
    window.sessionStorage.removeItem(SUMMARIES_KEY);
  }
}

function applyOverrides(t: Tender, overrides: Record<string, TenderOverride>): Tender {
  const ov = overrides[t.id];
  if (!ov) return t;
  return { ...t, ...ov };
}

export function useAllTenders() {
  const [state, setState] = useState<PersistedState>(emptyState);

  useEffect(() => {
    migrate();
    setState(readState());
    const onChange = () => setState(readState());
    window.addEventListener("bidpanion:tenders-changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("bidpanion:tenders-changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const tenders: Tender[] = [
    ...MOCK_TENDERS.map((t) => applyOverrides(t, state.overrides)),
    ...state.sessionTenders.map((t) => applyOverrides(t, state.overrides)),
  ].filter((t) => !t.deleted);

  const addSessionTender = useCallback((tender: Tender, summary?: TenderSummary) => {
    const next = readState();
    next.sessionTenders = [
      tender,
      ...next.sessionTenders.filter((t) => t.id !== tender.id),
    ];
    if (summary) next.summaries[tender.id] = summary;
    writeState(next);
  }, []);

  const updateOverride = useCallback((id: string, patch: TenderOverride) => {
    const next = readState();
    next.overrides[id] = { ...(next.overrides[id] ?? {}), ...patch };
    writeState(next);
  }, []);

  const removeFromBoard = useCallback(
    (id: string) => {
      updateOverride(id, { boardColumn: undefined });
    },
    [updateOverride],
  );

  const getSummary = useCallback(
    (id: string): TenderSummary | undefined => state.summaries[id],
    [state.summaries],
  );

  return {
    tenders,
    sessionTenders: state.sessionTenders,
    addSessionTender,
    updateOverride,
    removeFromBoard,
    getSummary,
  };
}

// Server-safe: returns the static MOCK_TENDERS only. For server components / SSR fallbacks.
export function getStaticTenders(): Tender[] {
  return MOCK_TENDERS;
}
