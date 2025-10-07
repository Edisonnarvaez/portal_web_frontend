import type { IndicatorRepository } from '../../repositories/IndicatorRepository';
import type { Indicator, CreateIndicatorRequest } from '../../entities/Indicator';

export class CreateIndicatorUseCase {
  private indicatorRepository: IndicatorRepository;

  constructor(indicatorRepository: IndicatorRepository) {
    this.indicatorRepository = indicatorRepository;
  }

  async execute(indicator: CreateIndicatorRequest): Promise<Indicator> {
    // Validaciones de negocio
    if (!indicator.name || indicator.name.trim() === '') {
      throw new Error('El nombre del indicador es obligatorio');
    }

    if (!indicator.code || indicator.code.trim() === '') {
      throw new Error('El código del indicador es obligatorio');
    }

    if (Number(indicator.target) < 0) {
      throw new Error('La meta debe ser un número positivo');
    }

    return await this.indicatorRepository.create(indicator);
  }
}