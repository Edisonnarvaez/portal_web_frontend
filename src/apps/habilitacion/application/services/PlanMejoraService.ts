import type { PlanMejora, PlanMejoraCreate, PlanMejoraUpdate, PlanMejoraResumen } from '../../domain/entities';
import { PlanMejoraRepository } from '../../infrastructure/repositories';

export class PlanMejoraService {
  private repository: PlanMejoraRepository;

  constructor(repository?: PlanMejoraRepository) {
    this.repository = repository || new PlanMejoraRepository();
  }

  async getPlanesDeMejora(filters?: Record<string, any>): Promise<PlanMejora[]> {
    return this.repository.getAll(filters);
  }

  async getPlanDeMejora(id: number): Promise<PlanMejora> {
    return this.repository.getById(id);
  }

  async getPorAutoevaluacion(autoevaluacionId: number): Promise<PlanMejora[]> {
    return this.repository.getByAutoevaluacion(autoevaluacionId);
  }

  async createPlanDeMejora(data: PlanMejoraCreate): Promise<PlanMejora> {
    return this.repository.create(data);
  }

  async updatePlanDeMejora(id: number, data: PlanMejoraUpdate): Promise<PlanMejora> {
    return this.repository.update(id, data);
  }

  async deletePlanDeMejora(id: number): Promise<void> {
    return this.repository.delete(id);
  }

  async getVencidos(): Promise<PlanMejora[]> {
    return this.repository.getVencidos();
  }

  async getProximosAVencer(dias: number = 30): Promise<PlanMejora[]> {
    return this.repository.getProximosAVencer(dias);
  }

  async getResumen(autoevaluacionId: number): Promise<PlanMejoraResumen> {
    return this.repository.getResumen(autoevaluacionId);
  }

  diasParaVencimiento(fechaVencimiento: string): number {
    const fechaVencimientoDate = new Date(fechaVencimiento);
    const hoy = new Date();
    const diferencia = fechaVencimientoDate.getTime() - hoy.getTime();
    return Math.ceil(diferencia / (1000 * 3600 * 24));
  }

  estaVencido(fechaVencimiento: string): boolean {
    return this.diasParaVencimiento(fechaVencimiento) < 0;
  }

  estaProximoAVencer(fechaVencimiento: string, dias: number = 30): boolean {
    const diasFaltantes = this.diasParaVencimiento(fechaVencimiento);
    return diasFaltantes >= 0 && diasFaltantes <= dias;
  }

  calcularEstado(fechaVencimiento: string, porcentajeAvance: number): string {
    if (porcentajeAvance === 100) return 'COMPLETADO';
    if (this.estaVencido(fechaVencimiento)) return 'VENCIDO';
    if (porcentajeAvance > 0) return 'EN_CURSO';
    return 'PENDIENTE';
  }
}
