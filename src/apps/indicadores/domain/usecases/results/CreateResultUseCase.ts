import type { ResultRepository } from '../../repositories/ResultRepository';
import type { Result, CreateResultRequest } from '../../entities/Result';

export class CreateResultUseCase {
  private resultRepository: ResultRepository;

  constructor(resultRepository: ResultRepository) {
    this.resultRepository = resultRepository;
  }

  async execute(result: CreateResultRequest): Promise<Result> {
    // Validaciones de negocio
    if (!result.headquarters || result.headquarters <= 0) {
      throw new Error('Debe seleccionar una sede');
    }

    if (!result.indicator || result.indicator <= 0) {
      throw new Error('Debe seleccionar un indicador');
    }

    if (result.numerator < 0) {
      throw new Error('El numerador no puede ser negativo');
    }

    if (result.denominator <= 0) {
      throw new Error('El denominador debe ser mayor que cero');
    }

    if (!result.year || result.year < 2020 || result.year > 2030) {
      throw new Error('El año debe estar entre 2020 y 2030');
    }

    return await this.resultRepository.create(result);
  }
}