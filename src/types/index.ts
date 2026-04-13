export interface Pagination {
    pageNumber: number;
    pageSize: number;
}

export interface APIResponse<T> {
    content: T;
    totalElements: number;
    totalPages: number;
    page: number;
    size: number;
    pageable: Pagination;
}
