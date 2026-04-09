/**
 * ProcessType Entity (Tipos de Proceso)
 * Define categorías o clasificaciones de procesos en una empresa
 */

export interface ProcessType {
  id: number;
  name: string;
  description: string;
  company: number;
  status: boolean;
  creationDate?: string; // ISO datetime
  updateDate?: string; // ISO datetime
  user?: number; // Usuario que lo creó
  company_name?: string; // Para listados
}

export interface ProcessTypeCreate {
  name: string;
  description: string;
  company: number;
  status?: boolean;
}

export interface ProcessTypeUpdate extends Partial<ProcessTypeCreate> {
  id: number;
}
