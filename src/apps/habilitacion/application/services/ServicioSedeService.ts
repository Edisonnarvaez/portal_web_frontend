import type { ServicioSede, ServicioSedeCreate, ServicioSedeUpdate } from '../../domain/entities';
import type { Cumplimiento } from '../../domain/entities/Cumplimiento';
import { ServicioSedeRepository } from '../../infrastructure/repositories';

/**
 * ServicioSedeService
 * Implementa la lógica de negocio para la gestión de servicios de salud.
 * 
 * Responsabilidades:
 * - Validar datos de entrada
 * - Aplicar reglas de negocio
 * - Delegar operaciones CRUD al repositorio
 * - Proporcionar métodos auxiliares (cálculos, transformaciones)
 */
export class ServicioSedeService {
  private repository: ServicioSedeRepository;

  constructor(repository: ServicioSedeRepository) {
    this.repository = repository;
  }

  // ========== CRUD Operations ==========

  /**
   * Obtener todos los servicios de salud con filtros opcionales
   * Filtros soportados:
   * - prestador: ID del prestador
   * - modalidad: INTRAMURAL, AMBULATORIA, TELEMEDICINA, URGENCIAS, AMBULANCIA
   * - complejidad: BAJA, MEDIA, ALTA
   * - estado_habilitacion: HABILITADO, EN_PROCESO, SUSPENDIDO, NO_HABILITADO, CANCELADO
   */
  async getServicios(filters?: Record<string, any>): Promise<ServicioSede[]> {
    return this.repository.getAll(filters);
  }

  /**
   * Obtener un servicio específico por su ID
   */
  async getServicio(id: number): Promise<ServicioSede> {
    return this.repository.getById(id);
  }

  /**
   * Crear un nuevo servicio de salud
   * El campo prestador_id es requerido para vincular el servicio a un prestador
   */
  async createServicio(data: ServicioSedeCreate): Promise<ServicioSede> {
    return this.repository.create(data);
  }

  /**
   * Actualizar un servicio existente
   */
  async updateServicio(id: number, data: ServicioSedeUpdate): Promise<ServicioSede> {
    return this.repository.update(id, data);
  }

  /**
   * Eliminar un servicio existente
   */
  async deleteServicio(id: number): Promise<void> {
    return this.repository.delete(id);
  }

  // ========== Specialized Queries ==========

  /**
   * Obtener todos los servicios de un prestador específico
   * @param prestadorId ID del prestador (DatosPrestador)
   */
  async getServiciosByPrestador(prestadorId: number): Promise<ServicioSede[]> {
    return this.repository.getByPrestador(prestadorId);
  }

  /**
   * Método legado para compatibilidad con código anterior
   * @deprecated Usar getServiciosByPrestador() en su lugar
   */
  async getServiciosByHeadquarters(headquartersId: number): Promise<ServicioSede[]> {
    return this.repository.getByHeadquarters(headquartersId);
  }

  /**
   * Obtener servicios próximos a vencer (próximos 90 días)
   */
  async getProximosAVencer(dias?: number): Promise<ServicioSede[]> {
    return this.repository.getProximosAVencer(dias);
  }

  /**
   * Obtener cumplimientos evaluados de un servicio
   */
  async getCumplimientos(id: number): Promise<Cumplimiento[]> {
    return this.repository.getCumplimientos(id);
  }

  /**
   * Obtener servicios filtrados por nivel de complejidad
   * @param complejidad BAJA, MEDIA o ALTA
   */
  async getPorComplejidad(complejidad: string): Promise<ServicioSede[]> {
    return this.repository.getPorComplejidad(complejidad);
  }

  // ========== Utility Methods ==========

  /**
   * Calcular días para vencimiento de un servicio
   * @returns Número de días (negativo si está vencido) o null si no tiene fecha
   */
  diasParaVencimiento(fechaVencimiento?: string): number | null {
    if (!fechaVencimiento) return null;
    
    const fechaVencimientoDate = new Date(fechaVencimiento);
    const hoy = new Date();
    
    // Ajustar horas para comparación de solo fechas
    hoy.setHours(0, 0, 0, 0);
    fechaVencimientoDate.setHours(0, 0, 0, 0);
    
    const diferencia = fechaVencimientoDate.getTime() - hoy.getTime();
    return Math.ceil(diferencia / (1000 * 3600 * 24));
  }

  /**
   * Verificar si un servicio está próximo a vencer
   * @param fechaVencimiento Fecha de vencimiento (ISO format)
   * @param dias Rango de días para considerar "próximo a vencer" (default: 90)
   */
  estaProximoAVencer(fechaVencimiento?: string, dias: number = 90): boolean {
    const diasFaltantes = this.diasParaVencimiento(fechaVencimiento);
    if (diasFaltantes === null) return false;
    return diasFaltantes >= 0 && diasFaltantes <= dias;
  }

  /**
   * Verificar si un servicio está vencido
   */
  estaVencido(fechaVencimiento?: string): boolean {
    const diasFaltantes = this.diasParaVencimiento(fechaVencimiento);
    if (diasFaltantes === null) return false;
    return diasFaltantes < 0;
  }

  /**
   * Obtener clase CSS de color para el nivel de complejidad
   */
  getComplejidadColor(complejidad: string): string {
    const colores: Record<string, string> = {
      'BAJA': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'MEDIA': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'ALTA': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return colores[complejidad] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }

  /**
   * Obtener clase CSS de color para el estado de habilitación
   */
  getEstadoHabilitacionColor(estado: string): string {
    const colores: Record<string, string> = {
      'HABILITADO': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'EN_PROCESO': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'SUSPENDIDO': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'NO_HABILITADO': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'CANCELADO': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    };
    return colores[estado] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }

  /**
   * Obtener clase CSS de color para la modalidad
   */
  getModalidadColor(modalidad: string): string {
    const colores: Record<string, string> = {
      'INTRAMURAL': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'AMBULATORIA': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'TELEMEDICINA': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      'URGENCIAS': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'AMBULANCIA': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    };
    return colores[modalidad] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }

  /**
   * Validar si los datos de un servicio son válidos para crear/actualizar
   */
  validarDatos(data: ServicioSedeCreate | ServicioSedeUpdate): { valido: boolean; errores: string[] } {
    const errores: string[] = [];

    if (!data.prestador_id && !('id' in data)) {
      errores.push('El campo prestador_id es requerido');
    }

    if (!data.codigo_servicio?.trim()) {
      errores.push('El código del servicio es requerido');
    }

    if (!data.nombre_servicio?.trim()) {
      errores.push('El nombre del servicio es requerido');
    }

    if (data.modalidad && !['INTRAMURAL', 'AMBULATORIA', 'TELEMEDICINA', 'URGENCIAS', 'AMBULANCIA'].includes(data.modalidad)) {
      errores.push('Modalidad inválida');
    }

    if (data.complejidad && !['BAJA', 'MEDIA', 'ALTA'].includes(data.complejidad)) {
      errores.push('Complejidad inválida');
    }

    if (data.estado_habilitacion && !['HABILITADO', 'EN_PROCESO', 'SUSPENDIDO', 'NO_HABILITADO', 'CANCELADO'].includes(data.estado_habilitacion)) {
      errores.push('Estado de habilitación inválido');
    }

    return {
      valido: errores.length === 0,
      errores
    };
  }
}
