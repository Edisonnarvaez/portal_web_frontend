import type { ComplejidadServicio, EstadoHabilitacionPrestador, EstadoHabilitacionServicio, ModalidadServicio } from './index';

export type QueryFilterValue = string | number | boolean | null | undefined;

export interface BaseListFilters {
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface DatosPrestadorFilters extends BaseListFilters {
  codigo_reps?: string;
  clase_prestador?: string;
  estado_habilitacion?: EstadoHabilitacionPrestador;
  municipio?: string;
  departamento?: string;
}

export interface ServicioSedeFilters extends BaseListFilters {
  prestador?: number;
  prestador_id?: number;
  modalidad?: ModalidadServicio;
  complejidad?: ComplejidadServicio;
  estado_habilitacion?: EstadoHabilitacionServicio;
}

export interface CumplimientoFilters extends BaseListFilters {
  autoevaluacion_id?: number;
  autoevaluacion?: number;
  servicio_sede_id?: number;
  criterio_id?: number;
  prestador_id?: number;
  cumple?: 'CUMPLE' | 'NO_CUMPLE' | 'PARCIALMENTE' | 'NO_APLICA';
  con_plan_mejora?: boolean;
}

export interface EstandarFilters extends BaseListFilters {
  estado?: boolean;
  codigo?: string;
}

export interface AutoevaluacionFilters extends BaseListFilters {
  datos_prestador?: number;
  datos_prestador_id?: number;
  periodo?: number;
  estado?: 'BORRADOR' | 'EN_CURSO' | 'COMPLETADA' | 'REVISADA' | 'VALIDADA';
}

export interface CriterioFilters extends BaseListFilters {
  codigo?: string;
  estandar?: number;
  categoria?: string;
  complejidad?: 'BAJA' | 'MEDIA' | 'ALTA';
  es_mandatorio?: boolean;
  requiere_evidencia_documental?: boolean;
}

export interface CriterioEvaluacionFilters extends BaseListFilters {
  autoevaluacion?: number;
  autoevaluacion_id?: number;
  criterio_id?: number;
  estado_cumplimiento?: 'CUMPLE' | 'NO_CUMPLE' | 'PARCIALMENTE' | 'NO_APLICA';
}

export interface HallazgoFilters extends BaseListFilters {
  autoevaluacion?: number;
  autoevaluacion_id?: number;
  origen_tipo?: 'HABILITACION' | 'AUDITORIA' | 'INDICADOR';
  estado?: 'ABIERTO' | 'EN_SEGUIMIENTO' | 'CERRADO';
  severidad?: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRÍTICA';
  plan_mejora_id?: number;
}

export interface PlanMejoraFilters extends BaseListFilters {
  autoevaluacion?: number;
  autoevaluacion_id?: number;
  origen_tipo?: 'HABILITACION' | 'AUDITORIA' | 'INDICADOR';
  estado?: 'PENDIENTE' | 'EN_CURSO' | 'COMPLETADO' | 'VENCIDO';
  responsable?: number;
}
