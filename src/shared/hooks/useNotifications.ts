import { notify } from '../utils/notifications';

export const useNotifications = () => {
  return {
    notifySuccess: (message: string) => notify.success(message),
    notifyError: (message: string) => notify.error(message),
    notifyInfo: (message: string) => notify.info(message),
    notifyWarning: (message: string) => notify.warning(message),
  };
};