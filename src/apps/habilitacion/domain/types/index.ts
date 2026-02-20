// Estados de habilitación
export const ESTADOS_HABILITACION = [
  { value: 'HABILITADA', label: 'Habilitada', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  { value: 'EN_PROCESO', label: 'En Proceso', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  { value: 'SUSPENDIDA', label: 'Suspendida', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  { value: 'NO_HABILITADA', label: 'No Habilitada', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  { value: 'CANCELADA', label: 'Cancelada', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
] as const;

// Clase de prestador
export const CLASES_PRESTADOR = [
  { value: 'IPS', label: 'Institución Prestadora' },
  { value: 'PROF', label: 'Profesional' },
  { value: 'PH', label: 'Persona Humana' },
  { value: 'PJ', label: 'Persona Jurídica' },
] as const;

// Modalidades de servicio
export const MODALIDADES_SERVICIO = [
  { value: 'INTRAMURAL', label: 'Intramural' },
  { value: 'AMBULATORIA', label: 'Ambulatoria' },
  { value: 'TELEMEDICINA', label: 'Telemedicina' },
  { value: 'URGENCIAS', label: 'Urgencias' },
  { value: 'AMBULANCIA', label: 'Ambulancia' },
] as const;

// Complejidad de servicios
export const COMPLEJIDADES_SERVICIO = [
  { value: 'BAJA', label: 'Baja' },
  { value: 'MEDIA', label: 'Media' },
  { value: 'ALTA', label: 'Alta' },
] as const;

// Estados de autoevaluación
export const ESTADOS_AUTOEVALUACION = [
  { value: 'BORRADOR', label: 'Borrador', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
  { value: 'EN_CURSO', label: 'En Curso', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  { value: 'COMPLETADA', label: 'Completada', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  { value: 'REVISADA', label: 'Revisada', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' },
  { value: 'VALIDADA', label: 'Validada', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
] as const;

// Estados de cumplimiento de criterios
export const ESTADOS_CUMPLIMIENTO = [
  { value: 'CUMPLE', label: 'Cumple', color: 'bg-green-100 text-green-800' },
  { value: 'NO_CUMPLE', label: 'No Cumple', color: 'bg-red-100 text-red-800' },
  { value: 'PARCIALMENTE', label: 'Parcialmente', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'NO_APLICA', label: 'No Aplica', color: 'bg-gray-100 text-gray-800' },
] as const;

// Estados de plan de mejora
export const ESTADOS_PLAN_MEJORA = [
  { value: 'PENDIENTE', label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  { value: 'EN_CURSO', label: 'En Curso', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  { value: 'COMPLETADO', label: 'Completado', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  { value: 'VENCIDO', label: 'Vencido', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
] as const;

// Tipos de hallazgo
export const TIPOS_HALLAZGO = [
  { value: 'FORTALEZA', label: 'Fortaleza', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  { value: 'OPORTUNIDAD_MEJORA', label: 'Oportunidad de Mejora', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  { value: 'NO_CONFORMIDAD', label: 'No Conformidad', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  { value: 'HALLAZGO', label: 'Hallazgo', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
] as const;

// Severidades de hallazgo
export const SEVERIDADES_HALLAZGO = [
  { value: 'BAJA', label: 'Baja', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  { value: 'MEDIA', label: 'Media', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  { value: 'ALTA', label: 'Alta', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
  { value: 'CRÍTICA', label: 'Crítica', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
] as const;

// Estados de hallazgo
export const ESTADOS_HALLAZGO = [
  { value: 'ABIERTO', label: 'Abierto', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  { value: 'EN_SEGUIMIENTO', label: 'En Seguimiento', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  { value: 'CERRADO', label: 'Cerrado', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
] as const;

// Origen de planes de mejora y hallazgos
export const ORIGENES_TIPO = [
  { value: 'HABILITACION', label: 'Habilitación', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  { value: 'AUDITORIA', label: 'Auditoría', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  { value: 'INDICADOR', label: 'Indicador', color: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200' },
] as const;

// Tipos de soporte de plan de mejora
export const TIPOS_SOPORTE = [
  { value: 'EVIDENCIA', label: 'Evidencia' },
  { value: 'ACTA', label: 'Acta' },
  { value: 'INFORME', label: 'Informe' },
  { value: 'FOTOGRAFIA', label: 'Fotografía' },
  { value: 'PLAN_ACCION', label: 'Plan de Acción' },
  { value: 'OTRO', label: 'Otro' },
] as const;

// Categorías de criterio
export const CATEGORIAS_CRITERIO = [
  { value: 'TALENTO_HUMANO', label: 'Talento Humano' },
  { value: 'INFRAESTRUCTURA', label: 'Infraestructura' },
  { value: 'DOTACION', label: 'Dotación' },
  { value: 'MEDICAMENTOS', label: 'Medicamentos y Dispositivos' },
  { value: 'PROCESOS_PRIORITARIOS', label: 'Procesos Prioritarios' },
  { value: 'HISTORIA_CLINICA', label: 'Historia Clínica' },
  { value: 'INTERDEPENDENCIA', label: 'Interdependencia' },
] as const;

// Type exports
export type EstadoHabilitacion = typeof ESTADOS_HABILITACION[number]['value'];
export type ClasePrestador = typeof CLASES_PRESTADOR[number]['value'];
export type ModalidadServicio = typeof MODALIDADES_SERVICIO[number]['value'];
export type ComplejidadServicio = typeof COMPLEJIDADES_SERVICIO[number]['value'];
export type EstadoAutoevaluacion = typeof ESTADOS_AUTOEVALUACION[number]['value'];
export type EstadoCumplimiento = typeof ESTADOS_CUMPLIMIENTO[number]['value'];
export type EstadoPlanMejora = typeof ESTADOS_PLAN_MEJORA[number]['value'];
export type TipoHallazgo = typeof TIPOS_HALLAZGO[number]['value'];
export type SeveridadHallazgo = typeof SEVERIDADES_HALLAZGO[number]['value'];
export type EstadoHallazgo = typeof ESTADOS_HALLAZGO[number]['value'];
export type CategoriaCriterio = typeof CATEGORIAS_CRITERIO[number]['value'];
export type OrigenTipoValue = typeof ORIGENES_TIPO[number]['value'];
export type TipoSoporte = typeof TIPOS_SOPORTE[number]['value'];

// Mensajes por rol
export const ROLE_MESSAGES = {
  user: {
    noPermission: "No tienes permisos para realizar esta acción. Contacta al gestor o administrador.",
    description: "Consulta de habilitación y servicios",
    emptyState: "No hay datos de habilitación disponibles"
  },
  gestor: {
    noPermission: "No tienes permisos para gestionar habilitación. Contacta al administrador.",
    description: "Gestión de habilitación, servicios y autoevaluaciones",
    emptyState: "No hay datos disponibles. Intenta crear un nuevo registro."
  },
  admin: {
    description: "Gestión completa de habilitación",
    emptyState: "Intenta ajustar los filtros de búsqueda"
  }
} as const;

export type UserRole = keyof typeof ROLE_MESSAGES;
