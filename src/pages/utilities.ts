import { toast, Slide, Id } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/**
 * Update a toast from loading to success/error/info
 */
export const showToast = (
  toastId: Id,
  message: string,
  type: 'success' | 'error' | 'info'
) => {
  toast.update(toastId, {
    render: message,
    type,
    isLoading: false,
    autoClose: 2000,
    closeButton: true,
    closeOnClick: true,
    draggable: false,
    pauseOnHover: false,
    pauseOnFocusLoss: false,
    transition: Slide,
  });
};

/**
 * Show an informational toast
 */
export const showInfoToast = (message: string) => {
  toast.info(message, {
    autoClose: 3000,
    closeButton: true,
    closeOnClick: true,
    draggable: false,
    pauseOnHover: false,
    pauseOnFocusLoss: false,
    transition: Slide,
  });
};

/**
 * Show an error toast
 */
export const showErrorToast = (message: string) => {
  toast.error(message, {
    autoClose: 3000,
    closeButton: true,
    closeOnClick: true,
    draggable: false,
    pauseOnHover: false,
    pauseOnFocusLoss: false,
    transition: Slide,
  });
};

/**
 * Reusable helper for async toasts (e.g., API requests)
 */
export const handleAsyncToast = async <T>(
  promise: Promise<T>,
  {
    loadingMessage = 'Processing...',
    successMessage = 'Operation successful!',
    errorMessage = 'Something went wrong!',
  }: {
    loadingMessage?: string;
    successMessage?: string;
    errorMessage?: string;
  }
): Promise<T> => {
  const toastId = toast.loading(loadingMessage);
  try {
    const result = await promise;
    showToast(toastId, successMessage, 'success');
    return result;
  } catch (error: any) {
    showToast(toastId, error?.message || errorMessage, 'error');
    throw error;
  }
};
