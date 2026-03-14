import { useState, useCallback } from 'react';
import type { Autoevaluacion, AutoevaluacionCreate, AutoevaluacionUpdate, AutoevaluacionResumen } from '../../domain/entities';
import type { AutoevaluacionFilters } from '../../domain/types';
import { AutoevaluacionService } from '../../application/services';
import { AutoevaluacionRepository } from '../../infrastructure/repositories';
import { extractErrorMessage } from '../../shared/utils/error';

export const useAutoevaluacion = () => {
  const [autoevaluaciones, setAutoevaluaciones] = useState<Autoevaluacion[]>([]);
  const [porCompletar, setPorCompletar] = useState<Autoevaluacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const repository = new AutoevaluacionRepository();
  const service = new AutoevaluacionService(repository);

  const fetchAutoevaluaciones = useCallback(async (filters?: AutoevaluacionFilters) => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.getAutoevaluaciones(filters);
      setAutoevaluaciones(data);
      return data;
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al cargar autoevaluaciones'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener una autoevaluación específica por ID
   */
  const getAutoevaluacion = useCallback(async (id: number): Promise<Autoevaluacion> => {
    setLoading(true);
    setError(null);
    try {
      return await service.getAutoevaluacion(id);
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al obtener autoevaluación'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (data: AutoevaluacionCreate) => {
    try {
      const newAutoevaluacion = await service.createAutoevaluacion(data);
      setAutoevaluaciones(prev => [...prev, newAutoevaluacion]);
      return newAutoevaluacion;
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al crear autoevaluación'));
      throw err;
    }
  }, []);

  const update = useCallback(async (id: number, data: AutoevaluacionUpdate) => {
    try {
      const updatedAutoevaluacion = await service.updateAutoevaluacion(id, data);
      setAutoevaluaciones(prev => prev.map(a => a.id === id ? updatedAutoevaluacion : a));
      return updatedAutoevaluacion;
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al actualizar autoevaluación'));
      throw err;
    }
  }, []);

  const deleteAutoevaluacion = useCallback(async (id: number) => {
    try {
      await service.deleteAutoevaluacion(id);
      setAutoevaluaciones(prev => prev.filter(a => a.id !== id));
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al eliminar autoevaluación'));
      throw err;
    }
  }, []);

  /**
   * Validar autoevaluación (submit/finalize)
   */
  const validar = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await service.validarAutoevaluacion(id);
      setAutoevaluaciones(prev => prev.map(a => a.id === id ? updated : a));
      return updated;
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al validar autoevaluación'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Duplicar autoevaluación (copy from previous year)
   */
  const duplicar = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const newAutoevaluacion = await service.duplicarAutoevaluacion(id);
      setAutoevaluaciones(prev => [...prev, newAutoevaluacion]);
      return newAutoevaluacion;
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al duplicar autoevaluación'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener resumen de cumplimientos
   */
  const getResumen = useCallback(async (id: number): Promise<AutoevaluacionResumen> => {
    try {
      return await service.getResumen(id);
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al obtener resumen'));
      throw err;
    }
  }, []);

  /**
   * Obtener autoevaluaciones pendientes de completar
   */
  const getAutoevaluacionesPorCompletar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.getAutoevaluacionesPorCompletar();
      setPorCompletar(data);
      return data;
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al obtener autoevaluaciones por completar'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * @deprecated Usar getAutoevaluacionesPorCompletar() en su lugar
   */
  const getPorCompletar = useCallback(async () => {
    return getAutoevaluacionesPorCompletar();
  }, [getAutoevaluacionesPorCompletar]);

  return {
    autoevaluaciones,
    porCompletar,
    loading,
    error,
    fetchAutoevaluaciones,
    getAutoevaluacion,
    create,
    update,
    delete: deleteAutoevaluacion,
    validar,
    duplicar,
    getResumen,
    getAutoevaluacionesPorCompletar,
    getPorCompletar, // Legacy
    service,
  };
};
