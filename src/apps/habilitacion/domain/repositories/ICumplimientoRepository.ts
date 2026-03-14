import type {
  Cumplimiento,
  CumplimientoCreate,
  CumplimientoUpdate,
  ServiciosDeAutoevaluacionResponse,
} from '../entities';
import type { CumplimientoFilters } from '../types';

export interface ICumplimientoRepository {
  getAll(filters?: CumplimientoFilters): Promise<Cumplimiento[]>;
  getById(id: number): Promise<Cumplimiento>;
  create(data: CumplimientoCreate): Promise<Cumplimiento>;
  update(id: number, data: CumplimientoUpdate): Promise<Cumplimiento>;
  delete(id: number): Promise<void>;
  getSinCumplir(): Promise<Cumplimiento[]>;
  getConPlanMejora(): Promise<Cumplimiento[]>;
  getMejorasVencidas(): Promise<Cumplimiento[]>;
  getServiciosDeAutoevaluacion(autoevaluacionId: number): Promise<ServiciosDeAutoevaluacionResponse>;
}
