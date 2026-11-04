# SEO & performance

## Metadata in `index.html`

- `<title>` (≈70 chars) and `meta description` (≈160 chars) leading with the primary keywords: *let me prompt that for you*, *ChatGPT*, *LMGTFY for AI*.
- `canonical`, `robots` with `max-image-preview:large`.
- `theme-color` for light and dark, `color-scheme`, `application-name`, `apple-mobile-web-app-title`.
- Icons: `favicon.ico` (32 px), `favicon.svg`, `apple-touch-icon.png` (180 px), manifest icons (192, 512, maskable 512).
- Open Graph: type, site name, locale, url, title, description, image (+ secure URL, type, width, height, alt).
- Twitter: `summary_large_image` with title, description, image and alt.
- JSON-LD `@graph`: `WebSite`, `WebApplication` (free offer, feature list) and `FAQPage`. The FAQ JSON-LD mirrors the visible FAQ; keep them in sync.

## Content

The SEO copy under the tool uses one `h1` and an `h2` per topic. Target and related keywords:

- let me prompt that for you · i prompted it for you
- let me ChatGPT that for you · let me AI that for you · let me Claude that for you
- LMGTFY for AI / ChatGPT · ask ChatGPT for me · ChatGPT link generator

When editing copy, write for people first. Keep keywords in headings natural and don't stuff them.

## Shared links

`/?q=…` pages are canonicalised to `/` and switched to `noindex, follow` in JavaScript, so user prompts never become indexed pages.

## Performance budget

| Resource | Size (gzip) |
| --- | --- |
| HTML | ~6 KB |
| CSS | ~5 KB |
| JS (initial) | ~4 KB |
| JS (replay, lazy) | ~2 KB |
| Font (Sora variable, preloaded) | 33 KB |
| Provider logos (8 SVGs) | <1 KB each |
| Third-party requests | 0 |

Techniques: one preloaded variable font with a metric-matched fallback, inline SVG sprite, `modulepreload` for the module graph, replay code split out with `import()`, no images above the fold, no layout-shifting content (the result panel opens below the fold line of the composer).

## Pre-release checklist

- [ ] Lighthouse: 100 for Performance, Accessibility, Best Practices, SEO (mobile and desktop)
- [ ] Rich Results Test passes for `FAQPage`
- [ ] OG card renders on X, LinkedIn, Slack, WhatsApp, iMessage
- [ ] `sitemap.xml` `lastmod` updated
- [ ] Each provider's pre-fill still works (`/?q=test&ai=<id>`)
- [ ] `npm test` passes
