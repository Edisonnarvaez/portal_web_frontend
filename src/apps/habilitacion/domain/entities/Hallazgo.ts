import type { OrigenTipo } from './PlanMejora';

export interface Hallazgo {
  id: number;
  numero_hallazgo: string;
  descripcion: string;
  tipo: 'FORTALEZA' | 'OPORTUNIDAD_MEJORA' | 'NO_CONFORMIDAD' | 'HALLAZGO';
  tipo_display: string;
  severidad: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRÍTICA';
  severidad_display: string;
  estado: 'ABIERTO' | 'EN_SEGUIMIENTO' | 'CERRADO';
  estado_display: string;
  origen_tipo: OrigenTipo;
  origen_tipo_display: string;
  area_responsable?: string;
  autoevaluacion_id?: number;
  autoevaluacion_numero?: string;
  datos_prestador_id?: number;
  auditoria_id?: number;
  auditoria_nombre?: string;
  resultado_indicador_id?: number;
  criterio_id?: number;
  criterio_codigo?: string;
  criterio_nombre?: string;
  plan_mejora_id?: number;
  plan_mejora_numero?: string;
  fecha_identificacion: string;
  fecha_cierre?: string;
  observaciones?: string;
  origen_detalle?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface HallazgoDetail extends Hallazgo {
  plan_mejora_detalle?: {
    id: number;
    numero_plan: string;
    estado: string;
    porcentaje_avance: number;
    fecha_vencimiento: string;
  };
}

export interface HallazgoCreate {
  numero_hallazgo: string;
  descripcion: string;
  tipo: 'FORTALEZA' | 'OPORTUNIDAD_MEJORA' | 'NO_CONFORMIDAD' | 'HALLAZGO';
  severidad: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRÍTICA';
  origen_tipo: OrigenTipo;
  fecha_identificacion: string;
  autoevaluacion?: number;
  auditoria?: number;
  resultado_indicador?: number;
  datos_prestador?: number;
  criterio?: number;
  plan_mejora?: number;
  area_responsable?: string;
  estado?: string;
  fecha_cierre?: string;
  observaciones?: string;
}

export interface HallazgoUpdate extends Partial<HallazgoCreate> {
  id: number;
}

export interface EstadisticasHallazgos {
  total_hallazgos: number;
  fortalezas: number;
  oportunidades_mejora: number;
  no_conformidades: number;
  hallazgos: number;
  abiertos: number;
  en_seguimiento: number;
  cerrados: number;
  criticos: number;
}

export interface HallazgoPorOrigen {
  origen_tipo: OrigenTipo;
  total: number;
  abiertos: number;
  en_seguimiento: number;
  cerrados: number;
  criticos: number;
}
