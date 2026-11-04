/**
 * AI chat providers.
 *
 * `buildUrl(prompt)` returns the URL that opens the chat.
 * `prefill: true`  → the chat reads the prompt from the URL and fills it in.
 * `prefill: false` → no URL parameter is supported; the prompt is copied to
 *                    the clipboard and the chat opens empty, ready to paste.
 *
 * Pre-fill parameters are not official APIs; providers change them from time
 * to time. See docs/providers.md before editing, and please open a PR when one
 * breaks.
 *
 * @typedef {Object} Provider
 * @property {string} id        Short, URL-safe id used in `?ai=`.
 * @property {string} name      Display name.
 * @property {boolean} prefill  Whether the URL pre-fills the prompt.
 * @property {(prompt: string) => string} buildUrl
 */

const enc = encodeURIComponent;

/** @type {Provider[]} */
export const PROVIDERS = [
  { id: 'chatgpt',    name: 'ChatGPT',    prefill: true,  buildUrl: (p) => `https://chatgpt.com/?q=${enc(p)}` },
  { id: 'claude',     name: 'Claude',     prefill: true,  buildUrl: (p) => `https://claude.ai/new?q=${enc(p)}` },
  { id: 'gemini',     name: 'Gemini',     prefill: false, buildUrl: () => 'https://gemini.google.com/app' },
  { id: 'perplexity', name: 'Perplexity', prefill: true,  buildUrl: (p) => `https://www.perplexity.ai/search?q=${enc(p)}` },
  { id: 'grok',       name: 'Grok',       prefill: true,  buildUrl: (p) => `https://grok.com/?q=${enc(p)}` },
  { id: 'copilot',    name: 'Copilot',    prefill: true,  buildUrl: (p) => `https://copilot.microsoft.com/?q=${enc(p)}` },
  { id: 'google',     name: 'Google AI',  prefill: true,  buildUrl: (p) => `https://www.google.com/search?q=${enc(p)}&udm=50` },
  { id: 'deepseek',   name: 'DeepSeek',   prefill: false, buildUrl: () => 'https://chat.deepseek.com/' },
];

/** @param {string | null | undefined} id */
export const getProvider = (id) => PROVIDERS.find((p) => p.id === id) ?? null;
