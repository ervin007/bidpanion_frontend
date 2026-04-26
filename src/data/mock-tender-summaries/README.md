# Mock tender summaries

30 real structured tender summaries pulled from the Tendr prototype repo
(https://github.com/suad-b/Tendr). Used as mock data for:

- The `TenderSummary` shape produced by Ervin's AI service
  (see `src/data/tender-summary-schema.ts`)
- Quick Analysis demo flows (upload ZIP → show summary)
- Tender detail brief sections rendered without a live backend

## Structure

```
mock-tender-summaries/
├── <tender folder>/
│   └── <tender folder>_summary.json   # one TenderSummary per tender
├── _human_reference_summaries.csv     # human-written summaries Ervin uses for eval
└── _scraping_keyword_ranking.json     # keyword scoring used by the scraper
```

## Notes

- Filenames preserved from upstream so they stay matchable to the human reference CSV.
- Files starting with `_` are auxiliary (not tender summaries themselves) — exclude them when iterating.
- Mostly German content (DACH tenders). Ervin's pipeline can output EN or DE.
