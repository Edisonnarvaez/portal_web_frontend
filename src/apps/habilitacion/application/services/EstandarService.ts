import type { Estandar, EstandarDetail } from '../../domain/entities/Estandar';
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
      console.error('Error fetching estandares:', error);
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
      console.error('Error fetching full estandares:', error);
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
      console.error(`Error fetching estandar ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get criterios for a specific standard
   * GET /api/normativity/estandares/{id}/criterios/
   */
  async getCriteriosByEstandar(estandarId: number): Promise<any[]> {
    try {
      return await this.repository.getCriteriosByEstandar(estandarId);
    } catch (error) {
      console.error(`Error fetching criterios for estandar ${estandarId}:`, error);
      throw error;
    }
  }
}
