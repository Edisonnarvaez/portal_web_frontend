import type { DatosPrestador, DatosPrestadorCreate, DatosPrestadorUpdate } from '../../domain/entities';
import { DatosPrestadorRepository } from '../../infrastructure/repositories';

export class DatosPrestadorService {
  private repository: DatosPrestadorRepository;

  constructor(repository: DatosPrestadorRepository) {
    this.repository = repository;
  }

  async getDatosPrestadores(filters?: Record<string, any>): Promise<DatosPrestador[]> {
    return this.repository.getAll(filters);
  }

  async getDatosPrestador(id: number): Promise<DatosPrestador> {
    return this.repository.getById(id);
  }

  async createDatosPrestador(data: DatosPrestadorCreate): Promise<DatosPrestador> {
    return this.repository.create(data);
  }

  async updateDatosPrestador(id: number, data: DatosPrestadorUpdate): Promise<DatosPrestador> {
    return this.repository.update(id, data);
  }

  async deleteDatosPrestador(id: number): Promise<void> {
    return this.repository.delete(id);
  }

  async getProximosAVencer(dias?: number): Promise<DatosPrestador[]> {
    return this.repository.getProximosAVencer(dias);
  }

  async getVencidos(): Promise<DatosPrestador[]> {
    return this.repository.getVencidos();
  }

  // Métodos auxiliares para la UI
  diasParaVencimiento(fechaVencimiento?: string): number | null {
    if (!fechaVencimiento) return null;
    const fechaVencimientoDate = new Date(fechaVencimiento);
    const hoy = new Date();
    const diferencia = fechaVencimientoDate.getTime() - hoy.getTime();
    return Math.ceil(diferencia / (1000 * 3600 * 24));
  }

  estaProximoAVencer(fechaVencimiento?: string, dias: number = 90): boolean {
    const diasFaltantes = this.diasParaVencimiento(fechaVencimiento);
    if (diasFaltantes === null) return false;
    return diasFaltantes >= 0 && diasFaltantes <= dias;
  }

  estaVencido(fechaVencimiento?: string): boolean {
    const diasFaltantes = this.diasParaVencimiento(fechaVencimiento);
    if (diasFaltantes === null) return false;
    return diasFaltantes < 0;
  }

  getEstadoBadgeColor(estado: string): string {
    const estadoMap: Record<string, string> = {
      'HABILITADA': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'EN_PROCESO': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'SUSPENDIDA': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'NO_HABILITADA': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'CANCELADA': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    };
    return estadoMap[estado] || 'bg-gray-100 text-gray-800';
  }
}
