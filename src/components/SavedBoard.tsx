"use client";

import { useState } from "react";
import {
  Bookmark,
  Check,
  Copy,
  Download,
  ExternalLink,
  Rocket,
  Trash2,
  Wrench,
  Lightbulb,
} from "lucide-react";
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

const STATUS_META: Record<
  ProjectStatus,
  { label: string; color: string; icon: typeof Lightbulb }
> = {
  idea: {
    label: "Ideia",
    color: "border-zinc-500/40 bg-zinc-500/15 text-zinc-200",
    icon: Lightbulb,
  },
  building: {
    label: "Vibecodando",
    color: "border-amber-400/40 bg-amber-400/15 text-amber-200",
    icon: Wrench,
  },
  shipped: {
    label: "Lançado",
    color: "border-emerald-400/40 bg-emerald-400/15 text-emerald-200",
    icon: Rocket,
  },
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
    a.download = `${slug || "vibe-blueprint"}-PRD.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <div className="surface-card rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bookmark className="h-4 w-4 text-amber-400" />
            <h2 className="font-display text-xl font-bold text-white">
              Meu Quadro de VibeCoding
            </h2>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Suas ideias salvas localmente no navegador. Acompanhe do brainstorm até o deploy.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(["all", "idea", "building", "shipped"] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition cursor-pointer ${
                statusFilter === st
                  ? "border-amber-400/50 bg-amber-400/15 text-amber-200"
                  : "border-white/10 bg-white/[0.03] text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {st === "all" ? `Todos (${saved.length})` : STATUS_META[st].label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="surface-card rounded-2xl p-12 text-center space-y-2">
          <div className="text-zinc-200 font-medium">
            {saved.length === 0
              ? "Nenhuma ideia salva ainda."
              : "Nenhuma ideia nesse status."}
          </div>
          <p className="text-sm text-zinc-400">
            Gere um Vibe Blueprint na aba principal e clique em &ldquo;Salvar Ideia&rdquo; para montar seu backlog.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visible.map((item) => {
            const bp = item.blueprint;
            const modeMeta = MODE_META[bp.mode];
            return (
              <div
                key={bp.id}
                className="surface-card rounded-2xl p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className={`rounded-full border px-2 py-0.5 ${modeMeta.badgeBg}`}>
                        {modeMeta.shortLabel}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-zinc-300">
                        {getNicheLabel(bp.niche)}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-zinc-400">
                        {getTimeframeLabel(bp.timeframe)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemove(bp.id)}
                      title="Remover"
                      className="text-zinc-500 hover:text-rose-400 transition p-1 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div>
                    <h3 className="font-display text-lg font-bold text-white">
                      {bp.title}
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-zinc-400 line-clamp-2">
                      {bp.tagline}
                    </p>
                  </div>

                  {/* Status selector */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(["idea", "building", "shipped"] as ProjectStatus[]).map((st) => {
                      const meta = STATUS_META[st];
                      const Icon = meta.icon;
                      const active = item.status === st;
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => onUpdateStatus(bp.id, st)}
                          className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition cursor-pointer ${
                            active
                              ? meta.color
                              : "border-white/8 bg-white/[0.02] text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          <Icon className="h-3 w-3" />
                          {meta.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/8">
                  <button
                    type="button"
                    onClick={() => onOpenBlueprint(bp)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-amber-300 hover:text-amber-200 cursor-pointer"
                  >
                    Abrir Blueprint
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyPrompt(bp)}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-200 hover:bg-white/10 cursor-pointer"
                    >
                      {copiedId === bp.id ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          Prompt
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownload(bp)}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-200 hover:bg-white/10 cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5" />
                      PRD.md
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
