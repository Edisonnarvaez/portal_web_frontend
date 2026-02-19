import type { ServicioSede, ServicioSedeCreate, ServicioSedeUpdate } from '../entities';

export interface IServicioSedeRepository {
  getAll(filters?: Record<string, any>): Promise<ServicioSede[]>;
  getById(id: number): Promise<ServicioSede>;
  create(data: ServicioSedeCreate): Promise<ServicioSede>;
  update(id: number, data: ServicioSedeUpdate): Promise<ServicioSede>;
  delete(id: number): Promise<void>;
  getByHeadquarters(headquartersId: number): Promise<ServicioSede[]>;
  getProximosAVencer(dias?: number): Promise<ServicioSede[]>;
}
