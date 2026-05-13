"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, FileArchive } from "lucide-react";

interface DropZoneProps {
  onFiles: (files: FileList) => void;
}

export default function DropZone({ onFiles }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const handleClick = () => inputRef.current?.click();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFiles(e.target.files);
      // reset so same file can be re-selected later
      e.target.value = "";
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current = 0;
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        onFiles(e.dataTransfer.files);
      }
    },
    [onFiles],
  );

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Solte arquivos .skill aqui ou clique para selecionar"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      data-dragging={isDragging}
      className="group relative block w-full cursor-pointer select-none border border-[var(--border)] bg-[var(--surface)] p-10 text-left transition-colors outline-none focus-visible:border-[var(--amber)] data-[dragging=true]:border-[var(--amber)] data-[dragging=true]:bg-[var(--surface-hot)]"
    >
      {/* corner brackets */}
      <CornerBrackets active={isDragging} />

      {/* hazard stripes — visible only on drag */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1 transition-opacity duration-200"
        style={{
          opacity: isDragging ? 1 : 0,
          backgroundImage:
            "repeating-linear-gradient(-45deg, var(--amber) 0 8px, #0a0a0a 8px 16px)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1 transition-opacity duration-200"
        style={{
          opacity: isDragging ? 1 : 0,
          backgroundImage:
            "repeating-linear-gradient(-45deg, var(--amber) 0 8px, #0a0a0a 8px 16px)",
        }}
      />

      <div className="flex flex-col items-center gap-5 py-6 text-center">
        <div className="relative">
          <div
            className="grid h-16 w-16 place-items-center border border-[var(--border)] bg-[var(--bg)] transition-colors group-hover:border-[var(--amber)] group-data-[dragging=true]:border-[var(--amber)]"
            aria-hidden
          >
            {isDragging ? (
              <FileArchive
                className="h-7 w-7 text-[var(--amber)]"
                strokeWidth={1.5}
              />
            ) : (
              <Upload
                className="h-7 w-7 text-[var(--muted)] transition-colors group-hover:text-[var(--amber)]"
                strokeWidth={1.5}
              />
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="font-display text-2xl tracking-[0.04em] text-[var(--fg)] uppercase">
            {isDragging ? "Liberar para Enfileirar" : "Solte arquivos .skill"}
          </p>
          <p className="font-mono text-[11px] tracking-[0.2em] text-[var(--muted)] uppercase">
            {isDragging
              ? "// captura armada"
              : "// ou clique para selecionar"}
          </p>
        </div>

        <div className="mt-2 flex items-center gap-4 font-mono text-[10px] tracking-[0.18em] text-[var(--muted-2)] uppercase">
          <span>[ .skill ]</span>
          <span aria-hidden>·</span>
          <span>[ max 500 mb ]</span>
          <span aria-hidden>·</span>
          <span>[ multi-arquivo ]</span>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".skill"
        multiple
        onChange={handleInputChange}
        className="sr-only"
        aria-hidden
        tabIndex={-1}
      />
    </div>
  );
}

function CornerBrackets({ active }: { active: boolean }) {
  const color = active ? "var(--amber)" : "var(--border-strong)";
  const size = "h-4 w-4";
  return (
    <>
      <span
        aria-hidden
        className={`pointer-events-none absolute top-2 left-2 ${size}`}
        style={{
          borderTop: `2px solid ${color}`,
          borderLeft: `2px solid ${color}`,
          transition: "border-color 150ms ease",
        }}
      />
      <span
        aria-hidden
        className={`pointer-events-none absolute top-2 right-2 ${size}`}
        style={{
          borderTop: `2px solid ${color}`,
          borderRight: `2px solid ${color}`,
          transition: "border-color 150ms ease",
        }}
      />
      <span
        aria-hidden
        className={`pointer-events-none absolute bottom-2 left-2 ${size}`}
        style={{
          borderBottom: `2px solid ${color}`,
          borderLeft: `2px solid ${color}`,
          transition: "border-color 150ms ease",
        }}
      />
      <span
        aria-hidden
        className={`pointer-events-none absolute right-2 bottom-2 ${size}`}
        style={{
          borderBottom: `2px solid ${color}`,
          borderRight: `2px solid ${color}`,
          transition: "border-color 150ms ease",
        }}
      />
    </>
  );
}
