// Run a background task safely across local Node and Vercel serverless.
// On Vercel: hands the promise to `waitUntil` (from @vercel/functions) so the
// lambda stays alive past the response. Locally / when the package isn't
// available: just lets the promise run as a normal pending task.
import logger from './logger.js';

let waitUntilLoaded = false;
let waitUntilFn = null;

const ensureWaitUntil = async () => {
  if (waitUntilLoaded) return waitUntilFn;
  waitUntilLoaded = true;
  try {
    const mod = await import('@vercel/functions');
    waitUntilFn = mod?.waitUntil || null;
  } catch {
    waitUntilFn = null;
  }
  return waitUntilFn;
};

export const runBackground = (promise, label = 'background-task') => {
  const safe = Promise.resolve(promise).catch((err) => {
    logger.error(`[${label}] background task failed:`, err);
  });
  // Best-effort: register with waitUntil if available. We don't await the
  // ensure call so the response isn't delayed.
  ensureWaitUntil().then((fn) => {
    if (!fn) return;
    try { fn(safe); } catch (e) { logger.error('waitUntil failed:', e); }
  });
  return safe;
};
