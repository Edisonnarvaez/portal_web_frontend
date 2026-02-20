import type { ModalidadServicio, ComplejidadServicio, EstadoHabilitacion } from '../types';

export interface ServicioSede {
  id: number;
  codigo_servicio: string;
  nombre_servicio: string;
  descripcion?: string;
  modalidad: ModalidadServicio;
  complejidad: ComplejidadServicio;
  estado_habilitacion: EstadoHabilitacion;
  estado_display?: string;
  fecha_habilitacion?: string;
  fecha_vencimiento?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  headquarters?: {
    id: number;
    nombre: string;
  };
  datos_prestador?: {
    id: number;
    codigo_reps: string;
  };
}

export interface ServicioSedeCreate {
  sede_id: number;
  codigo_servicio: string;
  nombre_servicio: string;
  descripcion?: string;
  modalidad: ModalidadServicio;
  complejidad: ComplejidadServicio;
  estado_habilitacion?: EstadoHabilitacion;
  fecha_habilitacion?: string;
  fecha_vencimiento?: string;
}

export interface ServicioSedeUpdate extends Partial<ServicioSedeCreate> {
  id: number;
}
