/**
 * Habilitación Enums
 * Typescript enums for type-safe access to constants
 */

/**
 * Complejidad de Criterios
 */
export enum ComplejidadCriterioEnum {
  BAJA = 'BAJA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
}

export const complejidadCriterioLabels: Record<ComplejidadCriterioEnum, string> = {
  [ComplejidadCriterioEnum.BAJA]: 'Baja',
  [ComplejidadCriterioEnum.MEDIA]: 'Media',
  [ComplejidadCriterioEnum.ALTA]: 'Alta',
};

/**
 * Estados de Cumplimiento
 */
export enum EstadoCumplimientoEnum {
  CUMPLE = 'CUMPLE',
  NO_CUMPLE = 'NO_CUMPLE',
  PARCIALMENTE = 'PARCIALMENTE',
  NO_APLICA = 'NO_APLICA',
}

export const estadoCumplimientoLabels: Record<EstadoCumplimientoEnum, string> = {
  [EstadoCumplimientoEnum.CUMPLE]: 'Cumple',
  [EstadoCumplimientoEnum.NO_CUMPLE]: 'No Cumple',
  [EstadoCumplimientoEnum.PARCIALMENTE]: 'Parcialmente',
  [EstadoCumplimientoEnum.NO_APLICA]: 'No Aplica',
};

export const estadoCumplimientoColors: Record<EstadoCumplimientoEnum, string> = {
  [EstadoCumplimientoEnum.CUMPLE]: 'bg-green-500 text-white',
  [EstadoCumplimientoEnum.NO_CUMPLE]: 'bg-red-500 text-white',
  [EstadoCumplimientoEnum.PARCIALMENTE]: 'bg-yellow-500 text-white',
  [EstadoCumplimientoEnum.NO_APLICA]: 'bg-gray-500 text-white',
};

/**
 * Modalidades de Servicio
 */
export enum ModalidadServicioEnum {
  INTRAMURAL = 'INTRAMURAL',
  AMBULATORIA = 'AMBULATORIA',
  TELEMEDICINA = 'TELEMEDICINA',
  URGENCIAS = 'URGENCIAS',
  AMBULANCIA = 'AMBULANCIA',
}

/**
 * Estados de Autoevaluación
 */
export enum EstadoAutoevaluacionEnum {
  BORRADOR = 'BORRADOR',
  EN_CURSO = 'EN_CURSO',
  COMPLETADA = 'COMPLETADA',
  REVISADA = 'REVISADA',
  VALIDADA = 'VALIDADA',
}

/**
 * Helpers para convertir entre enums y valores string
 */
export const isValidComplejidadCriterio = (value: any): value is ComplejidadCriterioEnum => {
  return Object.values(ComplejidadCriterioEnum).includes(value);
};

export const isValidEstadoCumplimiento = (value: any): value is EstadoCumplimientoEnum => {
  return Object.values(EstadoCumplimientoEnum).includes(value);
};
