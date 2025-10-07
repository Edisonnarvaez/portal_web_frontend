import type { IndicatorRepository } from '../../repositories/IndicatorRepository';
import type { Indicator } from '../../entities/Indicator';

export class GetIndicatorsUseCase {
  private indicatorRepository: IndicatorRepository;

  constructor(indicatorRepository: IndicatorRepository) {
    this.indicatorRepository = indicatorRepository;
  }

  async execute(): Promise<Indicator[]> {
    return await this.indicatorRepository.getAll();
  }
}