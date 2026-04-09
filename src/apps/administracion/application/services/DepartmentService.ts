/**
 * DepartmentService
 * Servicio centralizado para la gestión de departamentos/áreas
 * Delega operaciones HTTP al repository
 */

import { DepartmentRepository } from '../../infrastructure/repositories';
import type { Department, DepartmentCreate, DepartmentUpdate } from '../../domain/entities';

export class DepartmentService {
  private static repository = new DepartmentRepository();

  /**
   * Obtener todos los departamentos
   */
  static async getDepartments(): Promise<Department[]> {
    return this.repository.getAllDepartments();
  }

  /**
   * Obtener departamento por ID
   */
  static async getDepartment(id: number): Promise<Department> {
    return this.repository.getDepartment(id);
  }

  /**
   * Obtener departamentos de una empresa
   */
  static async getDepartmentsByCompany(companyId: number): Promise<Department[]> {
    return this.repository.getDepartmentsByCompany(companyId);
  }

  /**
   * Crear nuevo departamento
   */
  static async createDepartment(data: DepartmentCreate): Promise<Department> {
    const validation = this.validateDepartmentData(data);
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }
    return this.repository.createDepartment(data);
  }

  /**
   * Actualizar departamento existente
   */
  static async updateDepartment(id: number, data: DepartmentUpdate): Promise<Department> {
    const validation = this.validateDepartmentData(data);
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }
    return this.repository.updateDepartment(id, data);
  }

  /**
   * Eliminar departamento
   */
  static async deleteDepartment(id: number): Promise<void> {
    return this.repository.deleteDepartment(id);
  }

  /**
   * Cambiar estado del departamento
   */
  static async toggleDepartmentStatus(id: number, status: boolean): Promise<Department> {
    return this.repository.toggleDepartmentStatus(id, status);
  }

  /**
   * Validar datos de departamento
   */
  static validateDepartmentData(data: Partial<DepartmentCreate>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name) errors.push('El nombre del departamento es requerido');
    if (!data.departmentCode) errors.push('El código del departamento es requerido');
    if (!data.company && data.company !== 0) errors.push('La empresa es requerida');
    if (!data.description) errors.push('La descripción es requerida');

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
