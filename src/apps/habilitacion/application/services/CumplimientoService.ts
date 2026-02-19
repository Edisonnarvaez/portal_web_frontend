import type { Cumplimiento, CumplimientoCreate, CumplimientoUpdate } from '../../domain/entities';
import { CumplimientoRepository } from '../../infrastructure/repositories';

export class CumplimientoService {
  private repository: CumplimientoRepository;

  constructor(repository: CumplimientoRepository) {
    this.repository = repository;
  }

  async getCumplimientos(filters?: Record<string, any>): Promise<Cumplimiento[]> {
    return this.repository.getAll(filters);
  }

  async getCumplimiento(id: number): Promise<Cumplimiento> {
    return this.repository.getById(id);
  }

  async createCumplimiento(data: CumplimientoCreate): Promise<Cumplimiento> {
    return this.repository.create(data);
  }

  async updateCumplimiento(id: number, data: CumplimientoUpdate): Promise<Cumplimiento> {
    return this.repository.update(id, data);
  }

  async deleteCumplimiento(id: number): Promise<void> {
    return this.repository.delete(id);
  }

  async getCumplimientosSinCumplir(): Promise<Cumplimiento[]> {
    return this.repository.getSinCumplir();
  }

  async getCumplimientosConPlanMejora(): Promise<Cumplimiento[]> {
    return this.repository.getConPlanMejora();
  }

  async getMejorasVencidas(): Promise<Cumplimiento[]> {
    return this.repository.getMejorasVencidas();
  }

  // Métodos auxiliares
  diasParaVencimiento(fechaCompromiso?: string): number | null {
    if (!fechaCompromiso) return null;
    const fechaCompromisoDate = new Date(fechaCompromiso);
    const hoy = new Date();
    const diferencia = fechaCompromisoDate.getTime() - hoy.getTime();
    return Math.ceil(diferencia / (1000 * 3600 * 24));
  }

  estaMejoraPendiente(cumplimiento: Cumplimiento): boolean {
    return !!cumplimiento.plan_mejora && cumplimiento.cumple !== 'CUMPLE';
  }

  estaMejoraVencida(cumplimiento: Cumplimiento): boolean {
    if (!this.estaMejoraPendiente(cumplimiento)) return false;
    const diasFaltantes = this.diasParaVencimiento(cumplimiento.fecha_compromiso);
    return diasFaltantes !== null && diasFaltantes < 0;
  }

  getCumplimientoColor(cumple: string): string {
    const colores: Record<string, string> = {
      'CUMPLE': 'bg-green-100 text-green-800',
      'NO_CUMPLE': 'bg-red-100 text-red-800',
      'PARCIALMENTE': 'bg-yellow-100 text-yellow-800',
      'NO_APLICA': 'bg-gray-100 text-gray-800',
    };
    return colores[cumple] || 'bg-gray-100 text-gray-800';
  }
}
