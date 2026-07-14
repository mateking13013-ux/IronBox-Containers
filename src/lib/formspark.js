// Shared FormSpark client — every form on the site submits JSON through this.
// Swap the single FORM_ID value below when you rotate FormSpark credentials.
export const FORMSPARK_FORM_ID = 'giqYy9VTp';
export const FORMSPARK_URL = `https://submit-form.com/${FORMSPARK_FORM_ID}`;

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * POST a plain object to FormSpark as JSON, with a request timeout and
 * automatic retries on transient failures (network errors, 429, 5xx).
 * Resolves with the Response on success; throws on permanent failure.
 */
export async function submitToFormspark(payload, { retries = 2, timeoutMs = 15000 } = {}) {
  let lastErr;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(FORMSPARK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (res.ok) return res;

      // 4xx (except 429) is a permanent client error — don't waste retries on it.
      if (res.status !== 429 && res.status < 500) {
        throw new Error(`Submit failed: ${res.status}`);
      }
      lastErr = new Error(`Submit failed: ${res.status}`);
    } catch (err) {
      clearTimeout(timer);
      lastErr = err;
    }

    if (attempt < retries) await wait(600 * (attempt + 1)); // linear backoff
  }

  throw lastErr || new Error('Submit failed');
}

/** Serialize a <form> to a plain object, dropping FormSpark control fields. */
export function formToObject(form) {
  const obj = {};
  for (const [key, value] of new FormData(form).entries()) {
    if (key === '_redirect') continue; // native-redirect hint, irrelevant for JSON
    obj[key] = value;
  }
  return obj;
}

/**
 * Wire a standard contact/lead <form> to submit JSON via FormSpark with
 * inline success/error feedback (no full-page redirect).
 *
 * opts.validate(data, form) -> string|null   optional; return an error message to block submit
 * opts.transform(data, form) -> object       optional; reshape the payload before sending
 * opts.successMessage                        text shown on success
 */
export function wireFormspark(form, opts = {}) {
  if (!form || form.dataset.fsWired) return;
  form.dataset.fsWired = '1';

  const {
    validate,
    transform,
    successMessage = "Thanks! Your message has been sent — we'll be in touch shortly.",
  } = opts;

  // Reusable status banner injected right above the submit button.
  const status = document.createElement('div');
  status.className = 'hidden text-sm rounded-lg px-4 py-3';
  status.setAttribute('role', 'status');
  const submitBtn = form.querySelector('button[type="submit"], button:not([type])');
  if (submitBtn) submitBtn.insertAdjacentElement('beforebegin', status);
  else form.appendChild(status);

  const showError = (msg) => {
    status.textContent = msg;
    status.className = 'text-sm rounded-lg px-4 py-3 bg-red-50 text-red-700 border border-red-200';
  };
  const showSuccess = (msg) => {
    status.textContent = msg;
    status.className = 'text-sm rounded-lg px-4 py-3 bg-green-50 text-green-700 border border-green-200';
  };
  const clearStatus = () => {
    status.textContent = '';
    status.className = 'hidden text-sm rounded-lg px-4 py-3';
  };

  const originalLabel = submitBtn ? submitBtn.textContent : '';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearStatus();

    if (typeof form.reportValidity === 'function' && !form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = formToObject(form);

    if (validate) {
      const err = validate(data, form);
      if (err) {
        showError(err);
        return;
      }
    }

    const payload = transform ? transform(data, form) : data;

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.dataset.busy = '1';
      submitBtn.textContent = 'Sending...';
    }

    try {
      await submitToFormspark(payload);
      showSuccess(successMessage);
      form.reset();
    } catch (err) {
      console.error('Form submission error:', err);
      showError(
        'Sorry, we could not send your message. Please check your connection and try again, or call us at +1 816 255 7461.'
      );
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        delete submitBtn.dataset.busy;
        submitBtn.textContent = originalLabel;
      }
    }
  });
}
