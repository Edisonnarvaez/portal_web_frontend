import type { Hallazgo, HallazgoCreate, HallazgoUpdate, EstadisticasHallazgos } from '../entities';

export interface IHallazgoRepository {
  getAll(filters?: Record<string, any>): Promise<Hallazgo[]>;
  getById(id: number): Promise<Hallazgo>;
  getByAutoevaluacion(autoevaluacionId: number): Promise<Hallazgo[]>;
  create(data: HallazgoCreate): Promise<Hallazgo>;
  update(id: number, data: HallazgoUpdate): Promise<Hallazgo>;
  delete(id: number): Promise<void>;
  getEstadisticas(autoevaluacionId: number): Promise<EstadisticasHallazgos>;
  getAbiertos(): Promise<Hallazgo[]>;
  getCriticos(): Promise<Hallazgo[]>;
}
