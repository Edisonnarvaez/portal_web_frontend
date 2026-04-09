/**
 * RegionService
 * Servicio centralizado para la gestión de regiones
 * Delega operaciones HTTP al repository
 */

import { RegionRepository } from '../../infrastructure/repositories';
import type { Region, RegionCreate, RegionUpdate } from '../../domain/entities';

export class RegionService {
  private static repository = new RegionRepository();

  /**
   * Obtener todas las regiones
   */
  static async getRegions(): Promise<Region[]> {
    return this.repository.getAllRegions();
  }

  /**
   * Obtener región por ID
   */
  static async getRegion(id: number): Promise<Region> {
    return this.repository.getRegion(id);
  }

  /**
   * Crear nueva región
   */
  static async createRegion(data: RegionCreate): Promise<Region> {
    return this.repository.createRegion(data);
  }

  /**
   * Actualizar región
   */
  static async updateRegion(id: number, data: RegionUpdate): Promise<Region> {
    return this.repository.updateRegion(id, data);
  }

  /**
   * Eliminar región
   */
  static async deleteRegion(id: number): Promise<void> {
    return this.repository.deleteRegion(id);
  }

  /**
   * Validar datos de región
   */
  static validateRegionData(data: Partial<RegionCreate>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name) errors.push('El nombre de la región es requerido');
    if (!data.code) errors.push('El código de la región es requerido');

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
