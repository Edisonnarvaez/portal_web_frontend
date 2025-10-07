export const TIPOS_DOCUMENTO = [
    { value: 'FC', label: 'Ficha de caracterización' },
    { value: 'MA', label: 'Matriz' },
    { value: 'PR', label: 'Procedimiento' },
    { value: 'DI', label: 'Documento interno' },
    { value: 'GU', label: 'Guía' },
    { value: 'PT', label: 'Protocolo' },
    { value: 'PL', label: 'Plan' },
    { value: 'IN', label: 'Instructivo' },
    { value: 'FR', label: 'Formato' },
    { value: 'DE', label: 'Documento externo' },
    { value: 'RG', label: 'Registro' },
] as const;

export const ESTADOS = [
    { value: 'VIG', label: 'Vigente', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    { value: 'OBS', label: 'Obsoleto', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
] as const;

export const ROLE_MESSAGES = {
    user: {
        noPermission: "No tienes permisos para realizar esta acción. Contacta al gestor o administrador.",
        description: "Consulta de documentos del sistema de calidad",
        emptyState: "No hay documentos disponibles para consulta"
    },
    gestor: {
        noPermission: "No tienes permisos para gestionar documentos. Contacta al administrador.",
        description: "Consulta y descarga de documentos del sistema de calidad",
        emptyState: "No hay documentos disponibles para consulta y descarga"
    },
    admin: {
        description: "Gestión completa de documentos del sistema de calidad",
        emptyState: "Intenta ajustar los filtros de búsqueda"
    }
} as const;

export type TipoDocumento = typeof TIPOS_DOCUMENTO[number]['value'];
export type EstadoDocumento = typeof ESTADOS[number]['value'];
export type UserRole = keyof typeof ROLE_MESSAGES;