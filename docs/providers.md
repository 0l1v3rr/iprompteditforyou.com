# Providers

Providers live in [`assets/js/providers.js`](../assets/js/providers.js):

```js
{ id: 'claude', name: 'Claude', prefill: true, buildUrl: (p) => `https://claude.ai/new?q=${enc(p)}` }
```

| Field | Meaning |
| --- | --- |
| `id` | Short, lowercase, URL-safe. Used in `?ai=` and `data-ai`. **Never rename an id**: old links depend on it. |
| `name` | Display name. |
| `prefill` | `true` if the chat reads the prompt from the URL. `false` → we copy the prompt to the clipboard and open the chat empty. |
| `buildUrl(prompt)` | Returns the URL to open. Always `encodeURIComponent` the prompt. |

## Current URLs

| id | URL | Notes |
| --- | --- | --- |
| `chatgpt` | `https://chatgpt.com/?q=…` | Submits automatically when logged in. |
| `claude` | `https://claude.ai/new?q=…` | Pre-fills the composer. |
| `perplexity` | `https://www.perplexity.ai/search?q=…` | Runs the search. |
| `grok` | `https://grok.com/?q=…` | |
| `copilot` | `https://copilot.microsoft.com/?q=…` | |
| `lechat` | `https://chat.mistral.ai/chat?q=…` | |
| `gemini` | `https://gemini.google.com/app` | No public pre-fill parameter → clipboard. |
| `deepseek` | `https://chat.deepseek.com/` | No public pre-fill parameter → clipboard. |

None of these parameters are documented APIs. They work at the time of writing and may break without notice. If one stops working, open an issue or a PR updating the table above and `providers.js`.

## Adding a provider

1. **Add it to `PROVIDERS`** in `assets/js/providers.js`.
2. **Add a button** to the `.providers__list` in `index.html`:
   ```html
   <li><button type="button" class="provider" data-ai="myai"><span class="provider__logo"><img src="/assets/icons/providers/myai.svg" alt="" width="26" height="26" decoding="async"></span><span class="provider__name">My AI</span></button></li>
   ```
3. **Add an `<option>`** to the `#ai` select in `index.html`.
4. **Give it a primary colour** in `styles.css`. It tints the card, border, hover glow and focus ring:
   ```css
   .provider[data-ai="myai"] { --brand: #…; }
   ```
5. **Add its logo** as `assets/icons/providers/myai.svg` (square viewBox, renders at 26×26).
6. **Mention it** in the SEO copy, the `FAQPage` JSON-LD answer and the footer disclaimer, and in the README table.
7. Run `npm test` and click through the replay with `/?q=test&ai=myai`.

## Logos

Each provider has an SVG at `assets/icons/providers/<id>.svg`. The repository ships **placeholders** (the provider's initials in its primary colour). To use official logos, download them from each company's brand or press page and overwrite the file with the same name; no code change is needed. Logos keep their own colours, so multi-colour marks work.

Use official logos only as their brand guidelines allow (typically: unmodified, to refer to the product). Never imply endorsement.

| id | Primary colour |
| --- | --- |
| `chatgpt` | `#10a37f` |
| `claude` | `#d97757` |
| `gemini` | `#4f8ef7` |
| `perplexity` | `#20b8cd` |
| `grok` | `#e7e9ee` |
| `copilot` | `#2a8af6` |
| `lechat` | `#fa520f` |
| `deepseek` | `#4d6bfe` |
