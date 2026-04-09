/**
 * HeadquartersService
 * Servicio centralizado para la gestión de sedes
 * Delega operaciones HTTP al repository
 */

import { HeadquartersRepository } from '../../infrastructure/repositories';
import type { Headquarters, HeadquartersCreate, HeadquartersUpdate } from '../../domain/entities';

export class HeadquartersService {
  private static repository = new HeadquartersRepository();

  /**
   * Obtener todas las sedes
   */
  static async getHeadquarters(): Promise<Headquarters[]> {
    return this.repository.getAllHeadquarters();
  }

  /**
   * Obtener sede por ID
   */
  static async getHeadquarter(id: number): Promise<Headquarters> {
    return this.repository.getHeadquarter(id);
  }

  /**
   * Obtener sedes de una empresa
   */
  static async getHeadquartersByCompany(companyId: number): Promise<Headquarters[]> {
    return this.repository.getHeadquartersByCompany(companyId);
  }

  /**
   * Crear nueva sede
   */
  static async createHeadquarter(data: HeadquartersCreate): Promise<Headquarters> {
    const validation = this.validateHeadquarterData(data);
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }
    return this.repository.createHeadquarter(data);
  }

  /**
   * Actualizar sede existente
   */
  static async updateHeadquarter(id: number, data: HeadquartersUpdate): Promise<Headquarters> {
    const validation = this.validateHeadquarterData(data);
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }
    return this.repository.updateHeadquarter(id, data);
  }

  /**
   * Eliminar sede
   */
  static async deleteHeadquarter(id: number): Promise<void> {
    return this.repository.deleteHeadquarter(id);
  }

  /**
   * Cambiar estado de la sede
   */
  static async toggleHeadquarterStatus(id: number, status: boolean): Promise<Headquarters> {
    return this.repository.toggleHeadquarterStatus(id, status);
  }

  /**
   * Validar datos de sede
   */
  static validateHeadquarterData(data: Partial<HeadquartersCreate>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name) errors.push('El nombre de la sede es requerido');
    if (!data.company && data.company !== 0) errors.push('La empresa es requerida');
    if (!data.region && data.region !== 0) errors.push('El departamento/región es requerido');
    if (!data.municipality && data.municipality !== 0) errors.push('El municipio es requerido');
    if (!data.address) errors.push('La dirección es requerida');

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
