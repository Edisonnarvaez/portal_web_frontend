/**
 * Tipos de Hallazgos identificados en evaluaciones
 * Alineado con backend: mejoras/models/hallazgo.py
 */

export type TipoHallazgo = 
  | 'FORTALEZA'             // Punto fuerte identificado
  | 'OPORTUNIDAD_MEJORA'    // Área con potencial de mejora
  | 'NO_CONFORMIDAD'        // Incumplimiento de requisito
  | 'HALLAZGO';             // Hallazgo general

export type SeveridadHallazgo = 
  | 'BAJA'       // Bajo impacto
  | 'MEDIA'      // Impacto moderado
  | 'ALTA'       // Impacto significativo
  | 'CRÍTICA';   // Impacto crítico/urgente

export type EstadoHallazgo = 
  | 'ABIERTO'         // Recientemente identificado
  | 'EN_SEGUIMIENTO'  // Se está dando seguimiento
  | 'CERRADO';        // Resuelto/cerrado

export const TIPO_HALLAZGO_LABELS: Record<TipoHallazgo, string> = {
  FORTALEZA: 'Fortaleza',
  OPORTUNIDAD_MEJORA: 'Oportunidad de Mejora',
  NO_CONFORMIDAD: 'No Conformidad',
  HALLAZGO: 'Hallazgo',
};

export const TIPO_HALLAZGO_COLORS: Record<TipoHallazgo, string> = {
  FORTALEZA: '#10B981',          // Green
  OPORTUNIDAD_MEJORA: '#3B82F6', // Blue
  NO_CONFORMIDAD: '#EF4444',     // Red
  HALLAZGO: '#F59E0B',           // Amber
};

export const TIPO_HALLAZGO_ICONS: Record<TipoHallazgo, string> = {
  FORTALEZA: 'thumb_up',
  OPORTUNIDAD_MEJORA: 'lightbulb',
  NO_CONFORMIDAD: 'warning',
  HALLAZGO: 'info',
};

export const SEVERIDAD_HALLAZGO_LABELS: Record<SeveridadHallazgo, string> = {
  BAJA: 'Baja',
  MEDIA: 'Media',
  ALTA: 'Alta',
  CRÍTICA: 'Crítica',
};

export const SEVERIDAD_HALLAZGO_COLORS: Record<SeveridadHallazgo, string> = {
  BAJA: '#D1FAE5',       // Light green
  MEDIA: '#FEF3C7',      // Light amber
  ALTA: '#FED7AA',       // Light orange
  CRÍTICA: '#FECACA',    // Light red
};

export const SEVERIDAD_HALLAZGO_BADGE_COLORS: Record<SeveridadHallazgo, string> = {
  BAJA: '#059669',       // Green
  MEDIA: '#D97706',      // Amber
  ALTA: '#EA580C',       // Orange
  CRÍTICA: '#DC2626',    // Red
};

export const SEVERIDAD_HALLAZGO_ICONS: Record<SeveridadHallazgo, string> = {
  BAJA: 'info',
  MEDIA: 'warning',
  ALTA: 'error',
  CRÍTICA: 'priority_high',
};

export const ESTADO_HALLAZGO_LABELS: Record<EstadoHallazgo, string> = {
  ABIERTO: 'Abierto',
  EN_SEGUIMIENTO: 'En Seguimiento',
  CERRADO: 'Cerrado',
};

export const ESTADO_HALLAZGO_COLORS: Record<EstadoHallazgo, string> = {
  ABIERTO: '#EF4444',    // Red
  EN_SEGUIMIENTO: '#F59E0B', // Amber
  CERRADO: '#10B981',    // Green
};

export const ESTADO_HALLAZGO_ICONS: Record<EstadoHallazgo, string> = {
  ABIERTO: 'task',
  EN_SEGUIMIENTO: 'schedule',
  CERRADO: 'task_alt',
};

/**
 * Obtiene información de visualización para un tipo de hallazgo
 */
export function getTipoHallazgoInfo(tipo: TipoHallazgo) {
  return {
    label: TIPO_HALLAZGO_LABELS[tipo],
    color: TIPO_HALLAZGO_COLORS[tipo],
    icon: TIPO_HALLAZGO_ICONS[tipo],
  };
}

/**
 * Obtiene información de visualización para una severidad
 */
export function getSeveridadHallazgoInfo(severidad: SeveridadHallazgo) {
  return {
    label: SEVERIDAD_HALLAZGO_LABELS[severidad],
    color: SEVERIDAD_HALLAZGO_COLORS[severidad],
    badgeColor: SEVERIDAD_HALLAZGO_BADGE_COLORS[severidad],
    icon: SEVERIDAD_HALLAZGO_ICONS[severidad],
  };
}

/**
 * Obtiene información de visualización para un estado de hallazgo
 */
export function getEstadoHallazgoInfo(estado: EstadoHallazgo) {
  return {
    label: ESTADO_HALLAZGO_LABELS[estado],
    color: ESTADO_HALLAZGO_COLORS[estado],
    icon: ESTADO_HALLAZGO_ICONS[estado],
  };
}
