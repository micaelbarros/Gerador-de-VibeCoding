"use client";

import { useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight, RefreshCw, Search } from "lucide-react";
import {
  NICHES,
  NicheId,
  TrendFeedResponse,
  TrendSignal,
  TrendSource,
  getNicheLabel,
} from "@/lib/types";

interface TrendRadarProps {
  feed: TrendFeedResponse | null;
  isLoading: boolean;
  onRefresh: () => void;
  onGenerateFromTrend: (signal: TrendSignal) => void;
}

const SOURCE_FILTERS: { id: TrendSource | "all"; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "hackernews", label: "Hacker News" },
  { id: "github", label: "GitHub" },
  { id: "reddit", label: "Reddit" },
  { id: "huggingface", label: "Hugging Face" },
];

export function TrendRadar({
  feed,
  isLoading,
  onRefresh,
  onGenerateFromTrend,
}: TrendRadarProps) {
  const [sourceFilter, setSourceFilter] = useState<TrendSource | "all">("all");
  const [nicheFilter, setNicheFilter] = useState<NicheId>("all");
  const [query, setQuery] = useState("");

  const filteredSignals = useMemo(() => {
    const signals = feed?.signals ?? [];
    const q = query.trim().toLowerCase();
    return signals.filter((s) => {
      if (sourceFilter !== "all" && s.source !== sourceFilter) return false;
      if (nicheFilter !== "all" && !s.niches.includes(nicheFilter)) return false;
      if (q && !`${s.title} ${s.summary} ${s.tags.join(" ")}`.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [feed, sourceFilter, nicheFilter, query]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-white">
            Radar de tendências
          </h1>
          <p className="text-sm text-zinc-500">
            Fontes ativas: {feed?.sourcesActive.join(" · ") || "carregando..."}
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-md border border-zinc-800 px-3.5 py-2 text-xs font-medium text-zinc-300 hover:border-zinc-600 hover:text-white transition cursor-pointer disabled:opacity-40 self-start"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          {isLoading ? "Atualizando..." : "Atualizar"}
        </button>
      </div>

      {/* Controls */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="h-3.5 w-3.5 text-zinc-600 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar tendência..."
              className="w-full rounded-md border border-zinc-800 bg-black pl-9 pr-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none"
            />
          </div>

          <select
            value={nicheFilter}
            onChange={(e) => setNicheFilter(e.target.value as NicheId)}
            className="rounded-md border border-zinc-800 bg-black px-3 py-2 text-sm text-zinc-300 focus:border-zinc-500 focus:outline-none"
          >
            {NICHES.map((n) => (
              <option key={n.id} value={n.id} className="bg-black text-zinc-200">
                {n.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {SOURCE_FILTERS.map((sf) => (
            <button
              key={sf.id}
              type="button"
              onClick={() => setSourceFilter(sf.id)}
              className={`rounded-full px-3 py-1 text-xs transition cursor-pointer ${
                sourceFilter === sf.id
                  ? "bg-white text-black font-medium"
                  : "text-zinc-500 hover:text-zinc-200"
              }`}
            >
              {sf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Minimal feed list */}
      {isLoading && !feed ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 border-b border-zinc-900 animate-pulse" />
          ))}
        </div>
      ) : filteredSignals.length === 0 ? (
        <p className="py-12 text-center text-sm text-zinc-500">
          Nenhuma tendência encontrada para esse filtro.
        </p>
      ) : (
        <div className="divide-y divide-zinc-900 border-t border-zinc-900">
          {filteredSignals.map((sig) => (
            <div
              key={sig.id}
              className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-zinc-500">
                  <span className="text-zinc-300">{sig.sourceLabel}</span>
                  <span>·</span>
                  <span>Score {sig.heatScore}</span>
                  {sig.niches.slice(0, 2).map((n) => (
                    <span key={n}>· {getNicheLabel(n)}</span>
                  ))}
                </div>

                <a
                  href={sig.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1.5 text-sm sm:text-base font-medium text-zinc-100 hover:text-white"
                >
                  <span>{sig.title}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-zinc-600 group-hover:text-zinc-300" />
                </a>

                <p className="text-xs sm:text-sm text-zinc-500 line-clamp-2 max-w-2xl">
                  {sig.summary}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onGenerateFromTrend(sig)}
                className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-white hover:bg-white hover:text-black transition cursor-pointer shrink-0 self-start sm:self-center"
              >
                Gerar ideia
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
