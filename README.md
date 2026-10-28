# Claus Hoerandner Portfolio

The site is published from the master branch with GitHub Pages. English content is in the HTML; German translations are stored in data-de attributes. Keep both versions synchronized.

## Site URL

Edit `base_url` in `site.config.json`, then run:

```sh
python tools/update_site_urls.py
```

Commit the regenerated HTML and contact card along with the configuration. Canonical and Open Graph tags remain static so they work without JavaScript. Configure a future custom domain in GitHub Pages separately.

## Résumé download

The hero and contact buttons download the existing `Claus_Hoerandner_Resume.docx` from the repository root. Every page opens in English; visitors can switch to German with the language button.

## Content privacy

Performance evaluations are intentionally excluded. Do not re-add review PDFs, manager feedback, or old history from pre-cleanup clones. Use a fresh clone after the history rewrite rather than merging the old history.

## Local preview

```sh
python -m http.server 8766
```

The close command center uses fictional data and stores demo changes in the visitor's browser.
