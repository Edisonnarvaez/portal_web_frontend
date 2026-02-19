import { useState, useCallback } from 'react';
import type { ServicioSede, ServicioSedeCreate, ServicioSedeUpdate } from '../../domain/entities';
import { ServicioSedeService } from '../../application/services';
import { ServicioSedeRepository } from '../../infrastructure/repositories';

export const useServicioSede = () => {
  const [servicios, setServicios] = useState<ServicioSede[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const repository = new ServicioSedeRepository();
  const service = new ServicioSedeService(repository);

  const fetchServicios = useCallback(async (filters?: Record<string, any>) => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.getServicios(filters);
      setServicios(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar servicios');
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (data: ServicioSedeCreate) => {
    try {
      const newServicio = await service.createServicio(data);
      setServicios(prev => [...prev, newServicio]);
      return newServicio;
    } catch (err: any) {
      setError(err.message || 'Error al crear servicio');
      throw err;
    }
  }, []);

  const update = useCallback(async (id: number, data: ServicioSedeUpdate) => {
    try {
      const updatedServicio = await service.updateServicio(id, data);
      setServicios(prev => prev.map(s => s.id === id ? updatedServicio : s));
      return updatedServicio;
    } catch (err: any) {
      setError(err.message || 'Error al actualizar servicio');
      throw err;
    }
  }, []);

  const deleteServicio = useCallback(async (id: number) => {
    try {
      await service.deleteServicio(id);
      setServicios(prev => prev.filter(s => s.id !== id));
    } catch (err: any) {
      setError(err.message || 'Error al eliminar servicio');
      throw err;
    }
  }, []);

  const getProximosAVencer = useCallback(async (dias?: number) => {
    try {
      return await service.getProximosAVencer(dias);
    } catch (err: any) {
      setError(err.message || 'Error al obtener próximos a vencer');
      throw err;
    }
  }, []);

  return {
    servicios,
    loading,
    error,
    fetchServicios,
    create,
    update,
    delete: deleteServicio,
    getProximosAVencer,
    service,
  };
};
