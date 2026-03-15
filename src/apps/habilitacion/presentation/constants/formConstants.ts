/**
 * Form Constants and Validation Rules
 * Constantes específicas para formularios de habilitación
 */



// Validación de campos Criterio
export const CRITERIO_VALIDATION = {
  codigo: {
    minLength: 3,
    maxLength: 20,
    pattern: /^\d+\.\d+$/,
    patternError: 'Código debe tener formato N.N (ej: 1.1, 2.3)',
    placeholder: 'Ej: 1.1, 2.3',
  },
  nombre: {
    minLength: 3,
    maxLength: 100,
    placeholder: 'Ej: Infraestructura Física',
  },
  descripcion: {
    minLength: 10,
    maxLength: 1000,
    placeholder: 'Explicación completa de qué trata este criterio...',
  },
  notas_interpretacion: {
    maxLength: 500,
    placeholder: 'Aclaraciones sobre cómo interpretar y aplicar este criterio...',
  },
} as const;

// Validación de campos Cumplimiento
export const CUMPLIMIENTO_VALIDATION = {
  hallazgo: {
    minLength: 10,
    maxLength: 1000,
    placeholder: 'Descripción del hallazgo hallado durante la evaluación...',
  },
  plan_mejora: {
    minLength: 10,
    maxLength: 1000,
    placeholder: 'Acciones concretas para mejorar en este criterio...',
  },
  fecha_compromiso: {
    format: 'YYYY-MM-DD',
    minDaysFromNow: 1,
    maxDaysFromNow: 365,
  },
} as const;

// Opciones por defecto para selectores
export const FORM_DEFAULTS = {
  criterio: {
    complejidad: 'MEDIA' as const,
    es_mandatorio: false,
    requiere_evidencia_documental: false,
  },
  cumplimiento: {
    cumple: 'CUMPLE' as const,
  },
  servicio: {
    modalidad: 'INTRAMURAL' as const,
    complejidad: 'MEDIA' as const,
    estado: 'EN_PROCESO' as const,
  },
} as const;

// Mensajes de validación comunes
export const VALIDATION_MESSAGES = {
  required: (field: string) => `${field} es requerido`,
  minLength: (field: string, min: number) => `${field} debe tener mínimo ${min} caracteres`,
  maxLength: (field: string, max: number) => `${field} no puede exceder ${max} caracteres`,
  pattern: (message: string) => message,
  invalidEmail: 'Email inválido',
  invalidDate: 'Fecha inválida. Use formato YYYY-MM-DD',
  futureDateRequired: 'La fecha debe ser en el futuro',
  pastDateRequired: 'La fecha debe ser en el pasado',
} as const;

// Ayuda y hints para formularios
export const FORM_HINTS = {
  criterio: {
    codigo: 'Código único del criterio en formato N.N (ej: 1.1, 2.3). No se puede cambiar después de crear.',
    nombre: 'Nombre corto y descriptivo del criterio. Es lo que ven los usuarios en listas y dropdown ',
    descripcion: 'Descripción detallada que explica qué se evalúa con este criterio y por qué es importante.',
    complejidad: 'Define el nivel de dificultad para verificar este criterio',
    es_mandatorio: 'Si está marcado, todas las IPS DEBEN cumplir con este criterio. Si no, es opcional según tipo de institución.',
    requiere_evidencia_documental: 'Si está marcado, el cumplimiento debe estar respaldado con documentos, actas, fotos, etc.',
  },
  cumplimiento: {
    cumple: 'Estado del cumplimiento: ✓ Cumple (todo correcto), ✗ No Cumple (incumplimiento total), ⚠ Parcialmente (cumplimiento parcial)',
    hallazgo: 'Describa qué se encontró durante la evaluación. Sea específico. (Solo si No Cumple o Parcialmente)',
    plan_mejora: 'Acciones concretas que se deben tomar para corregir el hallazgo. Incluya responsables y pasos.',
    fecha_compromiso: 'Fecha en la que se espera que el hallazgo sea corregido. Máximo 1 año desde hoy.',
  },
} as const;

// Estados y transiciones permitidas
export const ALLOWED_TRANSITIONS = {
  criterio: {
    crear: ['BAJA', 'MEDIA', 'ALTA'],
    editar: ['BAJA', 'MEDIA', 'ALTA'],
    eliminar: true,
  },
  cumplimiento: {
    crear: ['CUMPLE', 'NO_CUMPLE', 'PARCIALMENTE', 'NO_APLICA'],
    editar: ['CUMPLE', 'NO_CUMPLE', 'PARCIALMENTE', 'NO_APLICA'],
    // Solo se pueden eliminar cumplimientos sin planes de mejora vinculados
    puedoEliminar: (cumplimiento: any) => !cumplimiento.planes_mejora_vinculados?.length,
  },
} as const;

// Iconos y estilos para estados
export const STATE_STYLES = {
  complejidad: {
    BAJA: { icon: '▼', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/30' },
    MEDIA: { icon: '●', color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30' },
    ALTA: { icon: '▲', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-900/30' },
  },
  mandatorio: {
    true: { label: '⚠️ Mandatorio', color: 'text-red-600 dark:text-red-400' },
    false: { label: '◎ Opcional', color: 'text-gray-500 dark:text-gray-400' },
  },
  requiereEvidencia: {
    true: { label: '📎 Con Evidencia', color: 'text-blue-600 dark:text-blue-400' },
    false: { label: '◎ Sin Requerimiento', color: 'text-gray-500 dark:text-gray-400' },
  },
} as const;

// Límites y restricciones
export const LIMITS = {
  criterios_por_estandar: 50,
  cumplimientos_por_autoevaluacion: 1000,
  caracteres_hallazgo_preview: 100,
  resultados_busqueda_dropdown: 20,
  archivos_adjuntos_max_size_mb: 10,
  archivos_adjuntos_max_count: 5,
} as const;
