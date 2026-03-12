import type { DatosPrestador } from './DatosPrestador';

// ============================================================================
// SERVICIO SEDE (ServicioSede) - Servicios habilitados en una sede
// ============================================================================

/**
 * Tipos para ServicioSede basados en choices del backend
 */
export type ModalidadServicio = 'INTRAMURAL' | 'AMBULATORIA' | 'TELEMEDICINA' | 'URGENCIAS' | 'AMBULANCIA';
export type ComplejidadServicio = 'BAJA' | 'MEDIA' | 'ALTA';
export type EstadoHabilitacionServicio = 'HABILITADO' | 'EN_PROCESO' | 'SUSPENDIDO' | 'NO_HABILITADO' | 'CANCELADO';

/**
 * Respuesta reducida de prestador que viene dentro de servicios
 * El backend devuelve solo los campos necesarios para mostrar el prestador
 */
export interface PrestadorDetailReducido {
  id?: number;
  codigo_reps?: string;
  nombre_prestador?: string; // Campo principal para mostrar el nombre del prestador
  headquarters?: string;
  estado_habilitacion?: string;
}

/**
 * ServicioSede - Servicios de salud habilitados en una sede específica
 * Un servicio es la combinación de modalidad + tipo de servicio en una sede determinada.
 * 
 * Estructura sincronizada con el modelo Django:
 * habilitacion/models.py::ServicioSede
 */
export interface ServicioSede {
  id: number;
  prestador_codigo?: string; // Código REPS del prestador
  prestador_detail?: PrestadorDetailReducido | DatosPrestador; // FK: Objeto anidado (puede ser reducido o completo)
  prestador_id?: number; // FK: ID del prestador (alternativa si viene como ID)
  codigo_servicio: string; // Código asignado por REPS
  nombre_servicio: string;
  descripcion?: string | null;
  prestador_headquarters?: string; // Información adicional del backend
  modalidad: ModalidadServicio;
  complejidad: ComplejidadServicio;
  estado_habilitacion: EstadoHabilitacionServicio;
  fecha_habilitacion?: string | null; // ISO date (YYYY-MM-DD)
  fecha_vencimiento?: string | null; // ISO date (YYYY-MM-DD)
  fecha_creacion: string; // ISO datetime
  fecha_actualizacion: string; // ISO datetime
}

/**
 * DTO para crear un nuevo ServicioSede
 * El backend asigna automáticamente: id, fecha_creacion, fecha_actualizacion
 */
export interface ServicioSedeCreate {
  prestador_id: number;
  codigo_servicio: string;
  nombre_servicio: string;
  descripcion?: string;
  modalidad: ModalidadServicio;
  complejidad: ComplejidadServicio;
  estado_habilitacion?: EstadoHabilitacionServicio; // Default: 'EN_PROCESO'
  fecha_habilitacion?: string;
  fecha_vencimiento?: string;
}

/**
 * DTO para actualizar un ServicioSede (parcial o completa)
 */
export interface ServicioSedeUpdate extends Partial<ServicioSedeCreate> {
  id: number;
}

/**
 * Respuesta paginada del listado de servicios
 */
export interface ServicioSedeListResponse {
  count: number;
  next?: string;
  previous?: string;
  results: ServicioSede[];
}
