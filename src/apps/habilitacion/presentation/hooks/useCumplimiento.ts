import { useState, useCallback } from 'react';
import type { Cumplimiento, CumplimientoCreate, CumplimientoUpdate } from '../../domain/entities';
import { CumplimientoService } from '../../application/services';
import { CumplimientoRepository } from '../../infrastructure/repositories';

export const useCumplimiento = () => {
  const [cumplimientos, setCumplimientos] = useState<Cumplimiento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const repository = new CumplimientoRepository();
  const service = new CumplimientoService(repository);

  const fetchCumplimientos = useCallback(async (filters?: Record<string, any>) => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.getCumplimientos(filters);
      setCumplimientos(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar cumplimientos');
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (data: CumplimientoCreate) => {
    try {
      const newCumplimiento = await service.createCumplimiento(data);
      setCumplimientos(prev => [...prev, newCumplimiento]);
      return newCumplimiento;
    } catch (err: any) {
      setError(err.message || 'Error al crear cumplimiento');
      throw err;
    }
  }, []);

  const update = useCallback(async (id: number, data: CumplimientoUpdate) => {
    try {
      const updatedCumplimiento = await service.updateCumplimiento(id, data);
      setCumplimientos(prev => prev.map(c => c.id === id ? updatedCumplimiento : c));
      return updatedCumplimiento;
    } catch (err: any) {
      setError(err.message || 'Error al actualizar cumplimiento');
      throw err;
    }
  }, []);

  const deleteCumplimiento = useCallback(async (id: number) => {
    try {
      await service.deleteCumplimiento(id);
      setCumplimientos(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      setError(err.message || 'Error al eliminar cumplimiento');
      throw err;
    }
  }, []);

  const getSinCumplir = useCallback(async () => {
    try {
      return await service.getCumplimientosSinCumplir();
    } catch (err: any) {
      setError(err.message || 'Error al obtener sin cumplir');
      throw err;
    }
  }, []);

  const getConPlanMejora = useCallback(async () => {
    try {
      return await service.getCumplimientosConPlanMejora();
    } catch (err: any) {
      setError(err.message || 'Error al obtener con plan mejora');
      throw err;
    }
  }, []);

  const getMejorasVencidas = useCallback(async () => {
    try {
      return await service.getMejorasVencidas();
    } catch (err: any) {
      setError(err.message || 'Error al obtener mejoras vencidas');
      throw err;
    }
  }, []);

  return {
    cumplimientos,
    loading,
    error,
    fetchCumplimientos,
    create,
    update,
    delete: deleteCumplimiento,
    getSinCumplir,
    getConPlanMejora,
    getMejorasVencidas,
    service,
  };
};
