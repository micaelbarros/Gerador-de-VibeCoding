"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  Bookmark,
  BookmarkCheck,
  Check,
  Copy,
  Download,
  RefreshCw,
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
  { action: "simpler", label: "Mais simples (2h)" },
  { action: "b2b", label: "Focar em B2B" },
  { action: "extension", label: "Virar extensão" },
  { action: "monetize", label: "Mais rentável" },
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
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch {
      // ignore
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
    <article className="border-t border-zinc-800 pt-10 space-y-10">
      {/* Header */}
      <header className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-xs text-zinc-500">
            <span className="text-zinc-200">{modeMeta.shortLabel}</span>
            <span>/</span>
            <span>{getNicheLabel(blueprint.niche)}</span>
            <span>/</span>
            <span>{getFormatLabel(blueprint.format)}</span>
            <span>/</span>
            <span>{getTimeframeLabel(blueprint.timeframe)}</span>
            <span>/</span>
            <span>{getLevelLabel(blueprint.level)}</span>
            <span>/</span>
            <span className="text-zinc-300">Score {blueprint.opportunityScore}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onReroll}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 px-2.5 py-1.5 text-xs text-zinc-300 hover:border-zinc-600 hover:text-white transition cursor-pointer disabled:opacity-40"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Outra
            </button>

            <button
              type="button"
              onClick={() => onToggleSave(blueprint)}
              className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs transition cursor-pointer ${
                isSaved
                  ? "border-white bg-white text-black font-medium"
                  : "border-zinc-800 text-zinc-300 hover:border-zinc-600 hover:text-white"
              }`}
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="h-3.5 w-3.5" />
                  Salvo
                </>
              ) : (
                <>
                  <Bookmark className="h-3.5 w-3.5" />
                  Salvar
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadMarkdown}
              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 px-2.5 py-1.5 text-xs text-zinc-300 hover:border-zinc-600 hover:text-white transition cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              PRD.md
            </button>
          </div>
        </div>

        <div>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            {blueprint.title}
          </h2>
          <p className="mt-2 text-base text-zinc-400 leading-relaxed max-w-2xl">
            {blueprint.tagline}
          </p>
        </div>
      </header>

      {/* Why now + Sources */}
      <section className="space-y-4">
        <h3 className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">
          Por que agora
        </h3>
        <p className="text-sm sm:text-[15px] text-zinc-300 leading-relaxed">
          {blueprint.whyNow}
        </p>

        <div className="divide-y divide-zinc-900 border-y border-zinc-900">
          {blueprint.sources.map((src) => (
            <a
              key={src.id}
              href={src.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between gap-4 py-2.5 text-sm hover:text-white transition"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-mono text-[11px] text-zinc-500 shrink-0 w-28 truncate">
                  {src.sourceLabel}
                </span>
                <span className="text-zinc-300 group-hover:text-white truncate">
                  {src.title}
                </span>
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-zinc-600 group-hover:text-white transition" />
            </a>
          ))}
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2.5">
          <h3 className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">
            Problema &amp; Público ({getAudienceLabel(blueprint.audience)})
          </h3>
          <p className="text-sm text-zinc-300 leading-relaxed">{blueprint.problem}</p>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Persona: {blueprint.targetPersona}
          </p>
        </div>

        <div className="space-y-2.5">
          <h3 className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">
            Solução
          </h3>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {blueprint.solutionSummary}
          </p>
          <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1 font-mono text-xs text-zinc-500">
            {blueprint.suggestedStack.map((tech) => (
              <span key={tech}>{tech}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Monetization */}
      <section className="border border-zinc-900 rounded-xl p-5 bg-zinc-950/60 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">
            Monetização
          </h3>
          <span className="font-mono text-xs text-zinc-300">
            Potencial: {blueprint.monetization.potential}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-sm">
          <div>
            <div className="text-xs text-zinc-500">Modelo</div>
            <div className="mt-1 text-zinc-100 font-medium">
              {blueprint.monetization.model}
            </div>
            <div className="mt-0.5 font-mono text-xs text-zinc-400">
              {blueprint.monetization.suggestedPrice}
            </div>
          </div>

          <div>
            <div className="text-xs text-zinc-500">Por que pagam</div>
            <p className="mt-1 text-zinc-300 text-xs sm:text-sm leading-relaxed">
              {blueprint.monetization.whyPeoplePay}
            </p>
          </div>

          <div>
            <div className="text-xs text-zinc-500">Primeiros clientes</div>
            <p className="mt-1 text-zinc-300 text-xs sm:text-sm leading-relaxed">
              {blueprint.monetization.firstChannel}
            </p>
          </div>
        </div>
      </section>

      {/* MVP Scope & Anti-scope */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <h3 className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">
            Escopo do MVP
          </h3>
          <ul className="space-y-2">
            {blueprint.mvpFeatures.map((feat, idx) => {
              const checked = !!checkedItems[idx];
              return (
                <li key={idx}>
                  <button
                    type="button"
                    onClick={() => toggleChecklist(idx)}
                    className={`w-full text-left flex items-start gap-2.5 text-sm leading-relaxed transition cursor-pointer ${
                      checked ? "text-zinc-600 line-through" : "text-zinc-300 hover:text-white"
                    }`}
                  >
                    <span
                      className={`mt-1 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border ${
                        checked
                          ? "border-white bg-white text-black"
                          : "border-zinc-700"
                      }`}
                    >
                      {checked && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                    </span>
                    <span>{feat}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">
            Não construir na v1
          </h3>
          <ul className="space-y-2 text-sm text-zinc-500">
            {blueprint.antiScope.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                <span className="text-zinc-700 select-none">—</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Mode note */}
      {(blueprint.hackathonHook ||
        blueprint.creativeConstraint ||
        (blueprint.learningGoals && blueprint.learningGoals.length > 0)) && (
        <section className="border-l-2 border-zinc-700 pl-4 space-y-1.5">
          <h3 className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">
            {blueprint.hackathonHook
              ? "Dica para demo (Hackathon)"
              : blueprint.creativeConstraint
                ? "Restrição criativa"
                : "Foco de aprendizado"}
          </h3>
          {blueprint.hackathonHook && (
            <p className="text-sm text-zinc-300 leading-relaxed">
              {blueprint.hackathonHook}
            </p>
          )}
          {blueprint.creativeConstraint && (
            <p className="text-sm text-zinc-300 leading-relaxed">
              {blueprint.creativeConstraint}
            </p>
          )}
          {blueprint.learningGoals && blueprint.learningGoals.length > 0 && (
            <ul className="space-y-1 text-sm text-zinc-300">
              {blueprint.learningGoals.map((g, i) => (
                <li key={i}>· {g}</li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* Pivot strip */}
      <section className="flex flex-wrap items-center gap-2 pt-2">
        <span className="font-mono text-[11px] uppercase tracking-widest text-zinc-500 mr-2">
          Pivotar:
        </span>
        {PIVOT_BUTTONS.map((btn) => (
          <button
            key={btn.action}
            type="button"
            disabled={isLoading}
            onClick={() => onPivot(btn.action)}
            className="rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-400 hover:border-zinc-500 hover:text-white transition cursor-pointer disabled:opacity-40"
          >
            {btn.label}
          </button>
        ))}
      </section>

      {/* Master Prompt */}
      <section className="border border-zinc-800 rounded-xl bg-[#050505] overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-zinc-900 px-4 py-3">
          <span className="font-mono text-xs text-zinc-400">
            Prompt Mestre para VibeCoding
          </span>

          <button
            type="button"
            onClick={handleCopyPrompt}
            className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1 text-xs font-medium text-black hover:bg-zinc-200 transition cursor-pointer"
          >
            {copiedPrompt ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copiar prompt
              </>
            )}
          </button>
        </div>

        <pre className="p-4 text-xs font-mono text-zinc-400 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
          {blueprint.masterPrompt}
        </pre>
      </section>
    </article>
  );
}
