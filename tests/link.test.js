import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildShareUrl, parseShareUrl, sanitizePrompt, MAX_PROMPT_LENGTH } from '../assets/js/link.js';
import { PROVIDERS, getProvider } from '../assets/js/providers.js';

const ORIGIN = 'https://iprompteditforyou.com';

test('round-trips a prompt and provider', () => {
  const url = buildShareUrl('How do I boil an egg? 🥚 & more', 'claude', ORIGIN);
  const parsed = parseShareUrl(new URL(url).search);
  assert.equal(parsed.prompt, 'How do I boil an egg? 🥚 & more');
  assert.equal(parsed.provider.id, 'claude');
});

test('omits unknown providers', () => {
  const url = buildShareUrl('hi', 'not-a-bot', ORIGIN);
  assert.equal(new URL(url).searchParams.has('ai'), false);
  assert.equal(parseShareUrl('?q=hi&ai=nope').provider, null);
});

test('returns null without a prompt', () => {
  assert.equal(parseShareUrl(''), null);
  assert.equal(parseShareUrl('?q=%20%20'), null);
});

test('sanitizes control characters, keeps newlines, caps length', () => {
  assert.equal(sanitizePrompt('a\u0000b\r\nc'), 'a b\nc');
  assert.equal(sanitizePrompt('x'.repeat(MAX_PROMPT_LENGTH + 50)).length, MAX_PROMPT_LENGTH);
});

test('every provider builds an https URL', () => {
  for (const p of PROVIDERS) {
    const url = new URL(p.buildUrl('test prompt'));
    assert.equal(url.protocol, 'https:', p.id);
    if (p.prefill) assert.match(url.search, /test(%20|\+)prompt/, p.id);
  }
  assert.equal(getProvider('chatgpt').name, 'ChatGPT');
});
