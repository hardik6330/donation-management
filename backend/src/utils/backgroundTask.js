// Run a background task safely across local Node and Vercel serverless.
// On Vercel: uses `waitUntil` so the lambda stays alive past the response
// until the work completes (subject to function maxDuration).
// Locally: just fires the promise and lets it run.
import logger from './logger.js';

let waitUntilFn = null;
try {
  // Lazy load to avoid hard dependency if package isn't installed yet.
  const mod = await import('@vercel/functions');
  waitUntilFn = mod.waitUntil || null;
} catch {
  waitUntilFn = null;
}

export const runBackground = (promise, label = 'background-task') => {
  const safe = Promise.resolve(promise).catch((err) => {
    logger.error(`[${label}] background task failed:`, err);
  });
  if (waitUntilFn) {
    try { waitUntilFn(safe); } catch (e) { logger.error('waitUntil failed:', e); }
  }
  return safe;
};
