/**
 * ProcessService
 * Servicio centralizado para la gestión de procesos
 * Delega operaciones HTTP al repository
 */

import { ProcessRepository } from '../../infrastructure/repositories';
import type { Process, ProcessCreate, ProcessUpdate } from '../../domain/entities';

export class ProcessService {
  private static repository = new ProcessRepository();

  /**
   * Obtener todos los procesos
   */
  static async getProcesses(): Promise<Process[]> {
    return this.repository.getAllProcesses();
  }

  /**
   * Obtener proceso por ID
   */
  static async getProcess(id: number): Promise<Process> {
    return this.repository.getProcess(id);
  }

  /**
   * Obtener procesos de una empresa
   */
  static async getProcessesByCompany(companyId: number): Promise<Process[]> {
    return this.repository.getProcessesByCompany(companyId);
  }

  /**
   * Obtener procesos de un tipo específico
   */
  static async getProcessesByType(processTypeId: number): Promise<Process[]> {
    return this.repository.getProcessesByProcessType(processTypeId);
  }

  /**
   * Crear nuevo proceso
   */
  static async createProcess(data: ProcessCreate): Promise<Process> {
    const validation = this.validateProcessData(data);
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }
    return this.repository.createProcess(data);
  }

  /**
   * Actualizar proceso existente
   */
  static async updateProcess(id: number, data: ProcessUpdate): Promise<Process> {
    const validation = this.validateProcessData(data);
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }
    return this.repository.updateProcess(id, data);
  }

  /**
   * Eliminar proceso
   */
  static async deleteProcess(id: number): Promise<void> {
    return this.repository.deleteProcess(id);
  }

  /**
   * Cambiar estado del proceso
   */
  static async toggleProcessStatus(id: number, status: boolean): Promise<Process> {
    return this.repository.toggleProcessStatus(id, status);
  }

  /**
   * Validar datos de proceso
   */
  static validateProcessData(data: Partial<ProcessCreate>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name) errors.push('El nombre del proceso es requerido');
    if (!data.description) errors.push('La descripción es requerida');
    if (!data.code) errors.push('El código del proceso es requerido');
    if (!data.version) errors.push('La versión del proceso es requerida');
    if (!data.processType && data.processType !== 0) errors.push('El tipo de proceso es requerido');
    if (!data.department && data.department !== 0) errors.push('El departamento es requerido');

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
