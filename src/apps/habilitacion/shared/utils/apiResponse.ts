interface PaginatedLikeResponse<T> {
  results?: T[];
}

export const parseListResponse = <T>(payload: unknown): T[] => {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (payload && typeof payload === 'object') {
    const maybePaginated = payload as PaginatedLikeResponse<T>;
    if (Array.isArray(maybePaginated.results)) {
      return maybePaginated.results;
    }
  }

  return [];
};
