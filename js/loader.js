const DEFAULTS = { timeoutMs: 8000, base: '' };

const fetchJSON = async (url, { signal } = {}) => {
  const res = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`);
  return res.json();
};

export const loadAll = async (sources, options = {}) => {
  const { timeoutMs, base, ...rest } = { ...DEFAULTS, ...options };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const entries = Object.entries(sources);
    const values = await Promise.all(
      entries.map(([, path]) => fetchJSON(`${base}${path}`, { signal: controller.signal, ...rest })),
    );
    return Object.fromEntries(entries.map(([key], i) => [key, values[i]]));
  } finally {
    clearTimeout(timer);
  }
};

export const loadAllSettled = async (sources, { base = '' } = {}) => {
  const entries = Object.entries(sources);
  const settled = await Promise.allSettled(
    entries.map(([, path]) => fetchJSON(`${base}${path}`)),
  );
  return entries.reduce((acc, [key], i) => {
    const r = settled[i];
    const { status } = r;
    acc[key] = status === 'fulfilled'
      ? { data: r.value, error: null }
      : { data: null, error: String(r.reason) };
    return acc;
  }, {});
};
