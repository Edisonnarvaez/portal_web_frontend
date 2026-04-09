/**
 * Process Entity (Procesos)
 * Representa un proceso específico dentro de una empresa, departamento y tipo
 */

export interface Process {
  id: number;
  name: string;
  description: string;
  code: string;
  version: string; // Semver o número
  processType: number;
  department: number;
  status: boolean;
  creationDate?: string; // ISO datetime
  updateDate?: string; // ISO datetime
  user?: number; // Usuario que lo creó
  company?: number; // Derivado de department
  processType_name?: string; // Para listados
  department_name?: string; // Para listados
}

export interface ProcessCreate {
  name: string;
  description: string;
  code: string;
  version: string;
  processType: number;
  department: number;
  status?: boolean;
}

export interface ProcessUpdate extends Partial<ProcessCreate> {
  id: number;
}
