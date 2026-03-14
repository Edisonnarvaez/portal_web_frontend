/**
 * Habilitación Enums (as const objects - compatible con erasableSyntaxOnly)
 * Type-safe access to constants using const objects instead of enums
 */

/**
 * Complejidad de Criterios
 */
export const ComplejidadCriterioEnum = {
  BAJA: 'BAJA',
  MEDIA: 'MEDIA',
  ALTA: 'ALTA',
} as const;

export type ComplejidadCriterioEnum = typeof ComplejidadCriterioEnum[keyof typeof ComplejidadCriterioEnum];

export const complejidadCriterioLabels: Record<ComplejidadCriterioEnum, string> = {
  BAJA: 'Baja',
  MEDIA: 'Media',
  ALTA: 'Alta',
};

/**
 * Estados de Cumplimiento
 */
export const EstadoCumplimientoEnum = {
  CUMPLE: 'CUMPLE',
  NO_CUMPLE: 'NO_CUMPLE',
  PARCIALMENTE: 'PARCIALMENTE',
  NO_APLICA: 'NO_APLICA',
} as const;

export type EstadoCumplimientoEnum = typeof EstadoCumplimientoEnum[keyof typeof EstadoCumplimientoEnum];

export const estadoCumplimientoLabels: Record<EstadoCumplimientoEnum, string> = {
  CUMPLE: 'Cumple',
  NO_CUMPLE: 'No Cumple',
  PARCIALMENTE: 'Parcialmente',
  NO_APLICA: 'No Aplica',
};

export const estadoCumplimientoColors: Record<EstadoCumplimientoEnum, string> = {
  CUMPLE: 'bg-green-500 text-white',
  NO_CUMPLE: 'bg-red-500 text-white',
  PARCIALMENTE: 'bg-yellow-500 text-white',
  NO_APLICA: 'bg-gray-500 text-white',
};

/**
 * Modalidades de Servicio
 */
export const ModalidadServicioEnum = {
  INTRAMURAL: 'INTRAMURAL',
  AMBULATORIA: 'AMBULATORIA',
  TELEMEDICINA: 'TELEMEDICINA',
  URGENCIAS: 'URGENCIAS',
  AMBULANCIA: 'AMBULANCIA',
} as const;

export type ModalidadServicioEnum = typeof ModalidadServicioEnum[keyof typeof ModalidadServicioEnum];

/**
 * Estados de Autoevaluación
 */
export const EstadoAutoevaluacionEnum = {
  BORRADOR: 'BORRADOR',
  EN_CURSO: 'EN_CURSO',
  COMPLETADA: 'COMPLETADA',
  REVISADA: 'REVISADA',
  VALIDADA: 'VALIDADA',
} as const;

export type EstadoAutoevaluacionEnum = typeof EstadoAutoevaluacionEnum[keyof typeof EstadoAutoevaluacionEnum];

/**
 * Helpers para convertir entre enums y valores string
 */
export const isValidComplejidadCriterio = (value: any): value is ComplejidadCriterioEnum => {
  return Object.values(ComplejidadCriterioEnum).includes(value);
};

export const isValidEstadoCumplimiento = (value: any): value is EstadoCumplimientoEnum => {
  return Object.values(EstadoCumplimientoEnum).includes(value);
};
