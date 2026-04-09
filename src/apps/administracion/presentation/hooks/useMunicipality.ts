import { useState, useCallback } from 'react';
import { MunicipalityService } from '../../application/services';
import type { Municipality, MunicipalityCreate, MunicipalityUpdate } from '../../domain/entities';
import { extractErrorMessage } from '../../../../shared/utils/error';

/**
 * useMunicipality Hook
 * Gestiona el estado y operaciones de municipios
 */
export const useMunicipality = () => {
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [municipality, setMunicipality] = useState<Municipality | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Obtener todos los municipios
   */
  const fetchMunicipalities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await MunicipalityService.getMunicipalities();
      setMunicipalities(data);
      return data;
    } catch (err: unknown) {
      const errorMsg = extractErrorMessage(err, 'Error al cargar municipios');
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener municipios de una región
   */
  const fetchMunicipalitiesByRegion = useCallback(async (regionId: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await MunicipalityService.getMunicipalitiesByRegion(regionId);
      setMunicipalities(data);
      return data;
    } catch (err: unknown) {
      const errorMsg = extractErrorMessage(err, 'Error al cargar municipios');
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener municipio por ID
   */
  const fetchMunicipality = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await MunicipalityService.getMunicipality(id);
      setMunicipality(data);
      return data;
    } catch (err: unknown) {
      const errorMsg = extractErrorMessage(err, 'Error al cargar municipio');
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crear nuevo municipio
   */
  const createMunicipality = useCallback(async (data: MunicipalityCreate) => {
    setLoading(true);
    setError(null);
    try {
      const newMunicipality = await MunicipalityService.createMunicipality(data);
      setMunicipalities(prev => [...prev, newMunicipality]);
      return newMunicipality;
    } catch (err: unknown) {
      const errorMsg = extractErrorMessage(err, 'Error al crear municipio');
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualizar municipio
   */
  const updateMunicipality = useCallback(async (id: number, data: MunicipalityUpdate) => {
    setLoading(true);
    setError(null);
    try {
      const updatedMunicipality = await MunicipalityService.updateMunicipality(id, data);
      setMunicipalities(prev => prev.map(m => m.id === id ? updatedMunicipality : m));
      if (municipality?.id === id) setMunicipality(updatedMunicipality);
      return updatedMunicipality;
    } catch (err: unknown) {
      const errorMsg = extractErrorMessage(err, 'Error al actualizar municipio');
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [municipality?.id]);

  /**
   * Eliminar municipio
   */
  const deleteMunicipality = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await MunicipalityService.deleteMunicipality(id);
      setMunicipalities(prev => prev.filter(m => m.id !== id));
      if (municipality?.id === id) setMunicipality(null);
    } catch (err: unknown) {
      const errorMsg = extractErrorMessage(err, 'Error al eliminar municipio');
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [municipality?.id]);

  /**
   * Validar datos de municipio
   */
  const validateData = useCallback((data: Partial<MunicipalityCreate>) => {
    return MunicipalityService.validateMunicipalityData(data);
  }, []);

  /**
   * Limpiar errores
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Obtener nombre de municipio por ID
   */
  const getMunicipalityName = useCallback((municipalityId: number): string => {
    const municipality = municipalities.find(m => m.id === municipalityId);
    return municipality ? municipality.name : 'N/A';
  }, [municipalities]);

  return {
    municipalities,
    municipality,
    loading,
    error,
    fetchMunicipalities,
    fetchMunicipalitiesByRegion,
    fetchMunicipality,
    createMunicipality,
    updateMunicipality,
    deleteMunicipality,
    validateData,
    clearError,
    getMunicipalityName,
  };
};
