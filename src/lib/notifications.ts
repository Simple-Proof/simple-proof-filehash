import type { ToastType } from "./types";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  element: HTMLDivElement;
  timeoutId?: number;
}

class ToastManager {
  private toasts: Toast[] = [];
  private container: HTMLDivElement | null = null;
  private readonly maxToasts = 5;
  private readonly defaultDuration = 2000;
  private readonly errorDuration = 4000;

  constructor() {
    this.initContainer();
  }

  private initContainer(): void {
    if (typeof document === "undefined") return;

    this.container = document.getElementById(
      "toast-container",
    ) as HTMLDivElement;

    if (!this.container) {
      this.container = document.createElement("div");
      this.container.id = "toast-container";
      this.container.className =
        "fixed bottom-4 right-4 z-50 flex flex-col-reverse gap-2 pointer-events-none";
      this.container.style.cssText =
        "max-width: 420px; width: calc(100vw - 2rem);";
      document.body.appendChild(this.container);
    }
  }

  private generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private createToastElement(message: string, type: ToastType): HTMLDivElement {
    const toast = document.createElement("div");
    toast.className = `toast-item pointer-events-auto transform transition-all duration-300 ease-out 
      translate-y-0 opacity-0 scale-95 shadow-lg rounded-lg px-4 py-3 flex items-start gap-3 
      backdrop-blur-sm`;

    const colors = {
      success: "bg-green-500/95 text-white",
      error: "bg-red-500/95 text-white",
      warning: "bg-yellow-500/95 text-gray-900",
      info: "bg-primary/95 text-white",
    };

    const icons = {
      success: `<svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
      </svg>`,
      error: `<svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
      </svg>`,
      warning: `<svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
      </svg>`,
      info: `<svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>`,
    };

    toast.classList.add(...colors[type].split(" "));

    toast.innerHTML = `
      ${icons[type]}
      <div class="flex-1 text-sm font-medium leading-relaxed">${message}</div>
      <button class="toast-close flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity focus:outline-none ml-2">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    `;

    return toast;
  }

  private removeToast(toastId: string): void {
    const toastIndex = this.toasts.findIndex((t) => t.id === toastId);
    if (toastIndex === -1) return;

    const toast = this.toasts[toastIndex];

    if (toast.timeoutId) {
      clearTimeout(toast.timeoutId);
    }

    toast.element.style.transform = "translateX(400px)";
    toast.element.style.opacity = "0";
    toast.element.style.maxHeight = "0px";
    toast.element.style.marginBottom = "0px";
    toast.element.style.paddingTop = "0px";
    toast.element.style.paddingBottom = "0px";

    setTimeout(() => {
      if (this.container && this.container.contains(toast.element)) {
        this.container.removeChild(toast.element);
      }
      this.toasts.splice(toastIndex, 1);
    }, 300);
  }

  public show(message: string, type: ToastType = "info"): string {
    if (!this.container) {
      this.initContainer();
    }

    if (this.toasts.length >= this.maxToasts) {
      this.removeToast(this.toasts[0].id);
    }

    const id = this.generateId();
    const element = this.createToastElement(message, type);
    element.setAttribute("data-toast-id", id);

    const closeButton = element.querySelector(".toast-close");
    if (closeButton) {
      closeButton.addEventListener("click", () => this.removeToast(id));
    }

    this.container?.appendChild(element);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        element.style.opacity = "1";
        element.style.transform = "translateY(0) scale(1)";
      });
    });

    const duration =
      type === "error" ? this.errorDuration : this.defaultDuration;
    const timeoutId = window.setTimeout(() => {
      this.removeToast(id);
    }, duration);

    const toast: Toast = { id, message, type, element, timeoutId };
    this.toasts.push(toast);

    return id;
  }

  public dismiss(toastId: string): void {
    this.removeToast(toastId);
  }

  public dismissAll(): void {
    [...this.toasts].forEach((toast) => this.removeToast(toast.id));
  }
}

const toastManager = new ToastManager();

/**
 * Show a toast notification to the user
 */
export function showToast(message: string, type: ToastType = "info"): string {
  return toastManager.show(message, type);
}

/**
 * Show success toast notification
 */
export function showSuccessToast(message: string): string {
  return toastManager.show(message, "success");
}

/**
 * Show error toast notification
 */
export function showErrorToast(message: string): string {
  return toastManager.show(message, "error");
}

/**
 * Show warning toast notification
 */
export function showWarningToast(message: string): string {
  return toastManager.show(message, "warning");
}

/**
 * Show info toast notification
 */
export function showInfoToast(message: string): string {
  return toastManager.show(message, "info");
}

/**
 * Dismiss a specific toast by ID
 */
export function dismissToast(toastId: string): void {
  toastManager.dismiss(toastId);
}

/**
 * Dismiss all active toasts
 */
export function dismissAllToasts(): void {
  toastManager.dismissAll();
}
