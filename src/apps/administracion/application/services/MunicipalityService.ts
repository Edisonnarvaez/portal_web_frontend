/**
 * MunicipalityService
 * Servicio centralizado para la gestión de municipios
 * Delega operaciones HTTP al repository
 */

import { MunicipalityRepository } from '../../infrastructure/repositories';
import type { Municipality, MunicipalityCreate, MunicipalityUpdate } from '../../domain/entities';

export class MunicipalityService {
  private static repository = new MunicipalityRepository();

  /**
   * Obtener todos los municipios
   */
  static async getMunicipalities(): Promise<Municipality[]> {
    return this.repository.getAllMunicipalities();
  }

  /**
   * Obtener municipio por ID
   */
  static async getMunicipality(id: number): Promise<Municipality> {
    return this.repository.getMunicipality(id);
  }

  /**
   * Obtener municipios de una región
   */
  static async getMunicipalitiesByRegion(regionId: number): Promise<Municipality[]> {
    return this.repository.getMunicipalitiesByRegion(regionId);
  }

  /**
   * Crear nuevo municipio
   */
  static async createMunicipality(data: MunicipalityCreate): Promise<Municipality> {
    return this.repository.createMunicipality(data);
  }

  /**
   * Actualizar municipio
   */
  static async updateMunicipality(id: number, data: MunicipalityUpdate): Promise<Municipality> {
    return this.repository.updateMunicipality(id, data);
  }

  /**
   * Eliminar municipio
   */
  static async deleteMunicipality(id: number): Promise<void> {
    return this.repository.deleteMunicipality(id);
  }

  /**
   * Validar datos de municipio
   */
  static validateMunicipalityData(data: Partial<MunicipalityCreate>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name) errors.push('El nombre del municipio es requerido');
    if (!data.code) errors.push('El código del municipio es requerido');
    if (!data.region && data.region !== 0) errors.push('La región es requerida');

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
