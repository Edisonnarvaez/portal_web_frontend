/**
 * ProcessTypeService
 * Servicio centralizado para la gestión de tipos de proceso
 * Delega operaciones HTTP al repository
 */

import { ProcessTypeRepository } from '../../infrastructure/repositories';
import type { ProcessType, ProcessTypeCreate, ProcessTypeUpdate } from '../../domain/entities';

export class ProcessTypeService {
  private static repository = new ProcessTypeRepository();

  /**
   * Obtener todos los tipos de proceso
   */
  static async getProcessTypes(): Promise<ProcessType[]> {
    return this.repository.getAllProcessTypes();
  }

  /**
   * Obtener tipo de proceso por ID
   */
  static async getProcessType(id: number): Promise<ProcessType> {
    return this.repository.getProcessType(id);
  }

  /**
   * Obtener tipos de proceso de una empresa
   */
  static async getProcessTypesByCompany(companyId: number): Promise<ProcessType[]> {
    return this.repository.getProcessTypesByCompany(companyId);
  }

  /**
   * Crear nuevo tipo de proceso
   */
  static async createProcessType(data: ProcessTypeCreate): Promise<ProcessType> {
    const validation = this.validateProcessTypeData(data);
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }
    return this.repository.createProcessType(data);
  }

  /**
   * Actualizar tipo de proceso existente
   */
  static async updateProcessType(id: number, data: ProcessTypeUpdate): Promise<ProcessType> {
    const validation = this.validateProcessTypeData(data);
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }
    return this.repository.updateProcessType(id, data);
  }

  /**
   * Eliminar tipo de proceso
   */
  static async deleteProcessType(id: number): Promise<void> {
    return this.repository.deleteProcessType(id);
  }

  /**
   * Cambiar estado del tipo de proceso
   */
  static async toggleProcessTypeStatus(id: number, status: boolean): Promise<ProcessType> {
    return this.repository.toggleProcessTypeStatus(id, status);
  }

  /**
   * Validar datos de tipo de proceso
   */
  static validateProcessTypeData(data: Partial<ProcessTypeCreate>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name) errors.push('El nombre del tipo de proceso es requerido');
    if (!data.description) errors.push('La descripción es requerida');
    if (!data.company && data.company !== 0) errors.push('La empresa es requerida');

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
