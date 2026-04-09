/**
 * Region Entity
 * Representa una región geográfica del país
 */

export interface Region {
  id: number;
  name: string;
  code: string;
  status?: boolean;
}

export interface RegionCreate {
  name: string;
  code: string;
  status?: boolean;
}

export interface RegionUpdate {
  id?: number;
  name?: string;
  code?: string;
  status?: boolean;
}
