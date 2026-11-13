# The Daily Grievance

A satirical newspaper that tells the same true male-versus-female statistic twice: once from a wounded male angle, once from a wounded female angle. Readers switch with the Male / Female toggle at the top.

This is parody. The numbers are real and always linked. The quotes, named people and campaign demands are invented. Keep the tone playful, not hateful.

The live site is intended to be published at [https://wilksy.github.io/Crisis/](https://wilksy.github.io/Crisis/) from the `main` branch root, using GitHub Pages. There is no build step.

## Local preview

Serve the repository root (this folder) over HTTP so the story JSON can be fetched:

```bash
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000). Opening `index.html` as a file will not load the stories.

## How the site works

- `index.html` is the front page. It loads the newest story in `stories/index.json`, unless the URL has `?date=YYYY-MM-DD`.
- `archive.html` lists every edition. Each entry opens the front page at `./?date=YYYY-MM-DD`.
- The chosen angle (male or female) is stored in `localStorage` under the key `grievance-angle`, so it is remembered on the next visit.
- All asset and data paths are relative (`./css/styles.css`, `./stories/2026-11-13.json`, and so on) so the site works at `https://wilksy.github.io/Crisis/` as well as at the root of a local server.
- `.nojekyll` tells GitHub Pages not to process the files with Jekyll.

## Adding a day’s story

Do these two things, then commit and push to `main`. Newest stories must be listed first.

### 1. Create `stories/YYYY-MM-DD.json`

Use the date of the edition as the filename, for example `stories/2026-11-14.json`. The file must follow this shape:

```json
{
  "date": "2026-11-14",
  "stat_summary": "One or two sentences with the real figures, written in plain English.",
  "stat_source_title": "Name of the official source, including the year",
  "stat_source_url": "https://example.gov.uk/the-official-publication",
  "male": {
    "headline": "The male-angle headline",
    "standfirst": "A single-sentence introduction under the headline.",
    "body_paragraphs": [
      "First paragraph.",
      "Second paragraph, often including the invented quote.",
      "Third paragraph.",
      "Closing paragraph."
    ],
    "pull_quote": "A short, punchy line pulled from the article, without wrapping quotation marks."
  },
  "female": {
    "headline": "The female-angle headline",
    "standfirst": "A single-sentence introduction under the headline.",
    "body_paragraphs": [
      "First paragraph.",
      "Second paragraph, often including the invented quote.",
      "Third paragraph.",
      "Closing paragraph."
    ],
    "pull_quote": "A short, punchy line pulled from the article, without wrapping quotation marks."
  }
}
```

`date` must match the filename. `stat_source_url` must point to the real source of the figures. Invented people and quotes belong only in `body_paragraphs` and `pull_quote`, never in `stat_summary`.

### 2. Add a line to the top of `stories/index.json`

This file is an array of every edition, **newest first**. Insert a new object at the top:

```json
[
  {
    "date": "2026-11-14",
    "male_headline": "The male-angle headline",
    "female_headline": "The female-angle headline"
  },
  {
    "date": "2026-11-13",
    "male_headline": "Road Warriors: Men Cover 916 Extra Miles a Year While Society Looks the Other Way",
    "female_headline": "Death by a Thousand Errands: Women Make More Trips Than Men, and Experts Say It's No Coincidence"
  }
]
```

The two headlines should match the ones in that day’s story file. Once this is pushed to `main`, the front page will show the new edition automatically. No other files need to change.

## File list

- `index.html` — front page
- `archive.html` — full archive
- `css/styles.css` — newspaper styles (navy for the male angle, crimson for the female)
- `js/app.js` — loads stories, handles the toggle, archive and dates
- `stories/index.json` — catalogue of editions, newest first
- `stories/YYYY-MM-DD.json` — one file per edition
- `favicon.svg` — monogram
- `.nojekyll` — required for GitHub Pages
