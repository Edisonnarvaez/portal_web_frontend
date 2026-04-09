/**
 * Estados posibles de cumplimiento de un criterio
 * Alineado con backend: habilitacion/models/cumplimiento.py
 */

export type EstadoCumplimiento = 
  | 'CUMPLE'        // Cumple completamente el criterio
  | 'NO_CUMPLE'     // No cumple el criterio
  | 'PARCIALMENTE'  // Cumplimiento parcial
  | 'NO_APLICA';    // Criterio no aplica a este servicio

export const ESTADO_CUMPLIMIENTO_LABELS: Record<EstadoCumplimiento, string> = {
  CUMPLE: 'Cumple',
  NO_CUMPLE: 'No Cumple',
  PARCIALMENTE: 'Parcialmente',
  NO_APLICA: 'No Aplica',
};

export const ESTADO_CUMPLIMIENTO_COLORS: Record<EstadoCumplimiento, string> = {
  CUMPLE: '#10B981',       // Green
  NO_CUMPLE: '#EF4444',    // Red
  PARCIALMENTE: '#F59E0B', // Amber
  NO_APLICA: '#6B7280',    // Gray
};

export const ESTADO_CUMPLIMIENTO_ICONS: Record<EstadoCumplimiento, string> = {
  CUMPLE: 'check_circle',
  NO_CUMPLE: 'cancel',
  PARCIALMENTE: 'help',
  NO_APLICA: 'block',
};

/**
 * Obtiene información de visualización para un estado de cumplimiento
 */
export function getEstadoCumplimientoInfo(estado: EstadoCumplimiento) {
  return {
    label: ESTADO_CUMPLIMIENTO_LABELS[estado],
    color: ESTADO_CUMPLIMIENTO_COLORS[estado],
    icon: ESTADO_CUMPLIMIENTO_ICONS[estado],
  };
}

/**
 * Calcula el porcentaje de cumplimiento basado en los estados
 */
export function calcularPorcentajeCumplimiento(
  cumple: number,
  parcialmente: number,
  total: number
): number {
  if (total === 0) return 0;
  return Math.round(((cumple + parcialmente * 0.5) / total) * 100);
}
