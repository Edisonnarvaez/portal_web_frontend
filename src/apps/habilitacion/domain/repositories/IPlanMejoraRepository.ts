import type { PlanMejora, PlanMejoraCreate, PlanMejoraUpdate, PlanMejoraResumen } from '../entities';

export interface IPlanMejoraRepository {
  getAll(filters?: Record<string, any>): Promise<PlanMejora[]>;
  getById(id: number): Promise<PlanMejora>;
  getByAutoevaluacion(autoevaluacionId: number): Promise<PlanMejora[]>;
  create(data: PlanMejoraCreate): Promise<PlanMejora>;
  update(id: number, data: PlanMejoraUpdate): Promise<PlanMejora>;
  delete(id: number): Promise<void>;
  getVencidos(): Promise<PlanMejora[]>;
  getResumen(autoevaluacionId: number): Promise<PlanMejoraResumen>;
  getProximosAVencer(dias: number): Promise<PlanMejora[]>;
}
