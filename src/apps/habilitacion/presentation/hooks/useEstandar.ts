import { useState, useEffect, useCallback } from 'react';
import type { Estandar, EstandarDetail } from '../../domain/entities/Estandar';
import { EstandarService } from '../../application/services/EstandarService';

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
    } catch (err: any) {
      const errorMsg = err.message || 'Error al cargar estándares';
      setError(errorMsg);
      console.error('usEstandar.fetchEstandares error:', err);
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
    } catch (err: any) {
      const errorMsg = err.message || 'Error al cargar estándares completos';
      setError(errorMsg);
      console.error('useEstandar.fetchEstandaresFull error:', err);
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
    } catch (err: any) {
      const errorMsg = err.message || `Error al cargar estándar ${id}`;
      setError(errorMsg);
      console.error(`useEstandar.getEstandarById(${id}) error:`, err);
      throw err;
    } finally {
      setLoading(false);
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
    service,
  };
};
