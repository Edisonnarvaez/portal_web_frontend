/**
 * Clase de Prestador de Servicios de Salud
 * Alineado con backend: companies/models/company.py y habilitacion/models/datosPrestador.py
 */

export type ClasePrestador = 
  | 'IPS'   // Institución Prestadora de Servicios
  | 'PROF'  // Profesional de Salud
  | 'PH'    // Persona Humana
  | 'PJ';   // Persona Jurídica

export const CLASE_PRESTADOR_LABELS: Record<ClasePrestador, string> = {
  IPS: 'Institución Prestadora de Servicios',
  PROF: 'Profesional de Salud',
  PH: 'Persona Humana',
  PJ: 'Persona Jurídica',
};

export const CLASE_PRESTADOR_COLORS: Record<ClasePrestador, string> = {
  IPS: '#1E40AF',    // Blue (empresarial)
  PROF: '#7C3AED',   // Purple (profesional)
  PH: '#0891B2',     // Cyan (individual)
  PJ: '#059669',     // Emerald (jurídica)
};

export const CLASE_PRESTADOR_ICONS: Record<ClasePrestador, string> = {
  IPS: 'local_hospital',
  PROF: 'person',
  PH: 'account_circle',
  PJ: 'domain',
};

/**
 * Obtiene información de visualización para una clase de prestador
 */
export function getClasePrestadorInfo(clase: ClasePrestador) {
  return {
    label: CLASE_PRESTADOR_LABELS[clase],
    color: CLASE_PRESTADOR_COLORS[clase],
    icon: CLASE_PRESTADOR_ICONS[clase],
  };
}
