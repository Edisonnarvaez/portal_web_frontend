export interface PlanMejora {
  id: number;
  numero_plan: string;
  descripcion: string;
  criterio_id: number;
  autoevaluacion_id: number;
  estado_cumplimiento_actual: string;
  objetivo_mejorado?: string;
  acciones_implementar: string;
  responsable?: string;
  fecha_inicio: string;
  fecha_vencimiento: string;
  fecha_implementacion?: string;
  evidencia?: string;
  porcentaje_avance: number; // 0-100
  estado: 'PENDIENTE' | 'EN_CURSO' | 'COMPLETADO' | 'VENCIDO';
  observaciones?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface PlanMejoraCreate {
  numero_plan: string;
  descripcion: string;
  criterio_id: number;
  autoevaluacion_id: number;
  estado_cumplimiento_actual: string;
  objetivo_mejorado?: string;
  acciones_implementar: string;
  responsable?: string;
  fecha_inicio: string;
  fecha_vencimiento: string;
  porcentaje_avance?: number;
}

export interface PlanMejoraUpdate extends Partial<PlanMejoraCreate> {
  id: number;
}

export interface PlanMejoraResumen {
  total_planes: number;
  pendientes: number;
  en_curso: number;
  completados: number;
  vencidos: number;
  porcentaje_promedio_avance: number;
}
