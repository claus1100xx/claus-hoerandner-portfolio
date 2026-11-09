# Claus Hoerandner Portfolio

The site is published from the master branch with GitHub Pages. English content is in the HTML; German translations are stored in data-de attributes. Keep both versions synchronized.

## Site URL

Edit `base_url` in `site.config.json`, then run:

```sh
python tools/update_site_urls.py
```

Commit the regenerated HTML and contact card along with the configuration. Canonical and Open Graph tags remain static so they work without JavaScript. Configure a future custom domain in GitHub Pages separately.

## Résumé download

The hero and contact buttons use GitHub’s direct raw-file route to download the existing `Claus_Hoerandner_Resume.docx` from the repository root. Every page opens in English; visitors can switch to German with the language button.

## Content privacy

Performance evaluations are intentionally excluded. Do not re-add review PDFs, manager feedback, or old history from pre-cleanup clones. Use a fresh clone after the history rewrite rather than merging the old history.

## Local preview

```sh
python -m http.server 8766
```

The close command center uses fictional data and stores demo changes in the visitor's browser.

## Conversational finance demo

`finance-demo.html` is a bilingual, deterministic agent simulation, not a live LLM. `finance-demo-data.js` contains an explicitly fictional USD ledger for April–September 2026. `finance-demo-engine.js` plans supported financial questions and calculates totals; `finance-demo.js` renders the conversation, charts, source rows and downloads. Questions stay in page memory and are never submitted to a server.

The guided walkthrough starts with the budget gap, narrows the same month to Europe, and opens the supporting ledger rows. The demo also supports actual versus budget, regional and monthly trends, and comparisons between two months or two quarters. Profit comparisons show the revenue and expense contributions to the change. Source inspection and CSV export include both periods. Keep the simulation disclosure visible.

Run the relevant checks with `node tools/test-finance-engine.cjs` and the browser smoke test documented in that file. The public demo runs without a build step.
