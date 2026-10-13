import { contactForm } from './form.js';
import { initReveals, initIcons } from './animations.js';
import { createCounter } from './counter.js';
import { loadAll } from './loader.js';

const DATA_SOURCES = {
  collections: 'data/collections.json',
  testimonials: 'data/testimonials.json',
  stats: 'data/stats.json',
};

const bootstrap = ({ ...globals } = window) => {
  const { document: doc } = globals;

  window.contactForm = contactForm;

  doc.addEventListener('alpine:init', () => {
    window.Alpine?.data('contactForm', contactForm);
  });

  const pageLoads = createCounter({ start: 0 });
  pageLoads.inc();

  const start = async () => {
    initIcons();
    const revealed = initReveals();

    window.__nocturn = { pageLoads, revealed, data: null, error: null };

    try {
      const { collections, testimonials, stats } = await loadAll(DATA_SOURCES);
      window.__nocturn = { ...window.__nocturn, data: { collections, testimonials, stats } };
      console.log('[loader] loaded', window.__nocturn.data);
    } catch (err) {
      window.__nocturn = { ...window.__nocturn, error: err };
      console.error('[loader] failed', err);
    }
  };

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
};

bootstrap();
