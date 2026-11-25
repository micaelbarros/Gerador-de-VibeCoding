"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Flame,
  Radio,
  RefreshCw,
  Search,
  Sparkles,
} from "lucide-react";
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
  { id: "all", label: "Todas as fontes" },
  { id: "hackernews", label: "Hacker News" },
  { id: "github", label: "GitHub Trending" },
  { id: "reddit", label: "Reddit (Dores)" },
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
    <div className="space-y-5">
      {/* Header status bar */}
      <div className="surface-card rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-emerald-400 animate-live-dot" />
            <h2 className="font-display text-xl font-bold text-white">
              Radar de Tendências Ao Vivo
            </h2>
          </div>
          <p className="text-sm text-zinc-400">
            Sinais coletados em tempo real de{" "}
            <span className="text-zinc-200 font-medium">
              {feed?.sourcesActive.join(", ") || "Hacker News, GitHub, Reddit e Hugging Face"}
            </span>
            . Clique em qualquer sinal para gerar um Blueprint baseado nele.
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-4 py-2.5 text-sm font-semibold text-emerald-200 hover:bg-emerald-500/25 transition cursor-pointer disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          {isLoading ? "Coletando sinais..." : "Atualizar Scraping"}
        </button>
      </div>

      {/* Filters */}
      <div className="surface-subtle rounded-2xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="h-4 w-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filtrar tendências por palavra-chave (ex: ai, saas, health, chrome)..."
              className="w-full rounded-xl border border-white/10 bg-black/35 pl-9 pr-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-amber-400/50 focus:outline-none"
            />
          </div>

          <select
            value={nicheFilter}
            onChange={(e) => setNicheFilter(e.target.value as NicheId)}
            className="rounded-xl border border-white/10 bg-[#10141d] px-3 py-2 text-sm text-zinc-100 focus:border-amber-400/50 focus:outline-none"
          >
            {NICHES.map((n) => (
              <option key={n.id} value={n.id}>
                {n.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          {SOURCE_FILTERS.map((sf) => (
            <button
              key={sf.id}
              type="button"
              onClick={() => setSourceFilter(sf.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium border transition cursor-pointer ${
                sourceFilter === sf.id
                  ? "border-amber-400/50 bg-amber-400/15 text-amber-200"
                  : "border-white/8 bg-white/[0.03] text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {sf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of signals */}
      {isLoading && !feed ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="surface-card rounded-2xl p-5 h-44 animate-pulse bg-white/[0.03]"
            />
          ))}
        </div>
      ) : filteredSignals.length === 0 ? (
        <div className="surface-card rounded-2xl p-10 text-center text-zinc-400 text-sm">
          Nenhuma tendência encontrada com esses filtros. Tente limpar a busca ou mudar o nicho.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSignals.map((sig) => (
            <div
              key={sig.id}
              className="surface-card rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-amber-400/30 transition"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-amber-300">{sig.sourceLabel}</span>
                    {sig.isLive ? (
                      <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-medium text-emerald-300">
                        AO VIVO
                      </span>
                    ) : (
                      <span className="rounded bg-zinc-700/60 px-1.5 py-0.5 text-[10px] font-medium text-zinc-300">
                        CURADO
                      </span>
                    )}
                  </div>

                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 text-[11px] font-mono text-amber-300">
                    <Flame className="h-3 w-3" />
                    {sig.heatScore}
                  </span>
                </div>

                <h3 className="font-display text-base font-semibold text-zinc-100 leading-snug">
                  {sig.title}
                </h3>

                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed line-clamp-3">
                  {sig.summary}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {sig.niches.map((n) => (
                    <span
                      key={n}
                      className="rounded-md bg-white/5 border border-white/8 px-2 py-0.5 text-[11px] text-zinc-300"
                    >
                      {getNicheLabel(n)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/6">
                <a
                  href={sig.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition"
                >
                  Abrir fonte
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>

                <button
                  type="button"
                  onClick={() => onGenerateFromTrend(sig)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-amber-400/15 border border-amber-400/35 px-3 py-1.5 text-xs font-semibold text-amber-200 hover:bg-amber-400 hover:text-zinc-950 transition cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Vibecodar essa tendência
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
