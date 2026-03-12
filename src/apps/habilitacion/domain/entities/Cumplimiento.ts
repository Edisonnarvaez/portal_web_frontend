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
  fecha_compromiso?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  documentos_evidencia?: Array<{
    id: number;
    nombre?: string;
    url?: string;
  }>;
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
    nombre: string;
  };
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
