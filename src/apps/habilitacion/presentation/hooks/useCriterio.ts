import { useState, useEffect, useCallback } from 'react';
import type { Criterio, CriterioCreate, CriterioUpdate, CriterioEvaluacion } from '../../domain/entities';
import { CriterioService } from '../../application/services';

export const useCriterio = () => {
  const [criterios, setCriterios] = useState<Criterio[]>([]);
  const [evaluaciones, setEvaluaciones] = useState<CriterioEvaluacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const service = new CriterioService();

  const fetchCriterios = useCallback(async (filters?: Record<string, any>) => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.getCriterios(filters);
      setCriterios(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar criterios');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEvaluaciones = useCallback(async (autoevaluacionId: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.getEvaluacionesByCriterio(autoevaluacionId);
      setEvaluaciones(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar evaluaciones');
    } finally {
      setLoading(false);
    }
  }, []);

  const createCriterio = useCallback(async (data: CriterioCreate) => {
    try {
      const newCriterio = await service.createCriterio(data);
      setCriterios(prev => [...prev, newCriterio]);
      return newCriterio;
    } catch (err: any) {
      setError(err.message || 'Error al crear criterio');
      throw err;
    }
  }, []);

  const updateCriterio = useCallback(async (id: number, data: CriterioUpdate) => {
    try {
      const updated = await service.updateCriterio(id, data);
      setCriterios(prev => prev.map(c => c.id === id ? updated : c));
      return updated;
    } catch (err: any) {
      setError(err.message || 'Error al actualizar criterio');
      throw err;
    }
  }, []);

  const deleteCriterio = useCallback(async (id: number) => {
    try {
      await service.deleteCriterio(id);
      setCriterios(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      setError(err.message || 'Error al eliminar criterio');
      throw err;
    }
  }, []);

  const createEvaluacion = useCallback(async (data: any) => {
    try {
      const newEval = await service.createEvaluacion(data);
      setEvaluaciones(prev => [...prev, newEval]);
      return newEval;
    } catch (err: any) {
      setError(err.message || 'Error al crear evaluación');
      throw err;
    }
  }, []);

  const updateEvaluacion = useCallback(async (id: number, data: any) => {
    try {
      const updated = await service.updateEvaluacion(id, data);
      setEvaluaciones(prev => prev.map(e => e.id === id ? updated : e));
      return updated;
    } catch (err: any) {
      setError(err.message || 'Error al actualizar evaluación');
      throw err;
    }
  }, []);

  return {
    criterios,
    evaluaciones,
    loading,
    error,
    fetchCriterios,
    fetchEvaluaciones,
    createCriterio,
    updateCriterio,
    deleteCriterio,
    createEvaluacion,
    updateEvaluacion,
  };
};
