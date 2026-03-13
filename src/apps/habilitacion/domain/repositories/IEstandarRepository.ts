import type { Estandar, EstandarDetail } from '../entities';

export interface IEstandarRepository {
  getAll(filters?: Record<string, any>): Promise<Estandar[]>;
  getById(id: number): Promise<EstandarDetail>;
  getAllWithCriterios(): Promise<Estandar[]>;
  getCriteriosByEstandar(estandarId: number): Promise<any[]>;
}
