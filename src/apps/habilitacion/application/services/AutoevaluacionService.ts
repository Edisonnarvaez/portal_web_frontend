import type { Autoevaluacion, AutoevaluacionCreate, AutoevaluacionUpdate, AutoevaluacionResumen } from '../../domain/entities';
import { AutoevaluacionRepository } from '../../infrastructure/repositories';

export class AutoevaluacionService {
  private repository: AutoevaluacionRepository;

  constructor(repository: AutoevaluacionRepository) {
    this.repository = repository;
  }

  async getAutoevaluaciones(filters?: Record<string, any>): Promise<Autoevaluacion[]> {
    return this.repository.getAll(filters);
  }

  async getAutoevaluacion(id: number): Promise<Autoevaluacion> {
    return this.repository.getById(id);
  }

  async createAutoevaluacion(data: AutoevaluacionCreate): Promise<Autoevaluacion> {
    return this.repository.create(data);
  }

  async updateAutoevaluacion(id: number, data: AutoevaluacionUpdate): Promise<Autoevaluacion> {
    return this.repository.update(id, data);
  }

  async deleteAutoevaluacion(id: number): Promise<void> {
    return this.repository.delete(id);
  }

  async getResumen(id: number): Promise<AutoevaluacionResumen> {
    return this.repository.getResumen(id);
  }

  async validarAutoevaluacion(id: number): Promise<Autoevaluacion> {
    return this.repository.validar(id);
  }

  async duplicarAutoevaluacion(id: number): Promise<Autoevaluacion> {
    return this.repository.duplicar(id);
  }

  async getAutoevaluacionesPorCompletar(): Promise<Autoevaluacion[]> {
    return this.repository.getPorCompletar();
  }

  // Métodos auxiliares
  diasParaVencimiento(fechaVencimiento?: string): number | null {
    if (!fechaVencimiento) return null;
    const fechaVencimientoDate = new Date(fechaVencimiento);
    const hoy = new Date();
    const diferencia = fechaVencimientoDate.getTime() - hoy.getTime();
    return Math.ceil(diferencia / (1000 * 3600 * 24));
  }

  estaVigente(fechaVencimiento?: string): boolean {
    const diasFaltantes = this.diasParaVencimiento(fechaVencimiento);
    if (diasFaltantes === null) return false;
    return diasFaltantes >= 0;
  }

  porcentajeResumen(resumen: AutoevaluacionResumen): number {
    if (resumen.total_criterios === 0) return 0;
    return Math.round((resumen.cumplidos / resumen.total_criterios) * 100);
  }

  getEstadoColor(estado: string): string {
    const colores: Record<string, string> = {
      'BORRADOR': 'bg-gray-100 text-gray-800',
      'EN_CURSO': 'bg-blue-100 text-blue-800',
      'COMPLETADA': 'bg-yellow-100 text-yellow-800',
      'REVISADA': 'bg-indigo-100 text-indigo-800',
      'VALIDADA': 'bg-green-100 text-green-800',
    };
    return colores[estado] || 'bg-gray-100 text-gray-800';
  }
}
