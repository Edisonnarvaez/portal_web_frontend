import { useState, useCallback } from 'react';
import { ProcessTypeService } from '../../application/services';
import type { ProcessType, ProcessTypeCreate, ProcessTypeUpdate } from '../../domain/entities';
import { extractErrorMessage } from '../../../../shared/utils/error';

/**
 * useProcessType Hook
 * Gestiona el estado y operaciones de tipos de proceso
 */
export const useProcessType = () => {
  const [processTypes, setProcessTypes] = useState<ProcessType[]>([]);
  const [processType, setProcessType] = useState<ProcessType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Obtener todos los tipos de proceso
   */
  const fetchProcessTypes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ProcessTypeService.getProcessTypes();
      setProcessTypes(data);
      return data;
    } catch (err: unknown) {
      const errorMsg = extractErrorMessage(err, 'Error al cargar tipos de proceso');
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener tipos de proceso de una empresa
   */
  const fetchProcessTypesByCompany = useCallback(async (companyId: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await ProcessTypeService.getProcessTypesByCompany(companyId);
      setProcessTypes(data);
      return data;
    } catch (err: unknown) {
      const errorMsg = extractErrorMessage(err, 'Error al cargar tipos de proceso');
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener tipo de proceso por ID
   */
  const fetchProcessType = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await ProcessTypeService.getProcessType(id);
      setProcessType(data);
      return data;
    } catch (err: unknown) {
      const errorMsg = extractErrorMessage(err, 'Error al cargar tipo de proceso');
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crear nuevo tipo de proceso
   */
  const createProcessType = useCallback(async (data: ProcessTypeCreate) => {
    setLoading(true);
    setError(null);
    try {
      const newProcessType = await ProcessTypeService.createProcessType(data);
      setProcessTypes(prev => [...prev, newProcessType]);
      return newProcessType;
    } catch (err: unknown) {
      const errorMsg = extractErrorMessage(err, 'Error al crear tipo de proceso');
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualizar tipo de proceso
   */
  const updateProcessType = useCallback(async (id: number, data: ProcessTypeUpdate) => {
    setLoading(true);
    setError(null);
    try {
      const updatedProcessType = await ProcessTypeService.updateProcessType(id, data);
      setProcessTypes(prev => prev.map(pt => pt.id === id ? updatedProcessType : pt));
      if (processType?.id === id) setProcessType(updatedProcessType);
      return updatedProcessType;
    } catch (err: unknown) {
      const errorMsg = extractErrorMessage(err, 'Error al actualizar tipo de proceso');
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [processType?.id]);

  /**
   * Eliminar tipo de proceso
   */
  const deleteProcessType = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await ProcessTypeService.deleteProcessType(id);
      setProcessTypes(prev => prev.filter(pt => pt.id !== id));
      if (processType?.id === id) setProcessType(null);
    } catch (err: unknown) {
      const errorMsg = extractErrorMessage(err, 'Error al eliminar tipo de proceso');
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [processType?.id]);

  /**
   * Cambiar estado de tipo de proceso
   */
  const toggleStatus = useCallback(async (id: number, status: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await ProcessTypeService.toggleProcessTypeStatus(id, status);
      setProcessTypes(prev => prev.map(pt => pt.id === id ? updated : pt));
      if (processType?.id === id) setProcessType(updated);
      return updated;
    } catch (err: unknown) {
      const errorMsg = extractErrorMessage(err, 'Error al cambiar estado');
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [processType?.id]);

  /**
   * Validar datos de tipo de proceso
   */
  const validateData = useCallback((data: Partial<ProcessTypeCreate>) => {
    return ProcessTypeService.validateProcessTypeData(data);
  }, []);

  /**
   * Limpiar errores
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    processTypes,
    processType,
    loading,
    error,
    fetchProcessTypes,
    fetchProcessTypesByCompany,
    fetchProcessType,
    createProcessType,
    updateProcessType,
    deleteProcessType,
    toggleStatus,
    validateData,
    clearError,
  };
};
