type ErrorWithMessage = {
  message?: string;
  response?: {
    data?: {
      detail?: string;
      message?: string;
    };
  };
};

export const extractErrorMessage = (error: unknown, fallback: string): string => {
  const candidate = error as ErrorWithMessage;

  if (candidate?.response?.data?.detail) {
    return candidate.response.data.detail;
  }

  if (candidate?.response?.data?.message) {
    return candidate.response.data.message;
  }

  if (candidate?.message) {
    return candidate.message;
  }

  return fallback;
};
