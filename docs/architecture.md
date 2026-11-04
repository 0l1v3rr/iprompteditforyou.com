# Architecture

I Prompted It For You is a single static page. There is no server code, no build step and no runtime dependency.

## Files

| File | Role |
| --- | --- |
| `index.html` | Markup, all metadata and JSON-LD. Semantic landmarks: `header`, `nav`, `main`, `section`, `article`, `footer`. |
| `assets/css/styles.css` | Design tokens on `:root` (dark only: navy, cyan → teal → green), components, reduced-motion overrides. |
| `assets/js/app.js` | Entry module. Composer (counter, shortcuts, create/copy/share), provider buttons, boot logic. |
| `assets/js/link.js` | Builds and parses share links, sanitises prompts. Pure and unit-tested. |
| `assets/js/providers.js` | Registry of AI chats and their URL builders. Pure and unit-tested. |
| `assets/js/replay.js` | Recipient animation. Loaded with dynamic `import()` only when the URL contains a prompt. |

## Runtime flow

```text
page load
  └─ app.js
       ├─ restore last chosen AI (localStorage, optional)
       ├─ parseShareUrl(location.search)
       │    ├─ null      → sender mode: the composer is ready
       │    └─ {prompt}  → recipient mode
       │                     ├─ robots → noindex, document.title → prompt
       │                     └─ import('./replay.js') → playReplay()
       │                          ├─ Step 1: cursor walks in, types the prompt
       │                          ├─ Step 2: cursor clicks the chosen AI
       │                          ├─ "Was that so hard?"
       │                          └─ redirect (pre-fill providers) or prompt to click (clipboard providers)
       └─ event handlers (submit, copy, share, provider click)
```

Any key press, click, scroll or touch during the replay skips to the end and cancels the redirect. Users with `prefers-reduced-motion: reduce` skip the animation entirely and are redirected after a short pause.

## Design decisions

- **No framework.** The interactive surface is one form and eight buttons; a framework would cost more bytes than the whole app.
- **One self-hosted font.** Sora (variable, Latin subset, 33 KB) is preloaded with `font-display: swap` and a metric-adjusted fallback, so text paints immediately without layout shift.
- **Progressive enhancement.** The composer is a real `<form method="get" action="/">` whose fields are named `q` and `ai`. Without JavaScript, submitting it navigates to the share URL itself.
- **Readable links.** Prompts are plain query parameters, not base64 or a database id. See [url-format.md](url-format.md).
- **CSP-friendly.** No inline scripts (JSON-LD is a data block, not executed) and no inline `style` attributes, so a strict Content-Security-Policy (`default-src 'self'`, no `unsafe-inline`) works if your host adds one.
- **Drop-in provider logos.** Each provider card loads `assets/icons/providers/<id>.svg` and is tinted with its `--brand` colour. See [providers.md](providers.md#logos).
