import { createCounter } from './counter.js';
import { SITE } from './config.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validate = ({ name = '', email = '', message = '' } = {}) => {
  const errors = {};
  if (name.trim().length < 2) errors.name = 'Please add your name';
  if (!EMAIL_RE.test(email)) errors.email = 'Enter a valid email';
  if (message.trim().length < 10) errors.message = 'A little more detail please';
  return errors;
};

const postForm = async (endpoint, payload) => {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  const { success = false, message = '', ...rest } = await res.json();
  return { success, message, ...rest };
};

export const contactForm = () => {
  const attempts = createCounter();
  const successes = createCounter();

  return {
    state: 'idle',
    errors: {},
    serverMessage: '',
    lastSubmitted: 0,

    async submit(e) {
      const { target: form } = e;
      this.errors = {};
      this.serverMessage = '';

      const now = Date.now();
      if (this.lastSubmitted && now - this.lastSubmitted < SITE.cooldownMs) {
        this.serverMessage = 'Please wait a few seconds before submitting again.';
        this.state = 'error';
        return;
      }

      const formData = new FormData(form);
      const data = Object.fromEntries(formData);
      const { name, email, message, 'g-recaptcha-response': recaptcha } = data;

      this.errors = validate({ name, email, message });
      if (Object.keys(this.errors).length) return;

      if (!recaptcha) {
        this.serverMessage = 'Please complete the reCAPTCHA.';
        this.state = 'error';
        return;
      }

      attempts.inc();
      this.state = 'loading';

      try {
        const payload = { ...data };
        console.log('[Web3Forms] sending', payload);
        const { success, message: serverMsg, ...rest } = await postForm(SITE.formEndpoint, payload);

        if (success) {
          successes.inc();
          this.state = 'success';
          this.lastSubmitted = Date.now();
          form.reset();
          if (window.grecaptcha) window.grecaptcha.reset();
        } else {
          console.error('[Web3Forms] rejected:', serverMsg, rest);
          this.serverMessage = serverMsg || 'Something went wrong. Please try again.';
          this.state = 'error';
        }
      } catch (err) {
        console.error('[Web3Forms] network error:', err);
        this.serverMessage = 'Network error. Please try again.';
        this.state = 'error';
      }
    },
  };
};
