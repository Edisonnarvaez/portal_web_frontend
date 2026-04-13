import { useState, useCallback } from 'react';
import type {
  CategoriaSoporte,
  TipoDocumentoSoporte,
  SoporteDocumental,
  SoporteRequerido,
} from '../../domain/entities/SoporteDocumental';
import type { NivelSoporte } from '../../domain/types/SoporteTypes';
import { SoporteService } from '../../application/services/SoporteService';
import { SoporteRepository } from '../../infrastructure/repositories/SoporteRepository';
import { extractErrorMessage } from '../../shared/utils/error';

/**
 * useSoporte
 * React hook for managing supporting documents and evidence
 * Handles versioning, expiration tracking, and automatic checklists
 */
export const useSoporte = () => {
  // ========== STATE ==========
  const [categorias, setCategorias] = useState<CategoriaSoporte[]>([]);
  const [tiposDocumento, setTiposDocumento] = useState<TipoDocumentoSoporte[]>([]);
  const [soportes, setSoportes] = useState<SoporteDocumental[]>([]);
  const [soportesVencidos, setSoportesVencidos] = useState<SoporteDocumental[]>([]);
  const [requeridos, setRequeridos] = useState<SoporteRequerido[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const repository = new SoporteRepository() as any;
  const service = new SoporteService(repository);

  // ========== CATEGORIA SOPORTE ==========

  /**
   * Fetch all document categories
   */
  const fetchCategorias = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.getAllCategorias();
      setCategorias(data);
      return data;
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al cargar categorías'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create new category
   */
  const createCategoria = useCallback(async (data: Partial<CategoriaSoporte>) => {
    setLoading(true);
    setError(null);
    try {
      const newCategory = await service.createCategoria(data);
      setCategorias(prev => [...prev, newCategory]);
      return newCategory;
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al crear categoría'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update category
   */
  const updateCategoria = useCallback(async (id: number, data: Partial<CategoriaSoporte>) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await service.updateCategoria(id, data);
      setCategorias(prev => prev.map(c => c.id === id ? updated : c));
      return updated;
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al actualizar categoría'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete category
   */
  const deleteCategoria = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await service.deleteCategoria(id);
      setCategorias(prev => prev.filter(c => c.id !== id));
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al eliminar categoría'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ========== TIPO DOCUMENTO SOPORTE ==========

  /**
   * Fetch all document types
   */
  const fetchTipos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.getAllTipos();
      setTiposDocumento(data);
      return data;
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al cargar tipos de documento'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get document types by category
   */
  const getTiposByCategoria = useCallback(async (categoriaId: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.getTiposByCategoria(categoriaId);
      return data;
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al cargar tipos'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get document types by level
   */
  const getTiposByNivel = useCallback(async (nivel: NivelSoporte) => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.getTiposByNivel(nivel);
      return data;
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al cargar tipos'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get obligatory document types
   */
  const getTiposObligatorios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.getTiposObligatorios();
      return data;
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al cargar tipos obligatorios'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create new document type
   */
  const createTipo = useCallback(async (data: Partial<TipoDocumentoSoporte>) => {
    setLoading(true);
    setError(null);
    try {
      const newType = await service.createTipo(data);
      setTiposDocumento(prev => [...prev, newType]);
      return newType;
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al crear tipo de documento'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ========== SOPORTE DOCUMENTAL ==========

  /**
   * Fetch all supporting documents
   */
  const fetchSoportes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.getAllSoportes();
      setSoportes(data);
      return data;
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al cargar soportes'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * ✅ NUEVO: Fetch documents by prestador (con aislamiento de datos)
   */
  const fetchSoportesByPrestador = useCallback(async (prestadorId: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.getSoportesByPrestador(prestadorId);
      setSoportes(data);
      return data;
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al cargar soportes del prestador'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get documents by company level
   */
  const getSoportesByEmpresa = useCallback(async (empresaId: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.getSoportesByEmpresa(empresaId);
      return data;
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al cargar soportes'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get documents by headquarters level
   */
  const getSoportesBySede = useCallback(async (sedeId: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.getSoportesBySede(sedeId);
      return data;
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al cargar soportes'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get documents by service level
   */
  const getSoportesByServicio = useCallback(async (servicioId: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.getSoportesByServicio(servicioId);
      return data;
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al cargar soportes'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Upload new supporting document
   */
  const uploadSoporte = useCallback(async (data: Partial<SoporteDocumental>) => {
    setLoading(true);
    setError(null);
    try {
      const newSoporte = await service.uploadSoporte(data);
      setSoportes(prev => [...prev, newSoporte]);
      return newSoporte;
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al cargar documento'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get expired documents
   */
  const getSoportesVencidos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.getSoportesVencidos();
      setSoportesVencidos(data);
      return data;
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al cargar soportes vencidos'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get documents expiring soon
   */
  const getSoportesProximosAVencer = useCallback(async (diasAdelante: number = 30) => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.getSoportesProximosAVencer(diasAdelante);
      return data;
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al cargar soportes proximos a vencer'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get document versions
   */
  const getSoporteVersions = useCallback(async (tipoDocumentoId: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.getSoporteVersions(tipoDocumentoId);
      return data;
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al cargar versiones'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Search documents
   */
  const searchSoportesAsync = useCallback(async (criteria: any) => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.searchSoportes(criteria);
      return data;
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al buscar soportes'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch all required documents
   */
  const fetchRequeridos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.getAllRequeridos();
      setRequeridos(data);
      return data;
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al cargar documentos requeridos'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get pending required documents
   */
  const getRequeridosPendientes = useCallback(async (nivel: NivelSoporte) => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.getRequeridosPendientes(nivel);
      return data;
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al cargar pendientes'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get loaded required documents
   */
  const getRequeridosCargados = useCallback(async (nivel: NivelSoporte) => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.getRequeridosCargados(nivel);
      return data;
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al cargar cargados'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Auto-generate checklist
   */
  const generarChecklistAutomatico = useCallback(async (nivel: NivelSoporte) => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.generarChecklistAutomatico(nivel);
      setRequeridos(data);
      return data;
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al generar checklist'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get statistics
   */
  const getEstadisticas = useCallback(async (nivel?: NivelSoporte) => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.getEstadisticas(nivel);
      return data;
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al cargar estadísticas'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ========== HELPERS ==========

  /**
   * Calculate days until expiration
   */
  const getDiasHastaVencimiento = useCallback((fechaVencimiento: string): number | null => {
    return service.getDiasHastaVencimiento(fechaVencimiento);
  }, []);

  /**
   * Check if document is expired
   */
  const isVencido = useCallback((fechaVencimiento: string): boolean => {
    return service.isVencido(fechaVencimiento);
  }, []);

  /**
   * Get completion percentage
   */
  const getCompletionPercentage = useCallback((cargados: number, total: number): number => {
    return service.getCompletionPercentage(cargados, total);
  }, []);

  return {
    // State
    categorias,
    tiposDocumento,
    soportes,
    soportesVencidos,
    requeridos,
    loading,
    error,
    clearError: () => setError(null),

    // Categoría methods
    fetchCategorias,
    createCategoria,
    updateCategoria,
    deleteCategoria,

    // Tipo Documento methods
    fetchTipos,
    getTiposByCategoria,
    getTiposByNivel,
    getTiposObligatorios,
    createTipo,

    // Soporte Documental methods
    fetchSoportes,
    fetchSoportesByPrestador, // ✅ NUEVO: Filtro por prestador
    getSoportesByEmpresa,
    getSoportesBySede,
    getSoportesByServicio,
    uploadSoporte,
    getSoportesVencidos,
    getSoportesProximosAVencer,
    getSoporteVersions,

    // Soporte Requerido methods
    fetchRequeridos,
    getRequeridosPendientes,
    getRequeridosCargados,
    generarChecklistAutomatico,
    getEstadisticas,

    // Helper methods
    getDiasHastaVencimiento,
    isVencido,
    getCompletionPercentage,
    searchSoportesAsync,
  };
};
