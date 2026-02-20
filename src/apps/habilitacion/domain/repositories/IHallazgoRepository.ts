import type { Hallazgo, HallazgoDetail, HallazgoCreate, HallazgoUpdate, EstadisticasHallazgos, HallazgoPorOrigen } from '../entities';

export interface IHallazgoRepository {
  getAll(filters?: Record<string, any>): Promise<Hallazgo[]>;
  getById(id: number): Promise<HallazgoDetail>;
  getByAutoevaluacion(autoevaluacionId: number): Promise<Hallazgo[]>;
  create(data: HallazgoCreate): Promise<Hallazgo>;
  update(id: number, data: HallazgoUpdate): Promise<Hallazgo>;
  delete(id: number): Promise<void>;
  getEstadisticas(filters?: Record<string, any>): Promise<EstadisticasHallazgos>;
  getAbiertos(): Promise<Hallazgo[]>;
  getCriticos(): Promise<Hallazgo[]>;
  getPorOrigen(): Promise<HallazgoPorOrigen[]>;
  getSinPlan(): Promise<Hallazgo[]>;
}
