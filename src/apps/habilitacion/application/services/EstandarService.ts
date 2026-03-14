import type { Estandar, EstandarCreate, EstandarDetail, EstandarUpdate } from '../../domain/entities/Estandar';
import type { Criterio } from '../../domain/entities/Criterio';
import { EstandarRepository } from '../../infrastructure/repositories';

export class EstandarService {
  private repository: EstandarRepository;

  constructor(repository?: EstandarRepository) {
    this.repository = repository || new EstandarRepository();
  }

  /**
   * Get all standards from backend
   * GET /api/normativity/estandares/
   */
  async getAllEstandares(): Promise<Estandar[]> {
    try {
      return await this.repository.getAll();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all standards with all criterios nested
   * GET /api/normativity/estandares/todos/
   */
  async getEstandaresFull(): Promise<Estandar[]> {
    try {
      return await this.repository.getAllWithCriterios();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get a specific standard by ID
   * GET /api/normativity/estandares/{id}/
   */
  async getEstandarById(id: number): Promise<EstandarDetail> {
    try {
      return await this.repository.getById(id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get criterios for a specific standard
   * GET /api/normativity/estandares/{id}/criterios/
   */
  async getCriteriosByEstandar(estandarId: number): Promise<Criterio[]> {
    try {
      return await this.repository.getCriteriosByEstandar(estandarId);
    } catch (error) {
      throw error;
    }
  }

  async createEstandar(data: EstandarCreate): Promise<Estandar> {
    return this.repository.create(data);
  }

  async updateEstandar(id: number, data: EstandarUpdate): Promise<Estandar> {
    return this.repository.update(id, data);
  }

  async deleteEstandar(id: number): Promise<void> {
    return this.repository.delete(id);
  }
}
