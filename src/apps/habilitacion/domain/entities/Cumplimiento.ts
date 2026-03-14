import type { EstadoCumplimiento } from '../types';

export interface Cumplimiento {
  id: number;
  cumple: EstadoCumplimiento;
  cumple_display?: string;
  // Campos del endpoint lista
  criterio_codigo?: string;
  criterio_nombre?: string;
  servicio_nombre?: string;
  // IDs para filtrado rápido (desde endpoint lista)
  autoevaluacion_id?: number;
  servicio_sede_id?: number;
  criterio_id?: number;
  tiene_plan_mejora?: boolean;
  planes_mejora_count?: number;
  hallazgos_count?: number;
  hallazgo?: string;
  plan_mejora?: string;
  responsable_mejora?: {
    id: number;
    username: string;
  };
  responsable_mejora_detail?: {
    id: number;
    username: string;
  } | null;
  fecha_compromiso?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  documentos_evidencia?: Array<{
    id: number;
    nombre?: string;
    url?: string;
  }>;
  documentos_evidencia_list?: Array<{
    id: number;
    nombre?: string;
    url?: string;
  }>;
  // Formato antiguo (desde list endpoint)
  autoevaluacion?: {
    id: number;
    numero_autoevaluacion: string;
  };
  servicio_sede?: {
    id: number;
    nombre_servicio: string;
  };
  criterio?: {
    id: number;
    codigo?: string;
    nombre: string;
    descripcion?: string;
    es_mandatorio?: boolean;
  };
  // Formato detallado (desde detail endpoint)
  autoevaluacion_detail?: {
    id: number;
    numero: string;
    periodo: number;
  };
  servicio_sede_detail?: {
    id: number;
    codigo: string;
    nombre: string;
  };
  criterio_detail?: {
    id: number;
    codigo: string;
    nombre: string;
    complejidad?: string;
  };
  servicios_disponibles?: Array<{
    id: number;
    codigo: string;
    nombre: string;
    modalidad?: string;
    complejidad?: string;
    estado?: string;
  }>;
  mejora_vencida?: boolean;
  planes_mejora_vinculados?: any[];
  hallazgos_vinculados?: any[];
}

export interface CumplimientoCreate {
  autoevaluacion_id: number;
  cumple: EstadoCumplimiento;
  hallazgo?: string;
  plan_mejora?: string;
  responsable_mejora?: number;
  fecha_compromiso?: string;
  servicio_sede_id: number;
  criterio_id: number;
  documentos_evidencia?: number[];
}

export interface CumplimientoUpdate extends Partial<CumplimientoCreate> {
  id: number;
}

export interface ServicioDisponibleAutoevaluacion {
  id: number;
  codigo?: string;
  nombre?: string;
  codigo_servicio?: string;
  nombre_servicio?: string;
  modalidad?: string;
  complejidad?: string;
  estado?: string;
}

export interface ServiciosDeAutoevaluacionResponse {
  autoevaluacion?: {
    id: number;
    numero_autoevaluacion?: string;
    periodo?: number;
    estado?: string;
  } | null;
  prestador?: {
    id: number;
    codigo_reps?: string;
    company_name?: string;
  } | null;
  servicios: ServicioDisponibleAutoevaluacion[];
  total_servicios: number;
}
