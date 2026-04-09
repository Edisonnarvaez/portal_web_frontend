import { useState, useCallback } from 'react';
import { RegionService } from '../../application/services';
import type { Region, RegionCreate, RegionUpdate } from '../../domain/entities';
import { extractErrorMessage } from '../../../../shared/utils/error';

/**
 * useRegion Hook
 * Gestiona el estado y operaciones de regiones
 */
export const useRegion = () => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [region, setRegion] = useState<Region | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Obtener todas las regiones
   */
  const fetchRegions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await RegionService.getRegions();
      setRegions(data);
      return data;
    } catch (err: unknown) {
      const errorMsg = extractErrorMessage(err, 'Error al cargar regiones');
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener región por ID
   */
  const fetchRegion = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await RegionService.getRegion(id);
      setRegion(data);
      return data;
    } catch (err: unknown) {
      const errorMsg = extractErrorMessage(err, 'Error al cargar región');
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crear nueva región
   */
  const createRegion = useCallback(async (data: RegionCreate) => {
    setLoading(true);
    setError(null);
    try {
      const newRegion = await RegionService.createRegion(data);
      setRegions(prev => [...prev, newRegion]);
      return newRegion;
    } catch (err: unknown) {
      const errorMsg = extractErrorMessage(err, 'Error al crear región');
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualizar región
   */
  const updateRegion = useCallback(async (id: number, data: RegionUpdate) => {
    setLoading(true);
    setError(null);
    try {
      const updatedRegion = await RegionService.updateRegion(id, data);
      setRegions(prev => prev.map(r => r.id === id ? updatedRegion : r));
      if (region?.id === id) setRegion(updatedRegion);
      return updatedRegion;
    } catch (err: unknown) {
      const errorMsg = extractErrorMessage(err, 'Error al actualizar región');
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [region?.id]);

  /**
   * Eliminar región
   */
  const deleteRegion = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await RegionService.deleteRegion(id);
      setRegions(prev => prev.filter(r => r.id !== id));
      if (region?.id === id) setRegion(null);
    } catch (err: unknown) {
      const errorMsg = extractErrorMessage(err, 'Error al eliminar región');
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [region?.id]);

  /**
   * Validar datos de región
   */
  const validateData = useCallback((data: Partial<RegionCreate>) => {
    return RegionService.validateRegionData(data);
  }, []);

  /**
   * Limpiar errores
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Obtener nombre de región por ID
   */
  const getRegionName = useCallback((regionId: number): string => {
    const region = regions.find(r => r.id === regionId);
    return region ? region.name : 'N/A';
  }, [regions]);

  return {
    regions,
    region,
    loading,
    error,
    fetchRegions,
    fetchRegion,
    createRegion,
    updateRegion,
    deleteRegion,
    validateData,
    clearError,
    getRegionName,
  };
};
