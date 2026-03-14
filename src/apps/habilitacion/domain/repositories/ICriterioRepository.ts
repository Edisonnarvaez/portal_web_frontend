import type {
  Criterio,
  CriterioCreate,
  CriterioUpdate,
  CriterioEvaluacion,
  CriterioEvaluacionCreate,
  CriterioEvaluacionUpdate,
} from '../entities';
import type { CriterioEvaluacionFilters, CriterioFilters } from '../types';

export interface ICriterioRepository {
  getAll(filters?: CriterioFilters): Promise<Criterio[]>;
  getById(id: number): Promise<Criterio>;
  create(data: CriterioCreate): Promise<Criterio>;
  update(id: number, data: CriterioUpdate): Promise<Criterio>;
  delete(id: number): Promise<void>;
  getByCategoria(categoria: string): Promise<Criterio[]>;
}

export interface ICriterioEvaluacionRepository {
  getAll(filters?: CriterioEvaluacionFilters): Promise<CriterioEvaluacion[]>;
  getByAutoevaluacion(autoevaluacionId: number): Promise<CriterioEvaluacion[]>;
  create(data: CriterioEvaluacionCreate): Promise<CriterioEvaluacion>;
  update(id: number, data: CriterioEvaluacionUpdate): Promise<CriterioEvaluacion>;
  delete(id: number): Promise<void>;
}
