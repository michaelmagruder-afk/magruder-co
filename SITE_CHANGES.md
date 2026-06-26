# magruder.co — Site Change Log

Running record of all changes to the production site. Append-only. Each entry: date, what changed, why, commit(s).

---

## 2026-06-26

### Constraint article pages — left sidebar navigation (C01–C05)
**What:** Added a sticky left sidebar listing all 5 constraint articles to each individual constraint page (constraint-01.html through constraint-05.html). The sidebar marks the current page active (orange highlight, non-linked) and links to the other four. Removed the bottom series-nav block that previously served this purpose.
**Why:** User navigation between the 5-article series required scrolling to the bottom of each article. Left sidebar provides persistent in-series navigation visible while reading.
**CSS:** `.constraint-layout` grid (196px sidebar + 1fr body), `.constraint-sidebar` sticky block, `.c-current` active state, responsive collapse to flex pills at ≤900px.
**Bug fixed:** Initial push used `<nav class="constraint-sidebar">` — the page's global `nav { display:flex; align-items:center; justify-content:space-between; position:fixed }` rule caused sidebar items to scatter horizontally across the viewport at desktop width. Fixed by changing to `<div class="constraint-sidebar" role="navigation">` and adding explicit `display:block` to the sidebar CSS.
**Commits:**
- C01: `302b7202` (sidebar added), `de955fbb` (nav→div fix)
- C02: `da52a6a6` (sidebar added), `e48027b5` (nav→div fix)
- C03: `d048ed41` (sidebar added), `4da82436` (nav→div fix)
- C04: `36b41eaf` (sidebar added), `ad45c528` (nav→div fix)
- C05: `fc426b62` (sidebar added), `d0e1b9d9` (nav→div fix)

### q2-imperative — left sidebar navigation (Section 03)
**What:** Added the same sticky sidebar to the q2-imperative hub page's Section 03 ("The Five Named Constraints"), wrapping it in a `.constraint-wrapper` grid. Also applied the nav→div fix.
**Why:** Consistent in-series navigation with the individual constraint article pages.
**Commits:** `2529f5ea` (sidebar added), `f7ed250a` (nav→div fix)

### q2-imperative — "Read →" inline links for C03/C04/C05
**What:** Added `Read: [article title] →` links at the bottom of each constraint section in the q2-imperative hub, matching the existing links for C01/C02.
**Why:** Hub page was inconsistent — C01 and C02 had article links, C03–C05 did not.
**Commits:** included in q2-imperative push

### Constraint article pages — header/body alignment fix (C01–C05)
**What:** Fixed CSS so the article header left edge aligns with the body column. Changed header inner `max-width` from 760px→680px and added `margin:0 auto`.
**Why:** Article body was center-justified at 680px max-width, but the dark header block was left-justified at 760px — visually misaligned.
**Commits:**
- C01: `c8dadc3c`
- C02: `acd674a4`
- C03: `213609a9`
- C04: `62cb853e`
- C05: `2c5fa7d1`

### Favicon — fix MIME types, add to all pages, add /favicon.ico rewrite
**What:** Three-part fix for favicon not displaying on any page of magruder.co:
1. **Root cause fixed:** Both `_headers` and `netlify.toml` had a `/*` wildcard forcing `Content-Type: text/html` on ALL files, including images and SVGs. Browsers silently reject favicons served with the wrong MIME type. Fixed both files to scope header rules to specific extensions only (`/*.html`, `/*.svg`, `/*.png`, `/*.ico`).
2. **All pages covered:** Added `<link rel="icon">` tags to all 12 HTML pages. index.html already had them; the other 11 (advisory, constraint-01 through -05, cowork/index, privacy, q2-deck-review-1, q2-deck-review-2, q2-imperative) were missing them entirely.
3. **favicon.ico rewrite:** Added a Netlify redirect rule so `/favicon.ico` serves `/images/favicon.png` — covers browsers that ignore link tags and always request the root ICO path.
**Why:** Favicon assets (`images/favicon.svg`, `images/favicon.png`) were valid and correctly referenced in index.html, but no favicon appeared on any page. MIME type misconfiguration was the root cause — browsers discard resources with wrong Content-Type for security reasons.
**Verified live:** `curl -sI https://magruder.co/images/favicon.svg` → `content-type: image/svg+xml`; `/favicon.ico` → `content-type: image/x-icon`.
**Commits:**
- `b3457bf8` — fix: correct MIME types in `_headers`
- `e5aa7b7b` — fix: remove wildcard Content-Type in `netlify.toml`
- favicon link tags + `/favicon.ico` rewrite were already committed in the constraint sidebar session (included in tree above)
**Deploys triggered:** 2026-06-26 via Netlify admin API (site `75e37729`); all builds state=ready.

### New constraint article pages — C03, C04, C05
**What:** Built and deployed three new article pages:
- `constraint-03.html` — "Why Your AI Program Cannot Account for Itself"
- `constraint-04.html` — "The AI Budget You Don't Know You Have"
- `constraint-05.html` — "Nobody Owns the AI Failure, and You Are Paying for It"
**Why:** Completing the 5-article Q2 Imperative series. C01 and C02 were already live.
**Commits:** pushed earlier in session (see git log for constraint-03/04/05 initial commits)

---

## [Prior sessions — backfill pending]

C01 (`constraint-01.html`) and C02 (`constraint-02.html`) were built and deployed in earlier sessions. Exact commit hashes not captured here — see GitHub history for `michaelmagruder-afk/magruder-co`.

---

## Format guide (for future entries)

```
### [page or feature] — [short description]
**What:** what changed on the site
**Why:** the reason / user problem solved
**Bug fixed:** (if applicable) what broke and how it was resolved
**Commits:** hash per file or grouped
```
