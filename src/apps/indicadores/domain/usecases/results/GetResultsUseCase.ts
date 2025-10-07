import type { ResultRepository } from '../../repositories/ResultRepository';
import type { Result, DetailedResult } from '../../entities/Result';

export class GetResultsUseCase {
  private resultRepository: ResultRepository;

  constructor(resultRepository: ResultRepository) {
    this.resultRepository = resultRepository;
  }

  async execute(): Promise<Result[]> {
    return await this.resultRepository.getAll();
  }

  async executeWithDetails(): Promise<DetailedResult[]> {
    return await this.resultRepository.getAllWithDetails();
  }
}