import type { RejectionReason } from "./types";

export const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500 MB
export const ALLOWED_EXTENSION = ".skill";

/**
 * Validates a user-supplied file. Returns null if valid, otherwise a
 * machine-readable rejection reason.
 */
export function validateFile(file: File): RejectionReason | null {
  if (!file.name.toLowerCase().endsWith(ALLOWED_EXTENSION)) {
    return "INVALID_EXTENSION";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "TOO_LARGE";
  }
  return null;
}

/**
 * Strips the .skill extension from a filename (case-insensitive).
 */
export function getBaseName(filename: string): string {
  return filename.replace(/\.skill$/i, "");
}

/**
 * Returns a download name like `foo.zip`, `foo (1).zip`, ... that does not
 * collide with anything already in `existingNames`.
 *
 * `existingNames` should contain lowercased download names.
 */
export function buildDownloadName(
  baseName: string,
  existingNames: Set<string>,
): string {
  let candidate = `${baseName}.zip`;
  let counter = 1;
  while (existingNames.has(candidate.toLowerCase())) {
    candidate = `${baseName} (${counter}).zip`;
    counter++;
  }
  return candidate;
}

/**
 * Reads the file fully into memory and returns a fresh Blob with the same
 * bytes, typed as a zip. No content transformation happens — `.skill` is
 * already a zip, this only changes how the OS labels it.
 */
export async function convertFile(file: File): Promise<Blob> {
  const buffer = await file.arrayBuffer();
  return new Blob([buffer], { type: "application/zip" });
}

/**
 * Forces a browser download of `blob` with the given filename.
 */
export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // revoke after a tick so the download has time to start
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Pretty-prints a byte count.
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(k)),
    units.length - 1,
  );
  const value = bytes / Math.pow(k, i);
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}
