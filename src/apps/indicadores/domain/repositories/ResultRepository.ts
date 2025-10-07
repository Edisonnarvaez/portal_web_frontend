import type { Result, DetailedResult, CreateResultRequest, UpdateResultRequest } from '../entities/Result';

export interface ResultRepository {
  getAll(): Promise<Result[]>;
  getAllWithDetails(): Promise<DetailedResult[]>;
  getById(id: number): Promise<Result | null>;
  create(result: CreateResultRequest): Promise<Result>;
  update(result: UpdateResultRequest): Promise<Result>;
  delete(id: number): Promise<void>;
  getByIndicator(indicatorId: number): Promise<Result[]>;
  getByHeadquarters(headquartersId: number): Promise<Result[]>;
  getIndicators(): Promise<Array<{id: number, name: string, code: string, measurementFrequency: string}>>;
  getHeadquarters(): Promise<Array<{id: number, name: string}>>;
}