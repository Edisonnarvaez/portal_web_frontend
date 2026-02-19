import { useState, useCallback } from 'react';
import type { Hallazgo, HallazgoCreate, HallazgoUpdate, EstadisticasHallazgos } from '../../domain/entities';
import { HallazgoService } from '../../application/services';

export const useHallazgo = () => {
  const [hallazgos, setHallazgos] = useState<Hallazgo[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasHallazgos | null>(null);
  const [abiertos, setAbiertos] = useState<Hallazgo[]>([]);
  const [criticos, setCriticos] = useState<Hallazgo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const service = new HallazgoService();

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

  const fetchEstadisticas = useCallback(async (autoevaluacionId: number) => {
    try {
      const data = await service.getEstadisticas(autoevaluacionId);
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

  return {
    hallazgos,
    estadisticas,
    abiertos,
    criticos,
    loading,
    error,
    fetchHallazgos,
    fetchPorAutoevaluacion,
    fetchEstadisticas,
    fetchAbiertos,
    fetchCriticos,
    createHallazgo,
    updateHallazgo,
    deleteHallazgo,
  };
};
