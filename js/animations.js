import { createCounter } from './counter.js';
import { SITE, SELECTORS } from './config.js';

export const initReveals = (...extraTargets) => {
  const { gsap, ScrollTrigger } = window;
  const revealed = createCounter();
  const targets = [...document.querySelectorAll(SELECTORS.reveal), ...extraTargets];

  if (!gsap || !ScrollTrigger) {
    targets.forEach((el) => Object.assign(el.style, { opacity: 1, transform: 'none' }));
    return revealed;
  }

  gsap.registerPlugin(ScrollTrigger);
  const { duration, ease, start } = SITE.reveal;

  targets.forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration,
      ease,
      scrollTrigger: {
        trigger: el,
        start,
        onEnter: () => revealed.inc(),
      },
    });
  });

  return revealed;
};

export const initIcons = () => {
  const { lucide } = window;
  if (lucide?.createIcons) lucide.createIcons();
};
