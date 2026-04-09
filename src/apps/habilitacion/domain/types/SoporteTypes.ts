/**
 * Tipos y enums para sistema de Soportes
 * Alineado con backend: soportes/models/
 */

export type NivelSoporte = 'EMPRESA' | 'SEDE' | 'SERVICIO';

export type EstadoSoporteRequerido = 'PENDIENTE' | 'CARGADO' | 'VENCIDO';

export const NIVEL_SOPORTE_LABELS: Record<NivelSoporte, string> = {
  EMPRESA: 'Nivel Empresa',
  SEDE: 'Nivel Sede',
  SERVICIO: 'Nivel Servicio',
};

export const NIVEL_SOPORTE_COLORS: Record<NivelSoporte, string> = {
  EMPRESA: '#1E40AF',    // Blue (empresa)
  SEDE: '#7C3AED',       // Purple (sede)
  SERVICIO: '#0891B2',   // Cyan (servicio)
};

export const NIVEL_SOPORTE_ICONS: Record<NivelSoporte, string> = {
  EMPRESA: 'domain',
  SEDE: 'location_on',
  SERVICIO: 'medical_services',
};

export const ESTADO_SOPORTE_REQUERIDO_LABELS: Record<EstadoSoporteRequerido, string> = {
  PENDIENTE: 'Pendiente',
  CARGADO: 'Cargado',
  VENCIDO: 'Vencido',
};

export const ESTADO_SOPORTE_REQUERIDO_COLORS: Record<EstadoSoporteRequerido, string> = {
  PENDIENTE: '#F59E0B',  // Amber - Acción requerida
  CARGADO: '#10B981',    // Green - Cumplido
  VENCIDO: '#EF4444',    // Red - Acción urgente
};

export const ESTADO_SOPORTE_REQUERIDO_ICONS: Record<EstadoSoporteRequerido, string> = {
  PENDIENTE: 'schedule',
  CARGADO: 'check_circle',
  VENCIDO: 'error',
};

/**
 * Obtiene información de visualización para un nivel de soporte
 */
export function getNivelSoporteInfo(nivel: NivelSoporte) {
  return {
    label: NIVEL_SOPORTE_LABELS[nivel],
    color: NIVEL_SOPORTE_COLORS[nivel],
    icon: NIVEL_SOPORTE_ICONS[nivel],
  };
}

/**
 * Obtiene información de visualización para un estado de soporte requerido
 */
export function getEstadoSoporteRequeridoInfo(estado: EstadoSoporteRequerido) {
  return {
    label: ESTADO_SOPORTE_REQUERIDO_LABELS[estado],
    color: ESTADO_SOPORTE_REQUERIDO_COLORS[estado],
    icon: ESTADO_SOPORTE_REQUERIDO_ICONS[estado],
  };
}
