import type { DatosPrestador, DatosPrestadorCreate, DatosPrestadorUpdate } from '../entities';
import type { ServicioSede } from '../entities/ServicioSede';
import type { Autoevaluacion } from '../entities/Autoevaluacion';

export interface IDatosPrestadorRepository {
  getAll(filters?: Record<string, any>): Promise<DatosPrestador[]>;
  getById(id: number): Promise<DatosPrestador>;
  create(data: DatosPrestadorCreate): Promise<DatosPrestador>;
  update(id: number, data: DatosPrestadorUpdate): Promise<DatosPrestador>;
  delete(id: number): Promise<void>;
  getProximosAVencer(dias?: number): Promise<DatosPrestador[]>;
  getVencidos(): Promise<DatosPrestador[]>;
  iniciarRenovacion(id: number): Promise<DatosPrestador>;
  getServicios(id: number): Promise<ServicioSede[]>;
  getAutoevaluaciones(id: number): Promise<Autoevaluacion[]>;
}
