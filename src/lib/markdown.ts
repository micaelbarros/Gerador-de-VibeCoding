import { VibeBlueprint, MODE_META, getNicheLabel, getFormatLabel, getTimeframeLabel, getLevelLabel, getAudienceLabel } from "./types";

export function blueprintToMarkdown(bp: VibeBlueprint): string {
  const modeMeta = MODE_META[bp.mode];
  const lines: string[] = [
    `# ${bp.title}`,
    "",
    `> ${bp.tagline}`,
    "",
    `- **Modo:** ${modeMeta.label}`,
    `- **Nicho:** ${getNicheLabel(bp.niche)}`,
    `- **Formato:** ${getFormatLabel(bp.format)}`,
    `- **Tempo Estimado:** ${getTimeframeLabel(bp.timeframe)}`,
    `- **Nível:** ${getLevelLabel(bp.level)}`,
    `- **Público-alvo:** ${getAudienceLabel(bp.audience)}`,
    `- **Score de Oportunidade:** ${bp.opportunityScore}/100`,
    "",
    "---",
    "",
    "## Por que agora? (Tendência Real)",
    bp.whyNow,
    "",
    "### Fontes coletadas",
    ...bp.sources.map((s) => `- **${s.sourceLabel}** (${s.heatScore}/100): [${s.title}](${s.url})`),
    "",
    "## Problema & Público-alvo",
    `**Dor:** ${bp.problem}`,
    "",
    `**Persona:** ${bp.targetPersona}`,
    "",
    "## Solução Proposta",
    bp.solutionSummary,
    "",
    "## Potencial de Monetização",
    `- **Potencial:** ${bp.monetization.potential}`,
    `- **Modelo:** ${bp.monetization.model}`,
    `- **Ticket Sugerido:** ${bp.monetization.suggestedPrice}`,
    `- **Primeiro Canal de Aquisição:** ${bp.monetization.firstChannel}`,
    `- **Por que pagariam:** ${bp.monetization.whyPeoplePay}`,
    "",
    "## Escopo do MVP (Construa só isso primeiro)",
    ...bp.mvpFeatures.map((f) => `- [ ] ${f}`),
    "",
    "## O que NÃO construir na v1 (Anti-Escopo)",
    ...bp.antiScope.map((a) => `- ❌ ${a}`),
    "",
    "## Stack Recomendada",
    bp.suggestedStack.map((s) => `\`${s}\``).join(" · "),
    "",
  ];

  if (bp.hackathonHook) {
    lines.push("## Diferencial para Demo / Hackathon", bp.hackathonHook, "");
  }

  if (bp.creativeConstraint) {
    lines.push("## Restrição Criativa do Desafio", bp.creativeConstraint, "");
  }

  if (bp.learningGoals && bp.learningGoals.length > 0) {
    lines.push("## O que você vai dominar construindo isso", ...bp.learningGoals.map((g) => `- ${g}`), "");
  }

  lines.push(
    "---",
    "",
    "## Prompt Mestre para VibeCoding",
    "",
    "```text",
    bp.masterPrompt,
    "```",
    ""
  );

  return lines.join("\n");
}
