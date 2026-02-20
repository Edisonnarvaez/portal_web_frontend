import { useState, useCallback } from 'react';
import type { Hallazgo, HallazgoCreate, HallazgoUpdate, EstadisticasHallazgos, HallazgoPorOrigen } from '../../domain/entities';
import { HallazgoService } from '../../application/services';

export const useHallazgo = () => {
  const [hallazgos, setHallazgos] = useState<Hallazgo[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasHallazgos | null>(null);
  const [abiertos, setAbiertos] = useState<Hallazgo[]>([]);
  const [criticos, setCriticos] = useState<Hallazgo[]>([]);
  const [porOrigen, setPorOrigen] = useState<HallazgoPorOrigen[]>([]);
  const [sinPlan, setSinPlan] = useState<Hallazgo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const service = new HallazgoService();

  const getHallazgo = useCallback(async (id: number): Promise<Hallazgo> => {
    try {
      return await service.getHallazgo(id);
    } catch (err: any) {
      setError(err.message || 'Error al obtener hallazgo');
      throw err;
    }
  }, []);

  const fetchHallazgos = useCallback(async (filters?: Record<string, any>) => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.getHallazgos(filters);
      setHallazgos(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar hallazgos');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPorAutoevaluacion = useCallback(async (autoevaluacionId: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.getHallazgosPorAutoevaluacion(autoevaluacionId);
      setHallazgos(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar hallazgos');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEstadisticas = useCallback(async (filters?: Record<string, any>) => {
    try {
      const data = await service.getEstadisticas(filters);
      setEstadisticas(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar estadísticas');
    }
  }, []);

  const fetchAbiertos = useCallback(async () => {
    try {
      const data = await service.getAbiertos();
      setAbiertos(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar hallazgos abiertos');
    }
  }, []);

  const fetchCriticos = useCallback(async () => {
    try {
      const data = await service.getCriticos();
      setCriticos(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar hallazgos críticos');
    }
  }, []);

  const createHallazgo = useCallback(async (data: HallazgoCreate) => {
    try {
      const newHallazgo = await service.createHallazgo(data);
      setHallazgos(prev => [...prev, newHallazgo]);
      return newHallazgo;
    } catch (err: any) {
      setError(err.message || 'Error al crear hallazgo');
      throw err;
    }
  }, []);

  const updateHallazgo = useCallback(async (id: number, data: HallazgoUpdate) => {
    try {
      const updated = await service.updateHallazgo(id, data);
      setHallazgos(prev => prev.map(h => h.id === id ? updated : h));
      return updated;
    } catch (err: any) {
      setError(err.message || 'Error al actualizar hallazgo');
      throw err;
    }
  }, []);

  const deleteHallazgo = useCallback(async (id: number) => {
    try {
      await service.deleteHallazgo(id);
      setHallazgos(prev => prev.filter(h => h.id !== id));
    } catch (err: any) {
      setError(err.message || 'Error al eliminar hallazgo');
      throw err;
    }
  }, []);

  const fetchPorOrigen = useCallback(async () => {
    try {
      const data = await service.getPorOrigen();
      setPorOrigen(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar hallazgos por origen');
    }
  }, []);

  const fetchSinPlan = useCallback(async () => {
    try {
      const data = await service.getSinPlan();
      setSinPlan(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar hallazgos sin plan');
    }
  }, []);

  return {
    hallazgos,
    estadisticas,
    abiertos,
    criticos,
    porOrigen,
    sinPlan,
    loading,
    error,
    fetchHallazgos,
    fetchPorAutoevaluacion,
    fetchEstadisticas,
    fetchAbiertos,
    fetchCriticos,
    fetchPorOrigen,
    fetchSinPlan,
    getHallazgo,
    createHallazgo,
    updateHallazgo,
    deleteHallazgo,
    service,
  };
};
