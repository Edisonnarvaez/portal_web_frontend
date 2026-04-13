import type {
  CategoriaSoporte,
  TipoDocumentoSoporte,
  SoporteDocumental,
  SoporteRequerido,
} from '../../domain/entities/SoporteDocumental';
import type { ISoporteRepository } from '../../domain/repositories/ISoporteRepository';
import type { NivelSoporte } from '../../domain/types/SoporteTypes';

/**
 * SoporteService
 * Manages all operations related to supporting documents and evidence
 * Handles versioning, expiration, and automatic checklist generation
 *
 * Key responsibilities:
 * - Category and document type management
 * - Supporting document upload and versioning
 * - Required document checklist tracking
 * - Expiration monitoring
 * - Automatic compliance tracking
 */
export class SoporteService {
  private repository: ISoporteRepository;

  constructor(repository: ISoporteRepository) {
    this.repository = repository;
  }

  // ========== CATEGORIA SOPORTE ==========

  /**
   * Get all document categories
   */
  async getAllCategorias(): Promise<CategoriaSoporte[]> {
    try {
      return await this.repository.getAllCategorias();
    } catch (error) {
      throw this.handleError(error, 'getAllCategorias');
    }
  }

  /**
   * Get category by ID
   */
  async getCategoria(id: number): Promise<CategoriaSoporte> {
    try {
      if (!id || id <= 0) throw new Error('Invalid category ID');
      return await this.repository.getCategoria(id);
    } catch (error) {
      throw this.handleError(error, 'getCategoria');
    }
  }

  /**
   * Create new document category
   */
  async createCategoria(data: Partial<CategoriaSoporte>): Promise<CategoriaSoporte> {
    try {
      if (!data.nombre || data.nombre.trim().length === 0) {
        throw new Error('Category name is required');
      }
      const createData = {
        nombre: data.nombre!,
        descripcion: data.descripcion,
        activo: data.activo ?? true,
      };
      return await this.repository.createCategoria(createData);
    } catch (error) {
      throw this.handleError(error, 'createCategoria');
    }
  }

  /**
   * Update document category
   */
  async updateCategoria(
    id: number,
    data: Partial<CategoriaSoporte>
  ): Promise<CategoriaSoporte> {
    try {
      if (!id || id <= 0) throw new Error('Invalid category ID');
      return await this.repository.updateCategoria(id, data);
    } catch (error) {
      throw this.handleError(error, 'updateCategoria');
    }
  }

  /**
   * Delete document category
   */
  async deleteCategoria(id: number): Promise<void> {
    try {
      if (!id || id <= 0) throw new Error('Invalid category ID');
      return await this.repository.deleteCategoria(id);
    } catch (error) {
      throw this.handleError(error, 'deleteCategoria');
    }
  }

  // ========== TIPO DOCUMENTO SOPORTE ==========

  /**
   * Get all document types
   */
  async getAllTipos(): Promise<TipoDocumentoSoporte[]> {
    try {
      return await this.repository.getAllTipos();
    } catch (error) {
      throw this.handleError(error, 'getAllTipos');
    }
  }

  /**
   * Get document types by category
   */
  async getTiposByCategoria(categoriaId: number): Promise<TipoDocumentoSoporte[]> {
    try {
      if (!categoriaId || categoriaId <= 0) throw new Error('Invalid category ID');
      return await this.repository.getTiposByCategoria(categoriaId);
    } catch (error) {
      throw this.handleError(error, 'getTiposByCategoria');
    }
  }

  /**
   * Get obligatory document types
   */
  async getTiposObligatorios(): Promise<TipoDocumentoSoporte[]> {
    try {
      const tipos = await this.repository.getAllTipos();
      return tipos.filter(tipo => tipo.es_obligatorio);
    } catch (error) {
      throw this.handleError(error, 'getTiposObligatorios');
    }
  }

  /**
   * Get document types by level (EMPRESA, SEDE, SERVICIO)
   */
  async getTiposByNivel(nivel: NivelSoporte): Promise<TipoDocumentoSoporte[]> {
    try {
      if (!nivel || !this.isValidNivel(nivel)) {
        throw new Error(`Invalid nivel: ${nivel}`);
      }
      return await this.repository.getTiposByNivel(nivel);
    } catch (error) {
      throw this.handleError(error, 'getTiposByNivel');
    }
  }

  /**
   * Create new document type
   */
  async createTipo(data: Partial<TipoDocumentoSoporte>): Promise<TipoDocumentoSoporte> {
    try {
      if (!data.nombre || data.nombre.trim().length === 0) {
        throw new Error('Document type name is required');
      }
      if (!data.categoria || data.categoria <= 0) {
        throw new Error('Category is required');
      }
      const createData = {
        nombre: data.nombre!,
        categoria: data.categoria!,
        nivel_aplica: data.nivel_aplica as any,
        es_obligatorio: data.es_obligatorio ?? false,
        requiere_vencimiento: data.requiere_vencimiento ?? false,
        activo: data.activo ?? true,
      };
      return await this.repository.createTipo(createData);
    } catch (error) {
      throw this.handleError(error, 'createTipo');
    }
  }

  /**
   * Update document type
   */
  async updateTipo(
    id: number,
    data: Partial<TipoDocumentoSoporte>
  ): Promise<TipoDocumentoSoporte> {
    try {
      if (!id || id <= 0) throw new Error('Invalid document type ID');
      return await this.repository.updateTipo(id, data);
    } catch (error) {
      throw this.handleError(error, 'updateTipo');
    }
  }

  /**
   * Delete document type
   */
  async deleteTipo(id: number): Promise<void> {
    try {
      if (!id || id <= 0) throw new Error('Invalid document type ID');
      return await this.repository.deleteTipo(id);
    } catch (error) {
      throw this.handleError(error, 'deleteTipo');
    }
  }

  // ========== SOPORTE DOCUMENTAL ==========

  /**
   * Get all supporting documents
   */
  async getAllSoportes(): Promise<SoporteDocumental[]> {
    try {
      return await this.repository.getAllSoportes();
    } catch (error) {
      throw this.handleError(error, 'getAllSoportes');
    }
  }

  /**
   * Get document by ID
   */
  async getSoporte(id: number): Promise<SoporteDocumental> {
    try {
      if (!id || id <= 0) throw new Error('Invalid document ID');
      return await this.repository.getSoporte(id);
    } catch (error) {
      throw this.handleError(error, 'getSoporte');
    }
  }

  /**
   * Get all documents at company level
   */
  async getSoportesByEmpresa(empresaId: number): Promise<SoporteDocumental[]> {
    try {
      if (!empresaId || empresaId <= 0) throw new Error('Invalid empresa ID');
      return await this.repository.getSoportesByEmpresa(empresaId);
    } catch (error) {
      throw this.handleError(error, 'getSoportesByEmpresa');
    }
  }

  /**
   * ✅ NUEVO: Get all documents by prestador (con aislamiento de datos)
   */
  async getSoportesByPrestador(prestadorId: number): Promise<SoporteDocumental[]> {
    try {
      if (!prestadorId || prestadorId <= 0) throw new Error('Invalid prestador ID');
      return await this.repository.getSoportesByPrestador(prestadorId);
    } catch (error) {
      throw this.handleError(error, 'getSoportesByPrestador');
    }
  }

  /**
   * Get all documents at headquarters level
   */
  async getSoportesBySede(sedeId: number): Promise<SoporteDocumental[]> {
    try {
      if (!sedeId || sedeId <= 0) throw new Error('Invalid sede ID');
      return await this.repository.getSoportesBySede(sedeId);
    } catch (error) {
      throw this.handleError(error, 'getSoportesBySede');
    }
  }

  /**
   * Get all documents for a specific service
   */
  async getSoportesByServicio(servicioId: number): Promise<SoporteDocumental[]> {
    try {
      if (!servicioId || servicioId <= 0) throw new Error('Invalid service ID');
      return await this.repository.getSoportesByServicio(servicioId);
    } catch (error) {
      throw this.handleError(error, 'getSoportesByServicio');
    }
  }

  /**
   * Get all documents by level
   */
  async getSoportesByNivel(nivel: NivelSoporte): Promise<SoporteDocumental[]> {
    try {
      if (!nivel || !this.isValidNivel(nivel)) {
        throw new Error(`Invalid nivel: ${nivel}`);
      }
      return await this.repository.getSoportesByNivel(nivel);
    } catch (error) {
      throw this.handleError(error, 'getSoportesByNivel');
    }
  }

  /**
   * Upload new supporting document
   * If document exists, creates new version and marks previous as inactive
   */
  async uploadSoporte(data: any): Promise<SoporteDocumental> {
    try {
      if (!data.prestador || data.prestador <= 0) {
        throw new Error('Prestador is required');
      }
      if (!data.tipo_documento || data.tipo_documento <= 0) {
        throw new Error('Document type is required');
      }
      if (!data.nivel || !this.isValidNivel(data.nivel)) {
        throw new Error('Valid nivel is required');
      }
      if (!data.archivo) {
        throw new Error('Document file is required');
      }
      
      // ✅ NUEVO: Crear FormData si el archivo es File (multipart/form-data)
      if (data.archivo instanceof File) {
        const formData = new FormData();
        
        // Append all fields to FormData
        formData.append('prestador', data.prestador!.toString());
        formData.append('tipo_documento', data.tipo_documento!.toString());
        formData.append('nivel', data.nivel!);
        if (data.empresa) formData.append('empresa', data.empresa.toString());
        if (data.sede) formData.append('sede', data.sede.toString());
        if (data.servicio) formData.append('servicio', data.servicio.toString());
        if (data.fecha_emision) formData.append('fecha_emision', data.fecha_emision);
        if (data.fecha_vencimiento) formData.append('fecha_vencimiento', data.fecha_vencimiento);
        if (data.observaciones) formData.append('observaciones', data.observaciones);
        formData.append('archivo', data.archivo);
        
        // Send FormData directly with flag to bypass JSON serialization
        const soporte = await this.repository.createSoporteFormData(formData);
        return soporte;
      }
      
      // Regular JSON upload for non-file data
      const createData: any = {
        prestador: data.prestador!,
        tipo_documento: data.tipo_documento!,
        nivel: data.nivel!,
        archivo: data.archivo as any,
      };
      
      // ✅ Only add context field if it exists and is valid
      if (data.empresa) createData.empresa = data.empresa;
      else if (data.sede) createData.sede = data.sede;
      else if (data.servicio) createData.servicio = data.servicio;
      
      // ✅ Only add optional fields if they exist
      if (data.fecha_emision) createData.fecha_emision = data.fecha_emision;
      if (data.fecha_vencimiento) createData.fecha_vencimiento = data.fecha_vencimiento;
      if (data.observaciones) createData.observaciones = data.observaciones;
      
      const soporte = await this.repository.createSoporte(createData);
      return soporte;
    } catch (error) {
      throw this.handleError(error, 'uploadSoporte');
    }
  }

  /**
   * Update supporting document
   */
  async updateSoporte(
    id: number,
    data: Partial<SoporteDocumental>
  ): Promise<SoporteDocumental> {
    try {
      if (!id || id <= 0) throw new Error('Invalid document ID');
      const updateData = {
        fecha_vencimiento: data.fecha_vencimiento,
        observaciones: data.observaciones,
      };
      return await this.repository.updateSoporte(id, updateData as any);
    } catch (error) {
      throw this.handleError(error, 'updateSoporte');
    }
  }

  /**
   * Delete supporting document
   */
  async deleteSoporte(id: number): Promise<void> {
    try {
      if (!id || id <= 0) throw new Error('Invalid document ID');
      return await this.repository.deleteSoporte(id);
    } catch (error) {
      throw this.handleError(error, 'deleteSoporte');
    }
  }

  /**
   * Get all versions of a document
   */
  async getSoporteVersions(tipoDocumentoId: number): Promise<SoporteDocumental[]> {
    try {
      if (!tipoDocumentoId || tipoDocumentoId <= 0) {
        throw new Error('Invalid document type ID');
      }
      return await this.repository.getSoporteVersions(tipoDocumentoId);
    } catch (error) {
      throw this.handleError(error, 'getSoporteVersions');
    }
  }

  /**
   * Get latest version of a document
   */
  async getSoporteLatestVersion(tipoDocumentoId: number): Promise<SoporteDocumental | null> {
    try {
      if (!tipoDocumentoId || tipoDocumentoId <= 0) {
        throw new Error('Invalid document type ID');
      }
      const result = await this.repository.getSoporteLatestVersion(tipoDocumentoId);
      return result || null;
    } catch (error) {
      throw this.handleError(error, 'getSoporteLatestVersion');
    }
  }

  /**
   * Get expired documents
   */
  async getSoportesVencidos(): Promise<SoporteDocumental[]> {
    try {
      return await this.repository.getSoportesVencidos();
    } catch (error) {
      throw this.handleError(error, 'getSoportesVencidos');
    }
  }

  /**
   * Get documents expiring soon
   */
  async getSoportesProximosAVencer(diasAdelante: number = 30): Promise<SoporteDocumental[]> {
    try {
      if (diasAdelante <= 0 || diasAdelante > 365) {
        throw new Error('Days must be between 1 and 365');
      }
      return await this.repository.getSoportesProximosAVencer(diasAdelante);
    } catch (error) {
      throw this.handleError(error, 'getSoportesProximosAVencer');
    }
  }

  /**
   * Search documents with advanced filtering
   */
  async searchSoportes(criteria: any): Promise<SoporteDocumental[]> {
    try {
      return await this.repository.searchSoportes(criteria);
    } catch (error) {
      throw this.handleError(error, 'searchSoportes');
    }
  }

  // ========== SOPORTE REQUERIDO ==========

  /**
   * Get all required documents
   */
  async getAllRequeridos(): Promise<SoporteRequerido[]> {
    try {
      return await this.repository.getAllRequeridos();
    } catch (error) {
      throw this.handleError(error, 'getAllRequeridos');
    }
  }

  /**
   * Get required documents by level
   */
  async getRequeridosByNivel(nivel: NivelSoporte): Promise<SoporteRequerido[]> {
    try {
      if (!nivel || !this.isValidNivel(nivel)) {
        throw new Error(`Invalid nivel: ${nivel}`);
      }
      return await this.repository.getRequeridosByNivel(nivel);
    } catch (error) {
      throw this.handleError(error, 'getRequeridosByNivel');
    }
  }

  /**
   * Get pending required documents
   */
  async getRequeridosPendientes(nivel: NivelSoporte): Promise<SoporteRequerido[]> {
    try {
      if (!nivel || !this.isValidNivel(nivel)) {
        throw new Error(`Invalid nivel: ${nivel}`);
      }
      return await this.repository.getRequeridosPendientes(nivel);
    } catch (error) {
      throw this.handleError(error, 'getRequeridosPendientes');
    }
  }

  /**
   * Get loaded/completed required documents
   */
  async getRequeridosCargados(nivel: NivelSoporte): Promise<SoporteRequerido[]> {
    try {
      if (!nivel || !this.isValidNivel(nivel)) {
        throw new Error(`Invalid nivel: ${nivel}`);
      }
      return await this.repository.getRequeridosCargados(nivel);
    } catch (error) {
      throw this.handleError(error, 'getRequeridosCargados');
    }
  }

  /**
   * Get expired required documents
   */
  async getRequeridosVencidos(nivel: NivelSoporte): Promise<SoporteRequerido[]> {
    try {
      if (!nivel || !this.isValidNivel(nivel)) {
        throw new Error(`Invalid nivel: ${nivel}`);
      }
      return await this.repository.getRequeridosVencidos(nivel);
    } catch (error) {
      throw this.handleError(error, 'getRequeridosVencidos');
    }
  }

  /**
   * Auto-generate checklist from document type configuration
   * Creates SoporteRequerido entries based on TipoDocumentoSoporte obligations
   */
  async generarChecklistAutomatico(nivel: NivelSoporte): Promise<SoporteRequerido[]> {
    try {
      if (!nivel || !this.isValidNivel(nivel)) {
        throw new Error(`Invalid nivel: ${nivel}`);
      }
      return await this.repository.generarChecklistAutomatico(nivel);
    } catch (error) {
      throw this.handleError(error, 'generarChecklistAutomatico');
    }
  }

  /**
   * Get aggregated statistics for required documents
   */
  async getEstadisticas(nivel?: NivelSoporte): Promise<any> {
    try {
      return await this.repository.getEstadisticas(nivel);
    } catch (error) {
      throw this.handleError(error, 'getEstadisticas');
    }
  }

  // ========== HELPERS ==========

  /**
   * Calculate days until expiration
   */
  getDiasHastaVencimiento(fechaVencimiento: string): number | null {
    try {
      if (!fechaVencimiento) return null;
      const vencimiento = new Date(fechaVencimiento);
      const hoy = new Date();
      const diferencia = vencimiento.getTime() - hoy.getTime();
      return Math.ceil(diferencia / (1000 * 3600 * 24));
    } catch {
      return null;
    }
  }

  /**
   * Check if document is expired
   */
  isVencido(fechaVencimiento: string): boolean {
    try {
      const dias = this.getDiasHastaVencimiento(fechaVencimiento);
      return dias !== null && dias < 0;
    } catch {
      return false;
    }
  }

  /**
   * Get completion percentage
   */
  getCompletionPercentage(cargados: number, total: number): number {
    if (total === 0) return 100;
    return Math.round((cargados / total) * 100);
  }

  // ========== VALIDATION & ERROR HANDLING ==========

  /**
   * Validate nivel value
   */
  private isValidNivel(nivel: NivelSoporte): boolean {
    return ['EMPRESA', 'SEDE', 'SERVICIO'].includes(nivel);
  }

  /**
   * Handle errors consistently
   */
  private handleError(error: any, operation: string): Error {
    const message = error?.message || `Error in ${operation}`;
    console.error(`[SoporteService] ${operation}: ${message}`, error);
    return error instanceof Error ? error : new Error(message);
  }
}
