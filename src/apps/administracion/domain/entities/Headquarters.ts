/**
 * Headquarters Entity (Sedes)
 * Representa físicamente una sede o punto de atención de una empresa
 */

export interface HeadquartersDetail {
  id: number;
  name: string;
  company: {
    id: number;
    name: string;
  };
  region: {
    id: number;
    name: string;
    code: string;
  };
  municipality: {
    id: number;
    name: string;
    code: string;
  };
  address: string;
  concepto_sanitario: boolean;
  reserva_agua_24h: boolean;
  planta_electrica: boolean;
  es_domicilio_ong: boolean;
  status: boolean;
  creationDate: string; // ISO datetime
  updateDate: string; // ISO datetime
}

export interface Headquarters {
  id: number;
  name: string;
  company: number;
  region: number;
  municipality: number;
  address: string;
  concepto_sanitario?: boolean;
  reserva_agua_24h?: boolean;
  planta_electrica?: boolean;
  es_domicilio_ong?: boolean;
  status: boolean;
  creationDate?: string;
  updateDate?: string;
  company_name?: string; // Para listados
  region_name?: string; // Para listados
  municipality_name?: string; // Para listados
}

export interface HeadquartersCreate {
  name: string;
  company: number;
  region: number;
  municipality: number;
  address: string;
  concepto_sanitario?: boolean;
  reserva_agua_24h?: boolean;
  planta_electrica?: boolean;
  es_domicilio_ong?: boolean;
}

export interface HeadquartersUpdate extends Partial<HeadquartersCreate> {
  id: number;
  status?: boolean;
}
