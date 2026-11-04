/**
 * Share-link format:  https://iprompteditforyou.com/?q=<prompt>&ai=<provider-id>
 *
 * Plain, readable query parameters on purpose: the form works without
 * JavaScript (a GET submit produces exactly this URL), links stay debuggable,
 * and nothing is ever stored on a server. See docs/url-format.md.
 */
import { getProvider } from './providers.js';

export const MAX_PROMPT_LENGTH = 2000;

/** Collapse control characters, keep newlines, trim and cap the length. */
export function sanitizePrompt(raw) {
  return String(raw ?? '')
    .replace(/\r\n?/g, '\n')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, ' ')
    .trim()
    .slice(0, MAX_PROMPT_LENGTH);
}

/**
 * @param {string} prompt
 * @param {string} [providerId] empty → recipient picks
 * @param {string} [origin]
 */
export function buildShareUrl(prompt, providerId, origin = location.origin) {
  const url = new URL('/', origin);
  url.searchParams.set('q', sanitizePrompt(prompt));
  if (getProvider(providerId)) url.searchParams.set('ai', providerId);
  return url.toString();
}

/** @param {string} [search] */
export function parseShareUrl(search = location.search) {
  const params = new URLSearchParams(search);
  const prompt = sanitizePrompt(params.get('q'));
  const provider = getProvider(params.get('ai'));
  return prompt ? { prompt, provider } : null;
}
