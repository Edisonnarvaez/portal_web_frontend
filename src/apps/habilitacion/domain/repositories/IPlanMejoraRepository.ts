import type { PlanMejora, PlanMejoraDetail, PlanMejoraCreate, PlanMejoraUpdate, PlanMejoraResumen, PlanMejoraPorOrigen, SoportePlan } from '../entities';

export interface IPlanMejoraRepository {
  getAll(filters?: Record<string, any>): Promise<PlanMejora[]>;
  getById(id: number): Promise<PlanMejoraDetail>;
  getByAutoevaluacion(autoevaluacionId: number): Promise<PlanMejora[]>;
  create(data: PlanMejoraCreate): Promise<PlanMejora>;
  update(id: number, data: PlanMejoraUpdate): Promise<PlanMejora>;
  delete(id: number): Promise<void>;
  getVencidos(): Promise<PlanMejora[]>;
  getResumen(filters?: Record<string, any>): Promise<PlanMejoraResumen>;
  getProximosAVencer(dias?: number): Promise<PlanMejora[]>;
  getPorOrigen(): Promise<PlanMejoraPorOrigen[]>;
  // Soportes
  getSoportes(planId: number): Promise<SoportePlan[]>;
  uploadSoporte(planId: number, formData: FormData): Promise<SoportePlan>;
  deleteSoporte(planId: number, soporteId: number): Promise<void>;
}
