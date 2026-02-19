import type { Criterio, CriterioCreate, CriterioUpdate, CriterioEvaluacion } from '../../domain/entities';
import { CriterioRepository, CriterioEvaluacionRepository } from '../../infrastructure/repositories';

export class CriterioService {
  private repository: CriterioRepository;
  private evaluacionRepository: CriterioEvaluacionRepository;

  constructor(
    repository?: CriterioRepository,
    evaluacionRepository?: CriterioEvaluacionRepository
  ) {
    this.repository = repository || new CriterioRepository();
    this.evaluacionRepository = evaluacionRepository || new CriterioEvaluacionRepository();
  }

  async getCriterios(filters?: Record<string, any>): Promise<Criterio[]> {
    return this.repository.getAll(filters);
  }

  async getCriterio(id: number): Promise<Criterio> {
    return this.repository.getById(id);
  }

  async createCriterio(data: CriterioCreate): Promise<Criterio> {
    return this.repository.create(data);
  }

  async updateCriterio(id: number, data: CriterioUpdate): Promise<Criterio> {
    return this.repository.update(id, data);
  }

  async deleteCriterio(id: number): Promise<void> {
    return this.repository.delete(id);
  }

  async getCriteriosByCategoria(categoria: string): Promise<Criterio[]> {
    return this.repository.getByCategoria(categoria);
  }

  async getEvaluacionesByCriterio(autoevaluacionId: number): Promise<CriterioEvaluacion[]> {
    return this.evaluacionRepository.getByAutoevaluacion(autoevaluacionId);
  }

  async createEvaluacion(data: any): Promise<CriterioEvaluacion> {
    return this.evaluacionRepository.create(data);
  }

  async updateEvaluacion(id: number, data: any): Promise<CriterioEvaluacion> {
    return this.evaluacionRepository.update(id, data);
  }

  async calcularPorcentajeCumplimiento(evaluaciones: CriterioEvaluacion[]): Promise<number> {
    if (evaluaciones.length === 0) return 0;
    
    const cumplidas = evaluaciones.filter(e => e.estado_cumplimiento === 'CUMPLE').length;
    return Math.round((cumplidas / evaluaciones.length) * 100);
  }
}
