import { useState, useCallback } from 'react';
import type { PlanMejora, PlanMejoraCreate, PlanMejoraUpdate, PlanMejoraResumen, PlanMejoraPorOrigen, SoportePlan } from '../../domain/entities';
import { PlanMejoraService } from '../../application/services';

export const usePlanMejora = () => {
  const [planes, setPlanes] = useState<PlanMejora[]>([]);
  const [resumen, setResumen] = useState<PlanMejoraResumen | null>(null);
  const [proximosVencer, setProximosVencer] = useState<PlanMejora[]>([]);
  const [vencidos, setVencidos] = useState<PlanMejora[]>([]);
  const [porOrigen, setPorOrigen] = useState<PlanMejoraPorOrigen[]>([]);
  const [soportes, setSoportes] = useState<SoportePlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const service = new PlanMejoraService();

  const getPlanDeMejora = useCallback(async (id: number): Promise<PlanMejora> => {
    try {
      return await service.getPlanDeMejora(id);
    } catch (err: any) {
      setError(err.message || 'Error al obtener plan de mejora');
      throw err;
    }
  }, []);

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

  const fetchResumen = useCallback(async (filters?: Record<string, any>) => {
    try {
      const data = await service.getResumen(filters);
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

  const fetchPorOrigen = useCallback(async () => {
    try {
      const data = await service.getPorOrigen();
      setPorOrigen(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar planes por origen');
    }
  }, []);

  const fetchSoportes = useCallback(async (planId: number) => {
    try {
      const data = await service.getSoportes(planId);
      setSoportes(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Error al cargar soportes');
      throw err;
    }
  }, []);

  const uploadSoporte = useCallback(async (planId: number, formData: FormData) => {
    try {
      const newSoporte = await service.uploadSoporte(planId, formData);
      setSoportes(prev => [...prev, newSoporte]);
      return newSoporte;
    } catch (err: any) {
      setError(err.message || 'Error al subir soporte');
      throw err;
    }
  }, []);

  const deleteSoporte = useCallback(async (planId: number, soporteId: number) => {
    try {
      await service.deleteSoporte(planId, soporteId);
      setSoportes(prev => prev.filter(s => s.id !== soporteId));
    } catch (err: any) {
      setError(err.message || 'Error al eliminar soporte');
      throw err;
    }
  }, []);

  return {
    planes,
    resumen,
    proximosVencer,
    vencidos,
    porOrigen,
    soportes,
    loading,
    error,
    fetchPlanes,
    fetchPorAutoevaluacion,
    fetchResumen,
    fetchProximosAVencer,
    fetchVencidos,
    fetchPorOrigen,
    fetchSoportes,
    uploadSoporte,
    deleteSoporte,
    getPlanDeMejora,
    createPlan,
    updatePlan,
    deletePlan,
    service,
  };
};
