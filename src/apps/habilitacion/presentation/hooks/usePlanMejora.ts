import { useState, useCallback } from 'react';
import type { PlanMejora, PlanMejoraCreate, PlanMejoraUpdate, PlanMejoraResumen } from '../../domain/entities';
import { PlanMejoraService } from '../../application/services';

export const usePlanMejora = () => {
  const [planes, setPlanes] = useState<PlanMejora[]>([]);
  const [resumen, setResumen] = useState<PlanMejoraResumen | null>(null);
  const [proximosVencer, setProximosVencer] = useState<PlanMejora[]>([]);
  const [vencidos, setVencidos] = useState<PlanMejora[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const service = new PlanMejoraService();

  const fetchPlanes = useCallback(async (filters?: Record<string, any>) => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.getPlanesDeMejora(filters);
      setPlanes(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar planes de mejora');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPorAutoevaluacion = useCallback(async (autoevaluacionId: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.getPorAutoevaluacion(autoevaluacionId);
      setPlanes(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar planes');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchResumen = useCallback(async (autoevaluacionId: number) => {
    try {
      const data = await service.getResumen(autoevaluacionId);
      setResumen(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar resumen');
    }
  }, []);

  const fetchProximosAVencer = useCallback(async (dias: number = 30) => {
    try {
      const data = await service.getProximosAVencer(dias);
      setProximosVencer(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar próximos a vencer');
    }
  }, []);

  const fetchVencidos = useCallback(async () => {
    try {
      const data = await service.getVencidos();
      setVencidos(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar vencidos');
    }
  }, []);

  const createPlan = useCallback(async (data: PlanMejoraCreate) => {
    try {
      const newPlan = await service.createPlanDeMejora(data);
      setPlanes(prev => [...prev, newPlan]);
      return newPlan;
    } catch (err: any) {
      setError(err.message || 'Error al crear plan');
      throw err;
    }
  }, []);

  const updatePlan = useCallback(async (id: number, data: PlanMejoraUpdate) => {
    try {
      const updated = await service.updatePlanDeMejora(id, data);
      setPlanes(prev => prev.map(p => p.id === id ? updated : p));
      return updated;
    } catch (err: any) {
      setError(err.message || 'Error al actualizar plan');
      throw err;
    }
  }, []);

  const deletePlan = useCallback(async (id: number) => {
    try {
      await service.deletePlanDeMejora(id);
      setPlanes(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      setError(err.message || 'Error al eliminar plan');
      throw err;
    }
  }, []);

  return {
    planes,
    resumen,
    proximosVencer,
    vencidos,
    loading,
    error,
    fetchPlanes,
    fetchPorAutoevaluacion,
    fetchResumen,
    fetchProximosAVencer,
    fetchVencidos,
    createPlan,
    updatePlan,
    deletePlan,
  };
};
