export interface Hallazgo {
  id: number;
  numero_hallazgo: string;
  descripcion: string;
  tipo: 'FORTALEZA' | 'OPORTUNIDAD_MEJORA' | 'NO_CONFORMIDAD' | 'HALLAZGO';
  severidad: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRÍTICA';
  area_responsable?: string;
  estado: 'ABIERTO' | 'EN_SEGUIMIENTO' | 'CERRADO';
  autoevaluacion_id: number;
  datos_prestador_id?: number;
  criterio_id?: number;
  plan_mejora_id?: number;
  fecha_identificacion: string;
  fecha_cierre?: string;
  observaciones?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface HallazgoCreate {
  numero_hallazgo: string;
  descripcion: string;
  tipo: 'FORTALEZA' | 'OPORTUNIDAD_MEJORA' | 'NO_CONFORMIDAD' | 'HALLAZGO';
  severidad: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRÍTICA';
  area_responsable?: string;
  autoevaluacion_id: number;
  datos_prestador_id?: number;
  criterio_id?: number;
  plan_mejora_id?: number;
  fecha_identificacion: string;
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
