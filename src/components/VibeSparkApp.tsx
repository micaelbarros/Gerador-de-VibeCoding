"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, Dices, SlidersHorizontal, Sparkles, X } from "lucide-react";
import {
  AUDIENCES,
  AudienceId,
  FORMATS,
  IdeaMode,
  LEVELS,
  MODE_META,
  NICHES,
  NicheId,
  PivotAction,
  ProductFormat,
  ProjectStatus,
  SavedBlueprint,
  SkillLevel,
  TIMEFRAMES,
  TimeframeId,
  TrendFeedResponse,
  TrendSignal,
  VibeBlueprint,
  getAudienceLabel,
  getFormatLabel,
  getLevelLabel,
  getTimeframeLabel,
} from "@/lib/types";
import { BlueprintCard } from "./BlueprintCard";
import { TrendRadar } from "./TrendRadar";
import { SavedBoard } from "./SavedBoard";

type ActiveTab = "generator" | "radar" | "saved";

const STORAGE_KEY = "vibespark_saved_blueprints_v1";
const ALL_MODES: IdeaMode[] = ["money", "hackathon", "study", "challenge"];

function randomFrom<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

export function VibeSparkApp() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("generator");

  // Filters
  const [mode, setMode] = useState<IdeaMode>("money");
  const [niche, setNiche] = useState<NicheId>("all");
  const [format, setFormat] = useState<ProductFormat>("any");
  const [timeframe, setTimeframe] = useState<TimeframeId>("48h");
  const [level, setLevel] = useState<SkillLevel>("intermediate");
  const [audience, setAudience] = useState<AudienceId>("any");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [focusedTrend, setFocusedTrend] = useState<TrendSignal | null>(null);

  // Generation
  const [blueprint, setBlueprint] = useState<VibeBlueprint | null>(null);
  const [seenTrendIds, setSeenTrendIds] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Radar
  const [trendFeed, setTrendFeed] = useState<TrendFeedResponse | null>(null);
  const [isLoadingTrends, setIsLoadingTrends] = useState(false);

  // Saved
  const [saved, setSaved] = useState<SavedBlueprint[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SavedBlueprint[];
        if (Array.isArray(parsed)) setSaved(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  const persistSaved = useCallback((next: SavedBlueprint[]) => {
    setSaved(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, []);

  const fetchTrends = useCallback(async (forceRefresh = false) => {
    setIsLoadingTrends(true);
    try {
      const res = await fetch(`/api/trends${forceRefresh ? "?refresh=true" : ""}`);
      if (res.ok) {
        const data = (await res.json()) as TrendFeedResponse;
        setTrendFeed(data);
      }
    } catch {
      // ignore
    } finally {
      setIsLoadingTrends(false);
    }
  }, []);

  useEffect(() => {
    fetchTrends(false);
  }, [fetchTrends]);

  const runGenerate = useCallback(
    async (overrides?: {
      mode?: IdeaMode;
      niche?: NicheId;
      format?: ProductFormat;
      timeframe?: TimeframeId;
      level?: SkillLevel;
      audience?: AudienceId;
      focusTrendId?: string;
      pivot?: PivotAction;
      previousTitle?: string;
    }) => {
      setIsGenerating(true);
      setErrorMsg(null);

      try {
        const payload = {
          mode: overrides?.mode ?? mode,
          niche: overrides?.niche ?? niche,
          format: overrides?.format ?? format,
          timeframe: overrides?.timeframe ?? timeframe,
          level: overrides?.level ?? level,
          audience: overrides?.audience ?? audience,
          focusTrendId:
            overrides?.focusTrendId !== undefined
              ? overrides.focusTrendId
              : focusedTrend?.id,
          excludeTrendIds: overrides?.pivot ? [] : seenTrendIds.slice(-6),
          pivot: overrides?.pivot,
          previousTitle: overrides?.previousTitle,
        };

        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error("Não foi possível gerar a ideia agora.");
        }

        const data = (await res.json()) as { blueprint: VibeBlueprint };
        setBlueprint(data.blueprint);
        if (data.blueprint.sources[0]?.id) {
          setSeenTrendIds((prev) => [...prev.slice(-10), data.blueprint.sources[0].id]);
        }
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Erro ao gerar.");
      } finally {
        setIsGenerating(false);
      }
    },
    [mode, niche, format, timeframe, level, audience, focusedTrend, seenTrendIds]
  );

  function handleRoulette() {
    if (isGenerating || isSpinning) return;
    setIsSpinning(true);
    setFocusedTrend(null);

    const concreteNiches = NICHES.filter((n) => n.id !== "all").map((n) => n.id);
    const concreteFormats = FORMATS.filter((f) => f.id !== "any").map((f) => f.id);
    const allTimeframes: TimeframeId[] = ["2h", "1d", "48h", "1w"];

    let ticks = 0;
    const interval = setInterval(() => {
      ticks += 1;
      const nextMode = randomFrom(ALL_MODES);
      const nextNiche = randomFrom(concreteNiches);
      const nextFormat = randomFrom(concreteFormats);
      const nextTime = randomFrom(allTimeframes);

      setMode(nextMode);
      setNiche(nextNiche);
      setFormat(nextFormat);
      setTimeframe(nextTime);

      if (ticks >= 7) {
        clearInterval(interval);
        setIsSpinning(false);
        runGenerate({
          mode: nextMode,
          niche: nextNiche,
          format: nextFormat,
          timeframe: nextTime,
          focusTrendId: "",
        });
      }
    }, 85);
  }

  function handleGenerateFromTrend(signal: TrendSignal) {
    const suggestedMode = signal.bestModes[0] ?? mode;
    const suggestedNiche = signal.niches[0] ?? "all";
    setFocusedTrend(signal);
    setMode(suggestedMode);
    setNiche(suggestedNiche);
    setActiveTab("generator");
    runGenerate({
      mode: suggestedMode,
      niche: suggestedNiche,
      focusTrendId: signal.id,
    });
  }

  function handleToggleSave(bp: VibeBlueprint) {
    const exists = saved.some((s) => s.blueprint.id === bp.id);
    if (exists) {
      persistSaved(saved.filter((s) => s.blueprint.id !== bp.id));
    } else {
      persistSaved([
        { blueprint: bp, status: "idea", savedAt: new Date().toISOString() },
        ...saved,
      ]);
    }
  }

  function handleUpdateStatus(id: string, status: ProjectStatus) {
    persistSaved(
      saved.map((item) => (item.blueprint.id === id ? { ...item, status } : item))
    );
  }

  function handleRemoveSaved(id: string) {
    persistSaved(saved.filter((item) => item.blueprint.id !== id));
  }

  function handleOpenSaved(bp: VibeBlueprint) {
    setBlueprint(bp);
    setActiveTab("generator");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const isCurrentSaved = blueprint
    ? saved.some((s) => s.blueprint.id === blueprint.id)
    : false;

  const advancedSummary = [
    format !== "any" ? getFormatLabel(format) : null,
    getTimeframeLabel(timeframe),
    getLevelLabel(level),
    audience !== "any" ? getAudienceLabel(audience) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col">
      {/* Minimal Header */}
      <header className="border-b border-zinc-900">
        <div className="mx-auto max-w-4xl px-5 h-14 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setActiveTab("generator")}
            className="font-display text-sm font-semibold tracking-tight text-white cursor-pointer"
          >
            VibeSpark
          </button>

          <nav className="flex items-center gap-6 text-xs sm:text-sm">
            <button
              type="button"
              onClick={() => setActiveTab("generator")}
              className={`transition cursor-pointer ${
                activeTab === "generator"
                  ? "text-white font-medium"
                  : "text-zinc-500 hover:text-zinc-200"
              }`}
            >
              Gerador
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("radar")}
              className={`inline-flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === "radar"
                  ? "text-white font-medium"
                  : "text-zinc-500 hover:text-zinc-200"
              }`}
            >
              <span>Radar</span>
              {trendFeed && (
                <span className="font-mono text-[11px] text-zinc-600">
                  {trendFeed.signals.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("saved")}
              className={`inline-flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === "saved"
                  ? "text-white font-medium"
                  : "text-zinc-500 hover:text-zinc-200"
              }`}
            >
              <span>Salvos</span>
              {saved.length > 0 && (
                <span className="font-mono text-[11px] text-zinc-600">
                  {saved.length}
                </span>
              )}
            </button>
          </nav>

          <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] text-zinc-500">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                trendFeed && trendFeed.liveCount > 0 ? "bg-emerald-500" : "bg-zinc-600"
              }`}
            />
            <span>
              {trendFeed
                ? trendFeed.liveCount > 0
                  ? `${trendFeed.liveCount} ao vivo`
                  : "curado"
                : "..."}
            </span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 mx-auto w-full max-w-4xl px-5 py-12 sm:py-16">
        {activeTab === "generator" && (
          <div className="space-y-12">
            {/* Hero */}
            <section className="space-y-2.5">
              <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-white">
                Ideias atuais para vibecodar.
              </h1>
              <p className="text-sm sm:text-base text-zinc-500 max-w-xl">
                Escolha o objetivo e o nicho. Cruzamos tendências reais de hoje para montar
                seu escopo MVP e o prompt pronto.
              </p>
            </section>

            {/* Minimal Controls */}
            <section className="space-y-6">
              {/* Mode segmented control */}
              <div className="flex flex-wrap gap-1.5 border-b border-zinc-900 pb-6">
                {ALL_MODES.map((m) => {
                  const active = mode === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMode(m)}
                      className={`rounded-md px-3.5 py-2 text-xs sm:text-sm transition cursor-pointer ${
                        active
                          ? "bg-white text-black font-medium"
                          : "border border-zinc-800/80 text-zinc-400 hover:border-zinc-600 hover:text-zinc-100"
                      }`}
                    >
                      {MODE_META[m].label}
                    </button>
                  );
                })}
              </div>

              {/* Niche selector */}
              <div className="space-y-2.5">
                <div className="font-mono text-[11px] uppercase tracking-widest text-zinc-600">
                  Nicho
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {NICHES.map((n) => {
                    const active = niche === n.id;
                    return (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => setNiche(n.id)}
                        className={`rounded-full px-3 py-1 text-xs transition cursor-pointer ${
                          active
                            ? "bg-zinc-100 text-black font-medium"
                            : "border border-zinc-900 text-zinc-500 hover:border-zinc-700 hover:text-zinc-200"
                        }`}
                      >
                        {n.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Collapsible advanced filters */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setShowAdvanced((v) => !v)}
                  className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-200 transition cursor-pointer"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span>Filtros avançados</span>
                  <span className="font-mono text-[11px] text-zinc-600">
                    ({advancedSummary})
                  </span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${
                      showAdvanced ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showAdvanced && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                    <select
                      value={format}
                      onChange={(e) => setFormat(e.target.value as ProductFormat)}
                      aria-label="Formato"
                      className="rounded-md border border-zinc-800 bg-black px-3 py-2 text-xs text-zinc-300 focus:border-zinc-500 focus:outline-none"
                    >
                      {FORMATS.map((f) => (
                        <option key={f.id} value={f.id} className="bg-black">
                          {f.label}
                        </option>
                      ))}
                    </select>

                    <select
                      value={timeframe}
                      onChange={(e) => setTimeframe(e.target.value as TimeframeId)}
                      aria-label="Tempo"
                      className="rounded-md border border-zinc-800 bg-black px-3 py-2 text-xs text-zinc-300 focus:border-zinc-500 focus:outline-none"
                    >
                      {TIMEFRAMES.map((t) => (
                        <option key={t.id} value={t.id} className="bg-black">
                          {t.label}
                        </option>
                      ))}
                    </select>

                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value as SkillLevel)}
                      aria-label="Nível"
                      className="rounded-md border border-zinc-800 bg-black px-3 py-2 text-xs text-zinc-300 focus:border-zinc-500 focus:outline-none"
                    >
                      {LEVELS.map((l) => (
                        <option key={l.id} value={l.id} className="bg-black">
                          {l.label}
                        </option>
                      ))}
                    </select>

                    <select
                      value={audience}
                      onChange={(e) => setAudience(e.target.value as AudienceId)}
                      aria-label="Público"
                      className="rounded-md border border-zinc-800 bg-black px-3 py-2 text-xs text-zinc-300 focus:border-zinc-500 focus:outline-none"
                    >
                      {AUDIENCES.map((a) => (
                        <option key={a.id} value={a.id} className="bg-black">
                          {a.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Focused Trend pill */}
              {focusedTrend && (
                <div className="flex items-center justify-between gap-3 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-300">
                  <div className="min-w-0 truncate">
                    <span className="font-mono text-zinc-500 mr-2">
                      [{focusedTrend.sourceLabel}]
                    </span>
                    {focusedTrend.title}
                  </div>
                  <button
                    type="button"
                    onClick={() => setFocusedTrend(null)}
                    className="text-zinc-500 hover:text-white cursor-pointer"
                    title="Limpar tendência fixada"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* Primary Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => runGenerate()}
                  disabled={isGenerating || isSpinning}
                  className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-medium text-black hover:bg-zinc-200 transition cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
                  {isGenerating ? "Gerando..." : "Gerar ideia"}
                </button>

                <button
                  type="button"
                  onClick={handleRoulette}
                  disabled={isGenerating || isSpinning}
                  className="inline-flex items-center gap-2 rounded-md border border-zinc-800 px-4 py-2.5 text-sm text-zinc-300 hover:border-zinc-500 hover:text-white transition cursor-pointer disabled:opacity-50"
                >
                  <Dices className={`h-4 w-4 ${isSpinning ? "animate-spin" : ""}`} />
                  {isSpinning ? "Sorteando..." : "Roleta"}
                </button>
              </div>

              {errorMsg && (
                <p className="text-xs text-zinc-400 border-l-2 border-zinc-600 pl-3">
                  {errorMsg}
                </p>
              )}
            </section>

            {/* Result */}
            {blueprint && (
              <BlueprintCard
                blueprint={blueprint}
                isSaved={isCurrentSaved}
                isLoading={isGenerating}
                onToggleSave={handleToggleSave}
                onReroll={() => runGenerate({ focusTrendId: "" })}
                onPivot={(action) =>
                  runGenerate({
                    pivot: action,
                    previousTitle: blueprint.title,
                    focusTrendId: blueprint.sources[0]?.id,
                  })
                }
              />
            )}
          </div>
        )}

        {activeTab === "radar" && (
          <TrendRadar
            feed={trendFeed}
            isLoading={isLoadingTrends}
            onRefresh={() => fetchTrends(true)}
            onGenerateFromTrend={handleGenerateFromTrend}
          />
        )}

        {activeTab === "saved" && (
          <SavedBoard
            saved={saved}
            onUpdateStatus={handleUpdateStatus}
            onRemove={handleRemoveSaved}
            onOpenBlueprint={handleOpenSaved}
          />
        )}
      </main>

      <footer className="border-t border-zinc-900 py-5">
        <div className="mx-auto max-w-4xl px-5 flex items-center justify-between text-[11px] font-mono text-zinc-600">
          <span>VibeSpark</span>
          <span>Hacker News · GitHub · Reddit · Hugging Face</span>
        </div>
      </footer>
    </div>
  );
}
