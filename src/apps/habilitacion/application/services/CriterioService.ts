import type {
  Criterio,
  CriterioCreate,
  CriterioUpdate,
  CriterioEvaluacion,
  CriterioEvaluacionCreate,
  CriterioEvaluacionUpdate,
} from '../../domain/entities';
import type { CriterioFilters } from '../../domain/types';
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

  async getCriterios(filters?: CriterioFilters): Promise<Criterio[]> {
    return this.repository.getAll(filters);
  }

  async getCriterio(id: number): Promise<Criterio> {
    return this.repository.getById(id);
  }

  /**
   * Get criterios by complexity level (BAJA, MEDIA, ALTA)
   */
  async getCriteriosPorComplejidad(complejidad: 'BAJA' | 'MEDIA' | 'ALTA'): Promise<Criterio[]> {
    return this.repository.getAll({ complejidad });
  }

  /**
   * Get only mandatory criterios
   */
  async getCriteriosMandatorios(): Promise<Criterio[]> {
    return this.repository.getAll({ es_mandatorio: true });
  }

  /**
   * Get criterios that require document evidence
   */
  async getCriteriosConEvidencia(): Promise<Criterio[]> {
    return this.repository.getAll({ requiere_evidencia_documental: true });
  }

  /**
   * Get criterios by standard (estandar)
   */
  async getCriteriosPorEstandar(estandarId: number): Promise<Criterio[]> {
    return this.repository.getAll({ estandar: estandarId });
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

  async createEvaluacion(data: CriterioEvaluacionCreate): Promise<CriterioEvaluacion> {
    return this.evaluacionRepository.create(data);
  }

  async updateEvaluacion(id: number, data: CriterioEvaluacionUpdate): Promise<CriterioEvaluacion> {
    return this.evaluacionRepository.update(id, data);
  }

  async calcularPorcentajeCumplimiento(evaluaciones: CriterioEvaluacion[]): Promise<number> {
    if (evaluaciones.length === 0) return 0;
    
    const cumplidas = evaluaciones.filter(e => e.estado_cumplimiento === 'CUMPLE').length;
    return Math.round((cumplidas / evaluaciones.length) * 100);
  }
}

