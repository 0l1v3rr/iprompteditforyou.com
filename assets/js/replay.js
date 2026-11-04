/**
 * The recipient experience: a fake cursor walks into the chat box, types the
 * prompt, clicks the chosen AI and redirects. Any key press or click skips
 * the show and cancels the redirect.
 */

const wait = (ms, signal) =>
  new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => { clearTimeout(t); reject(signal.reason); }, { once: true });
  });

const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * @param {Object} opts
 * @param {string} opts.prompt
 * @param {import('./providers.js').Provider | null} opts.provider
 * @param {HTMLTextAreaElement} opts.input
 * @param {SVGElement} opts.cursor
 * @param {HTMLElement} opts.step   Element that shows "Step 1…" captions.
 * @param {(id: string) => HTMLButtonElement | null} opts.getButton
 * @param {(msg: string) => void} opts.toast
 * @param {() => void} opts.onDone
 */
export async function playReplay({ prompt, provider, input, cursor, step, getButton, toast, onDone }) {
  const root = document.documentElement;
  const body = document.body;
  const controller = new AbortController();
  const { signal } = controller;
  const reduced = prefersReducedMotion();

  const setStep = (text) => {
    step.textContent = text;
    step.classList.add('is-step');
  };

  const moveCursorTo = (el, xRatio = 0.5, yRatio = 0.5) => {
    const r = el.getBoundingClientRect();
    cursor.style.transform = `translate(${r.left + r.width * xRatio}px, ${r.top + r.height * yRatio}px)`;
  };

  const press = async () => {
    cursor.classList.add('is-pressing');
    await wait(140, signal);
    cursor.classList.remove('is-pressing');
  };

  const skip = () => controller.abort(new Error('skipped'));
  const skipEvents = ['keydown', 'pointerdown', 'wheel', 'touchstart'];
  const armSkip = () => skipEvents.forEach((e) => addEventListener(e, skip, { once: true, passive: true }));
  const disarmSkip = () => skipEvents.forEach((e) => removeEventListener(e, skip));

  body.classList.add('is-replay');
  input.readOnly = true;
  input.value = '';
  input.dispatchEvent(new Event('input'));

  const button = provider ? getButton(provider.id) : null;
  let redirect = false;

  try {
    if (reduced) throw new Error('reduced-motion');
    // Let the page settle so the user can see the show start.
    await wait(50);
    armSkip();

    // Step 1: walk in and type.
    setStep('Step 1: Type your question');
    cursor.style.transition = 'none';
    cursor.style.transform = `translate(${innerWidth * 0.8}px, ${innerHeight + 40}px)`;
    cursor.getBoundingClientRect(); // flush
    cursor.style.transition = '';
    cursor.classList.add('is-visible');
    input.scrollIntoView({ block: 'center', behavior: 'smooth' });
    await wait(500, signal);
    moveCursorTo(input, 0.12, 0.32);
    await wait(1150, signal);
    await press();
    body.classList.add('is-typing');
    input.focus({ preventScroll: true });

    const perChar = Math.max(12, Math.min(70, 2600 / prompt.length));
    for (let i = 1; i <= prompt.length; i++) {
      input.value = prompt.slice(0, i);
      input.dispatchEvent(new Event('input'));
      // A little human jitter, with a pause after punctuation.
      const ch = prompt[i - 1];
      await wait(perChar * (0.6 + Math.random() * 0.8) + (/[.,!?]/.test(ch) ? perChar * 3 : 0), signal);
    }
    body.classList.remove('is-typing');
    input.blur();
    await wait(450, signal);

    // Step 2: click the AI.
    if (button) {
      setStep(`Step 2: Click “${provider.name}”`);
      button.scrollIntoView({ block: 'center', behavior: 'smooth' });
      await wait(350, signal);
      moveCursorTo(button, 0.3, 0.55);
      await wait(1150, signal);
      button.classList.add('is-hover');
      await press();
      button.classList.add('is-clicked');
      redirect = provider.prefill;
    } else {
      setStep('Step 2: Pick your favourite AI');
      const first = getButton('chatgpt');
      if (first) {
        first.scrollIntoView({ block: 'center', behavior: 'smooth' });
        await wait(350, signal);
        moveCursorTo(first, 0.5, 0.6);
        await wait(1150, signal);
      }
    }

    setStep('Was that so hard? 😌');
    await wait(1300, signal);
  } catch {
    // Skipped or reduced motion: jump straight to the end state.
    input.value = prompt;
    input.dispatchEvent(new Event('input'));
    setStep(provider ? `Your answer is one click away in ${provider.name}` : 'Pick an AI and get your answer');
    // Reduced motion keeps the redirect (the show was skipped, not refused).
    redirect = reduced && !!provider?.prefill;
  } finally {
    disarmSkip();
    body.classList.remove('is-typing');
    cursor.classList.remove('is-visible');
    button?.classList.remove('is-hover', 'is-clicked');
  }

  root.dataset.replayed = 'true';
  onDone();

  if (redirect) {
    toast(`Opening ${provider.name}…`);
    await wait(reduced ? 1200 : 300);
    location.assign(provider.buildUrl(prompt));
  } else if (provider && !provider.prefill) {
    toast(`Click ${provider.name}: we'll copy the prompt for you to paste.`);
    button?.focus();
  }
}
