import type { IndicatorRepository } from '../../domain/repositories/IndicatorRepository';
import type { Indicator, CreateIndicatorRequest, UpdateIndicatorRequest } from '../../domain/entities/Indicator';
import { IndicadoresApiService } from '../services/IndicadoresApiService';

export class ApiIndicatorRepository implements IndicatorRepository {
  private apiService: IndicadoresApiService;

  constructor() {
    this.apiService = new IndicadoresApiService();
  }

  async getAll(): Promise<Indicator[]> {
    return await this.apiService.getIndicators();
  }

  async getById(id: number): Promise<Indicator | null> {
    try {
      return await this.apiService.getIndicatorById(id);
    } catch (error) {
      return null;
    }
  }

  async create(indicator: CreateIndicatorRequest): Promise<Indicator> {
    return await this.apiService.createIndicator(indicator);
  }

  async update(indicator: UpdateIndicatorRequest): Promise<Indicator> {
    return await this.apiService.updateIndicator(indicator);
  }

  async delete(id: number): Promise<void> {
    await this.apiService.deleteIndicator(id);
  }

  async toggleStatus(id: number, status: boolean): Promise<Indicator> {
    return await this.apiService.toggleIndicatorStatus(id, status);
  }

  async getProcesses(): Promise<Array<{id: number, name: string}>> {
    return await this.apiService.getProcesses();
  }
}