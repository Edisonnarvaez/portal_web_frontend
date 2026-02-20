import type { ServicioSede, ServicioSedeCreate, ServicioSedeUpdate } from '../../domain/entities';
import type { Cumplimiento } from '../../domain/entities/Cumplimiento';
import { ServicioSedeRepository } from '../../infrastructure/repositories';

export class ServicioSedeService {
  private repository: ServicioSedeRepository;

  constructor(repository: ServicioSedeRepository) {
    this.repository = repository;
  }

  async getServicios(filters?: Record<string, any>): Promise<ServicioSede[]> {
    return this.repository.getAll(filters);
  }

  async getServicio(id: number): Promise<ServicioSede> {
    return this.repository.getById(id);
  }

  async createServicio(data: ServicioSedeCreate): Promise<ServicioSede> {
    return this.repository.create(data);
  }

  async updateServicio(id: number, data: ServicioSedeUpdate): Promise<ServicioSede> {
    return this.repository.update(id, data);
  }

  async deleteServicio(id: number): Promise<void> {
    return this.repository.delete(id);
  }

  async getServiciosByHeadquarters(headquartersId: number): Promise<ServicioSede[]> {
    return this.repository.getByHeadquarters(headquartersId);
  }

  async getProximosAVencer(dias?: number): Promise<ServicioSede[]> {
    return this.repository.getProximosAVencer(dias);
  }

  async getCumplimientos(id: number): Promise<Cumplimiento[]> {
    return this.repository.getCumplimientos(id);
  }

  async getPorComplejidad(complejidad: string): Promise<ServicioSede[]> {
    return this.repository.getPorComplejidad(complejidad);
  }

  // Métodos auxiliares
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

  getComplejidadColor(complejidad: string): string {
    const colores: Record<string, string> = {
      'BAJA': 'bg-green-100 text-green-800',
      'MEDIA': 'bg-yellow-100 text-yellow-800',
      'ALTA': 'bg-red-100 text-red-800',
    };
    return colores[complejidad] || 'bg-gray-100 text-gray-800';
  }
}
