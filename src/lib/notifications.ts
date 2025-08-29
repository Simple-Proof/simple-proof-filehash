import type { ToastType } from "./types";

/**
 * Show a toast notification to the user
 */
export function showToast(message: string, type: ToastType = "info"): void {
  const toast = document.createElement("div");
  const colors = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-yellow-500",
    info: "bg-primary",
  };

  toast.className = `fixed bottom-4 right-4 ${colors[type]} text-white px-4 py-2 rounded-md shadow-md z-50 toast-${type}`;
  toast.innerText = message;
  document.body.appendChild(toast);

  setTimeout(
    () => {
      toast.classList.add("opacity-0", "transition-opacity", "duration-300");
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    },
    type === "error" ? 4000 : 2000,
  );
}

/**
 * Show success toast notification
 */
export function showSuccessToast(message: string): void {
  showToast(message, "success");
}

/**
 * Show error toast notification
 */
export function showErrorToast(message: string): void {
  showToast(message, "error");
}

/**
 * Show warning toast notification
 */
export function showWarningToast(message: string): void {
  showToast(message, "warning");
}
