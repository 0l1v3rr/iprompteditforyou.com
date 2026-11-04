/**
 * I Prompted It For You: entry point.
 * Wires the composer (sender) and the replay (recipient).
 */
import { getProvider } from './providers.js';
import { MAX_PROMPT_LENGTH, buildShareUrl, parseShareUrl, sanitizePrompt } from './link.js';

const $ = (sel, root = document) => root.querySelector(sel);

const form = /** @type {HTMLFormElement} */ ($('#composer'));
const input = /** @type {HTMLTextAreaElement} */ ($('#prompt'));
const count = $('#prompt-count');
const aiSelect = /** @type {HTMLSelectElement} */ ($('#ai'));
const result = $('[data-result]');
const shareInput = /** @type {HTMLInputElement} */ ($('#share-url'));
const copyBtn = $('[data-copy]');
const copyLabel = $('[data-copy-label]');
const shareBtn = $('[data-share]');
const previewLink = /** @type {HTMLAnchorElement} */ ($('[data-preview]'));
const toastEl = $('[data-toast]');
const step = $('[data-step]');
const cursor = $('[data-cursor]');
const replayCta = $('[data-replay-cta]');

const STORAGE_KEY = 'ipify:ai';

/* ---------- Helpers ---------- */

let toastTimer;
function toast(message, ms = 2600) {
  toastEl.textContent = message;
  toastEl.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), ms);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers / insecure contexts.
    const ta = Object.assign(document.createElement('textarea'), { value: text });
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.append(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}

const storage = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch { /* private mode */ } },
};

const currentPrompt = () => sanitizePrompt(input.value);
const getButton = (id) => $(`.provider[data-ai="${id}"]`);

/* ---------- Composer ---------- */

function updateCount() {
  const n = input.value.length;
  count.textContent = `${n} / ${MAX_PROMPT_LENGTH}`;
  count.classList.toggle('is-near', n > MAX_PROMPT_LENGTH * 0.9);
}

function createLink() {
  const prompt = currentPrompt();
  if (!prompt) {
    toast('Type a question first 🙃');
    input.focus();
    return null;
  }
  const url = buildShareUrl(prompt, aiSelect.value);
  shareInput.value = url;
  previewLink.href = url;
  result.hidden = false;
  return url;
}

async function copyLink() {
  const url = shareInput.value || createLink();
  if (!url) return;
  const ok = await copyText(url);
  copyLabel.textContent = ok ? 'Copied!' : 'Copy';
  toast(ok ? 'Link copied. Go make someone’s day.' : 'Couldn’t copy. Select the link and copy it manually.');
  setTimeout(() => { copyLabel.textContent = 'Copy'; }, 2000);
  if (!ok) shareInput.select();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (createLink()) copyLink();
});

input.addEventListener('input', () => {
  updateCount();
  // Any edit invalidates a previously generated link.
  if (!result.hidden && !document.body.classList.contains('is-replay')) result.hidden = true;
});

input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
    event.preventDefault();
    form.requestSubmit();
  }
});

aiSelect.addEventListener('change', () => {
  storage.set(STORAGE_KEY, aiSelect.value);
  if (!result.hidden) createLink();
});

copyBtn.addEventListener('click', copyLink);
shareInput.addEventListener('focus', () => shareInput.select());

if (navigator.share) {
  shareBtn.hidden = false;
  shareBtn.addEventListener('click', async () => {
    const url = shareInput.value || createLink();
    if (!url) return;
    try {
      await navigator.share({ title: 'Let me prompt that for you', text: 'I prompted it for you 🙃', url });
    } catch { /* user cancelled */ }
  });
}

/* ---------- Providers ---------- */

document.querySelector('.providers__list').addEventListener('click', (event) => {
  const button = event.target.closest('.provider');
  if (!button || document.body.classList.contains('is-replay')) return;
  const provider = getProvider(button.dataset.ai);
  const prompt = currentPrompt();
  if (!provider) return;
  if (!prompt) {
    toast('Type a question first 🙃');
    input.focus();
    return;
  }
  if (!provider.prefill) {
    // Start the copy inside the user gesture, then open synchronously so
    // popup blockers stay happy.
    copyText(prompt).then((ok) => ok && toast(`Prompt copied. Paste it into ${provider.name}.`, 4000));
  }
  window.open(provider.buildUrl(prompt), '_blank', 'noopener');
});

/* ---------- Boot ---------- */

const savedAi = storage.get(STORAGE_KEY);
if (savedAi !== null && [...aiSelect.options].some((o) => o.value === savedAi)) aiSelect.value = savedAi;
updateCount();

const shared = parseShareUrl();

if (shared) {
  // Recipient view: keep shared links out of search indexes (canonical already points home).
  const robots = document.querySelector('meta[name="robots"]');
  robots?.setAttribute('content', 'noindex, follow');
  document.title = `“${shared.prompt.slice(0, 60)}${shared.prompt.length > 60 ? '…' : ''}” | I Prompted It For You`;

  const { playReplay } = await import('./replay.js');
  await playReplay({
    ...shared,
    input,
    cursor,
    step,
    getButton,
    toast,
    onDone() {
      document.body.classList.remove('is-replay');
      input.readOnly = false;
      replayCta.hidden = false;
      setTimeout(() => { step.hidden = true; }, 4000);
      if (shared.provider) aiSelect.value = shared.provider.id;
    },
  });
}

