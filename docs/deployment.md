# Deployment

The repository root *is* the site. There's nothing to build: publish the folder.

Files that aren't part of the site (`docs/`, `scripts/`, `tests/`, `README.md`, …) are harmless if published, but you can exclude them.

## Cloudflare Pages (recommended)

1. Create a Pages project from the GitHub repo.
2. Framework preset: **None**. Build command: *(empty)*. Output directory: `/`.
3. Add the custom domain `iprompteditforyou.com` and redirect `www` to the apex.

`404.html` is served for unknown paths.

## Netlify

Same settings: no build command, publish directory `.`. `404.html` works out of the box.

## Vercel

Framework preset **Other**, no build command, output directory `.`.

## GitHub Pages

Enable Pages for the `master` branch, root folder. Add a `CNAME` file containing `iprompteditforyou.com`.

## Headers (optional)

The page has no inline scripts or inline `style` attributes, so you can add a strict policy on your host:

```text
Content-Security-Policy: default-src 'self'; img-src 'self' data:; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'
```

Asset filenames aren't content-hashed, so keep cache lifetimes on `/assets/*` short (for example a day) unless you add hashing.

## After deploying

- Submit `https://iprompteditforyou.com/sitemap.xml` in Google Search Console and Bing Webmaster Tools.
- Check the social card with the [opengraph.xyz](https://www.opengraph.xyz/) preview, LinkedIn Post Inspector and the Facebook Sharing Debugger.
- Validate structured data with Google's [Rich Results Test](https://search.google.com/test/rich-results).
