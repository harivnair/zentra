import { Scope } from "./auth";

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

export interface MenuItem {
    key: string;
    label: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    dividerAfter?: boolean;
    scopes?: Scope[];
}
