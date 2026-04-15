import { toast } from 'react-toastify';

/**
 * Common handler for mutation errors (RTK Query / standard try-catch)
 * Extracts the message from response and shows a toast.
 */
export const handleMutationError = (error, defaultMsg = 'Something went wrong') => {
  console.error('[handleMutationError]:', error);

  let message = defaultMsg;

  if (error?.data?.message) {
    message = error.data.message;
  } else if (error?.message) {
    message = error.message;
  }

  toast.error(message);
  return message;
};
