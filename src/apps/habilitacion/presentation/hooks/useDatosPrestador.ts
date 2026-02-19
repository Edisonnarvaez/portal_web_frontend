import { useState, useEffect, useCallback } from 'react';
import type { DatosPrestador, DatosPrestadorCreate, DatosPrestadorUpdate } from '../../domain/entities';
import { DatosPrestadorService } from '../../application/services';
import { DatosPrestadorRepository } from '../../infrastructure/repositories';

export const useDatosPrestador = () => {
  const [datos, setDatos] = useState<DatosPrestador[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const repository = new DatosPrestadorRepository();
  const service = new DatosPrestadorService(repository);

  const fetchDatos = useCallback(async (filters?: Record<string, any>) => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.getDatosPrestadores(filters);
      setDatos(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (data: DatosPrestadorCreate) => {
    try {
      const newData = await service.createDatosPrestador(data);
      setDatos(prev => [...prev, newData]);
      return newData;
    } catch (err: any) {
      setError(err.message || 'Error al crear datos');
      throw err;
    }
  }, []);

  const update = useCallback(async (id: number, data: DatosPrestadorUpdate) => {
    try {
      const updatedData = await service.updateDatosPrestador(id, data);
      setDatos(prev => prev.map(d => d.id === id ? updatedData : d));
      return updatedData;
    } catch (err: any) {
      setError(err.message || 'Error al actualizar datos');
      throw err;
    }
  }, []);

  const deleteDatos = useCallback(async (id: number) => {
    try {
      await service.deleteDatosPrestador(id);
      setDatos(prev => prev.filter(d => d.id !== id));
    } catch (err: any) {
      setError(err.message || 'Error al eliminar datos');
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

  const iniciarRenovacion = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await service.iniciarRenovacion(id);
      setDatos(prev => prev.map(d => d.id === id ? updated : d));
      return updated;
    } catch (err: any) {
      setError(err.message || 'Error al iniciar renovación');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    datos,
    loading,
    error,
    fetchDatos,
    create,
    update,
    delete: deleteDatos,
    getProximosAVencer,
    iniciarRenovacion,
    service,
  };
};
