# Share-link format

```text
https://iprompteditforyou.com/?q=<prompt>&ai=<provider>
```

| Param | Required | Description |
| --- | --- | --- |
| `q` | yes | The prompt, URL-encoded (`application/x-www-form-urlencoded`, so spaces may be `+`). Max 2,000 characters after sanitising. |
| `ai` | no | A provider id from [providers.md](providers.md). If missing or unknown, the recipient chooses. |

## Examples

```text
/?q=How+do+I+boil+an+egg%3F&ai=chatgpt
/?q=Explain%20recursion%20like%20I%27m%205&ai=claude
/?q=Best%20pizza%20dough%20hydration           ← recipient picks the AI
```

## Sanitising

`sanitizePrompt()` in `assets/js/link.js`:

1. normalises `\r\n` and `\r` to `\n`,
2. replaces other ASCII control characters with spaces,
3. trims whitespace,
4. truncates to 2,000 characters.

The prompt is only ever written into a `<textarea>` via `.value`, and into provider URLs via `encodeURIComponent`, so it can't inject markup.

## Why not shorten or encode the prompt?

- No backend means no short ids. The link *is* the data.
- Plain parameters are transparent: the recipient can see what they're about to open before clicking.
- The non-JS form submit produces exactly this format for free.

## SEO handling

Shared URLs keep `<link rel="canonical" href="https://iprompteditforyou.com/">` and switch `meta robots` to `noindex, follow` at runtime, so search engines index only the home page.
