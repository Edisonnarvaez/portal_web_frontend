import type { Indicator, CreateIndicatorRequest, UpdateIndicatorRequest } from '../entities';

export interface IndicatorRepository {
  getAll(): Promise<Indicator[]>;
  getById(id: number): Promise<Indicator | null>;
  create(indicator: CreateIndicatorRequest): Promise<Indicator>;
  update(indicator: UpdateIndicatorRequest): Promise<Indicator>;
  delete(id: number): Promise<void>;
  toggleStatus(id: number, status: boolean): Promise<Indicator>;
  getProcesses(): Promise<Array<{id: number, name: string}>>;
}