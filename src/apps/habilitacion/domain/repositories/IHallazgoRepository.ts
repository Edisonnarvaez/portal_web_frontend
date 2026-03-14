import type { Hallazgo, HallazgoDetail, HallazgoCreate, HallazgoUpdate, EstadisticasHallazgos, HallazgoPorOrigen } from '../entities';
import type { HallazgoFilters } from '../types';

export interface IHallazgoRepository {
  getAll(filters?: HallazgoFilters): Promise<Hallazgo[]>;
  getById(id: number): Promise<HallazgoDetail>;
  getByAutoevaluacion(autoevaluacionId: number): Promise<Hallazgo[]>;
  create(data: HallazgoCreate): Promise<Hallazgo>;
  update(id: number, data: HallazgoUpdate): Promise<Hallazgo>;
  delete(id: number): Promise<void>;
  getEstadisticas(filters?: HallazgoFilters): Promise<EstadisticasHallazgos>;
  getAbiertos(): Promise<Hallazgo[]>;
  getCriticos(): Promise<Hallazgo[]>;
  getPorOrigen(): Promise<HallazgoPorOrigen[]>;
  getSinPlan(): Promise<Hallazgo[]>;
}
