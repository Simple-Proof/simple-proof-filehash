/**
 * Interface for file processing results
 */
export interface FileResult {
  name: string;
  extension: string;
  hash: string;
  id: string;
}

/**
 * Toast notification types
 */
export type ToastType = "success" | "error" | "warning" | "info";

/**
 * Pagination state interface
 */
export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
}
