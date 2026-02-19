import type { EstadoCumplimiento } from '../types';

export interface Cumplimiento {
  id: number;
  cumple: EstadoCumplimiento;
  hallazgo?: string;
  plan_mejora?: string;
  responsable_mejora?: {
    id: number;
    username: string;
  };
  fecha_compromiso?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
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
  responsable_mejora_id?: number;
  fecha_compromiso?: string;
  servicio_sede_id: number;
  criterio_id: number;
}

export interface CumplimientoUpdate extends Partial<CumplimientoCreate> {
  id: number;
}
