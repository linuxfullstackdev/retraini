# Tech Tutorials — Hugo source

A calm, library-feel static tutorial site built on **Hugo**. Zero JS framework,
zero build step beyond Hugo itself, zero backend. Reading progress and font
preferences live in `localStorage`.

> This repository is the **source** for the site. Generate the static HTML
> with `hugo` and serve the resulting `public/` folder from any static host
> (Netlify, Cloudflare Pages, GitHub Pages, S3 + CloudFront, …).

## Table of contents

1. [Quick start](#quick-start)
2. [Project layout](#project-layout)
3. [Content model](#content-model)
4. [Front-matter reference](#front-matter-reference)
5. [Pastel theme palette](#pastel-theme-palette)
6. [Adding content](#adding-content)
7. [Search index](#search-index)
8. [Progress tracking](#progress-tracking)
9. [Font-size settings](#font-size-settings)
10. [Ad slots](#ad-slots)
11. [Multi-language code tabs](#multi-language-code-tabs)
12. [SEO](#seo)
13. [Performance notes](#performance-notes)
14. [Customizing](#customizing)

---

## Quick start

You need **Hugo Extended ≥ 0.121** installed.

```bash
# macOS  : brew install hugo
# Linux  : apt-get install hugo   (or download from https://gohugo.io/installation/)
# Windows: choco install hugo-extended

git clone <your-repo> tech_tut_site
cd tech_tut_site

hugo server -D          # local dev server with drafts visible at http://localhost:1313/
hugo --minify           # production build → ./public
```

> The site does **not** depend on any external Hugo theme or module. All
> layouts ship in `layouts/` at the project root and all assets in `static/`
> at the project root — Hugo picks them up directly without a `theme = "..."`
> entry in `config.toml`.
>
> **Troubleshooting** — if `hugo server` ever fails with
> `failed to load modules: module "" not found in ".../themes"`, it means a
> `theme = "..."` line (even an empty string) has been re-introduced into
> `config.toml`. Remove it and Hugo will use the root `layouts/` and
> `static/` directly.

---

## Project layout

```
tech_tut_site/
├── config.toml              # site config + output formats (incl. JSON for /index.json)
├── archetypes/              # `hugo new` templates with sensible defaults
│   ├── default.md
│   ├── track.md
│   ├── course.md
│   └── chapter.md
├── content/
│   ├── _index.md            # home page (hero + featured courses)
│   ├── tracks/              # all learning tracks live under here
│   │   └── complete-dsa-mastery/
│   │       ├── _index.md                   ← track
│   │       └── two-pointer-algorithms/
│   │           ├── _index.md               ← course
│   │           ├── chapter-01.md           ← chapter
│   │           ├── chapter-02.md
│   │           └── chapter-03.md
│   ├── search.md            # /search/ — vanilla-JS live search
│   ├── settings.md          # /settings/ — font scale slider
│   ├── profile.md           # /profile/ — completion progress
│   └── about.md, contact.md, privacy.md, terms.md, faq.md
├── data/
│   ├── menu.yaml            # 2-level nav source of truth
│   └── courses.yaml         # tracks → courses → chapters map (for profile %)
├── layouts/
│   ├── _default/            # baseof, single, list, 404, search, settings, profile
│   ├── index.html           # home page layout
│   ├── index.json           # search index (emitted at /index.json)
│   ├── partials/            # head, seo, header, menu, footer, sidebar, ad-slot, cards
│   ├── shortcodes/          # {{< ad >}} etc.
│   ├── tracks/              # list (all tracks) + single (one track)
│   ├── courses/             # single (one course)
│   └── chapters/            # single (chapter content page)
└── static/
    ├── css/main.css
    ├── js/app.js, progress.js, settings.js, search.js
    ├── images/              # drop logo / og-default / favicons here
    ├── robots.txt
    └── manifest.webmanifest
```

---

## Content model

The hierarchy is intentionally simple:

```
Track  →  Course  →  Chapter
```

- A **track** is a curated curriculum (e.g. "Complete DSA Mastery").
- A **course** is a focused topic inside a track (e.g. "Two-Pointer Algorithms").
- A **chapter** is one lesson inside a course.

Hugo treats each level as a section because of the file structure:
`content/tracks/<track>/<course>/<chapter>.md`. The layouts referenced by the
`type` front-matter field are:

| Page kind | `type`        | Layout used                        |
|-----------|---------------|------------------------------------|
| Track     | `tracks`      | `layouts/tracks/single.html`       |
| Course    | `courses`     | `layouts/courses/single.html`      |
| Chapter   | `chapters`    | `layouts/chapters/single.html`     |

The archetypes already set the right `type` value, so `hugo new` does the
right thing automatically (see below).

---

## Front-matter reference

Every page can specify the following SEO + visual fields. Defaults come from
`config.toml > [params]`.

| Field           | Type       | Used by                         | Default                  |
|-----------------|------------|----------------------------------|--------------------------|
| `title`         | string     | `<title>`, og:title, h1          | _required_               |
| `description`   | string     | meta + og + twitter description  | site `description`       |
| `keywords`      | []string   | meta keywords                    | site `keywords`          |
| `author`        | string     | meta + JSON-LD                   | site `author`            |
| `canonical`     | string     | canonical URL                    | `.Permalink`             |
| `ogImage`       | string     | og:image, twitter:image          | site `ogImage`           |
| `ogType`        | string     | og:type                          | `website` / `article`    |
| `twitterCard`   | string     | twitter:card                     | `summary_large_image`    |
| `robots`        | string     | meta robots                      | `index, follow`          |
| `theme`         | string     | pastel CSS variant               | `sky`                    |
| `summary`       | string     | shown on cards / page header     | _none_                   |
| `tags`          | []string   | article tags + search index      | _none_                   |

Track-specific:

| `level`, `estimatedHours`, `courseCount` |

Course-specific:

| `level`, `estimatedHours`, `chapterCount`, `prerequisites` |

Chapter-specific:

| `order` (sort key), `estimatedMinutes` |

---

## Pastel theme palette

Set `theme: "<name>"` on any page to color its card and title bar. Each theme
exposes a pastel background and a darker title-bar variant with white text.

| Name       | Background  | Title bar  |
|------------|-------------|------------|
| `orange`   | `#FFE5CC`   | `#FFB36B`  |
| `lime`     | `#E7F5C9`   | `#B4D26A`  |
| `sky`      | `#DCEEFB`   | `#7BB6E3`  |
| `lavender` | `#E7E2F4`   | `#9F8FCB`  |
| `peach`    | `#FFE0D6`   | `#F5A48A`  |
| `mint`     | `#D6F1E2`   | `#7AC9A1`  |
| `rose`     | `#FBE0EA`   | `#E89AB3`  |
| `coral`    | `#FFD9D2`   | `#F08A7A`  |
| `butter`   | `#FFF1C2`   | `#E3C56B`  |
| `sand`     | `#F1E7D6`   | `#C9B187`  |
| `neutral`  | `#cfd2d8`   | `#2d3142`  |

To add or tweak palettes, edit the `.theme-*` rules in `static/css/main.css`.

---

## Adding content

### A new track

```bash
hugo new tracks/<track-slug>/_index.md --kind track
# or with the default archetype:
hugo new tracks/<track-slug>/_index.md
```

Open the generated `_index.md` and edit `title`, `summary`, `theme`, etc.

### A new course inside a track

```bash
hugo new tracks/<track-slug>/<course-slug>/_index.md --kind course
```

### A new chapter inside a course

```bash
hugo new tracks/<track-slug>/<course-slug>/chapter-04.md --kind chapter
```

Then **register it in `data/courses.yaml`** so the profile page can compute
progress for that chapter.

> The data file is the single source of truth for "what counts as 100%
> complete" on the profile page. Keep it in sync as you add chapters.

---

## Search index

`layouts/index.json` emits `/index.json` with one entry per regular page and
section. The format is:

```json
[
  {
    "title": "...", "summary": "...", "description": "...",
    "content": "first 600 chars of plain text",
    "url": "/tracks/.../",
    "section": "tracks", "type": "chapters",
    "tags": [], "theme": "orange", "date": "2026-01-21"
  }
]
```

`static/js/search.js` fetches it once and runs a tiny token-based scoring
function entirely in the browser. No external service. Works offline once
the page is cached.

---

## Progress tracking

`static/js/progress.js` exposes a tiny global API on `window`:

```js
ttsMarkComplete('/tracks/foo/bar/chapter-01/');
ttsMarkIncomplete('/tracks/foo/bar/chapter-01/');
ttsIsComplete('/tracks/foo/bar/chapter-01/');
ttsResetProgress();
```

Storage key: `localStorage['ttsProgress']` is a JSON object `{ path: true }`.

The "Mark as complete" button on every chapter page is auto-wired via the
`data-mark-complete` and `data-page-path` attributes — no manual setup
needed in markdown.

The profile page reads `data/courses.yaml`, intersects with the localStorage
data, and renders per-course and overall progress bars.

---

## Font-size settings

`/settings/` shows preset buttons (S, M, L, XL) and a fine-grained slider.
The chosen scale is written to `localStorage['ttsFontScale']` and applied
**before first paint** by a tiny inline script in `layouts/_default/baseof.html`,
so there is no flash.

The CSS variable `--user-font-scale` on `:root` is multiplied into
`html { font-size }` (see `static/css/main.css`).

---

## Ad slots

Use the partial:

```go-template
{{ partial "ad-slot.html" (dict "slot" "sidebar-top" "size" "300x250") }}
```

…or the markdown shortcode:

```markdown
{{</* ad slot="chapter-inline-1" size="responsive" */>}}
```

Sizes recognised in CSS: `300x250`, `300x600`, `728x90`, `responsive`.

The output is an empty `<div>` with an HTML comment `<!-- AdSense slot:
sidebar-top (300x250) -->` and an "Advertisement" label, so it is
visually obvious in development and trivially replaceable with real ad
markup later.

Globally hide every slot by setting `params.showAds = false` in
`config.toml`.

---

## Multi-language code tabs

The site now supports **tabbed multi-language code blocks** via shortcodes while keeping:

- Hugo/Chroma syntax highlighting (no Prism dependency)
- line numbers (`lineNos=table`)
- existing copy button behavior
- light and dark theme styling
- keyboard-accessible tabs (`←`, `→`, `Home`, `End`)
- mobile dropdown fallback for language selection

### Markdown usage

Single Code

```python
def remove_duplicates(nums):
    if not nums:
        return 0
    write = 1
    for read in range(1, len(nums)):
        if nums[read] != nums[read - 1]:
            nums[write] = nums[read]
            write += 1
    return write
```

Multiple code tabs

{{< code-tabs >}}
{{< code-tab lang="python" title="Python" >}}
```python
def fib(n: int) -> int:
    return n if n < 2 else fib(n - 1) + fib(n - 2)
```
{{< /code-tab >}}

{{< code-tab lang="java" title="Java" >}}
```java
class Fib {
    static int fib(int n) {
        return n < 2 ? n : fib(n - 1) + fib(n - 2);
    }
}
```
{{< /code-tab >}}

{{< code-tab lang="golang" title="Golang" >}}
```golang
func fib(n int) int {
    if n < 2 { return n }
    return fib(n-1) + fib(n-2)
}
```
{{< /code-tab >}}

{{< code-tab lang="rust" title="Rust" >}}
```rust
fn fib(n: u32) -> u32 {
    if n < 2 { n } else { fib(n - 1) + fib(n - 2) }
}
```
{{< /code-tab >}}

{{< code-tab lang="php" title="PHP" >}}
```php
function fib(int $n): int {
    return $n < 2 ? $n : fib($n - 1) + fib($n - 2);
}
```
{{< /code-tab >}}

{{< code-tab lang="node" title="Node.js" >}}
```javascript
function fib(n) {
  return n < 2 ? n : fib(n - 1) + fib(n - 2);
}
module.exports = { fib };
```
{{< /code-tab >}}

{{< code-tab lang="javascript" title="JavaScript" >}}
```javascript
export const fib = (n) => (n < 2 ? n : fib(n - 1) + fib(n - 2));
```
{{< /code-tab >}}
{{< /code-tabs >}}


{{< code-tabs >}}
{{< code-tab title="Python" >}}
```python
def fib(n: int) -> int:
    return n if n < 2 else fib(n - 1) + fib(n - 2)
```
{{< /code-tab >}}
{{< /code-tabs >}}

Use a parent `code-tabs` shortcode and one `code-tab` per language:

```markdown
{{</* code-tabs */>}}
{{</* code-tab lang="python" title="Python" */>}}
def fib(n: int) -> int:
    return n if n < 2 else fib(n - 1) + fib(n - 2)
{{</* /code-tab */>}}

{{</* code-tab lang="java" title="Java" */>}}
class Fib {
    static int fib(int n) {
        return n < 2 ? n : fib(n - 1) + fib(n - 2);
    }
}
{{</* /code-tab */>}}

{{</* code-tab lang="golang" title="Golang" */>}}
func fib(n int) int {
    if n < 2 { return n }
    return fib(n-1) + fib(n-2)
}
{{</* /code-tab */>}}

{{</* code-tab lang="rust" title="Rust" */>}}
fn fib(n: u32) -> u32 {
    if n < 2 { n } else { fib(n - 1) + fib(n - 2) }
}
{{</* /code-tab */>}}

{{</* code-tab lang="php" title="PHP" */>}}
function fib(int $n): int {
    return $n < 2 ? $n : fib($n - 1) + fib($n - 2);
}
{{</* /code-tab */>}}

{{</* code-tab lang="node" title="Node.js" */>}}
function fib(n) {
  return n < 2 ? n : fib(n - 1) + fib(n - 2);
}
module.exports = { fib };
{{</* /code-tab */>}}

{{</* code-tab lang="javascript" title="JavaScript" */>}}
export const fib = (n) => (n < 2 ? n : fib(n - 1) + fib(n - 2));
{{</* /code-tab */>}}
{{</* /code-tabs */>}}
```

### Supported language values

- `python`
- `java`
- `go` or `golang`
- `rust`
- `php`
- `node`, `nodejs` (highlighted as JavaScript)
- `javascript` or `js`

> You can add more languages supported by Hugo Chroma by passing the desired `lang` value in `code-tab`.



## General Markdown

## A gentle introduction

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris non tortor
a turpis fermentum porta. Curabitur eget tortor at velit fermentum porta.

> **Heads up.** This is a placeholder chapter. Replace it with real content
> when authoring your course.

### Why two pointers?

Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
ad minim veniam, quis nostrud exercitation ullamco laboris.

<!-- Inline ad slot — placed after the first major section, above the fold. -->
{{< ad slot="chapter-inline-1" size="responsive" >}}

### A worked example

Consider the classic *pair sum* problem on a sorted array:

```python
def pair_sum_sorted(nums, target):
    """Return indices of two numbers in `nums` summing to `target`, or None."""
    left, right = 0, len(nums) - 1
    while left < right:
        s = nums[left] + nums[right]
        if s == target:
            return (left, right)
        if s < target:
            left += 1
        else:
            right -= 1
    return None
```

The animation below shows how the pointers converge:

![Two-pointer animation placeholder](/images/placeholder-diagram.svg)

### Mini chart

A quick comparison of brute-force vs. two-pointer time complexity:

| Approach     | Time   | Space |
|--------------|--------|-------|
| Brute force  | O(n²)  | O(1)  |
| Two-pointer  | O(n)   | O(1)  |

<!-- Mid-content ad slot — typically after a heavy section. -->
{{< ad slot="chapter-inline-2" size="responsive" >}}

### Going further

- [Two-pointer practice problems](#)
- [The sliding-window pattern](#)
- [Binary search on the answer](#)

## Wrap up

You've seen the core idea. In the next chapter we'll apply it to strings.
Don't forget to **mark this chapter complete** when you're done — your
progress is saved locally in your browser.



---

## SEO

`layouts/partials/seo.html` emits:

- `<title>`, `description`, `keywords`, `author`, canonical
- OpenGraph tags (`og:title`, `og:description`, `og:image`, `og:type`,
  `og:url`, …)
- Twitter Card tags
- JSON-LD: **Organization** on the home page, **Course** on track/course
  pages, **Article** on chapter pages, **BreadcrumbList** wherever a
  parent exists.
- `viewport`, `theme-color`, `robots`

All values fall back to site `params`, so most pages need no SEO config
beyond `title` + `description`.

---

## Performance notes

The site is engineered for Lighthouse 100:

- No JS framework. ~6 KB of vanilla JS, all `defer`-loaded.
- One CSS file (~25 KB) — no Hugo Pipes / SCSS pipeline mandatory.
- Inter loaded via Google Fonts with `preconnect` + `display=swap`,
  injected with `media="print" onload="this.media='all'"` for non-blocking
  CSS.
- Images in chapter prose are auto-tagged `loading="lazy"` and
  `decoding="async"` by `app.js`.
- Sticky sidebar with `position: sticky` (no scroll listeners).
- Reduced-motion-friendly (transitions off when `prefers-reduced-motion`).

---

## Customizing

- **Brand mark / logo**: replace the `▸` in `layouts/partials/header.html`
  with an `<img>` or inline SVG, and update
  `params.organizationLogo` in `config.toml`.
- **Color tokens**: edit the `:root` block at the top of
  `static/css/main.css`.
- **Menu**: edit `data/menu.yaml`. Two levels are supported (one
  dropdown).
- **Pastel themes**: add a new `.theme-<name>` rule in `main.css`. Then
  reference it from front matter or `data/courses.yaml`.

---

## License

The placeholder content in this repo is for demonstration only. Replace
before publishing. Code (layouts, CSS, JS) is provided as a starter
template — adapt freely.

# Todo
Menu Design needed