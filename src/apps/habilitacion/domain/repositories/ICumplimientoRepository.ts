import type { Cumplimiento, CumplimientoCreate, CumplimientoUpdate } from '../entities';

export interface ICumplimientoRepository {
  getAll(filters?: Record<string, any>): Promise<Cumplimiento[]>;
  getById(id: number): Promise<Cumplimiento>;
  create(data: CumplimientoCreate): Promise<Cumplimiento>;
  update(id: number, data: CumplimientoUpdate): Promise<Cumplimiento>;
  delete(id: number): Promise<void>;
  getSinCumplir(): Promise<Cumplimiento[]>;
  getConPlanMejora(): Promise<Cumplimiento[]>;
  getMejorasVencidas(): Promise<Cumplimiento[]>;
}
