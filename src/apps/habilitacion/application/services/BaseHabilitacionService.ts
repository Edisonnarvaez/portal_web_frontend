import type { PaginatedResponse } from '../../domain/entities/PaginatedResponse';

/**
 * Base service class for all habilitación services
 * Provides common CRUD operations and error handling
 */
export abstract class BaseHabilitacionService<T> {
  protected abstract getRepository(): any;

  /**
   * Get all entities
   */
  async getAll(filters?: any): Promise<T[]> {
    try {
      const repository = this.getRepository();
      return await repository.getAll(filters);
    } catch (error) {
      throw this.handleError(error, 'getAll');
    }
  }

  /**
   * Get paginated entities
   */
  async getAllPaginated(
    page: number = 1,
    limit: number = 10,
    filters?: any
  ): Promise<PaginatedResponse<T>> {
    try {
      const repository = this.getRepository();
      if (repository.getAllPaginated) {
        return await repository.getAllPaginated(page, limit, filters);
      }
      // Fallback if getAllPaginated not available
      const items = await repository.getAll(filters);
      return {
        count: items.length,
        next: page * limit < items.length ? page + 1 : null,
        previous: page > 1 ? page - 1 : null,
        results: items.slice((page - 1) * limit, page * limit),
      } as PaginatedResponse<T>;
    } catch (error) {
      throw this.handleError(error, 'getAllPaginated');
    }
  }

  /**
   * Get entity by ID
   */
  async getById(id: number): Promise<T> {
    try {
      if (!id || id <= 0) {
        throw new Error('Invalid ID provided');
      }
      const repository = this.getRepository();
      return await repository.getById(id);
    } catch (error) {
      throw this.handleError(error, 'getById');
    }
  }

  /**
   * Create new entity
   */
  async create(data: any): Promise<T> {
    try {
      this.validateInput(data);
      const repository = this.getRepository();
      return await repository.create(data);
    } catch (error) {
      throw this.handleError(error, 'create');
    }
  }

  /**
   * Update entity
   */
  async update(id: number, data: any): Promise<T> {
    try {
      if (!id || id <= 0) {
        throw new Error('Invalid ID provided');
      }
      this.validateInput(data);
      const repository = this.getRepository();
      return await repository.update(id, data);
    } catch (error) {
      throw this.handleError(error, 'update');
    }
  }

  /**
   * Delete entity
   */
  async delete(id: number): Promise<void> {
    try {
      if (!id || id <= 0) {
        throw new Error('Invalid ID provided');
      }
      const repository = this.getRepository();
      return await repository.delete(id);
    } catch (error) {
      throw this.handleError(error, 'delete');
    }
  }

  /**
   * Validate input data
   * Override in subclasses for specific validation
   */
  protected validateInput(data: any): void {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid input data');
    }
  }

  /**
   * Handle errors consistently
   */
  protected handleError(error: any, operation: string): Error {
    const message = error?.message || `Error in ${operation}`;
    const statusCode = error?.status || error?.statusCode || 500;

    console.error(`[${this.constructor.name}] ${operation}: ${message}`, error);

    if (statusCode === 404) {
      return new Error(`Resource not found: ${message}`);
    }
    if (statusCode === 400) {
      return new Error(`Bad request: ${message}`);
    }
    if (statusCode === 403) {
      return new Error(`Permission denied: ${message}`);
    }

    return error instanceof Error ? error : new Error(message);
  }

  /**
   * Format response with metadata
   */
  protected formatResponse<R>(
    data: R,
    metadata?: Record<string, any>
  ): R & { _metadata?: Record<string, any> } {
    return {
      ...data,
      _metadata: metadata,
    } as R & { _metadata?: Record<string, any> };
  }
}
