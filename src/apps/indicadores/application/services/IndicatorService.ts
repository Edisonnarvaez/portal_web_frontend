import { ApiIndicatorRepository } from '../../infrastructure/repositories/ApiIndicatorRepository';
import { GetIndicatorsUseCase } from '../../domain/usecases/indicators/GetIndicatorsUseCase';
import { CreateIndicatorUseCase } from '../../domain/usecases/indicators/CreateIndicatorUseCase';
import type { Indicator, CreateIndicatorRequest, UpdateIndicatorRequest } from '../../domain/entities/Indicator';

export class IndicatorService {
  private repository: ApiIndicatorRepository;
  private getIndicatorsUseCase: GetIndicatorsUseCase;
  private createIndicatorUseCase: CreateIndicatorUseCase;

  constructor() {
    this.repository = new ApiIndicatorRepository();
    this.getIndicatorsUseCase = new GetIndicatorsUseCase(this.repository);
    this.createIndicatorUseCase = new CreateIndicatorUseCase(this.repository);
  }

  async getAllIndicators(): Promise<Indicator[]> {
    return await this.getIndicatorsUseCase.execute();
  }

  async createIndicator(indicator: CreateIndicatorRequest): Promise<Indicator> {
    return await this.createIndicatorUseCase.execute(indicator);
  }

  async updateIndicator(indicator: UpdateIndicatorRequest): Promise<Indicator> {
    return await this.repository.update(indicator);
  }

  async deleteIndicator(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async toggleIndicatorStatus(id: number, status: boolean): Promise<Indicator> {
    return await this.repository.toggleStatus(id, status);
  }

  async getProcesses(): Promise<Array<{id: number, name: string}>> {
    return await this.repository.getProcesses();
  }
}