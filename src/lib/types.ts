export type FileStatus = "waiting" | "converting" | "done" | "error";

export interface QueuedFile {
  id: string;
  originalFile: File;
  originalName: string;
  baseName: string;
  downloadName: string;
  size: number;
  status: FileStatus;
  convertedBlob?: Blob;
  errorMessage?: string;
}

export type RejectionReason = "INVALID_EXTENSION" | "TOO_LARGE";

export interface RejectedFile {
  id: string;
  name: string;
  reason: RejectionReason;
}
