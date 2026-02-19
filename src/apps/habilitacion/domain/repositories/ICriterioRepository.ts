import type { Criterio, CriterioCreate, CriterioUpdate, CriterioEvaluacion } from '../entities';

export interface ICriterioRepository {
  getAll(filters?: Record<string, any>): Promise<Criterio[]>;
  getById(id: number): Promise<Criterio>;
  create(data: CriterioCreate): Promise<Criterio>;
  update(id: number, data: CriterioUpdate): Promise<Criterio>;
  delete(id: number): Promise<void>;
  getByCategoria(categoria: string): Promise<Criterio[]>;
}

export interface ICriterioEvaluacionRepository {
  getAll(filters?: Record<string, any>): Promise<CriterioEvaluacion[]>;
  getByAutoevaluacion(autoevaluacionId: number): Promise<CriterioEvaluacion[]>;
  create(data: any): Promise<CriterioEvaluacion>;
  update(id: number, data: any): Promise<CriterioEvaluacion>;
  delete(id: number): Promise<void>;
}
