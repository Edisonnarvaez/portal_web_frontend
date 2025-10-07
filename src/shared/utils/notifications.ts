import { toast, type ToastOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const defaultOptions: Partial<ToastOptions> = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "light",
};

export const notify = {
  success: (message: string, options?: Partial<ToastOptions>) => {
    toast.success(message, { ...defaultOptions, ...options });
  },
  error: (message: string, options?: Partial<ToastOptions>) => {
    toast.error(message, { ...defaultOptions, ...options });
  },
  info: (message: string, options?: Partial<ToastOptions>) => {
    toast.info(message, { ...defaultOptions, ...options });
  },
  warning: (message: string, options?: Partial<ToastOptions>) => {
    toast.warning(message, { ...defaultOptions, ...options });
  },
  // 🔧 FIX: Use simple confirm instead of complex JSX toast
  confirm: (message: string, options?: {
    title?: string;
    confirmText?: string;
    cancelText?: string;
  }) => {
    const title = options?.title || 'Confirmar';
    const confirmText = options?.confirmText || 'Confirmar';
    const cancelText = options?.cancelText || 'Cancelar';
    
    return window.confirm(options?.title ? `${title}\n\n${message}` : message);
  },
  
  // 🔧 SIMPLE: Quick confirm with simple dialog
  quickConfirm: (message: string, title?: string) => {
    return window.confirm(title ? `${title}\n\n${message}` : message);
  }
};