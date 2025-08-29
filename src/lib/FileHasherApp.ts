import { FileProcessor } from "./fileProcessor.js";
import { PaginationManager } from "./pagination.js";
import { DragDropHandler } from "./dragDrop.js";
import { showWarningToast, showSuccessToast } from "./notifications.js";
import { generateDefaultFilename, getDefaultItemsPerPage } from "./utils.js";
import type { FileResult } from "./types.js";

/**
 * Main application controller that orchestrates all file hashing functionality
 * This class manages the entire application state and UI interactions
 */
export class FileHasherApp {
  private fileProcessor: FileProcessor;
  private paginationManager: PaginationManager;
  private dragDropHandler: DragDropHandler | null = null;
  private elements: { [key: string]: HTMLElement } = {};

  constructor() {
    this.fileProcessor = new FileProcessor();
    this.paginationManager = new PaginationManager(getDefaultItemsPerPage());
  }

  /**
   * Initialize the application
   * Should be called on DOMContentLoaded
   */
  public async initialize(): Promise<void> {
    this.cacheElements();
    this.setupEventListeners();
    this.initializePaginationSettings();
    this.resetFilenameInput();
    this.updateTable();
    this.initializeDragDrop();
  }

  /**
   * Cache frequently used DOM elements
   */
  private cacheElements(): void {
    const elementIds = [
      "file-upload",
      "dropZone",
      "downloadButton",
      "copyButton",
      "clearAllButton",
      "filenameInput",
      "itemsPerPage",
      "prevButton",
      "nextButton",
      "progressCard",
      "progressBar",
      "progressText",
      "progressNumbers",
      "currentFileName",
      "processedCount",
      "remainingCount",
      "resultsTable",
      "resultsBody",
      "actionButtons",
      "emptyState",
      "fileCounter",
      "fileCount",
      "itemsPerPageSelector",
      "paginationContainer",
      "paginationInfo",
      "pageNumbers",
    ];

    elementIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        this.elements[id] = element;
      }
    });
  }

  /**
   * Setup all event listeners
   */
  private setupEventListeners(): void {
    // File input handlers
    this.elements["dropZone"]?.addEventListener(
      "click",
      this.handleDropZoneClick.bind(this),
    );
    this.elements["file-upload"]?.addEventListener(
      "change",
      this.handleFileInputChange.bind(this),
    );

    // Action button handlers
    this.elements["downloadButton"]?.addEventListener(
      "click",
      this.downloadCSV.bind(this),
    );
    this.elements["copyButton"]?.addEventListener(
      "click",
      this.copyToClipboard.bind(this),
    );
    this.elements["clearAllButton"]?.addEventListener(
      "click",
      this.handleClearAll.bind(this),
    );

    // Pagination handlers
    this.elements["itemsPerPage"]?.addEventListener(
      "change",
      this.handleItemsPerPageChange.bind(this),
    );
    this.elements["prevButton"]?.addEventListener(
      "click",
      this.handlePrevPage.bind(this),
    );
    this.elements["nextButton"]?.addEventListener(
      "click",
      this.handleNextPage.bind(this),
    );

    // Responsive pagination adjustment
    window.addEventListener("resize", this.handleWindowResize.bind(this));

    // Keyboard navigation
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
  }

  /**
   * Initialize pagination settings
   */
  private initializePaginationSettings(): void {
    const defaultItems = getDefaultItemsPerPage();
    this.paginationManager.setItemsPerPage(defaultItems);

    const select = this.elements["itemsPerPage"] as HTMLSelectElement;
    if (select) {
      Array.from(select.options).forEach((option) => (option.selected = false));
      const optionToSelect = select.querySelector(
        `option[value="${defaultItems}"]`,
      ) as HTMLOptionElement;
      if (optionToSelect) {
        optionToSelect.selected = true;
      }
    }
  }

  /**
   * Initialize drag and drop functionality
   */
  private initializeDragDrop(): void {
    console.log("Attempting to initialize drag and drop...");

    try {
      this.dragDropHandler = new DragDropHandler(
        "dropZone",
        this.handleFiles.bind(this),
        () => this.fileProcessor.getIsProcessing(),
        { debugMode: true }, // Enable debug mode to see what's happening
      );
      console.log("✅ Drag drop handler initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize drag drop handler:", error);
    }
  }

  /**
   * Handle drop zone click events
   */
  private handleDropZoneClick(e: Event): void {
    if (this.fileProcessor.getIsProcessing()) {
      showWarningToast("Please wait for current processing to complete");
      return;
    }

    const target = e.target as HTMLElement;
    const label = target.closest("label");
    if (!label) {
      (this.elements["file-upload"] as HTMLInputElement)?.click();
    }
  }

  /**
   * Handle file input change events
   */
  private handleFileInputChange(e: Event): void {
    const files = (e.target as HTMLInputElement).files;
    if (files && files.length > 0) {
      this.handleFiles(files);
      this.showDropZoneFeedback();
    }
  }

  /**
   * Show visual feedback on drop zone
   */
  private showDropZoneFeedback(): void {
    const dropZone = this.elements["dropZone"];
    if (dropZone) {
      dropZone.classList.add("bg-[rgba(0,26,114,0.03)]", "border-primary");
      setTimeout(() => {
        dropZone.classList.remove("bg-[rgba(0,26,114,0.03)]", "border-primary");
      }, 500);
    }
  }

  /**
   * Handle file processing with UI updates
   */
  private async handleFiles(files: FileList): Promise<void> {
    console.log("📁 handleFiles called with:", files);
    console.log("📁 Files length:", files.length);
    console.log("📁 Files array:", Array.from(files));

    if (!files || files.length === 0) {
      console.warn("⚠️ No files received in handleFiles");
      return;
    }

    this.showProgress();
    this.updateProgress(0, files.length);

    await this.fileProcessor.processFiles(
      files,
      this.updateProgress.bind(this),
      () => {
        this.updateTable();
        setTimeout(() => this.hideProgress(), 1500);
      },
    );

    this.updateTable();
  }

  /**
   * Show progress UI
   */
  private showProgress(): void {
    this.elements["progressCard"]?.classList.remove("hidden");
    if (this.elements["dropZone"]) {
      this.elements["dropZone"].style.opacity = "0.5";
      this.elements["dropZone"].style.pointerEvents = "none";
    }
  }

  /**
   * Hide progress UI
   */
  private hideProgress(): void {
    this.elements["progressCard"]?.classList.add("hidden");
    if (this.elements["dropZone"]) {
      this.elements["dropZone"].style.opacity = "1";
      this.elements["dropZone"].style.pointerEvents = "auto";
    }
  }

  /**
   * Update progress indicators
   */
  private updateProgress(
    current: number,
    total: number,
    currentFileName: string = "",
  ): void {
    const percentage = total > 0 ? (current / total) * 100 : 0;

    if (this.elements["progressBar"]) {
      (this.elements["progressBar"] as HTMLElement).style.width =
        `${percentage}%`;
    }

    if (this.elements["progressText"]) {
      this.elements["progressText"].textContent =
        current === total ? "Processing complete!" : "Processing files...";
    }

    if (this.elements["progressNumbers"]) {
      this.elements["progressNumbers"].textContent = `${current} / ${total}`;
    }

    if (this.elements["processedCount"]) {
      this.elements["processedCount"].textContent = current.toString();
    }

    if (this.elements["remainingCount"]) {
      this.elements["remainingCount"].textContent = (
        total - current
      ).toString();
    }

    if (this.elements["currentFileName"]) {
      if (currentFileName) {
        this.elements["currentFileName"].textContent =
          `Current: ${currentFileName}`;
      } else if (current === total) {
        this.elements["currentFileName"].textContent =
          "All files processed successfully!";
      }
    }
  }

  /**
   * Update the results table and pagination
   */
  private updateTable(): void {
    const results = this.fileProcessor.getResults();

    this.paginationManager.updatePagination(results.length);
    const paginatedResults = this.paginationManager.getPaginatedData(results);

    this.renderTableRows(paginatedResults);
    this.updateUIVisibility(results.length);
    this.updateFileCounter(results.length);
    this.updatePaginationUI();
  }

  /**
   * Render table rows
   */
  private renderTableRows(results: FileResult[]): void {
    const tbody = this.elements["resultsBody"];
    if (!tbody) return;

    tbody.innerHTML = results
      .map(
        (result) => `
      <div data-id="${result.id}" class="grid grid-cols-12 py-3 px-3 items-center hover:bg-background-light transition-colors">
        <div class="col-span-11 md:col-span-10 grid grid-cols-1 md:grid-cols-12 gap-1 md:gap-0">
          <div class="md:col-span-6 font-mono text-xs text-text-secondary overflow-hidden flex items-center gap-2">
            <span>${result.hash.substring(0, 16)}...${result.hash.substring(result.hash.length - 16)}</span>
            <button 
              class="copy-hash-btn text-primary hover:text-primary-shade focus:outline-none p-1 rounded hover:bg-background-light transition-colors" 
              data-hash="${result.hash}"
              title="Copy full hash to clipboard"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
          <div class="md:col-span-5 text-text-dark truncate">
            ${result.name}${result.extension ? "." + result.extension : ""}
          </div>
          <div class="hidden md:block md:col-span-1 text-text-light">${result.extension}</div>
        </div>
        <div class="col-span-1 md:col-span-1 text-center">
          <button 
            class="text-danger hover:text-danger-shade focus:outline-none remove-file" 
            data-id="${result.id}"
            title="Remove file"
          >
            <span class="text-lg font-bold leading-none">×</span>
          </button>
        </div>
      </div>
    `,
      )
      .join("");

    // Add event listeners to buttons
    tbody.querySelectorAll(".remove-file").forEach((button) => {
      button.addEventListener("click", this.handleRemoveFile.bind(this));
    });

    tbody.querySelectorAll(".copy-hash-btn").forEach((button) => {
      button.addEventListener("click", this.handleCopyHash.bind(this));
    });
  }

  /**
   * Handle individual hash copy
   */
  private async handleCopyHash(e: Event): Promise<void> {
    const button = e.target as HTMLElement;
    const copyButton = button.closest(".copy-hash-btn") as HTMLElement;

    if (!copyButton) return;

    const hash = copyButton.getAttribute("data-hash");
    if (!hash) return;

    try {
      await navigator.clipboard.writeText(hash);

      // Show success feedback by temporarily changing the icon
      const svg = copyButton.querySelector("svg");
      if (svg) {
        const originalIcon = svg.innerHTML;

        // Change to checkmark icon
        svg.innerHTML = `
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        `;
        svg.classList.add("text-green-500");

        // Reset after 1.5 seconds
        setTimeout(() => {
          svg.innerHTML = originalIcon;
          svg.classList.remove("text-green-500");
        }, 1500);
      }

      // Optional: Show toast notification (you can remove this if it's too much)
      // showSuccessToast('Hash copied to clipboard!');
    } catch (error) {
      console.error("Failed to copy hash:", error);
      showWarningToast("Failed to copy hash to clipboard");
    }
  }

  /**
   * Handle file removal
   */
  private handleRemoveFile(e: Event): void {
    let target = e.target as HTMLElement;

    if (!target.hasAttribute("data-id") && target.parentElement) {
      target = target.closest("[data-id]") || target;
    }

    const id = target.getAttribute("data-id");
    if (id && this.fileProcessor.removeFile(id)) {
      this.updateTable();
    }
  }

  /**
   * Update UI element visibility based on results count
   */
  private updateUIVisibility(resultsCount: number): void {
    const showResults = resultsCount > 0;
    const paginationState = this.paginationManager.getState();

    this.elements["resultsTable"]?.classList.toggle("hidden", !showResults);
    this.elements["actionButtons"]?.classList.toggle("hidden", !showResults);
    this.elements["emptyState"]?.classList.toggle("hidden", showResults);
    this.elements["fileCounter"]?.classList.toggle("hidden", !showResults);
    this.elements["itemsPerPageSelector"]?.classList.toggle(
      "hidden",
      !showResults,
    );

    // Show pagination if needed
    const showPagination =
      showResults &&
      (paginationState.totalPages > 1 || resultsCount > Math.min(10, 25));
    this.elements["paginationContainer"]?.classList.toggle(
      "hidden",
      !showPagination,
    );
  }

  /**
   * Update file counter
   */
  private updateFileCounter(count: number): void {
    if (this.elements["fileCount"]) {
      this.elements["fileCount"].textContent = count.toString();
    }
  }

  /**
   * Update pagination UI controls
   */
  private updatePaginationUI(): void {
    const paginationState = this.paginationManager.getState();
    const results = this.fileProcessor.getResults();

    // Update pagination info
    if (this.elements["paginationInfo"]) {
      this.elements["paginationInfo"].textContent =
        this.paginationManager.getPaginationInfo(results.length);
    }

    // Update button states
    const prevButton = this.elements["prevButton"] as HTMLButtonElement;
    const nextButton = this.elements["nextButton"] as HTMLButtonElement;

    if (prevButton) prevButton.disabled = paginationState.currentPage <= 1;
    if (nextButton)
      nextButton.disabled =
        paginationState.currentPage >= paginationState.totalPages ||
        paginationState.itemsPerPage === -1;

    this.renderPageNumbers(paginationState);
  }

  /**
   * Render pagination page numbers
   */
  private renderPageNumbers(paginationState: any): void {
    const pageNumbers = this.elements["pageNumbers"];
    if (!pageNumbers) return;

    pageNumbers.innerHTML = "";

    if (paginationState.itemsPerPage !== -1 && paginationState.totalPages > 1) {
      const maxVisiblePages = 3;
      let startPage = Math.max(
        1,
        paginationState.currentPage - Math.floor(maxVisiblePages / 2),
      );
      let endPage = Math.min(
        paginationState.totalPages,
        startPage + maxVisiblePages - 1,
      );

      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      // First page + ellipsis
      if (startPage > 1) {
        pageNumbers.appendChild(this.createPageButton(1, false));
        if (startPage > 2) {
          const ellipsis = document.createElement("span");
          ellipsis.textContent = "...";
          ellipsis.className = "px-2 py-1 text-sm text-text-light";
          pageNumbers.appendChild(ellipsis);
        }
      }

      // Visible pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.appendChild(
          this.createPageButton(i, i === paginationState.currentPage),
        );
      }

      // Last page + ellipsis
      if (endPage < paginationState.totalPages) {
        if (endPage < paginationState.totalPages - 1) {
          const ellipsis = document.createElement("span");
          ellipsis.textContent = "...";
          ellipsis.className = "px-2 py-1 text-sm text-text-light";
          pageNumbers.appendChild(ellipsis);
        }
        pageNumbers.appendChild(
          this.createPageButton(paginationState.totalPages, false),
        );
      }
    }
  }

  /**
   * Create pagination button
   */
  private createPageButton(
    pageNum: number,
    isActive: boolean,
  ): HTMLButtonElement {
    const button = document.createElement("button");
    button.textContent = pageNum.toString();

    button.className = `px-3 py-1 text-sm border rounded transition-colors ${
      isActive
        ? "bg-primary text-white border-primary"
        : "border-border-medium hover:bg-white hover:border-primary"
    }`;

    if (!isActive) {
      button.addEventListener("click", () => {
        if (this.paginationManager.goToPage(pageNum)) {
          this.updateTable();
        }
      });
    }

    return button;
  }

  // Event Handlers
  private handleClearAll(): void {
    if (this.fileProcessor.getIsProcessing()) {
      showWarningToast("Cannot clear files while processing. Please wait...");
      return;
    }
    this.clearResults();
  }

  private handleItemsPerPageChange(e: Event): void {
    const value = (e.target as HTMLSelectElement).value;
    const newItemsPerPage = value === "all" ? -1 : parseInt(value);
    this.paginationManager.setItemsPerPage(newItemsPerPage);
    this.updateTable();
  }

  private handlePrevPage(): void {
    if (this.paginationManager.prevPage()) {
      this.updateTable();
    }
  }

  private handleNextPage(): void {
    if (this.paginationManager.nextPage()) {
      this.updateTable();
    }
  }

  private handleWindowResize(): void {
    const newDefault = getDefaultItemsPerPage();
    const currentState = this.paginationManager.getState();
    const currentIsDefault =
      currentState.itemsPerPage === 10 || currentState.itemsPerPage === 50;

    if (
      currentIsDefault &&
      newDefault !== currentState.itemsPerPage &&
      currentState.itemsPerPage !== -1
    ) {
      this.paginationManager.setItemsPerPage(newDefault);

      const select = this.elements["itemsPerPage"] as HTMLSelectElement;
      if (select) {
        Array.from(select.options).forEach(
          (option) => (option.selected = false),
        );
        const optionToSelect = select.querySelector(
          `option[value="${newDefault}"]`,
        ) as HTMLOptionElement;
        if (optionToSelect) {
          optionToSelect.selected = true;
        }
      }

      this.updateTable();
    }
  }

  private handleKeyDown(e: KeyboardEvent): void {
    const results = this.fileProcessor.getResults();
    const paginationState = this.paginationManager.getState();

    if (results.length === 0 || paginationState.itemsPerPage === -1) return;

    const activeElement = document.activeElement;
    if (
      activeElement &&
      (activeElement.tagName === "INPUT" || activeElement.tagName === "SELECT")
    ) {
      return;
    }

    if (e.key === "ArrowLeft" && this.paginationManager.prevPage()) {
      e.preventDefault();
      this.updateTable();
    } else if (e.key === "ArrowRight" && this.paginationManager.nextPage()) {
      e.preventDefault();
      this.updateTable();
    }
  }

  // Public Methods
  public resetFilenameInput(): void {
    const input = this.elements["filenameInput"] as HTMLInputElement;
    if (input) {
      input.value = generateDefaultFilename();
    }
  }

  public clearResults(): void {
    this.fileProcessor.clearResults();
    this.paginationManager.reset();
    this.updateTable();
    this.resetFilenameInput();
  }

  public async downloadCSV(): Promise<void> {
    const filenameInput = this.elements["filenameInput"] as HTMLInputElement;
    let filename = filenameInput?.value.trim() || generateDefaultFilename();

    if (!filename) {
      filename = generateDefaultFilename();
      if (filenameInput) filenameInput.value = filename;
    }

    const csv = this.fileProcessor.generateCSV();
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showSuccessToast("File downloaded successfully!");
    this.clearResults();
  }

  public async copyToClipboard(): Promise<void> {
    const text = this.fileProcessor.generateClipboardText();
    await navigator.clipboard.writeText(text);

    showSuccessToast("Copied to clipboard!");

    const copyButton = this.elements["copyButton"];
    if (copyButton) {
      const originalText = copyButton.textContent;
      copyButton.textContent = "Copied!";
      setTimeout(() => {
        copyButton.textContent = originalText;
      }, 2000);
    }
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    this.dragDropHandler?.destroy();
  }
}
