/**
 * Represents a paginated response from the Django REST Framework backend.
 * Standard DRF pagination format: { count, next, previous, results }
 */
export interface PaginatedResponse<T> {
  /** Total number of items across all pages */
  count: number;
  /** URL for the next page, or null if last page */
  next: string | null;
  /** URL for the previous page, or null if first page */
  previous: string | null;
  /** Array of items for the current page */
  results: T[];
}

/**
 * Pagination params to send in API requests.
 */
export interface PaginationParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
}
