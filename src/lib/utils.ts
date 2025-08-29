/**
 * Normalize filename for CSV export
 * Removes commas, periods, and replaces multiple spaces with underscores
 */
export function normalizeFileName(filename: string): string {
  return filename
    .replace(/[,\.]/g, "") // Remove commas and periods
    .replace(/\s+/g, "_") // Replace multiple spaces with underscore
    .trim(); // Remove leading/trailing spaces
}

/**
 * Generate time-based hexadecimal string for unique filenames
 */
export function generateTimeBasedHex(): string {
  const now = new Date();

  const year = now.getFullYear() % 100;
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const secondFraction = Math.floor(
    (now.getSeconds() * 1000 + now.getMilliseconds()) / ((1000 * 60) / 256),
  );

  const combined =
    (year << 20) | (month << 16) | (day << 11) | (hour << 6) | minute;

  return (
    combined.toString(16).padStart(6, "0") +
    secondFraction.toString(16).padStart(2, "0")
  );
}

/**
 * Generate default filename for exports
 */
export function generateDefaultFilename(): string {
  return `SimpleProofHashList_${generateTimeBasedHex()}`;
}

/**
 * Extract name and extension from filename
 */
export function getFileNameAndExtension(filename: string): [string, string] {
  const lastDotIndex = filename.lastIndexOf(".");
  if (lastDotIndex === -1) return [normalizeFileName(filename), ""];

  const name = filename.substring(0, lastDotIndex);
  const extension = filename.substring(lastDotIndex + 1);

  return [normalizeFileName(name), extension];
}

/**
 * Get responsive items per page based on screen size
 */
export function getDefaultItemsPerPage(): number {
  return window.innerWidth < 768 ? 10 : 50; // 10 for mobile, 50 for desktop
}
