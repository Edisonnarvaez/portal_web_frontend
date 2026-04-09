/**
 * Municipality Entity
 * Representa un municipio dentro de una región
 */

export interface Municipality {
  id: number;
  name: string;
  code: string;
  region: number;
  status?: boolean;
}

export interface MunicipalityCreate {
  name: string;
  code: string;
  region: number;
  status?: boolean;
}

export interface MunicipalityUpdate {
  id?: number;
  name?: string;
  code?: string;
  region?: number;
  status?: boolean;
}
