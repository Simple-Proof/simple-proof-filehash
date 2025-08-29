import type { PaginationState } from "./types";

/**
 * Pagination management class
 */
export class PaginationManager {
  private state: PaginationState = {
    currentPage: 1,
    itemsPerPage: 10,
    totalPages: 1,
  };

  constructor(initialItemsPerPage: number = 10) {
    this.state.itemsPerPage = initialItemsPerPage;
  }

  /**
   * Get current pagination state
   */
  getState(): PaginationState {
    return { ...this.state };
  }

  /**
   * Update pagination based on total items
   */
  updatePagination(totalItems: number): void {
    this.state.totalPages =
      this.state.itemsPerPage === -1
        ? 1
        : Math.ceil(totalItems / this.state.itemsPerPage);

    // Ensure current page is valid
    if (
      this.state.currentPage > this.state.totalPages &&
      this.state.totalPages > 0
    ) {
      this.state.currentPage = this.state.totalPages;
    } else if (this.state.currentPage < 1) {
      this.state.currentPage = 1;
    }
  }

  /**
   * Go to specific page
   */
  goToPage(page: number): boolean {
    if (page >= 1 && page <= this.state.totalPages) {
      this.state.currentPage = page;
      return true;
    }
    return false;
  }

  /**
   * Go to next page
   */
  nextPage(): boolean {
    return this.goToPage(this.state.currentPage + 1);
  }

  /**
   * Go to previous page
   */
  prevPage(): boolean {
    return this.goToPage(this.state.currentPage - 1);
  }

  /**
   * Set items per page
   */
  setItemsPerPage(itemsPerPage: number): void {
    // Calculate what the new current page should be to keep roughly the same position
    if (this.state.itemsPerPage !== -1 && itemsPerPage !== -1) {
      const currentFirstItem =
        (this.state.currentPage - 1) * this.state.itemsPerPage + 1;
      this.state.currentPage = Math.max(
        1,
        Math.ceil(currentFirstItem / itemsPerPage),
      );
    } else {
      this.state.currentPage = 1;
    }

    this.state.itemsPerPage = itemsPerPage;
  }

  /**
   * Get paginated slice of data
   */
  getPaginatedData<T>(data: T[]): T[] {
    if (this.state.itemsPerPage === -1) {
      return data; // Return all data
    }

    const startIndex = (this.state.currentPage - 1) * this.state.itemsPerPage;
    const endIndex = Math.min(
      startIndex + this.state.itemsPerPage,
      data.length,
    );
    return data.slice(startIndex, endIndex);
  }

  /**
   * Get pagination info text
   */
  getPaginationInfo(totalItems: number): string {
    if (totalItems === 0) {
      return "No results";
    }

    if (this.state.itemsPerPage === -1) {
      return `Showing all ${totalItems} results`;
    }

    const startIndex =
      (this.state.currentPage - 1) * this.state.itemsPerPage + 1;
    const endIndex = Math.min(
      this.state.currentPage * this.state.itemsPerPage,
      totalItems,
    );
    return `Showing ${startIndex} to ${endIndex} of ${totalItems} results`;
  }

  /**
   * Reset pagination to first page
   */
  reset(): void {
    this.state.currentPage = 1;
  }
}
