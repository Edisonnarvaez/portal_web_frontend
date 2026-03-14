import type { Criterio } from './Criterio';

/**
 * Estandar - Standards from Resolución 3100 de 2019
 * Each standard contains multiple criteria for IPS accreditation
 */
export interface Estandar {
  id: number;
  codigo: string;                               // 'TH', 'INF', 'DOT', 'PO', 'RS', 'GI', 'SA'
  codigo_display?: string;                      // Full name: "Talento Humano"
  nombre: string;                               // Display name
  descripcion?: string | null;                  // Detailed description
  estado?: boolean;                             // Active/inactive
  version_resolucion?: string;                  // e.g., "3100/2019"
  criterios?: Criterio[];                       // Nested criterios (from detail endpoint)
  criterios_count?: number;                     // Count of criterios (from list endpoint)
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

export interface EstandarCreate {
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  estado?: boolean;
  version_resolucion?: string;
}

export interface EstandarUpdate extends Partial<EstandarCreate> {
  id: number;
}

/**
 * Respuesta del endpoint /api/normativity/estandares/
 */
export interface EstandarListResponse {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: Estandar[];
}

/**
 * Estandar detail con criterios anidados
 */
export interface EstandarDetail extends Estandar {
  criterios: Criterio[];                        // Full criterios array
}
