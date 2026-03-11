import type { 
  ModalidadServicio, 
  ComplejidadServicio,
  EstadoHabilitacionServicio
} from '../types';
import type { DatosPrestador } from './DatosPrestador';

// ============================================================================
// SERVICIO SEDE (ServicioSede) - Servicios habilitados en una sede
// ============================================================================

/**
 * ServicioSede - Servicios de salud habilitados en una sede específica
 * Un servicio es la combinación de modalidad + tipo de servicio en una sede determinada
 */
export interface ServicioSede {
  id: number;
  prestador: DatosPrestador; // FK: Relación con DatosPrestador
  codigo_servicio: string; // Código REPS del servicio
  nombre_servicio: string;
  descripcion?: string;
  modalidad: ModalidadServicio;
  complejidad: ComplejidadServicio;
  estado_habilitacion: EstadoHabilitacionServicio;
  estado_display?: string;
  fecha_habilitacion?: string; // ISO date
  fecha_vencimiento?: string; // ISO date
  fecha_creacion: string; // ISO datetime
  fecha_actualizacion: string; // ISO datetime
}

export interface ServicioSedeCreate {
  prestador_id: number;
  codigo_servicio: string;
  nombre_servicio: string;
  descripcion?: string;
  modalidad: ModalidadServicio;
  complejidad: ComplejidadServicio;
  estado_habilitacion?: EstadoHabilitacionServicio;
  fecha_habilitacion?: string;
  fecha_vencimiento?: string;
}

export interface ServicioSedeUpdate extends Partial<ServicioSedeCreate> {
  id: number;
}

export interface ServicioSedeListResponse {
  count: number;
  next?: string;
  previous?: string;
  results: ServicioSede[];
}
