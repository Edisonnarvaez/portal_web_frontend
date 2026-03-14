import { useState, useCallback } from 'react';
import type {
  Cumplimiento,
  CumplimientoCreate,
  CumplimientoUpdate,
  ServiciosDeAutoevaluacionResponse,
} from '../../domain/entities';
import type { CumplimientoFilters } from '../../domain/types';
import { CumplimientoService } from '../../application/services';
import { CumplimientoRepository } from '../../infrastructure/repositories';
import { extractErrorMessage } from '../../shared/utils/error';

export const useCumplimiento = () => {
  const [cumplimientos, setCumplimientos] = useState<Cumplimiento[]>([]);
  const [sinCumplir, setSinCumplir] = useState<Cumplimiento[]>([]);
  const [conPlanMejora, setConPlanMejora] = useState<Cumplimiento[]>([]);
  const [mejorasVencidas, setMejorasVencidas] = useState<Cumplimiento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const repository = new CumplimientoRepository();
  const service = new CumplimientoService(repository);

  const fetchCumplimientos = useCallback(async (filters?: CumplimientoFilters) => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.getCumplimientos(filters);
      setCumplimientos(data);
      return data;
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al cargar cumplimientos'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener un cumplimiento específico por ID
   */
  const getCumplimiento = useCallback(async (id: number): Promise<Cumplimiento> => {
    setLoading(true);
    setError(null);
    try {
      return await service.getCumplimiento(id);
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al obtener cumplimiento'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (data: CumplimientoCreate) => {
    try {
      const newCumplimiento = await service.createCumplimiento(data);
      setCumplimientos(prev => [...prev, newCumplimiento]);
      return newCumplimiento;
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al crear cumplimiento'));
      throw err;
    }
  }, []);

  const update = useCallback(async (id: number, data: CumplimientoUpdate) => {
    try {
      const updatedCumplimiento = await service.updateCumplimiento(id, data);
      setCumplimientos(prev => prev.map(c => c.id === id ? updatedCumplimiento : c));
      return updatedCumplimiento;
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al actualizar cumplimiento'));
      throw err;
    }
  }, []);

  const deleteCumplimiento = useCallback(async (id: number) => {
    try {
      await service.deleteCumplimiento(id);
      setCumplimientos(prev => prev.filter(c => c.id !== id));
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al eliminar cumplimiento'));
      throw err;
    }
  }, []);

  /**
   * Obtener cumplimientos sin cumplir
   */
  const getCumplimientosSinCumplir = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.getCumplimientosSinCumplir();
      setSinCumplir(data);
      return data;
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al obtener sin cumplir'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * @deprecated Usar getCumplimientosSinCumplir() en su lugar
   */
  const getSinCumplir = useCallback(async () => {
    return getCumplimientosSinCumplir();
  }, [getCumplimientosSinCumplir]);

  /**
   * Obtener cumplimientos con plan de mejora
   */
  const getCumplimientosConPlanMejora = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.getCumplimientosConPlanMejora();
      setConPlanMejora(data);
      return data;
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al obtener con plan mejora'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * @deprecated Usar getCumplimientosConPlanMejora() en su lugar
   */
  const getConPlanMejora = useCallback(async () => {
    return getCumplimientosConPlanMejora();
  }, [getCumplimientosConPlanMejora]);

  /**
   * Obtener mejoras vencidas (planes de mejora cuya fecha ha pasado)
   */
  const getMejorasVencidas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.getMejorasVencidas();
      setMejorasVencidas(data);
      return data;
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al obtener mejoras vencidas'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener servicios de una autoevaluación específica
   * Útil para llenar dropdown en CumplimientoFormModal
   */
  const getServiciosDeAutoevaluacion = useCallback(async (autoevaluacionId: number): Promise<ServiciosDeAutoevaluacionResponse> => {
    try {
      return await service.getServiciosDeAutoevaluacion(autoevaluacionId);
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al obtener servicios de autoevaluación'));
      throw err;
    }
  }, []);

  /**
   * Obtener criterios de una autoevaluación específica
   * Útil para llenar dropdown en CumplimientoFormModal
   */
  const getCriteriosDeAutoevaluacion = useCallback(async (autoevaluacionId: number) => {
    try {
      return await service.getCriteriosDeAutoevaluacion?.(autoevaluacionId) || [];
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al obtener criterios de autoevaluación'));
      throw err;
    }
  }, []);

  return {
    cumplimientos,
    sinCumplir,
    conPlanMejora,
    mejorasVencidas,
    loading,
    error,
    fetchCumplimientos,
    getCumplimiento,
    create,
    update,
    delete: deleteCumplimiento,
    getCumplimientosSinCumplir,
    getSinCumplir, // Legacy
    getCumplimientosConPlanMejora,
    getConPlanMejora, // Legacy
    getMejorasVencidas,
    getServiciosDeAutoevaluacion,
    getCriteriosDeAutoevaluacion,
    service,
  };
};
