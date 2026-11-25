"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  Bookmark,
  BookmarkCheck,
  Check,
  CheckCircle2,
  Copy,
  Download,
  Flame,
  GraduationCap,
  Layers,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Wand2,
  Zap,
} from "lucide-react";
import {
  MODE_META,
  PivotAction,
  VibeBlueprint,
  getAudienceLabel,
  getFormatLabel,
  getLevelLabel,
  getNicheLabel,
  getTimeframeLabel,
} from "@/lib/types";
import { blueprintToMarkdown } from "@/lib/markdown";

interface BlueprintCardProps {
  blueprint: VibeBlueprint;
  isSaved: boolean;
  isLoading: boolean;
  onToggleSave: (bp: VibeBlueprint) => void;
  onReroll: () => void;
  onPivot: (action: PivotAction) => void;
}

const PIVOT_BUTTONS: { action: PivotAction; label: string }[] = [
  { action: "simpler", label: "Deixar mais simples (2h)" },
  { action: "b2b", label: "Focar em B2B / PMEs" },
  { action: "extension", label: "Virar Extensão de Chrome" },
  { action: "monetize", label: "Maximizar Monetização" },
];

export function BlueprintCard({
  blueprint,
  isSaved,
  isLoading,
  onToggleSave,
  onReroll,
  onPivot,
}: BlueprintCardProps) {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  const modeMeta = MODE_META[blueprint.mode];

  async function handleCopyPrompt() {
    try {
      await navigator.clipboard.writeText(blueprint.masterPrompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2200);
    } catch {
      // fallback silencioso
    }
  }

  function handleDownloadMarkdown() {
    const md = blueprintToMarkdown(blueprint);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const slug = blueprint.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    a.href = url;
    a.download = `${slug || "vibe-blueprint"}-PRD.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function toggleChecklist(idx: number) {
    setCheckedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  }

  return (
    <article className="surface-card rounded-2xl p-5 sm:p-7 shadow-2xl shadow-black/40 transition-all">
      {/* Top badges + Score */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/8 pb-5">
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${modeMeta.badgeBg}`}>
              <Sparkles className="h-3.5 w-3.5" />
              {modeMeta.label}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-zinc-200">
              {getNicheLabel(blueprint.niche)}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-zinc-300">
              {getFormatLabel(blueprint.format)}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-zinc-400">
              {getTimeframeLabel(blueprint.timeframe)}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-zinc-400">
              {getLevelLabel(blueprint.level)}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-zinc-400">
              {getAudienceLabel(blueprint.audience)}
            </span>
          </div>

          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {blueprint.title}
            </h2>
            <p className="mt-1.5 text-sm sm:text-base text-zinc-300 leading-relaxed">
              {blueprint.tagline}
            </p>
          </div>
        </div>

        {/* Opportunity meter */}
        <div className="flex items-center gap-3 self-start rounded-xl border border-amber-400/20 bg-amber-400/8 px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-400/15 text-amber-300">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-amber-200/75 font-medium">
              Tração & Momento
            </div>
            <div className="font-display text-2xl font-bold text-amber-300 leading-none mt-0.5">
              {blueprint.opportunityScore}
              <span className="text-xs font-normal text-amber-200/60">/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onReroll}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-white/6 px-3.5 py-2 text-xs font-medium text-zinc-100 hover:bg-white/12 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Sortear outra
          </button>

          <button
            type="button"
            onClick={() => onToggleSave(blueprint)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-medium transition cursor-pointer ${
              isSaved
                ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-200"
                : "border-white/12 bg-white/6 text-zinc-100 hover:bg-white/12"
            }`}
          >
            {isSaved ? (
              <>
                <BookmarkCheck className="h-3.5 w-3.5" />
                Salvo no Quadro
              </>
            ) : (
              <>
                <Bookmark className="h-3.5 w-3.5" />
                Salvar Ideia
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadMarkdown}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-white/6 px-3.5 py-2 text-xs font-medium text-zinc-100 hover:bg-white/12 transition cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Exportar PRD.md
          </button>
        </div>

        <span className="text-[11px] font-mono text-zinc-400">
          Motor:{" "}
          <span className="text-zinc-200">
            {blueprint.engine === "gemini"
              ? "Gemini + Sinais Reais"
              : blueprint.engine === "openai"
                ? "OpenAI + Sinais Reais"
                : "Híbrido + Sinais Reais"}
          </span>
        </span>
      </div>

      {/* Main grid */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Por que agora + Fontes */}
        <section className="lg:col-span-7 surface-subtle rounded-xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-300">
            <TrendingUp className="h-4 w-4" />
            Por que agora? (Tendências Reais)
          </div>
          <p className="text-sm text-zinc-200 leading-relaxed">{blueprint.whyNow}</p>

          <div className="pt-2 space-y-2">
            <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
              Sinais coletados que inspiraram este Blueprint
            </div>
            <div className="space-y-2">
              {blueprint.sources.map((src) => (
                <a
                  key={src.id}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start justify-between gap-3 rounded-lg border border-white/6 bg-black/25 px-3 py-2.5 hover:border-amber-400/35 hover:bg-black/40 transition"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                      <span className="font-semibold text-amber-300">{src.sourceLabel}</span>
                      <span>•</span>
                      <span>Tração {src.heatScore}/100</span>
                      {src.isLive && (
                        <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] text-emerald-300">
                          AO VIVO
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-xs sm:text-sm font-medium text-zinc-100 group-hover:text-amber-200 line-clamp-1">
                      {src.title}
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-zinc-500 group-hover:text-amber-300 mt-1" />
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Monetização */}
        <section className="lg:col-span-5 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-300">
              <Target className="h-4 w-4" />
              Retorno & Monetização
            </div>
            <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-200">
              {blueprint.monetization.potential}
            </span>
          </div>

          <div className="space-y-2.5 text-sm">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-emerald-200/60">
                Modelo & Ticket Sugerido
              </div>
              <div className="font-semibold text-zinc-100 mt-0.5">
                {blueprint.monetization.model}
              </div>
              <div className="text-emerald-300 font-mono text-xs mt-0.5">
                {blueprint.monetization.suggestedPrice}
              </div>
            </div>

            <div>
              <div className="text-[11px] uppercase tracking-wider text-emerald-200/60">
                Por que pagariam?
              </div>
              <p className="text-xs sm:text-sm text-zinc-200 mt-0.5 leading-relaxed">
                {blueprint.monetization.whyPeoplePay}
              </p>
            </div>

            <div>
              <div className="text-[11px] uppercase tracking-wider text-emerald-200/60">
                Primeiros 10 clientes / usuários
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 mt-0.5 leading-relaxed">
                {blueprint.monetization.firstChannel}
              </p>
            </div>
          </div>
        </section>

        {/* Problema & Solução */}
        <section className="lg:col-span-6 surface-subtle rounded-xl p-4 sm:p-5 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Problema & Público-Alvo
          </div>
          <p className="text-sm text-zinc-200 leading-relaxed">{blueprint.problem}</p>
          <div className="rounded-lg border border-white/6 bg-white/[0.03] px-3 py-2 text-xs text-zinc-300">
            <span className="font-semibold text-zinc-100">Persona ideal: </span>
            {blueprint.targetPersona}
          </div>
        </section>

        <section className="lg:col-span-6 surface-subtle rounded-xl p-4 sm:p-5 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Solução & Stack Sugerida
          </div>
          <p className="text-sm text-zinc-200 leading-relaxed">{blueprint.solutionSummary}</p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {blueprint.suggestedStack.map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center gap-1 rounded-md border border-sky-400/20 bg-sky-400/10 px-2.5 py-1 font-mono text-[11px] text-sky-200"
              >
                <Layers className="h-3 w-3 opacity-75" />
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* MVP Features */}
        <section className="lg:col-span-7 surface-subtle rounded-xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            Escopo Cirúrgico do MVP (clique para marcar)
          </div>
          <ul className="space-y-2">
            {blueprint.mvpFeatures.map((feat, idx) => {
              const checked = !!checkedItems[idx];
              return (
                <li key={idx}>
                  <button
                    type="button"
                    onClick={() => toggleChecklist(idx)}
                    className={`w-full text-left flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition cursor-pointer ${
                      checked
                        ? "border-emerald-500/30 bg-emerald-500/10 text-zinc-400 line-through"
                        : "border-white/6 bg-black/20 text-zinc-200 hover:border-white/15"
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] ${
                        checked
                          ? "border-emerald-400 bg-emerald-400 text-black"
                          : "border-zinc-500"
                      }`}
                    >
                      {checked && <Check className="h-3 w-3 stroke-[3]" />}
                    </span>
                    <span>{feat}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Anti-Scope */}
        <section className="lg:col-span-5 surface-subtle rounded-xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-300">
            <ShieldAlert className="h-4 w-4" />
            O que NÃO construir na v1
          </div>
          <ul className="space-y-2 text-sm text-zinc-300">
            {blueprint.antiScope.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 rounded-lg border border-rose-500/15 bg-rose-500/[0.04] px-3 py-2"
              >
                <span className="text-rose-400 font-bold leading-5">×</span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Mode-specific callouts */}
      {blueprint.hackathonHook && (
        <div className="mt-4 rounded-xl border border-amber-400/25 bg-amber-400/10 p-4 flex items-start gap-3">
          <Trophy className="h-5 w-5 text-amber-300 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-200">
              Roteiro Uau para Demo de Hackathon (90s)
            </div>
            <p className="mt-1 text-sm text-amber-50/90 leading-relaxed">
              {blueprint.hackathonHook}
            </p>
          </div>
        </div>
      )}

      {blueprint.creativeConstraint && (
        <div className="mt-4 rounded-xl border border-rose-400/25 bg-rose-400/10 p-4 flex items-start gap-3">
          <Zap className="h-5 w-5 text-rose-300 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-rose-200">
              Restrição Criativa do Desafio
            </div>
            <p className="mt-1 text-sm text-rose-50/90 leading-relaxed">
              {blueprint.creativeConstraint}
            </p>
          </div>
        </div>
      )}

      {blueprint.learningGoals && blueprint.learningGoals.length > 0 && (
        <div className="mt-4 rounded-xl border border-sky-400/25 bg-sky-400/10 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-200">
            <GraduationCap className="h-4 w-4 text-sky-300" />
            O que você vai dominar neste estudo
          </div>
          <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-sky-50/90">
            {blueprint.learningGoals.map((goal, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-sky-300">→</span>
                <span>{goal}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Pivot bar */}
      <div className="mt-6 rounded-xl border border-white/8 bg-white/[0.02] p-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
          <Wand2 className="h-3.5 w-3.5 text-amber-300" />
          Pivotar ou adaptar esta ideia
        </div>
        <div className="flex flex-wrap gap-2">
          {PIVOT_BUTTONS.map((btn) => (
            <button
              key={btn.action}
              type="button"
              disabled={isLoading}
              onClick={() => onPivot(btn.action)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:border-amber-400/40 hover:bg-amber-400/10 hover:text-amber-200 transition cursor-pointer disabled:opacity-50"
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Master VibeCoding Prompt */}
      <div className="mt-6 rounded-xl border border-amber-400/25 bg-[#090b10] overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/8 bg-white/[0.03] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-200">
              Prompt Mestre — Cole na sua IA de VibeCoding
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopyPrompt}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
              copiedPrompt
                ? "bg-emerald-400 text-zinc-950"
                : "bg-amber-400 text-zinc-950 hover:bg-amber-300"
            }`}
          >
            {copiedPrompt ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Prompt Copiado!
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copiar Prompt
              </>
            )}
          </button>
        </div>

        <pre className="p-4 text-xs sm:text-[13px] font-mono text-zinc-300 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
          {blueprint.masterPrompt}
        </pre>
      </div>
    </article>
  );
}
