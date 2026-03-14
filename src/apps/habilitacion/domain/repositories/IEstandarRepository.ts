import type { Estandar, EstandarCreate, EstandarDetail, EstandarUpdate } from '../entities';
import type { Criterio } from '../entities/Criterio';
import type { EstandarFilters } from '../types';

export interface IEstandarRepository {
  getAll(filters?: EstandarFilters): Promise<Estandar[]>;
  getById(id: number): Promise<EstandarDetail>;
  getAllWithCriterios(): Promise<Estandar[]>;
  getCriteriosByEstandar(estandarId: number): Promise<Criterio[]>;
  create(data: EstandarCreate): Promise<Estandar>;
  update(id: number, data: EstandarUpdate): Promise<Estandar>;
  delete(id: number): Promise<void>;
}
