export const createCounter = ({ start = 0, step = 1, min = -Infinity, max = Infinity } = {}) => {
  let value = start;
  const clamp = (n) => Math.min(max, Math.max(min, n));
  const listeners = new Set();
  const emit = () => listeners.forEach((fn) => fn(value));

  return {
    get value() { return value; },
    inc(by = step) { value = clamp(value + by); emit(); return value; },
    dec(by = step) { value = clamp(value - by); emit(); return value; },
    set(next) { value = clamp(next); emit(); return value; },
    reset() { value = start; emit(); return value; },
    on(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    snapshot: (...tags) => ({ value, tags: [...tags] }),
  };
};
