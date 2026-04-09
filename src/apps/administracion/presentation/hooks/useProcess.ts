import { useState, useCallback } from 'react';
import { ProcessService } from '../../application/services';
import type { Process, ProcessCreate, ProcessUpdate } from '../../domain/entities';
import { extractErrorMessage } from '../../../../shared/utils/error';

/**
 * useProcess Hook
 * Gestiona el estado y operaciones de procesos
 */
export const useProcess = () => {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [process, setProcess] = useState<Process | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Obtener todos los procesos
   */
  const fetchProcesses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ProcessService.getProcesses();
      setProcesses(data);
      return data;
    } catch (err: unknown) {
      const errorMsg = extractErrorMessage(err, 'Error al cargar procesos');
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener procesos de una empresa
   */
  const fetchProcessesByCompany = useCallback(async (companyId: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await ProcessService.getProcessesByCompany(companyId);
      setProcesses(data);
      return data;
    } catch (err: unknown) {
      const errorMsg = extractErrorMessage(err, 'Error al cargar procesos');
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener procesos de un tipo específico
   */
  const fetchProcessesByType = useCallback(async (processTypeId: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await ProcessService.getProcessesByType(processTypeId);
      setProcesses(data);
      return data;
    } catch (err: unknown) {
      const errorMsg = extractErrorMessage(err, 'Error al cargar procesos');
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener proceso por ID
   */
  const fetchProcess = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await ProcessService.getProcess(id);
      setProcess(data);
      return data;
    } catch (err: unknown) {
      const errorMsg = extractErrorMessage(err, 'Error al cargar proceso');
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crear nuevo proceso
   */
  const createProcess = useCallback(async (data: ProcessCreate) => {
    setLoading(true);
    setError(null);
    try {
      const newProcess = await ProcessService.createProcess(data);
      setProcesses(prev => [...prev, newProcess]);
      return newProcess;
    } catch (err: unknown) {
      const errorMsg = extractErrorMessage(err, 'Error al crear proceso');
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualizar proceso
   */
  const updateProcess = useCallback(async (id: number, data: ProcessUpdate) => {
    setLoading(true);
    setError(null);
    try {
      const updatedProcess = await ProcessService.updateProcess(id, data);
      setProcesses(prev => prev.map(p => p.id === id ? updatedProcess : p));
      if (process?.id === id) setProcess(updatedProcess);
      return updatedProcess;
    } catch (err: unknown) {
      const errorMsg = extractErrorMessage(err, 'Error al actualizar proceso');
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [process?.id]);

  /**
   * Eliminar proceso
   */
  const deleteProcess = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await ProcessService.deleteProcess(id);
      setProcesses(prev => prev.filter(p => p.id !== id));
      if (process?.id === id) setProcess(null);
    } catch (err: unknown) {
      const errorMsg = extractErrorMessage(err, 'Error al eliminar proceso');
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [process?.id]);

  /**
   * Cambiar estado de proceso
   */
  const toggleStatus = useCallback(async (id: number, status: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await ProcessService.toggleProcessStatus(id, status);
      setProcesses(prev => prev.map(p => p.id === id ? updated : p));
      if (process?.id === id) setProcess(updated);
      return updated;
    } catch (err: unknown) {
      const errorMsg = extractErrorMessage(err, 'Error al cambiar estado');
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [process?.id]);

  /**
   * Validar datos de proceso
   */
  const validateData = useCallback((data: Partial<ProcessCreate>) => {
    return ProcessService.validateProcessData(data);
  }, []);

  /**
   * Limpiar errores
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    processes,
    process,
    loading,
    error,
    fetchProcesses,
    fetchProcessesByCompany,
    fetchProcessesByType,
    fetchProcess,
    createProcess,
    updateProcess,
    deleteProcess,
    toggleStatus,
    validateData,
    clearError,
  };
};
