import { useState, useCallback } from 'react';
import { HeadquartersService } from '../../application/services';
import type { Headquarters, HeadquartersCreate, HeadquartersUpdate } from '../../domain/entities';
import { extractErrorMessage } from '../../../../shared/utils/error';

/**
 * useHeadquarters Hook
 * Gestiona el estado y operaciones de sedes
 */
export const useHeadquarters = () => {
  const [headquarters, setHeadquarters] = useState<Headquarters[]>([]);
  const [headquarter, setHeadquarter] = useState<Headquarters | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Obtener todas las sedes
   */
  const fetchHeadquarters = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await HeadquartersService.getHeadquarters();
      setHeadquarters(data);
      return data;
    } catch (err: unknown) {
      const errorMsg = extractErrorMessage(err, 'Error al cargar sedes');
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener sedes de una empresa
   */
  const fetchHeadquartersByCompany = useCallback(async (companyId: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await HeadquartersService.getHeadquartersByCompany(companyId);
      setHeadquarters(data);
      return data;
    } catch (err: unknown) {
      const errorMsg = extractErrorMessage(err, 'Error al cargar sedes');
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener sede por ID
   */
  const fetchHeadquarter = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await HeadquartersService.getHeadquarter(id);
      setHeadquarter(data);
      return data;
    } catch (err: unknown) {
      const errorMsg = extractErrorMessage(err, 'Error al cargar sede');
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crear nueva sede
   */
  const createHeadquarter = useCallback(async (data: HeadquartersCreate) => {
    setLoading(true);
    setError(null);
    try {
      const newHeadquarter = await HeadquartersService.createHeadquarter(data);
      setHeadquarters(prev => [...prev, newHeadquarter]);
      return newHeadquarter;
    } catch (err: unknown) {
      const errorMsg = extractErrorMessage(err, 'Error al crear sede');
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualizar sede
   */
  const updateHeadquarter = useCallback(async (id: number, data: HeadquartersUpdate) => {
    setLoading(true);
    setError(null);
    try {
      const updatedHeadquarter = await HeadquartersService.updateHeadquarter(id, data);
      setHeadquarters(prev => prev.map(h => h.id === id ? updatedHeadquarter : h));
      if (headquarter?.id === id) setHeadquarter(updatedHeadquarter);
      return updatedHeadquarter;
    } catch (err: unknown) {
      const errorMsg = extractErrorMessage(err, 'Error al actualizar sede');
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [headquarter?.id]);

  /**
   * Eliminar sede
   */
  const deleteHeadquarter = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await HeadquartersService.deleteHeadquarter(id);
      setHeadquarters(prev => prev.filter(h => h.id !== id));
      if (headquarter?.id === id) setHeadquarter(null);
    } catch (err: unknown) {
      const errorMsg = extractErrorMessage(err, 'Error al eliminar sede');
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [headquarter?.id]);

  /**
   * Cambiar estado de sede
   */
  const toggleStatus = useCallback(async (id: number, status: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await HeadquartersService.toggleHeadquarterStatus(id, status);
      setHeadquarters(prev => prev.map(h => h.id === id ? updated : h));
      if (headquarter?.id === id) setHeadquarter(updated);
      return updated;
    } catch (err: unknown) {
      const errorMsg = extractErrorMessage(err, 'Error al cambiar estado');
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [headquarter?.id]);

  /**
   * Validar datos de sede
   */
  const validateData = useCallback((data: Partial<HeadquartersCreate>) => {
    return HeadquartersService.validateHeadquarterData(data);
  }, []);

  /**
   * Limpiar errores
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    headquarters,
    headquarter,
    loading,
    error,
    fetchHeadquarters,
    fetchHeadquartersByCompany,
    fetchHeadquarter,
    createHeadquarter,
    updateHeadquarter,
    deleteHeadquarter,
    toggleStatus,
    validateData,
    clearError,
  };
};
