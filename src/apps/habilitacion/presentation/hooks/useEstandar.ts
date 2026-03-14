import { useState, useCallback } from 'react';
import type { Estandar, EstandarCreate, EstandarDetail, EstandarUpdate } from '../../domain/entities/Estandar';
import { EstandarService } from '../../application/services/EstandarService';
import { extractErrorMessage } from '../../shared/utils/error';

export const useEstandar = () => {
  const [estandares, setEstandares] = useState<Estandar[]>([]);
  const [estandaresFull, setEstandaresFull] = useState<Estandar[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const service = new EstandarService();

  /**
   * Fetch all standards (simple list)
   */
  const fetchEstandares = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.getAllEstandares();
      setEstandares(data);
      return data;
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al cargar estándares'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch all standards with full criterios nested
   */
  const fetchEstandaresFull = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.getEstandaresFull();
      setEstandaresFull(data);
      return data;
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al cargar estándares completos'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get a single standard by ID with all its criterios
   */
  const getEstandarById = useCallback(async (id: number): Promise<EstandarDetail> => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.getEstandarById(id);
      return data;
    } catch (err: unknown) {
      setError(extractErrorMessage(err, `Error al cargar estándar ${id}`));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createEstandar = useCallback(async (data: EstandarCreate) => {
    try {
      const created = await service.createEstandar(data);
      setEstandares(prev => [...prev, created]);
      setEstandaresFull(prev => [...prev, created]);
      return created;
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al crear estándar'));
      throw err;
    }
  }, []);

  const updateEstandar = useCallback(async (id: number, data: EstandarUpdate) => {
    try {
      const updated = await service.updateEstandar(id, data);
      setEstandares(prev => prev.map(item => item.id === id ? updated : item));
      setEstandaresFull(prev => prev.map(item => item.id === id ? updated : item));
      return updated;
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al actualizar estándar'));
      throw err;
    }
  }, []);

  const deleteEstandar = useCallback(async (id: number) => {
    try {
      await service.deleteEstandar(id);
      setEstandares(prev => prev.filter(item => item.id !== id));
      setEstandaresFull(prev => prev.filter(item => item.id !== id));
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al eliminar estándar'));
      throw err;
    }
  }, []);

  return {
    estandares,
    estandaresFull,
    loading,
    error,
    fetchEstandares,
    fetchEstandaresFull,
    getEstandarById,
    createEstandar,
    updateEstandar,
    deleteEstandar,
    service,
  };
};
