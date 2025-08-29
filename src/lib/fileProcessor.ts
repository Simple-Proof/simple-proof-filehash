import type { FileResult } from "./types";
import { getFileNameAndExtension } from "./utils";
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "./notifications";

/**
 * File processing class that handles hash calculation and file management
 */
export class FileProcessor {
  private results: FileResult[] = [];
  private isProcessing = false;
  private readonly MAX_FILES = 1000;
  private debugMode = false;

  // Progress tracking
  private totalFiles = 0;
  private processedFiles = 0;

  constructor() {
    // Initialize with empty results
  }

  /**
   * Get current processing results
   */
  getResults(): FileResult[] {
    return [...this.results];
  }

  /**
   * Check if currently processing files
   */
  getIsProcessing(): boolean {
    return this.isProcessing;
  }

  /**
   * Enable/disable debug mode
   */
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }

  /**
   * Debug helper function
   */
  private debugLog(message: string): void {
    if (!this.debugMode) return;

    console.log(message);

    const debugText = document.getElementById("debugText");
    const debugInfo = document.getElementById("debugInfo");

    if (debugText && debugInfo) {
      debugInfo.classList.remove("hidden");
      const timestamp = new Date().toLocaleTimeString();
      debugText.innerHTML += `[${timestamp}] ${message}<br>`;
      debugText.scrollTop = debugText.scrollHeight;
    }
  }

  /**
   * Calculate SHA-256 hash for a file
   */
  private async calculateHash(file: File): Promise<string> {
    try {
      const fileBlob = new Blob([file], { type: file.type });
      const buffer = await fileBlob.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    } catch (error) {
      console.error("Error in calculateHash:", error);
      throw error;
    }
  }

  /**
   * Process a single file and add to results
   */
  private async processFile(
    file: File,
    index: number,
    onProgress?: (current: number, total: number, fileName: string) => void,
  ): Promise<void> {
    this.debugLog(
      `Processing file ${index + 1}/${this.totalFiles}: ${file.name} (${file.size} bytes)`,
    );

    // Update progress callback
    if (onProgress) {
      onProgress(index, this.totalFiles, file.name);
    }

    try {
      const hash = await this.calculateHash(file);
      const [name, extension] = getFileNameAndExtension(file.name);

      this.results.push({
        name,
        extension,
        hash,
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      });

      this.debugLog(
        `Hash calculated for ${file.name}: ${hash.substring(0, 8)}...`,
      );

      // Update progress
      this.processedFiles++;
      if (onProgress) {
        onProgress(
          this.processedFiles,
          this.totalFiles,
          this.processedFiles < this.totalFiles
            ? "Processing next file..."
            : "",
        );
      }

      // Small delay to prevent UI blocking
      if (this.processedFiles % 50 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    } catch (error) {
      this.debugLog(`Error processing file ${file.name}: ${error}`);
      console.error("Error processing file:", file.name, error);
      this.processedFiles++;

      // Show error toast
      showErrorToast(`Error processing ${file.name}`);
    }
  }

  /**
   * Process multiple files with progress tracking
   */
  async processFiles(
    files: FileList,
    onProgress?: (current: number, total: number, fileName: string) => void,
    onComplete?: () => void,
  ): Promise<void> {
    if (this.isProcessing) {
      showWarningToast("Files are already being processed. Please wait...");
      return;
    }

    const fileArray = Array.from(files);
    const currentCount = this.results.length;
    const newFilesCount = fileArray.length;

    // Check file limit
    if (currentCount + newFilesCount > this.MAX_FILES) {
      const allowedFiles = this.MAX_FILES - currentCount;
      if (allowedFiles <= 0) {
        showErrorToast(
          `Maximum limit of ${this.MAX_FILES} files reached. Please clear existing files first.`,
        );
        return;
      }

      showWarningToast(
        `Only processing first ${allowedFiles} files. Maximum limit is ${this.MAX_FILES} files.`,
      );
      fileArray.splice(allowedFiles);
    }

    if (fileArray.length === 0) {
      return;
    }

    this.debugLog(`Starting to process ${fileArray.length} files`);

    // Initialize progress
    this.totalFiles = fileArray.length;
    this.processedFiles = 0;
    this.isProcessing = true;

    try {
      // Process files sequentially to avoid overwhelming the browser
      for (let i = 0; i < fileArray.length; i++) {
        await this.processFile(fileArray[i], i, onProgress);
      }

      // Show completion message
      showSuccessToast(
        `Successfully processed ${this.totalFiles} file${this.totalFiles > 1 ? "s" : ""}!`,
      );

      this.debugLog(
        `Processing complete. Total results: ${this.results.length}`,
      );

      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error("Error in processFiles:", error);
      showErrorToast("An error occurred while processing files");
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Remove a file from results by ID
   */
  removeFile(id: string): boolean {
    const index = this.results.findIndex((r) => r.id === id);
    if (index !== -1) {
      this.results.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Clear all results
   */
  clearResults(): void {
    this.results.length = 0;
  }

  /**
   * Generate CSV content from current results
   */
  generateCSV(): string {
    return [
      ["SHA-256 Hash", "File Name", "Extension"],
      ...this.results.map((r) => [r.hash, r.name, r.extension]),
    ]
      .map((row) => row.join(","))
      .join("\n");
  }

  /**
   * Generate clipboard text from current results
   */
  generateClipboardText(): string {
    return this.results
      .map((r) => {
        const fullFilename = r.extension ? `${r.name}.${r.extension}` : r.name;
        return `${r.hash}: ${fullFilename}`;
      })
      .join("\n");
  }
}
