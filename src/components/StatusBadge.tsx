import { Loader2 } from "lucide-react";
import type { FileStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: FileStatus;
}

const LABELS: Record<FileStatus, string> = {
  waiting: "Aguardando",
  converting: "Convertendo",
  done: "Pronto",
  error: "Erro",
};

const COLORS: Record<FileStatus, { text: string; border: string; bg: string }> =
  {
    waiting: {
      text: "text-[var(--muted)]",
      border: "border-[var(--border-strong)]",
      bg: "bg-transparent",
    },
    converting: {
      text: "text-[var(--amber)]",
      border: "border-[var(--amber)]",
      bg: "bg-[var(--amber-faint)]",
    },
    done: {
      text: "text-[var(--green)]",
      border: "border-[var(--green)]",
      bg: "bg-[var(--green-faint)]",
    },
    error: {
      text: "text-[var(--red)]",
      border: "border-[var(--red)]",
      bg: "bg-[var(--red-faint)]",
    },
  };

export default function StatusBadge({ status }: StatusBadgeProps) {
  const c = COLORS[status];
  return (
    <span
      data-status={status}
      className={`inline-flex items-center gap-1.5 border px-2 py-0.5 font-mono text-[10px] tracking-[0.18em] uppercase ${c.text} ${c.border} ${c.bg}`}
    >
      <span aria-hidden className="opacity-60">
        [
      </span>
      {status === "converting" && (
        <Loader2 className="h-3 w-3 animate-spin" strokeWidth={2.5} />
      )}
      {status === "done" && (
        <span
          aria-hidden
          className="block h-1.5 w-1.5 bg-[var(--green)]"
          style={{ boxShadow: "0 0 6px var(--green)" }}
        />
      )}
      {status === "error" && (
        <span aria-hidden className="block h-1.5 w-1.5 bg-[var(--red)]" />
      )}
      {status === "waiting" && (
        <span
          aria-hidden
          className="block h-1.5 w-1.5 border border-[var(--muted)]"
        />
      )}
      {LABELS[status]}
      <span aria-hidden className="opacity-60">
        ]
      </span>
    </span>
  );
}
