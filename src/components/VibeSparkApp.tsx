"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Bookmark,
  BookOpen,
  Dices,
  DollarSign,
  Flame,
  Radio,
  Sparkles,
  Trophy,
  X,
  Zap,
} from "lucide-react";
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
} from "@/lib/types";
import { BlueprintCard } from "./BlueprintCard";
import { TrendRadar } from "./TrendRadar";
import { SavedBoard } from "./SavedBoard";

type ActiveTab = "generator" | "radar" | "saved";

const STORAGE_KEY = "vibespark_saved_blueprints_v1";

const MODE_CARDS: {
  id: IdeaMode;
  icon: typeof DollarSign;
  ringActive: string;
  iconBg: string;
}[] = [
  {
    id: "money",
    icon: DollarSign,
    ringActive: "border-emerald-400/60 bg-emerald-500/12 shadow-lg shadow-emerald-950/40",
    iconBg: "bg-emerald-500/15 text-emerald-300",
  },
  {
    id: "hackathon",
    icon: Trophy,
    ringActive: "border-amber-400/60 bg-amber-500/12 shadow-lg shadow-amber-950/40",
    iconBg: "bg-amber-500/15 text-amber-300",
  },
  {
    id: "study",
    icon: BookOpen,
    ringActive: "border-sky-400/60 bg-sky-500/12 shadow-lg shadow-sky-950/40",
    iconBg: "bg-sky-500/15 text-sky-300",
  },
  {
    id: "challenge",
    icon: Zap,
    ringActive: "border-rose-400/60 bg-rose-500/12 shadow-lg shadow-rose-950/40",
    iconBg: "bg-rose-500/15 text-rose-300",
  },
];

function randomFrom<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

export function VibeSparkApp() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("generator");

  // Filter state
  const [mode, setMode] = useState<IdeaMode>("money");
  const [niche, setNiche] = useState<NicheId>("all");
  const [format, setFormat] = useState<ProductFormat>("any");
  const [timeframe, setTimeframe] = useState<TimeframeId>("48h");
  const [level, setLevel] = useState<SkillLevel>("intermediate");
  const [audience, setAudience] = useState<AudienceId>("any");
  const [focusedTrend, setFocusedTrend] = useState<TrendSignal | null>(null);

  // Generation state
  const [blueprint, setBlueprint] = useState<VibeBlueprint | null>(null);
  const [seenTrendIds, setSeenTrendIds] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Radar state
  const [trendFeed, setTrendFeed] = useState<TrendFeedResponse | null>(null);
  const [isLoadingTrends, setIsLoadingTrends] = useState(false);

  // Saved blueprints (localStorage)
  const [saved, setSaved] = useState<SavedBlueprint[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SavedBlueprint[];
        if (Array.isArray(parsed)) setSaved(parsed);
      }
    } catch {
      // ignore localStorage errors
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
      // mantém estado atual se falhar
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
        setErrorMsg(err instanceof Error ? err.message : "Erro ao gerar Blueprint.");
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
    const allModes: IdeaMode[] = ["money", "hackathon", "study", "challenge"];
    const allTimeframes: TimeframeId[] = ["2h", "1d", "48h", "1w"];

    let ticks = 0;
    const interval = setInterval(() => {
      ticks += 1;
      const nextMode = randomFrom(allModes);
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
    }, 95);
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

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-white/8 bg-[#0a0c10]/85 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-emerald-400 text-zinc-950 shadow-lg shadow-amber-500/20">
              <Sparkles className="h-5 w-5 stroke-[2.3]" />
            </div>
            <div>
              <div className="font-display text-lg font-bold tracking-tight text-white leading-none">
                VibeSpark
              </div>
              <div className="text-[11px] text-zinc-400 leading-none mt-1">
                Gerador de VibeCoding
              </div>
            </div>
          </div>

          {/* Navigation tabs */}
          <nav className="flex items-center gap-1 rounded-xl border border-white/8 bg-white/[0.03] p-1">
            <button
              type="button"
              onClick={() => setActiveTab("generator")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition cursor-pointer ${
                activeTab === "generator"
                  ? "bg-amber-400 text-zinc-950 font-semibold"
                  : "text-zinc-300 hover:text-white"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Gerador
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("radar")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition cursor-pointer ${
                activeTab === "radar"
                  ? "bg-amber-400 text-zinc-950 font-semibold"
                  : "text-zinc-300 hover:text-white"
              }`}
            >
              <Radio className="h-3.5 w-3.5" />
              Radar
              {trendFeed && (
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                    activeTab === "radar"
                      ? "bg-black/15 text-zinc-950"
                      : "bg-emerald-500/20 text-emerald-300"
                  }`}
                >
                  {trendFeed.signals.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("saved")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition cursor-pointer ${
                activeTab === "saved"
                  ? "bg-amber-400 text-zinc-950 font-semibold"
                  : "text-zinc-300 hover:text-white"
              }`}
            >
              <Bookmark className="h-3.5 w-3.5" />
              Salvos
              {saved.length > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                    activeTab === "saved"
                      ? "bg-black/15 text-zinc-950"
                      : "bg-white/10 text-zinc-200"
                  }`}
                >
                  {saved.length}
                </span>
              )}
            </button>
          </nav>

          {/* Live radar indicator */}
          <div className="hidden md:flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-live-dot" />
            {trendFeed ? (
              <span>
                {trendFeed.liveCount > 0
                  ? `${trendFeed.liveCount} sinais ao vivo`
                  : "Modo curado ativo"}
              </span>
            ) : (
              <span>Conectando radar...</span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-8 sm:py-10">
        {activeTab === "generator" && (
          <div className="space-y-8">
            {/* Hero intro */}
            <section className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-200">
                <Flame className="h-3.5 w-3.5" />
                Conectado ao Hacker News, GitHub Trending, Reddit & Hugging Face
              </div>
              <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white leading-[1.08]">
                Pare de encarar a tela em branco.{" "}
                <span className="bg-gradient-to-r from-amber-300 via-amber-200 to-emerald-300 bg-clip-text text-transparent">
                  Sorteie ideias reais
                </span>{" "}
                para vibecodar hoje.
              </h1>
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                Escolha se quer lucro, hackathon, estudo ou um desafio rápido. O VibeSpark
                cruza tendências raspadas hoje com o nicho selecionado e entrega o Blueprint
                completo + Prompt Mestre pronto para colar na sua IA.
              </p>
            </section>

            {/* Configurator Panel */}
            <section className="surface-card rounded-2xl p-5 sm:p-6 space-y-6">
              {/* 1. Mode Selection */}
              <div className="space-y-2.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  1. Qual é o seu objetivo agora?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {MODE_CARDS.map((card) => {
                    const meta = MODE_META[card.id];
                    const Icon = card.icon;
                    const active = mode === card.id;
                    return (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => setMode(card.id)}
                        className={`text-left rounded-xl border p-4 transition cursor-pointer ${
                          active
                            ? card.ringActive
                            : "border-white/8 bg-white/[0.02] hover:border-white/18 hover:bg-white/[0.04]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.iconBg}`}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          {active && (
                            <span className="h-2 w-2 rounded-full bg-white" />
                          )}
                        </div>
                        <div className="mt-3 font-display text-sm font-bold text-white">
                          {meta.label}
                        </div>
                        <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                          {meta.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Niche Pills */}
              <div className="space-y-2.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  2. Filtrar por nicho / setor
                </label>
                <div className="flex flex-wrap gap-2">
                  {NICHES.map((n) => {
                    const active = niche === n.id;
                    return (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => setNiche(n.id)}
                        className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition cursor-pointer ${
                          active
                            ? "border-amber-400 bg-amber-400 text-zinc-950 font-semibold"
                            : "border-white/10 bg-white/[0.03] text-zinc-300 hover:border-white/25 hover:text-white"
                        }`}
                      >
                        {n.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Fine-tuning selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Formato
                  </label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as ProductFormat)}
                    className="w-full rounded-xl border border-white/10 bg-[#10141d] px-3 py-2.5 text-sm text-zinc-100 focus:border-amber-400/60 focus:outline-none"
                  >
                    {FORMATS.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Tempo disponível
                  </label>
                  <select
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value as TimeframeId)}
                    className="w-full rounded-xl border border-white/10 bg-[#10141d] px-3 py-2.5 text-sm text-zinc-100 focus:border-amber-400/60 focus:outline-none"
                  >
                    {TIMEFRAMES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Nível técnico
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as SkillLevel)}
                    className="w-full rounded-xl border border-white/10 bg-[#10141d] px-3 py-2.5 text-sm text-zinc-100 focus:border-amber-400/60 focus:outline-none"
                  >
                    {LEVELS.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Público-alvo
                  </label>
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value as AudienceId)}
                    className="w-full rounded-xl border border-white/10 bg-[#10141d] px-3 py-2.5 text-sm text-zinc-100 focus:border-amber-400/60 focus:outline-none"
                  >
                    {AUDIENCES.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Focused Trend pill if user selected one from Radar */}
              {focusedTrend && (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2.5 text-xs text-emerald-100">
                  <div className="min-w-0 truncate">
                    <span className="font-semibold text-emerald-300">
                      Tendência fixada ({focusedTrend.sourceLabel}):
                    </span>{" "}
                    {focusedTrend.title}
                  </div>
                  <button
                    type="button"
                    onClick={() => setFocusedTrend(null)}
                    className="shrink-0 rounded-md p-1 hover:bg-white/10 cursor-pointer"
                    title="Remover tendência fixada"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* Primary CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => runGenerate()}
                  disabled={isGenerating || isSpinning}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 px-6 py-3.5 text-sm sm:text-base font-bold text-zinc-950 shadow-lg shadow-amber-500/20 hover:from-amber-300 hover:to-amber-200 transition cursor-pointer disabled:opacity-60"
                >
                  <Sparkles className={`h-5 w-5 ${isGenerating ? "animate-spin" : ""}`} />
                  {isGenerating
                    ? "Sintetizando Vibe Blueprint..."
                    : "Gerar Vibe Blueprint"}
                </button>

                <button
                  type="button"
                  onClick={handleRoulette}
                  disabled={isGenerating || isSpinning}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-400/35 bg-emerald-500/12 px-5 py-3.5 text-sm font-semibold text-emerald-200 hover:bg-emerald-500/22 transition cursor-pointer disabled:opacity-60"
                >
                  <Dices className={`h-5 w-5 ${isSpinning ? "animate-spin" : ""}`} />
                  {isSpinning ? "Girando roleta..." : "Roleta (Me Surpreenda)"}
                </button>
              </div>

              {errorMsg && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {errorMsg}
                </div>
              )}
            </section>

            {/* Generated Result or Empty State */}
            {blueprint ? (
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
            ) : (
              <section className="surface-subtle rounded-2xl p-8 sm:p-10 text-center space-y-3 border-dashed border-white/12">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/12 text-amber-300">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-semibold text-white">
                  Pronto para sua próxima ideia de VibeCoding
                </h3>
                <p className="mx-auto max-w-lg text-sm text-zinc-400">
                  Clique em <strong className="text-zinc-200">Gerar Vibe Blueprint</strong> para
                  cruzar as tendências reais de hoje com seus filtros — ou aperte{" "}
                  <strong className="text-emerald-300">Roleta (Me Surpreenda)</strong> para um
                  sorteio aleatório instantâneo.
                </p>
              </section>
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

      {/* Footer */}
      <footer className="border-t border-white/6 py-6 text-center text-xs text-zinc-500">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>VibeSpark — Gerador de Ideias para VibeCoding</span>
          <span>
            Dica: adicione <code className="font-mono text-zinc-400">GEMINI_API_KEY</code> ou{" "}
            <code className="font-mono text-zinc-400">OPENAI_API_KEY</code> no{" "}
            <code className="font-mono text-zinc-400">.env.local</code> para síntese com LLM.
          </span>
        </div>
      </footer>
    </div>
  );
}
