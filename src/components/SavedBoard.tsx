"use client";

import { useState } from "react";
import { Check, Copy, Download, Trash2 } from "lucide-react";
import {
  MODE_META,
  ProjectStatus,
  SavedBlueprint,
  VibeBlueprint,
  getNicheLabel,
  getTimeframeLabel,
} from "@/lib/types";
import { blueprintToMarkdown } from "@/lib/markdown";

interface SavedBoardProps {
  saved: SavedBlueprint[];
  onUpdateStatus: (id: string, status: ProjectStatus) => void;
  onRemove: (id: string) => void;
  onOpenBlueprint: (bp: VibeBlueprint) => void;
}

const STATUS_LABELS: Record<ProjectStatus, string> = {
  idea: "Ideia",
  building: "Construindo",
  shipped: "Lançado",
};

export function SavedBoard({
  saved,
  onUpdateStatus,
  onRemove,
  onOpenBlueprint,
}: SavedBoardProps) {
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const visible =
    statusFilter === "all"
      ? saved
      : saved.filter((item) => item.status === statusFilter);

  async function handleCopyPrompt(bp: VibeBlueprint) {
    try {
      await navigator.clipboard.writeText(bp.masterPrompt);
      setCopiedId(bp.id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // ignore
    }
  }

  function handleDownload(bp: VibeBlueprint) {
    const md = blueprintToMarkdown(bp);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const slug = bp.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    a.href = url;
    a.download = `${slug || "ideia-vibecoding"}-resumo.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-white">
            Salvos
          </h1>
          <p className="text-sm text-zinc-500">
            Ideias guardadas localmente no navegador.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(["all", "idea", "building", "shipped"] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`rounded-full px-3 py-1 text-xs transition cursor-pointer ${
                statusFilter === st
                  ? "bg-white text-black font-medium"
                  : "text-zinc-500 hover:text-zinc-200"
              }`}
            >
              {st === "all" ? `Todos (${saved.length})` : STATUS_LABELS[st]}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="border-t border-zinc-900 py-16 text-center text-sm text-zinc-500">
          {saved.length === 0
            ? "Nenhuma ideia salva ainda."
            : "Nenhuma ideia com este status."}
        </div>
      ) : (
        <div className="divide-y divide-zinc-900 border-t border-zinc-900">
          {visible.map((item) => {
            const bp = item.blueprint;
            const modeMeta = MODE_META[bp.mode];
            return (
              <div
                key={bp.id}
                className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-zinc-500">
                    <span className="text-zinc-300">{modeMeta.shortLabel}</span>
                    <span>·</span>
                    <span>{getNicheLabel(bp.niche)}</span>
                    <span>·</span>
                    <span>{getTimeframeLabel(bp.timeframe)}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenBlueprint(bp)}
                    className="text-left font-display text-lg font-medium text-white hover:underline cursor-pointer"
                  >
                    {bp.title}
                  </button>

                  <p className="text-xs sm:text-sm text-zinc-500 line-clamp-1 max-w-xl">
                    {bp.tagline}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <div className="inline-flex rounded-md border border-zinc-800 p-0.5 text-[11px]">
                    {(["idea", "building", "shipped"] as ProjectStatus[]).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => onUpdateStatus(bp.id, st)}
                        className={`rounded px-2 py-1 transition cursor-pointer ${
                          item.status === st
                            ? "bg-white text-black font-medium"
                            : "text-zinc-500 hover:text-zinc-200"
                        }`}
                      >
                        {STATUS_LABELS[st]}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyPrompt(bp)}
                    title="Copiar prompt"
                    className="rounded-md border border-zinc-800 p-1.5 text-zinc-400 hover:border-zinc-600 hover:text-white transition cursor-pointer"
                  >
                    {copiedId === bp.id ? (
                      <Check className="h-3.5 w-3.5 text-white" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownload(bp)}
                    title="Baixar resumo (.md)"
                    className="rounded-md border border-zinc-800 p-1.5 text-zinc-400 hover:border-zinc-600 hover:text-white transition cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onRemove(bp.id)}
                    title="Remover"
                    className="rounded-md border border-zinc-800 p-1.5 text-zinc-500 hover:border-zinc-600 hover:text-white transition cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
