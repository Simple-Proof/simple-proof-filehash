import { showWarningToast } from "./notifications.js";

/**
 * Configuration options for drag and drop handler
 */
export interface DragDropOptions {
  /** Enable debug logging */
  debugMode?: boolean;
  /** Custom CSS classes to apply on drag over */
  dragOverClasses?: string[];
  /** Custom CSS classes to apply on drag active */
  dragActiveClasses?: string[];
}

/**
 * Drag and drop handler class for file upload functionality
 * Handles all drag and drop events with proper visual feedback
 */
export class DragDropHandler {
  private dragCounter = 0;
  private dropZone: HTMLElement;
  private onFilesDropped: (files: FileList) => void;
  private isProcessingCallback: () => boolean;
  private options: DragDropOptions;

  constructor(
    dropZoneId: string,
    onFilesDropped: (files: FileList) => void,
    isProcessingCallback: () => boolean,
    options: DragDropOptions = {},
  ) {
    const dropZone = document.getElementById(dropZoneId);
    if (!dropZone) {
      throw new Error(`Drop zone element with id '${dropZoneId}' not found`);
    }

    this.dropZone = dropZone;
    this.onFilesDropped = onFilesDropped;
    this.isProcessingCallback = isProcessingCallback;
    this.options = {
      debugMode: false,
      dragOverClasses: ["border-primary", "bg-[rgba(0,26,114,0.03)]"],
      dragActiveClasses: ["drag-over"],
      ...options,
    };

    this.setupEventListeners();
    this.debugLog("DragDropHandler initialized");
  }

  /**
   * Debug logging helper
   */
  private debugLog(message: string): void {
    if (this.options.debugMode) {
      console.log(`[DragDrop] ${message}`);
    }
  }

  /**
   * Setup all drag and drop event listeners
   */
  private setupEventListeners(): void {
    // Document level prevention
    document.addEventListener("dragover", (e) => e.preventDefault(), false);
    document.addEventListener("drop", (e) => e.preventDefault(), false);

    // Drop zone specific events with capture for better handling
    this.dropZone.addEventListener(
      "dragenter",
      this.handleDragEnter.bind(this),
      true,
    );
    this.dropZone.addEventListener(
      "dragleave",
      this.handleDragLeave.bind(this),
      true,
    );
    this.dropZone.addEventListener(
      "dragover",
      this.handleDragOver.bind(this),
      false,
    );
    this.dropZone.addEventListener("drop", this.handleDrop.bind(this), false);

    this.debugLog("Event listeners attached");
  }

  /**
   * Prevent default behaviors for drag events
   */
  private preventDefaults(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
  }

  /**
   * Handle drag enter event
   * Tracks drag counter to handle nested elements properly
   */
  private handleDragEnter(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();

    if (this.isProcessingCallback()) {
      this.debugLog("Drag enter ignored - currently processing files");
      return;
    }

    this.dragCounter++;
    this.debugLog(
      `Drag enter - counter: ${this.dragCounter}, target: ${(e.target as Element)?.tagName}`,
    );

    // Only apply visual feedback on first drag enter
    if (this.dragCounter === 1) {
      this.applyDragOverStyles();
    }
  }

  /**
   * Handle drag leave event
   * Uses counter to properly handle nested elements
   */
  private handleDragLeave(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();

    if (this.isProcessingCallback()) {
      return;
    }

    this.dragCounter--;
    this.debugLog(
      `Drag leave - counter: ${this.dragCounter}, target: ${(e.target as Element)?.tagName}`,
    );

    // Remove visual feedback when completely leaving drop zone
    if (this.dragCounter === 0) {
      this.removeDragOverStyles();
    }
  }

  /**
   * Handle drag over event
   * Required for drop to work properly
   */
  private handleDragOver(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();

    // Set drop effect to copy
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "copy";
    }
  }
  /**
   * Handle drop event
   * Processes dropped files and resets state
   */
  private handleDrop(e: DragEvent): void {
    this.preventDefaults(e);

    // Reset drag state
    this.dragCounter = 0;
    this.removeDragOverStyles();

    if (this.isProcessingCallback()) {
      showWarningToast("Please wait for current processing to complete");
      this.debugLog("Drop ignored - currently processing files");
      return;
    }

    // Debug the drop event thoroughly
    this.debugLog("Drop event triggered");
    this.debugLog("dataTransfer exists:", !!e.dataTransfer);
    this.debugLog("dataTransfer.files exists:", !!e.dataTransfer?.files);
    this.debugLog(
      "dataTransfer.files.length:",
      e.dataTransfer?.files?.length || 0,
    );
    this.debugLog("dataTransfer.items exists:", !!e.dataTransfer?.items);
    this.debugLog(
      "dataTransfer.items.length:",
      e.dataTransfer?.items?.length || 0,
    );

    // Process dropped files
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      const fileCount = e.dataTransfer.files.length;
      this.debugLog(`✅ Files found in drop: ${fileCount} files`);

      // Log details about each file
      for (let i = 0; i < fileCount; i++) {
        const file = e.dataTransfer.files[i];
        this.debugLog(
          `File ${i}: ${file.name} (${file.size} bytes, type: ${file.type})`,
        );
      }

      // Use the files directly
      this.onFilesDropped(e.dataTransfer.files);
    } else if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
      // Fallback: try to get files from items
      this.debugLog("Trying to get files from dataTransfer.items");
      const files: File[] = [];

      for (let i = 0; i < e.dataTransfer.items.length; i++) {
        const item = e.dataTransfer.items[i];
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file) {
            files.push(file);
            this.debugLog(`File from item ${i}: ${file.name}`);
          }
        }
      }

      if (files.length > 0) {
        this.debugLog(`✅ Got ${files.length} files from items`);
        const fileList = this.createFileList(files);
        this.onFilesDropped(fileList);
      } else {
        this.debugLog("❌ No valid files found in items");
      }
    } else {
      this.debugLog(
        "❌ No files in drop event - dataTransfer or files is empty",
      );
    }
  }

  /**
   * Apply visual feedback styles for drag over state
   */
  private applyDragOverStyles(): void {
    this.options.dragOverClasses?.forEach((className) => {
      this.dropZone.classList.add(className);
    });
    this.options.dragActiveClasses?.forEach((className) => {
      this.dropZone.classList.add(className);
    });
    this.debugLog("Applied drag over styles");
  }

  /**
   * Remove visual feedback styles
   */
  private removeDragOverStyles(): void {
    this.options.dragOverClasses?.forEach((className) => {
      this.dropZone.classList.remove(className);
    });
    this.options.dragActiveClasses?.forEach((className) => {
      this.dropZone.classList.remove(className);
    });
    this.debugLog("Removed drag over styles");
  }

  /**
   * Create a FileList-like object from File array
   * Needed because FileList is read-only and can't be constructed directly
   */
  private createFileList(files: File[]): FileList {
    const dt = new DataTransfer();
    files.forEach((file) => dt.items.add(file));
    return dt.files;
  }

  /**
   * Manually trigger file processing (useful for testing)
   */
  public simulateFileDrop(files: File[]): void {
    if (this.isProcessingCallback()) {
      showWarningToast("Please wait for current processing to complete");
      return;
    }

    const fileList = this.createFileList(files);
    this.onFilesDropped(fileList);
    this.debugLog(`Simulated drop with ${files.length} files`);
  }

  /**
   * Enable or disable debug mode
   */
  public setDebugMode(enabled: boolean): void {
    this.options.debugMode = enabled;
    this.debugLog(`Debug mode ${enabled ? "enabled" : "disabled"}`);
  }

  /**
   * Get current drag state (useful for testing)
   */
  public isDragging(): boolean {
    return this.dragCounter > 0;
  }

  /**
   * Reset drag counter (useful if drag state gets stuck)
   */
  public resetDragState(): void {
    this.dragCounter = 0;
    this.removeDragOverStyles();
    this.debugLog("Drag state reset");
  }

  /**
   * Update the callback functions
   */
  public updateCallbacks(
    onFilesDropped?: (files: FileList) => void,
    isProcessingCallback?: () => boolean,
  ): void {
    if (onFilesDropped) {
      this.onFilesDropped = onFilesDropped;
    }
    if (isProcessingCallback) {
      this.isProcessingCallback = isProcessingCallback;
    }
    this.debugLog("Callbacks updated");
  }

  /**
   * Cleanup event listeners and reset state
   * Should be called when component is destroyed
   */
  public destroy(): void {
    // Remove document-level listeners
    document.removeEventListener("dragover", (e) => e.preventDefault());
    document.removeEventListener("drop", (e) => e.preventDefault());

    // Remove drop zone listeners
    this.dropZone.removeEventListener("dragenter", this.handleDragEnter);
    this.dropZone.removeEventListener("dragleave", this.handleDragLeave);
    this.dropZone.removeEventListener("dragover", this.handleDragOver);
    this.dropZone.removeEventListener("drop", this.handleDrop);

    this.resetDragState();
    this.debugLog("DragDropHandler destroyed");
  }
}
