"use client";

import { useCallback, useMemo, useState } from "react";
import {
  AlertTriangle,
  Eraser,
  FileArchive,
  Play,
  ShieldCheck,
  X,
  Zap,
} from "lucide-react";
import DropZone from "./DropZone";
import FileRow from "./FileRow";
import {
  buildDownloadName,
  convertFile,
  getBaseName,
  triggerDownload,
  validateFile,
} from "@/lib/conversion";
import type { FileStatus, QueuedFile, RejectedFile } from "@/lib/types";

const REJECTION_MESSAGE: Record<RejectedFile["reason"], string> = {
  INVALID_EXTENSION: "Apenas arquivos .skill são aceitos.",
  TOO_LARGE: "Arquivo excede o limite de 500 MB.",
};

export default function SkillDropApp() {
  const [files, setFiles] = useState<QueuedFile[]>([]);
  const [rejected, setRejected] = useState<RejectedFile[]>([]);

  const handleFiles = useCallback((incoming: FileList) => {
    setFiles((prev) => {
      const existingDownloadNames = new Set(
        prev.map((f) => f.downloadName.toLowerCase()),
      );
      const accepted: QueuedFile[] = [];
      const newRejections: RejectedFile[] = [];

      Array.from(incoming).forEach((file) => {
        const error = validateFile(file);
        if (error) {
          newRejections.push({
            id:
              typeof crypto !== "undefined" && "randomUUID" in crypto
                ? crypto.randomUUID()
                : `${file.name}-${Date.now()}-${Math.random()}`,
            name: file.name,
            reason: error,
          });
          return;
        }
        const baseName = getBaseName(file.name);
        const downloadName = buildDownloadName(
          baseName,
          existingDownloadNames,
        );
        existingDownloadNames.add(downloadName.toLowerCase());
        accepted.push({
          id:
            typeof crypto !== "undefined" && "randomUUID" in crypto
              ? crypto.randomUUID()
              : `${file.name}-${Date.now()}-${Math.random()}`,
          originalFile: file,
          originalName: file.name,
          baseName,
          downloadName,
          size: file.size,
          status: "waiting",
        });
      });

      if (newRejections.length > 0) {
        setRejected((r) => [...r, ...newRejections]);
      }

      return [...prev, ...accepted];
    });
  }, []);

  const updateStatus = useCallback(
    (id: string, patch: Partial<QueuedFile>) => {
      setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
    },
    [],
  );

  const convertOne = useCallback(
    async (file: QueuedFile) => {
      updateStatus(file.id, { status: "converting", errorMessage: undefined });
      // small artificial delay so the UI transition is perceivable for tiny files
      await new Promise((r) => setTimeout(r, 220));
      try {
        const blob = await convertFile(file.originalFile);
        updateStatus(file.id, { status: "done", convertedBlob: blob });
      } catch (e) {
        const message = e instanceof Error ? e.message : "Falha desconhecida.";
        updateStatus(file.id, {
          status: "error",
          errorMessage: message,
        });
      }
    },
    [updateStatus],
  );

  const convertAll = useCallback(async () => {
    // snapshot ids that need work (waiting or error)
    const targets = files.filter(
      (f) => f.status === "waiting" || f.status === "error",
    );
    for (const f of targets) {
      // refetch the latest from state inside the loop is unnecessary because
      // convertFile only needs the originalFile, which is immutable.
      await convertOne(f);
    }
  }, [files, convertOne]);

  const retryOne = useCallback(
    (id: string) => {
      const target = files.find((f) => f.id === id);
      if (target) convertOne(target);
    },
    [files, convertOne],
  );

  const downloadOne = useCallback(
    (id: string) => {
      const file = files.find((f) => f.id === id);
      if (!file) return;
      if (!file.convertedBlob) {
        // not converted yet — convert then download
        (async () => {
          await convertOne(file);
          // re-read latest blob from a fresh closure
          setFiles((prev) => {
            const fresh = prev.find((p) => p.id === id);
            if (fresh && fresh.convertedBlob) {
              try {
                triggerDownload(fresh.convertedBlob, fresh.downloadName);
              } catch {
                return prev.map((p) =>
                  p.id === id
                    ? {
                        ...p,
                        status: "error" as FileStatus,
                        errorMessage: "Falha ao iniciar download.",
                      }
                    : p,
                );
              }
            }
            return prev;
          });
        })();
        return;
      }
      try {
        triggerDownload(file.convertedBlob, file.downloadName);
      } catch {
        updateStatus(id, {
          status: "error",
          errorMessage: "Falha ao iniciar download.",
        });
      }
    },
    [files, convertOne, updateStatus],
  );

  const removeOne = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setFiles([]);
    setRejected([]);
  }, []);

  const dismissRejection = useCallback((id: string) => {
    setRejected((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const stats = useMemo(() => {
    return {
      total: files.length,
      waiting: files.filter((f) => f.status === "waiting").length,
      converting: files.filter((f) => f.status === "converting").length,
      done: files.filter((f) => f.status === "done").length,
      error: files.filter((f) => f.status === "error").length,
    };
  }, [files]);

  const hasPending = stats.waiting > 0 || stats.error > 0;
  const isWorking = stats.converting > 0;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-5 py-10 sm:px-8 sm:py-14">
      {/* HEADER */}
      <header className="mb-10">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.22em] text-[var(--muted-2)] uppercase">
            <span aria-hidden className="h-2 w-2 bg-[var(--green)]" />
            <span>Sistema · Online</span>
          </div>
          <div className="font-mono text-[10px] tracking-[0.22em] text-[var(--muted-2)] uppercase">
            v01.0 · Local-Only
          </div>
        </div>

        <div className="flex items-end justify-between gap-6">
          <div className="flex items-baseline gap-3">
            <FileArchive
              className="h-9 w-9 shrink-0 text-[var(--amber)]"
              strokeWidth={1.5}
              aria-hidden
            />
            <div>
              <h1 className="font-display text-5xl leading-none tracking-[-0.02em] text-[var(--fg)] uppercase sm:text-6xl">
                Skill<span className="text-[var(--amber)]">Drop</span>
              </h1>
              <p className="mt-2 font-mono text-[11px] tracking-[0.22em] text-[var(--muted)] uppercase">
                .skill <span aria-hidden>→</span> .zip · conversor client-side
              </p>
            </div>
          </div>
        </div>

        <div
          aria-hidden
          className="mt-8 h-[3px]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-45deg, var(--amber) 0 8px, #0a0a0a 8px 16px)",
          }}
        />
      </header>

      {/* PRIVACY STRIP */}
      <div className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-2 border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 font-mono text-[10px] tracking-[0.2em] text-[var(--muted)] uppercase">
        <span className="inline-flex items-center gap-2 text-[var(--green)]">
          <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2} />
          Nada sai do seu dispositivo
        </span>
        <span aria-hidden>·</span>
        <span>Sem backend</span>
        <span aria-hidden>·</span>
        <span>Sem login</span>
        <span aria-hidden>·</span>
        <span>Sem histórico</span>
      </div>

      {/* DROPZONE */}
      <section aria-labelledby="dz-label" className="mb-8">
        <SectionLabel id="dz-label" code="01" title="Upload" />
        <DropZone onFiles={handleFiles} />
      </section>

      {/* REJECTIONS */}
      {rejected.length > 0 && (
        <section aria-label="Arquivos rejeitados" className="mb-8 space-y-2">
          {rejected.map((r) => (
            <div
              key={r.id}
              role="alert"
              className="flex items-center gap-3 border border-[var(--red)] bg-[var(--red-faint)] px-4 py-2.5 font-mono text-[12px] text-[var(--fg)]"
            >
              <AlertTriangle
                className="h-4 w-4 shrink-0 text-[var(--red)]"
                strokeWidth={2}
              />
              <span className="flex-1 truncate">
                <span className="text-[var(--muted)]">{r.name} —</span>{" "}
                {REJECTION_MESSAGE[r.reason]}
              </span>
              <button
                type="button"
                onClick={() => dismissRejection(r.id)}
                aria-label="Dispensar aviso"
                className="grid h-7 w-7 place-items-center text-[var(--muted)] hover:text-[var(--fg)]"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            </div>
          ))}
        </section>
      )}

      {/* QUEUE */}
      <section
        aria-labelledby="queue-label"
        className="mb-8 flex-1 min-h-0"
      >
        <div className="flex items-center justify-between gap-3">
          <SectionLabel
            id="queue-label"
            code="02"
            title="Fila"
            extra={`[${String(stats.total).padStart(2, "0")} arquivos]`}
          />

          {stats.total > 0 && (
            <div className="hidden gap-4 font-mono text-[10px] tracking-[0.18em] text-[var(--muted-2)] uppercase sm:flex">
              <Stat label="Pronto" value={stats.done} tone="green" />
              <Stat label="Conv." value={stats.converting} tone="amber" />
              <Stat label="Espera" value={stats.waiting} tone="muted" />
              {stats.error > 0 && (
                <Stat label="Erro" value={stats.error} tone="red" />
              )}
            </div>
          )}
        </div>

        <div className="border border-[var(--border)] bg-[var(--surface)]">
          {files.length === 0 ? (
            <EmptyQueue />
          ) : (
            files.map((f, i) => (
              <FileRow
                key={f.id}
                index={i}
                file={f}
                onDownload={downloadOne}
                onRetry={retryOne}
                onRemove={removeOne}
              />
            ))
          )}
        </div>
      </section>

      {/* ACTIONS */}
      <section className="mb-12 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={clearAll}
          disabled={files.length === 0 && rejected.length === 0}
          className="group inline-flex items-center justify-center gap-2 border border-[var(--border-strong)] bg-transparent px-5 py-3 font-mono text-[11px] tracking-[0.22em] text-[var(--muted)] uppercase transition-colors hover:border-[var(--red)] hover:text-[var(--red)] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-[var(--border-strong)] disabled:hover:text-[var(--muted)]"
        >
          <Eraser className="h-4 w-4" strokeWidth={1.75} />
          Limpar tudo
        </button>

        <button
          type="button"
          onClick={convertAll}
          disabled={!hasPending || isWorking}
          aria-busy={isWorking}
          className="group relative inline-flex items-center justify-center gap-2 border border-[var(--amber)] bg-[var(--amber)] px-6 py-3 font-mono text-[12px] tracking-[0.22em] text-[var(--bg)] uppercase transition-colors hover:bg-[var(--amber-hover)] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-[var(--amber)]"
        >
          {isWorking ? (
            <>
              <Zap className="h-4 w-4 animate-pulse" strokeWidth={2.5} />
              Convertendo {stats.converting}/{stats.waiting + stats.converting + stats.error}
            </>
          ) : (
            <>
              <Play className="h-4 w-4 fill-current" strokeWidth={2.5} />
              Converter todos
              {hasPending ? ` (${stats.waiting + stats.error})` : ""}
            </>
          )}
        </button>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-[var(--border)] pt-6">
        <div className="flex flex-col gap-2 font-mono text-[10px] tracking-[0.22em] text-[var(--muted-2)] uppercase sm:flex-row sm:items-center sm:justify-between">
          <p>
            <span className="text-[var(--muted)]">// build</span>{" "}
            skilldrop.local · personal-tool
          </p>
          <p>
            FileReader API <span aria-hidden>+</span> Blob <span aria-hidden>+</span> URL.createObjectURL
          </p>
        </div>
      </footer>
    </div>
  );
}

function SectionLabel({
  id,
  code,
  title,
  extra,
}: {
  id?: string;
  code: string;
  title: string;
  extra?: string;
}) {
  return (
    <h2
      id={id}
      className="mb-3 flex items-baseline gap-3 font-mono text-[11px] tracking-[0.22em] text-[var(--muted)] uppercase"
    >
      <span className="text-[var(--amber)]">{code}</span>
      <span aria-hidden className="text-[var(--border-strong)]">
        /
      </span>
      <span className="text-[var(--fg)]">{title}</span>
      {extra && (
        <span className="ml-auto text-[10px] text-[var(--muted-2)]">
          {extra}
        </span>
      )}
    </h2>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "green" | "amber" | "muted" | "red";
}) {
  const color =
    tone === "green"
      ? "text-[var(--green)]"
      : tone === "amber"
        ? "text-[var(--amber)]"
        : tone === "red"
          ? "text-[var(--red)]"
          : "text-[var(--muted)]";
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className={`tabular-nums ${color}`}>
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[var(--muted-2)]">{label}</span>
    </span>
  );
}

function EmptyQueue() {
  return (
    <div className="grid place-items-center gap-2 px-4 py-10 text-center">
      <p className="font-mono text-[11px] tracking-[0.22em] text-[var(--muted-2)] uppercase">
        // fila vazia
      </p>
      <p className="font-mono text-[12px] text-[var(--muted)]">
        Solte arquivos .skill na zona de upload acima.
      </p>
    </div>
  );
}
