export type OrigenTipo = 'HABILITACION' | 'AUDITORIA' | 'INDICADOR';

export interface PlanMejora {
  id: number;
  numero_plan: string;
  descripcion: string;
  origen_tipo: OrigenTipo;
  origen_tipo_display: string;
  cumplimiento_id?: number;
  autoevaluacion_id?: number;
  autoevaluacion_numero?: string;
  criterio_id?: number;
  criterio_codigo?: string;
  criterio_nombre?: string;
  auditoria_id?: number;
  auditoria_nombre?: string;
  resultado_indicador_id?: number;
  estado_cumplimiento_actual?: string;
  objetivo_mejorado?: string;
  acciones_implementar: string;
  responsable?: number;
  responsable_nombre?: string;
  fecha_inicio: string;
  fecha_vencimiento: string;
  fecha_implementacion?: string;
  porcentaje_avance: number; // 0-100
  estado: 'PENDIENTE' | 'EN_CURSO' | 'COMPLETADO' | 'VENCIDO';
  estado_display: string;
  evidencia?: string;
  observaciones?: string;
  esta_vencido: boolean;
  dias_restantes: number;
  proximo_a_vencer: boolean;
  hallazgos_count: number;
  soportes_count: number;
  origen_detalle?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface PlanMejoraDetail extends PlanMejora {
  hallazgos: Array<{
    id: number;
    numero_hallazgo: string;
    tipo: string;
    severidad: string;
    estado: string;
    descripcion: string;
  }>;
  soportes: SoportePlan[];
}

export interface SoportePlan {
  id: number;
  plan_mejora: number;
  archivo: string;
  nombre_original: string;
  tipo_soporte: 'EVIDENCIA' | 'ACTA' | 'INFORME' | 'FOTOGRAFIA' | 'PLAN_ACCION' | 'OTRO';
  tipo_soporte_display: string;
  descripcion?: string;
  tamano_bytes: number;
  tamano_legible: string;
  extension: string;
  subido_por: number;
  subido_por_nombre: string;
  fecha_subida: string;
}

export interface PlanMejoraCreate {
  numero_plan: string;
  descripcion: string;
  origen_tipo: OrigenTipo;
  acciones_implementar: string;
  fecha_inicio: string;
  fecha_vencimiento: string;
  autoevaluacion?: number;
  auditoria?: number;
  resultado_indicador?: number;
  cumplimiento?: number;
  criterio?: number;
  estado_cumplimiento_actual?: string;
  objetivo_mejorado?: string;
  responsable?: number;
  fecha_implementacion?: string;
  porcentaje_avance?: number;
  estado?: string;
  evidencia?: string;
  observaciones?: string;
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

export interface PlanMejoraPorOrigen {
  origen_tipo: OrigenTipo;
  total: number;
  pendientes: number;
  en_curso: number;
  completados: number;
  vencidos: number;
}
