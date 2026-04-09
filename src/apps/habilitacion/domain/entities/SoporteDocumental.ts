/**
 * Modelos para la app de Soportes
 * Integración con habilitación para gestión de documentos
 * Backend: soportes/models/
 */

// ============================================================================
// CATEGORÍA DE SOPORTE
// ============================================================================

export interface CategoriaSoporte {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

export interface CategoriaSoporteCreate {
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export interface CategoriaSoporteUpdate extends Partial<CategoriaSoporteCreate> {
  id: number;
}

// ============================================================================
// TIPO DE DOCUMENTO SOPORTE
// ============================================================================

export type NivelAplica = 'EMPRESA' | 'SEDE' | 'SERVICIO';

export interface TipoDocumentoSoporte {
  id: number;
  categoria: number; // API sends this as ID only
  categoria_nombre?: string; // API also sends category name as read-only field
  nombre: string;
  nivel_aplica?: NivelAplica; // EMPRESA, SEDE, SERVICIO
  es_obligatorio: boolean;
  requiere_vencimiento: boolean;
  activo: boolean;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

export interface TipoDocumentoSoporteCreate {
  categoria: number; // Changed from categoria_id
  nombre: string;
  nivel_aplica?: NivelAplica;
  es_obligatorio?: boolean;
  requiere_vencimiento?: boolean;
  activo?: boolean;
}

export interface TipoDocumentoSoporteUpdate extends Partial<TipoDocumentoSoporteCreate> {
  id: number;
}

// ============================================================================
// SOPORTE DOCUMENTAL - Archivos de Soporte Reales
// ============================================================================

export type NivelSoporte = 'EMPRESA' | 'SEDE' | 'SERVICIO';

export interface SoporteDocumental {
  id: number;
  tipo_documento: number; // Changed from tipo_documento_id to match API
  tipo_nombre?: string; // API returns this as read-only field
  tipo_documento_objeto?: TipoDocumentoSoporte; // Full type object if expanded
  
  // Context: Exactly ONE of these should be non-null
  nivel: NivelSoporte;
  empresa: number | null; // API returns just ID or null
  sede: number | null; // API returns just ID or null
  servicio: number | null; // API returns just ID or null
  
  // Archivo
  archivo: string; // URL del archivo
  
  // Dates
  fecha_emision: string; // ISO date - when document was issued
  fecha_vencimiento: string | null; // ISO date - expiration date (if required)
  fecha_carga: string; // ISO datetime - when file was uploaded to system
  
  // Versioning
  version: number; // Auto-incrementado
  es_vigente: boolean; // Solo un soporte es vigente por tipo/contexto
  
  // Additional fields
  observaciones: string; // Notes about the document
}

export interface SoporteDocumentalCreate {
  tipo_documento: number; // Changed from tipo_documento_id
  nivel: NivelSoporte;
  empresa?: number;
  sede?: number;
  servicio?: number;
  archivo: File;
  fecha_emision?: string; // ISO date when document was issued
  fecha_vencimiento?: string | null; // ISO date - optional expiration
  observaciones?: string; // Optional notes
}

export interface SoporteDocumentalUpdate extends Partial<SoporteDocumentalCreate> {
  id: number;
}

export interface SoporteDocumentalListResponse {
  count: number;
  next?: string;
  previous?: string;
  results: SoporteDocumental[];
}

// ============================================================================
// SOPORTE REQUERIDO - Checklist Automático
// ============================================================================

export type EstadoSoporteRequerido = 'PENDIENTE' | 'CARGADO' | 'VENCIDO';

export interface SoporteRequerido {
  id: number;
  
  // Context: Exactly ONE of these should be non-null
  empresa: number | null; // API returns just ID or null
  sede: number | null; // API returns just ID or null
  servicio: number | null; // API returns just ID or null
  
  tipo_documento: number; // Changed from tipo_documento_id
  tipo_documento_objeto?: TipoDocumentoSoporte; // Full type object if expanded
  
  estado: EstadoSoporteRequerido;
  
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

export interface SoporteRequeridoCreate {
  tipo_documento: number; // Changed from tipo_documento_id
  empresa?: number;
  sede?: number;
  servicio?: number;
  estado?: EstadoSoporteRequerido;
}

export interface SoporteRequeridoUpdate extends Partial<SoporteRequeridoCreate> {
  id: number;
}

// ============================================================================
// Respuestas Paginadas
// ============================================================================

export interface CategoriaSoporteListResponse {
  count: number;
  next?: string;
  previous?: string;
  results: CategoriaSoporte[];
}

export interface TipoDocumentoSoporteListResponse {
  count: number;
  next?: string;
  previous?: string;
  results: TipoDocumentoSoporte[];
}

export interface SoporteRequeridoListResponse {
  count: number;
  next?: string;
  previous?: string;
  results: SoporteRequerido[];
}
