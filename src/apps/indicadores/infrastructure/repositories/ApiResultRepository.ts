import type { ResultRepository } from '../../domain/repositories/ResultRepository';
import type { Result, DetailedResult, CreateResultRequest, UpdateResultRequest } from '../../domain/entities/Result';
import { ResultsApiService } from '../services/ResultsApiService';

export class ApiResultRepository implements ResultRepository {
  private apiService: ResultsApiService;

  constructor() {
    this.apiService = new ResultsApiService();
  }

  async getAll(): Promise<Result[]> {
    return await this.apiService.getResults();
  }

  async getAllWithDetails(): Promise<DetailedResult[]> {
    const results = await this.apiService.getResultsWithDetails();
    if (results.length > 0) {
    }
    return results;
  }

  async getById(id: number): Promise<Result | null> {
    try {
      return await this.apiService.getResultById(id);
    } catch (error) {
      console.error(`Error fetching result ${id}:`, error);
      return null;
    }
  }

  async create(result: CreateResultRequest): Promise<Result> {
    return await this.apiService.createResult(result);
  }

  async update(result: UpdateResultRequest): Promise<Result> {
    return await this.apiService.updateResult(result);
  }

  async delete(id: number): Promise<void> {
    return await this.apiService.deleteResult(id);
  }

  async getByIndicator(indicatorId: number): Promise<Result[]> {
    return await this.apiService.getResultsByIndicator(indicatorId);
  }

  async getByHeadquarters(headquartersId: number): Promise<Result[]> {
    return await this.apiService.getResultsByHeadquarters(headquartersId);
  }

  async getIndicators(): Promise<Array<{id: number, name: string, code: string, measurementFrequency: string}>> {
    return await this.apiService.getIndicators();
  }

  async getHeadquarters(): Promise<Array<{id: number, name: string}>> {
    return await this.apiService.getHeadquarters();
  }

  // New: expose paginated results
  async getPaginated(params?: { page?: number; page_size?: number; indicator?: number; headquarters?: number; period_start?: string; period_end?: string }): Promise<{ count: number; next: string | null; previous: string | null; results: Result[] }> {
    return await this.apiService.getPaginatedResults(params);
  }
}