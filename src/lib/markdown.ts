import {
  VibeBlueprint,
  MODE_META,
  getNicheLabel,
  getFormatLabel,
  getTimeframeLabel,
  getLevelLabel,
  getAudienceLabel,
} from "./types";

export function blueprintToMarkdown(bp: VibeBlueprint): string {
  const modeMeta = MODE_META[bp.mode];
  const lines: string[] = [
    `# ${bp.title}`,
    "",
    `> ${bp.tagline}`,
    "",
    `- **Objetivo:** ${modeMeta.label}`,
    `- **Tema:** ${getNicheLabel(bp.niche)}`,
    `- **Formato:** ${getFormatLabel(bp.format)}`,
    `- **Tempo estimado:** ${getTimeframeLabel(bp.timeframe)}`,
    `- **Nível:** ${getLevelLabel(bp.level)}`,
    `- **Público:** ${getAudienceLabel(bp.audience)}`,
    `- **Força da oportunidade:** ${bp.opportunityScore}/100`,
    "",
    "---",
    "",
    "## Por que faz sentido agora",
    bp.whyNow,
    "",
    "### Referências do momento",
    ...bp.sources.map((s) => `- **${s.sourceLabel}**: [${s.title}](${s.url})`),
    "",
    "## Problema e para quem é",
    `**Problema:** ${bp.problem}`,
    "",
    `**Para quem é:** ${bp.targetPersona}`,
    "",
    "## Como funciona",
    bp.solutionSummary,
    "",
    "## Como pode gerar renda",
    `- **Potencial:** ${bp.monetization.potential}`,
    `- **Formato de cobrança:** ${bp.monetization.model}`,
    `- **Preço sugerido:** ${bp.monetization.suggestedPrice}`,
    `- **Onde conseguir os primeiros usuários:** ${bp.monetization.firstChannel}`,
    `- **Por que pagariam:** ${bp.monetization.whyPeoplePay}`,
    "",
    "## O que construir primeiro (versão inicial)",
    ...bp.mvpFeatures.map((f) => `- [ ] ${f}`),
    "",
    "## Deixe para depois",
    ...bp.antiScope.map((a) => `- ${a}`),
    "",
    "## Tecnologias sugeridas",
    bp.suggestedStack.map((s) => `\`${s}\``).join(" · "),
    "",
  ];

  if (bp.hackathonHook) {
    lines.push("## Como impressionar na apresentação", bp.hackathonHook, "");
  }

  if (bp.creativeConstraint) {
    lines.push("## Desafio extra", bp.creativeConstraint, "");
  }

  if (bp.learningGoals && bp.learningGoals.length > 0) {
    lines.push(
      "## O que você vai aprender",
      ...bp.learningGoals.map((g) => `- ${g}`),
      ""
    );
  }

  lines.push(
    "---",
    "",
    "## Prompt pronto para começar com IA",
    "",
    "```text",
    bp.masterPrompt,
    "```",
    ""
  );

  return lines.join("\n");
}
