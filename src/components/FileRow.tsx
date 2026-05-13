"use client";

import { Download, RotateCw, X } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { formatBytes } from "@/lib/conversion";
import type { QueuedFile } from "@/lib/types";

interface FileRowProps {
  index: number;
  file: QueuedFile;
  onDownload: (id: string) => void;
  onRetry: (id: string) => void;
  onRemove: (id: string) => void;
}

export default function FileRow({
  index,
  file,
  onDownload,
  onRetry,
  onRemove,
}: FileRowProps) {
  const isDone = file.status === "done";
  const isError = file.status === "error";
  const isConverting = file.status === "converting";

  return (
    <div
      data-status={file.status}
      className="group grid grid-cols-[2.5rem_minmax(0,1fr)_auto_auto_auto] items-center gap-3 border-b border-[var(--border)] px-4 py-3 transition-colors last:border-b-0 hover:bg-[var(--surface-hot)] sm:grid-cols-[2.5rem_minmax(0,1fr)_5rem_auto_auto]"
    >
      {/* row number */}
      <span className="font-mono text-[11px] tracking-[0.12em] text-[var(--muted-2)] tabular-nums">
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* names */}
      <div className="min-w-0 leading-tight">
        <p
          className="truncate font-mono text-[13px] text-[var(--fg)]"
          title={file.originalName}
        >
          {file.originalName}
        </p>
        <p
          className="truncate font-mono text-[10px] tracking-[0.12em] text-[var(--muted-2)] uppercase"
          title={file.downloadName}
        >
          → {file.downloadName}
        </p>
      </div>

      {/* size */}
      <span className="hidden font-mono text-[11px] tracking-[0.06em] text-[var(--muted)] tabular-nums sm:inline">
        {formatBytes(file.size)}
      </span>

      {/* status */}
      <StatusBadge status={file.status} />

      {/* actions */}
      <div className="flex items-center justify-end gap-1">
        {isDone && (
          <IconButton
            label={`Baixar ${file.downloadName}`}
            onClick={() => onDownload(file.id)}
            tone="accent"
          >
            <Download className="h-4 w-4" strokeWidth={1.75} />
          </IconButton>
        )}
        {isError && (
          <IconButton
            label="Tentar novamente"
            onClick={() => onRetry(file.id)}
            tone="warn"
          >
            <RotateCw className="h-4 w-4" strokeWidth={1.75} />
          </IconButton>
        )}
        <IconButton
          label="Remover da fila"
          onClick={() => onRemove(file.id)}
          tone="ghost"
          disabled={isConverting}
        >
          <X className="h-4 w-4" strokeWidth={1.75} />
        </IconButton>
      </div>
    </div>
  );
}

interface IconButtonProps {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  tone: "accent" | "warn" | "ghost";
  disabled?: boolean;
}

function IconButton({
  label,
  onClick,
  children,
  tone,
  disabled,
}: IconButtonProps) {
  const toneClass =
    tone === "accent"
      ? "text-[var(--amber)] hover:bg-[var(--amber)] hover:text-[var(--bg)]"
      : tone === "warn"
        ? "text-[var(--red)] hover:bg-[var(--red)] hover:text-[var(--bg)]"
        : "text-[var(--muted)] hover:text-[var(--fg)]";

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`grid h-8 w-8 place-items-center border border-transparent transition-colors hover:border-current disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-transparent disabled:hover:bg-transparent ${toneClass}`}
    >
      {children}
    </button>
  );
}
