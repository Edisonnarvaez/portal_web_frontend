import type { ServicioSede, ServicioSedeCreate, ServicioSedeUpdate } from '../entities';
import type { Cumplimiento } from '../entities/Cumplimiento';

/**
 * IServicioSedeRepository
 * Define el contrato para operaciones de datos de ServicioSede
 * Implementado por: ServicioSedeRepository
 */
export interface IServicioSedeRepository {
  /**
   * Obtener todos los servicios con filtros opcionales
   * Soporta filtros: prestador, modalidad, complejidad, estado_habilitacion
   */
  getAll(filters?: Record<string, any>): Promise<ServicioSede[]>;

  /**
   * Obtener un servicio específico por ID
   */
  getById(id: number): Promise<ServicioSede>;

  /**
   * Crear un nuevo servicio
   */
  create(data: ServicioSedeCreate): Promise<ServicioSede>;

  /**
   * Actualizar un servicio existente
   */
  update(id: number, data: ServicioSedeUpdate): Promise<ServicioSede>;

  /**
   * Eliminar un servicio
   */
  delete(id: number): Promise<void>;

  /**
   * Obtener servicios de un prestador específico
   */
  getByPrestador(prestadorId: number): Promise<ServicioSede[]>;

  /**
   * Obtener servicios de una sede (legado - usar getByPrestador)
   * @deprecated Usar getByPrestador() en su lugar
   */
  getByHeadquarters(headquartersId: number): Promise<ServicioSede[]>;

  /**
   * Obtener servicios próximos a vencer
   */
  getProximosAVencer(dias?: number): Promise<ServicioSede[]>;

  /**
   * Obtener cumplimientos de un servicio
   */
  getCumplimientos(id: number): Promise<Cumplimiento[]>;

  /**
   * Obtener servicios por nivel de complejidad
   */
  getPorComplejidad(complejidad: string): Promise<ServicioSede[]>;
}
