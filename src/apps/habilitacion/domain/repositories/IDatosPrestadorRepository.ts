import type { DatosPrestador, DatosPrestadorCreate, DatosPrestadorUpdate } from '../entities';

export interface IDatosPrestadorRepository {
  getAll(filters?: Record<string, any>): Promise<DatosPrestador[]>;
  getById(id: number): Promise<DatosPrestador>;
  create(data: DatosPrestadorCreate): Promise<DatosPrestador>;
  update(id: number, data: DatosPrestadorUpdate): Promise<DatosPrestador>;
  delete(id: number): Promise<void>;
  getProximosAVencer(dias?: number): Promise<DatosPrestador[]>;
  getVencidos(): Promise<DatosPrestador[]>;
}
