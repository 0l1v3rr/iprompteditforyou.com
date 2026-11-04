# Deployment

The repository root *is* the site. There's nothing to build: publish the folder.

Files that aren't part of the site (`docs/`, `scripts/`, `tests/`, `README.md`, …) are harmless if published, but you can exclude them.

## Cloudflare Pages (recommended)

1. Create a Pages project from the GitHub repo.
2. Framework preset: **None**. Build command: *(empty)*. Output directory: `/`.
3. Add the custom domain `iprompteditforyou.com` and redirect `www` to the apex.

`_headers` is picked up automatically. `404.html` is served for unknown paths.

## Netlify

Same settings: no build command, publish directory `.`. `_headers` and `404.html` work out of the box.

## Vercel

Framework preset **Other**, no build command, output directory `.`. Vercel ignores `_headers`; port the rules to a `vercel.json` `headers` block if you need them.

## GitHub Pages

Enable Pages for the `master` branch, root folder. Add a `CNAME` file containing `iprompteditforyou.com`. GitHub Pages ignores `_headers`, so security headers must come from a proxy such as Cloudflare.

## Headers

`_headers` sets:

- a strict **Content-Security-Policy** (`'self'` only; works because the page has no inline scripts or style attributes),
- HSTS, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`, COOP,
- caching: HTML always revalidates; `/assets/*` caches for a day with a week of `stale-while-revalidate`.

Asset filenames aren't content-hashed, so don't set `immutable` on `/assets/*` unless you add hashing (for example `styles.3f9a1c.css`) and update the references.

## After deploying

- Submit `https://iprompteditforyou.com/sitemap.xml` in Google Search Console and Bing Webmaster Tools.
- Check the social card with the [opengraph.xyz](https://www.opengraph.xyz/) preview, LinkedIn Post Inspector and the Facebook Sharing Debugger.
- Validate structured data with Google's [Rich Results Test](https://search.google.com/test/rich-results).
