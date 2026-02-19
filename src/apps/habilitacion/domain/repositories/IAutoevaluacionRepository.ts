import type { Autoevaluacion, AutoevaluacionCreate, AutoevaluacionUpdate, AutoevaluacionResumen } from '../entities';

export interface IAutoevaluacionRepository {
  getAll(filters?: Record<string, any>): Promise<Autoevaluacion[]>;
  getById(id: number): Promise<Autoevaluacion>;
  create(data: AutoevaluacionCreate): Promise<Autoevaluacion>;
  update(id: number, data: AutoevaluacionUpdate): Promise<Autoevaluacion>;
  delete(id: number): Promise<void>;
  getResumen(id: number): Promise<AutoevaluacionResumen>;
  validar(id: number): Promise<Autoevaluacion>;
  duplicar(id: number): Promise<Autoevaluacion>;
  getPorCompletar(): Promise<Autoevaluacion[]>;
}
