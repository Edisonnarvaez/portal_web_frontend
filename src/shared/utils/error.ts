/**
 * Extrae mensajes de error de diferentes tipos de objeto error
 * Soporta AxiosError, string, Error, y objetos genéricos
 */
export const extractErrorMessage = (error: unknown, fallback: string = 'Error desconocido'): string => {
  // Si es un AxiosError
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as any;
    if (axiosError.response?.data?.detail) {
      return axiosError.response.data.detail;
    }
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    if (axiosError.message) {
      return axiosError.message;
    }
  }

  // Si es un Error
  if (error instanceof Error) {
    return error.message;
  }

  // Si es un string
  if (typeof error === 'string') {
    return error;
  }

  // Si es un objeto con mensaje
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as any).message);
  }

  // Fallback
  return fallback;
};
