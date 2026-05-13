import JSZip from "jszip";
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
 * Detects a single redundant root folder that wraps every entry.
 *
 * Returns the prefix (e.g. `"foo/"`) when every entry inside the zip lives
 * under the same single top-level directory. Returns `null` otherwise.
 *
 * Works even when the source zip has no explicit directory entries, because
 * it inspects each entry's first path segment rather than relying on
 * `endsWith('/')` markers.
 */
export function detectRedundantRoot(entries: string[]): string | null {
  if (entries.length === 0) return null;

  let prefix: string | null = null;
  for (const entry of entries) {
    // Strip a trailing slash so an explicit folder entry like "foo/" still
    // contributes "foo" as its first segment.
    const slash = entry.indexOf("/");
    if (slash === -1) {
      // file at the root → no single-root structure to strip
      return null;
    }
    const firstDir = entry.slice(0, slash + 1);
    if (prefix === null) {
      prefix = firstDir;
    } else if (prefix !== firstDir) {
      // entries diverge → multiple top-level items
      return null;
    }
  }
  return prefix;
}

/**
 * Reads a `.skill` file, parses it as a zip, and returns a new `.zip` Blob.
 *
 * If the zip wraps everything inside a single root folder (a common
 * structural quirk in `.skill` files), that folder is stripped so the
 * resulting zip extracts cleanly without the extra nesting.
 *
 * 100% client-side: no network, no upload.
 */
export async function convertFile(file: File): Promise<Blob> {
  const buffer = await file.arrayBuffer();
  const source = await JSZip.loadAsync(buffer);

  const entries = Object.keys(source.files);
  const prefix = detectRedundantRoot(entries);

  const out = new JSZip();

  for (const path of entries) {
    // Skip the root folder entry itself when stripping a prefix
    if (prefix && path === prefix) continue;

    const newPath = prefix ? path.slice(prefix.length) : path;
    if (!newPath) continue;

    const entry = source.files[path];
    if (entry.dir) {
      // Preserve empty folders by registering them explicitly.
      out.folder(newPath.replace(/\/$/, ""));
    } else {
      const content = await entry.async("uint8array");
      out.file(newPath, content, {
        date: entry.date,
        comment: entry.comment,
        unixPermissions: entry.unixPermissions,
        dosPermissions: entry.dosPermissions,
      });
    }
  }

  return out.generateAsync({
    type: "blob",
    mimeType: "application/zip",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
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
