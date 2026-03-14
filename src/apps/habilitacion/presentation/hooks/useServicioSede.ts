import { useState, useCallback } from 'react';
import type { ServicioSede, ServicioSedeCreate, ServicioSedeUpdate } from '../../domain/entities';
import type { Cumplimiento } from '../../domain/entities/Cumplimiento';
import type { ServicioSedeFilters } from '../../domain/types';
import { ServicioSedeService } from '../../application/services';
import { ServicioSedeRepository } from '../../infrastructure/repositories';
import { extractErrorMessage } from '../../shared/utils/error';

/**
 * useServicioSede
 * Hook personalizado para gestionar servicios de salud
 * Proporciona funcionalidad CRUD y queries especializadas
 */
export const useServicioSede = () => {
  const [servicios, setServicios] = useState<ServicioSede[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const repository = new ServicioSedeRepository();
  const service = new ServicioSedeService(repository);

  // ========== Queries ==========

  /**
   * Obtener todos los servicios con filtros opcionales
   */
  const fetchServicios = useCallback(async (filters?: ServicioSedeFilters) => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.getServicios(filters);
      setServicios(data);
      return data;
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al cargar servicios'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener servicios de un prestador específico
   */
  const getServiciosByPrestador = useCallback(async (prestadorId: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.getServiciosByPrestador(prestadorId);
      setServicios(data);
      return data;
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al obtener servicios del prestador'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Método legado para compatibilidad
   * @deprecated Usar getServiciosByPrestador() en su lugar
   */
  const getServiciosByHeadquarters = useCallback(async (headquartersId: number) => {
    return getServiciosByPrestador(headquartersId);
  }, [getServiciosByPrestador]);

  /**
   * Obtener un servicio por ID
   */
  const getServicio = useCallback(async (id: number): Promise<ServicioSede> => {
    setLoading(true);
    setError(null);
    try {
      return await service.getServicio(id);
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al obtener servicio'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener cumplimientos de un servicio
   */
  const getCumplimientos = useCallback(async (id: number): Promise<Cumplimiento[]> => {
    try {
      return await service.getCumplimientos(id);
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al obtener cumplimientos'));
      throw err;
    }
  }, []);

  /**
   * Obtener servicios próximos a vencer
   * El servicio filtra automáticamente por los próximos 90 días
   */
  const getServiciosProximosAVencer = useCallback(async (): Promise<ServicioSede[]> => {
    setLoading(true);
    setError(null);
    try {
      return await service.getProximosAVencer();
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al obtener próximos a vencer'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener servicios por complejidad
   */
  const getServiciosPorComplejidad = useCallback(async (complejidad: 'BAJA' | 'MEDIA' | 'ALTA'): Promise<ServicioSede[]> => {
    setLoading(true);
    setError(null);
    try {
      return await service.getPorComplejidad(complejidad);
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al obtener servicios por complejidad'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ========== Mutations ==========

  /**
   * Crear un nuevo servicio
   */
  const create = useCallback(async (data: ServicioSedeCreate) => {
    try {
      const newServicio = await service.createServicio(data);
      setServicios(prev => [...prev, newServicio]);
      setError(null);
      return newServicio;
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al crear servicio'));
      throw err;
    }
  }, []);

  /**
   * Actualizar un servicio existente
   */
  const update = useCallback(async (id: number, data: ServicioSedeUpdate) => {
    try {
      const updatedServicio = await service.updateServicio(id, data);
      setServicios(prev => prev.map(s => s.id === id ? updatedServicio : s));
      setError(null);
      return updatedServicio;
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al actualizar servicio'));
      throw err;
    }
  }, []);

  /**
   * Eliminar un servicio
   */
  const deleteServicio = useCallback(async (id: number) => {
    try {
      await service.deleteServicio(id);
      setServicios(prev => prev.filter(s => s.id !== id));
      setError(null);
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al eliminar servicio'));
      throw err;
    }
  }, []);

  // ========== Utility Methods ==========

  /**
   * Calcular días para vencimiento
   */
  const diasParaVencimiento = useCallback((fechaVencimiento?: string): number | null => {
    return service.diasParaVencimiento(fechaVencimiento);
  }, []);

  /**
   * Verificar si está próximo a vencer
   */
  const estaProximoAVencer = useCallback((fechaVencimiento?: string, dias?: number): boolean => {
    return service.estaProximoAVencer(fechaVencimiento, dias);
  }, []);

  /**
   * Verificar si está vencido
   */
  const estaVencido = useCallback((fechaVencimiento?: string): boolean => {
    return service.estaVencido(fechaVencimiento);
  }, []);

  /**
   * Obtener color CSS para complejidad
   */
  const getComplejidadColor = useCallback((complejidad: string): string => {
    return service.getComplejidadColor(complejidad);
  }, []);

  /**
   * Obtener color CSS para estado
   */
  const getEstadoHabilitacionColor = useCallback((estado: string): string => {
    return service.getEstadoHabilitacionColor(estado);
  }, []);

  /**
   * Obtener color CSS para modalidad
   */
  const getModalidadColor = useCallback((modalidad: string): string => {
    return service.getModalidadColor(modalidad);
  }, []);

  /**
   * Validar datos de servicio
   */
  const validarDatos = useCallback((data: ServicioSedeCreate | ServicioSedeUpdate) => {
    return service.validarDatos(data);
  }, []);

  return {
    // State
    servicios,
    loading,
    error,
    
    // Queries
    fetchServicios,
    getServicio,
    getServiciosByPrestador,
    getServiciosByHeadquarters, // Legacy
    getServiciosProximosAVencer,
    getCumplimientos,
    getServiciosPorComplejidad,
    
    // Mutations
    create,
    update,
    delete: deleteServicio,
    
    // Utilities
    diasParaVencimiento,
    estaProximoAVencer,
    estaVencido,
    getComplejidadColor,
    getEstadoHabilitacionColor,
    getModalidadColor,
    validarDatos,
    
    // Service
    service,
  };
};
