/**
 * Retries a function with exponential backoff.
 * 
 * @param {Function} fn - The function to retry.
 * @param {number} retries - Maximum number of retries.
 * @param {number} delay - Initial delay in milliseconds.
 * @returns {Promise<any>}
 */
export const retryWithBackoff = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    
    // Check if error is worth retrying (e.g., 5xx, network error, timeout)
    // For axios, we can check error.response.status
    const status = error.response?.status;
    const isRetryable = !status || (status >= 500 && status <= 599) || status === 429;
    
    if (!isRetryable) throw error;

    console.warn(`Retry attempt remaining: ${retries}. Retrying in ${delay}ms...`);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return retryWithBackoff(fn, retries - 1, delay * 2);
  }
};
