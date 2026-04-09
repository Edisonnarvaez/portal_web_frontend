/**
 * Department Entity (Áreas)
 * Representa un departamento o área dentro de una empresa
 */

export interface Department {
  id: number;
  name: string;
  departmentCode: string;
  company: number;
  description: string;
  status: boolean;
  creationDate?: string; // ISO datetime
  updateDate?: string; // ISO datetime
  company_name?: string; // Para listados
}

export interface DepartmentCreate {
  name: string;
  departmentCode: string;
  company: number;
  description: string;
  status?: boolean;
}

export interface DepartmentUpdate extends Partial<DepartmentCreate> {
  id: number;
}
