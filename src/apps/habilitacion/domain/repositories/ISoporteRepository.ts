import type {
  CategoriaSoporte,
  CategoriaSoporteCreate,
  TipoDocumentoSoporte,
  TipoDocumentoSoporteCreate,
  SoporteDocumental,
  SoporteDocumentalCreate,
  SoporteRequerido,
  SoporteRequeridoCreate,
} from '../entities/SoporteDocumental';
import type { NivelSoporte } from '../types/SoporteTypes';

/**
 * Repository interface for all Soportes models (CategoriaSoporte, TipoDocumentoSoporte, SoporteDocumental, SoporteRequerido)
 * Handles document management across multi-levels: EMPRESA, SEDE, SERVICIO
 */
export interface ISoporteRepository {
  // ============ CategoriaSoporte CRUD ============
  getAllCategorias(filters?: any): Promise<CategoriaSoporte[]>;
  getCategoria(id: number): Promise<CategoriaSoporte>;
  createCategoria(data: CategoriaSoporteCreate): Promise<CategoriaSoporte>;
  updateCategoria(id: number, data: Partial<CategoriaSoporteCreate>): Promise<CategoriaSoporte>;
  deleteCategoria(id: number): Promise<void>;

  // ============ TipoDocumentoSoporte CRUD ============
  getAllTipos(filters?: any): Promise<TipoDocumentoSoporte[]>;
  getTipo(id: number): Promise<TipoDocumentoSoporte>;
  createTipo(data: TipoDocumentoSoporteCreate): Promise<TipoDocumentoSoporte>;
  updateTipo(
    id: number,
    data: Partial<TipoDocumentoSoporteCreate>
  ): Promise<TipoDocumentoSoporte>;
  deleteTipo(id: number): Promise<void>;
  getTiposByCategoria(categoriaId: number): Promise<TipoDocumentoSoporte[]>;
  getTiposByNivel(nivel: NivelSoporte): Promise<TipoDocumentoSoporte[]>;

  // ============ SoporteDocumental CRUD ============
  getAllSoportes(filters?: any): Promise<SoporteDocumental[]>;
  getSoporte(id: number): Promise<SoporteDocumental>;
  createSoporte(data: SoporteDocumentalCreate): Promise<SoporteDocumental>;
  updateSoporte(
    id: number,
    data: Partial<SoporteDocumentalCreate>
  ): Promise<SoporteDocumental>;
  deleteSoporte(id: number): Promise<void>;

  // Multi-level queries
  getSoportesByPrestador(prestadorId: number): Promise<SoporteDocumental[]>; // ✅ NUEVO
  getSoportesByEmpresa(empresaId: number): Promise<SoporteDocumental[]>;
  getSoportesBySede(sedeId: number): Promise<SoporteDocumental[]>;
  getSoportesByServicio(servicioId: number): Promise<SoporteDocumental[]>;
  getSoportesByNivel(nivel: NivelSoporte): Promise<SoporteDocumental[]>;

  // File uploads
  createSoporte(data: SoporteDocumentalCreate): Promise<SoporteDocumental>;
  createSoporteFormData(formData: FormData): Promise<SoporteDocumental>; // ✅ NUEVO: Multipart upload

  // Versioning
  getSoporteVersions(tipoDocumentoId: number): Promise<SoporteDocumental[]>;
  getSoporteLatestVersion(tipoDocumentoId: number): Promise<SoporteDocumental | null>;

  // Expiration tracking
  getSoportesVencidos(): Promise<SoporteDocumental[]>;
  getSoportesProximosAVencer(dias: number): Promise<SoporteDocumental[]>;
  
  // Search & filtering
  searchSoportes(criteria: any): Promise<SoporteDocumental[]>;
  filterByCriteria(criteria: any): Promise<SoporteDocumental[]>;

  // ============ SoporteRequerido CRUD ============
  getAllRequeridos(filters?: any): Promise<SoporteRequerido[]>;
  getRequerido(id: number): Promise<SoporteRequerido>;
  createRequerido(data: SoporteRequeridoCreate): Promise<SoporteRequerido>;
  updateRequerido(
    id: number,
    data: Partial<SoporteRequeridoCreate>
  ): Promise<SoporteRequerido>;
  deleteRequerido(id: number): Promise<void>;

  // Checklist queries
  getRequeridosByNivel(nivel: NivelSoporte): Promise<SoporteRequerido[]>;

  // Status checks
  getRequeridosPendientes(nivel: NivelSoporte): Promise<SoporteRequerido[]>;
  getRequeridosCargados(nivel: NivelSoporte): Promise<SoporteRequerido[]>;
  getRequeridosVencidos(nivel: NivelSoporte): Promise<SoporteRequerido[]>;
  
  // Auto-generate checklist
  generarChecklistAutomatico(
    nivel: NivelSoporte
  ): Promise<SoporteRequerido[]>;

  // Statistics
  getEstadisticas(nivel?: NivelSoporte): Promise<{
    totalSoportes: number;
    totalVersiones: number;
    vencimientoProximo: number;
    vencidos: number;
    checklistPendiente: number;
    checklistCargado: number;
    checklistVencido: number;
  }>;
}
