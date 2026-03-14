import { useCallback, useState } from 'react';
import { extractErrorMessage } from '../../shared/utils/error';

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  status: AsyncStatus;
  data: T;
  error: string | null;
}

export const createInitialAsyncState = <T>(initialData: T): AsyncState<T> => ({
  status: 'idle',
  data: initialData,
  error: null,
});

export const useAsyncState = <T>(initialData: T) => {
  const [state, setState] = useState<AsyncState<T>>(createInitialAsyncState(initialData));

  const setLoading = useCallback(() => {
    setState((prev) => ({ ...prev, status: 'loading', error: null }));
  }, []);

  const setSuccess = useCallback((data: T) => {
    setState({ status: 'success', data, error: null });
  }, []);

  const setError = useCallback((error: unknown, fallback: string) => {
    setState((prev) => ({
      ...prev,
      status: 'error',
      error: extractErrorMessage(error, fallback),
    }));
  }, []);

  const reset = useCallback(() => {
    setState(createInitialAsyncState(initialData));
  }, [initialData]);

  return {
    state,
    setLoading,
    setSuccess,
    setError,
    reset,
  };
};
