export type IdeaMode = "money" | "hackathon" | "study" | "challenge";

export type NicheId =
  | "all"
  | "education"
  | "health"
  | "finance"
  | "productivity"
  | "devtools"
  | "ecommerce"
  | "creators"
  | "local"
  | "entertainment"
  | "sustainability";

export type ProductFormat =
  | "any"
  | "webapp"
  | "extension"
  | "bot"
  | "ai-agent"
  | "mobile"
  | "cli";

export type TimeframeId = "2h" | "1d" | "48h" | "1w";

export type SkillLevel = "beginner" | "intermediate" | "advanced";

export type AudienceId = "any" | "b2c" | "b2b" | "creators" | "devs";

export type TrendSource =
  | "tabnews"
  | "hackernews"
  | "reddit"
  | "github"
  | "huggingface"
  | "curated";

export type PivotAction = "simpler" | "b2b" | "extension" | "monetize";

export interface TrendSignal {
  id: string;
  title: string;
  originalTitle?: string;
  summary: string;
  url: string;
  source: TrendSource;
  sourceLabel: string;
  score: number;
  heatScore: number;
  tags: string[];
  niches: Exclude<NicheId, "all">[];
  bestModes: IdeaMode[];
  fetchedAt: string;
  isLive: boolean;
}

export interface TrendFeedResponse {
  signals: TrendSignal[];
  updatedAt: string;
  liveCount: number;
  sourcesActive: string[];
  fromCache: boolean;
}

export interface GenerateRequest {
  mode: IdeaMode;
  niche: NicheId;
  format: ProductFormat;
  timeframe: TimeframeId;
  level: SkillLevel;
  audience: AudienceId;
  focusTrendId?: string;
  excludeTrendIds?: string[];
  pivot?: PivotAction;
  previousTitle?: string;
}

export interface MonetizationPlan {
  potential: "Alto" | "Muito Alto" | "Médio" | "Opcional (Estudo)";
  model: string;
  suggestedPrice: string;
  firstChannel: string;
  whyPeoplePay: string;
}

export interface VibeBlueprint {
  id: string;
  title: string;
  tagline: string;
  mode: IdeaMode;
  niche: Exclude<NicheId, "all">;
  format: Exclude<ProductFormat, "any">;
  timeframe: TimeframeId;
  level: SkillLevel;
  audience: Exclude<AudienceId, "any">;
  opportunityScore: number;
  whyNow: string;
  problem: string;
  targetPersona: string;
  solutionSummary: string;
  monetization: MonetizationPlan;
  mvpFeatures: string[];
  antiScope: string[];
  suggestedStack: string[];
  creativeConstraint?: string;
  hackathonHook?: string;
  learningGoals?: string[];
  masterPrompt: string;
  sources: TrendSignal[];
  engine: "gemini" | "openai" | "hybrid-live";
  generatedAt: string;
}

export type ProjectStatus = "idea" | "building" | "shipped";

export interface SavedBlueprint {
  blueprint: VibeBlueprint;
  status: ProjectStatus;
  savedAt: string;
}

export const MODE_META: Record<
  IdeaMode,
  {
    label: string;
    shortLabel: string;
    description: string;
  }
> = {
  money: {
    label: "Retorno Financeiro",
    shortLabel: "Renda",
    description: "Projetos pensados para resolver dores reais e gerar receita.",
  },
  hackathon: {
    label: "Hackathon",
    shortLabel: "Hackathon",
    description: "Ideias de alto impacto visual para apresentar em 24h a 48h.",
  },
  study: {
    label: "Estudo & Portfólio",
    shortLabel: "Estudo",
    description: "Projetos práticos para aprender tecnologia e mostrar no portfólio.",
  },
  challenge: {
    label: "Desafio Rápido",
    shortLabel: "Desafio",
    description: "Projetos curtos com uma restrição criativa para testar habilidades.",
  },
};

export const NICHES: { id: NicheId; label: string; keywords: string[] }[] = [
  { id: "all", label: "Todos os temas", keywords: [] },
  {
    id: "education",
    label: "Educação",
    keywords: [
      "educação",
      "estudo",
      "estudar",
      "curso",
      "aluno",
      "professor",
      "escola",
      "concurso",
      "prova",
      "faculdade",
      "aprender",
      "idioma",
      "learn",
      "study",
      "course",
      "student",
      "teacher",
      "tutor",
      "flashcard",
      "quiz",
      "edtech",
      "exam",
    ],
  },
  {
    id: "health",
    label: "Saúde & Bem-estar",
    keywords: [
      "saúde",
      "clínica",
      "médico",
      "consulta",
      "treino",
      "academia",
      "dieta",
      "nutrição",
      "sono",
      "psicólogo",
      "paciente",
      "hábito",
      "health",
      "medical",
      "fitness",
      "sleep",
      "mental",
      "therapy",
      "clinic",
      "nutrition",
      "workout",
      "wellness",
    ],
  },
  {
    id: "finance",
    label: "Finanças",
    keywords: [
      "finança",
      "dinheiro",
      "imposto",
      "cobrança",
      "pagamento",
      "pix",
      "orçamento",
      "investimento",
      "despesa",
      "fatura",
      "contabilidade",
      "mei",
      "finance",
      "invoice",
      "tax",
      "budget",
      "billing",
      "payment",
      "stripe",
      "accounting",
      "expense",
      "pricing",
    ],
  },
  {
    id: "productivity",
    label: "Produtividade",
    keywords: [
      "produtividade",
      "agenda",
      "reunião",
      "tarefa",
      "anotação",
      "rotina",
      "foco",
      "automação",
      "organização",
      "currículo",
      "pdf",
      "planilha",
      "productivity",
      "workflow",
      "calendar",
      "meeting",
      "note",
      "notion",
      "inbox",
      "task",
      "schedule",
      "resume",
    ],
  },
  {
    id: "devtools",
    label: "Programação & IA",
    keywords: [
      "programação",
      "código",
      "desenvolvedor",
      "agente",
      "inteligência artificial",
      "ia",
      "api",
      "banco de dados",
      "automação",
      "mcp",
      "llm",
      "agent",
      "code",
      "sdk",
      "cli",
      "database",
      "sql",
      "debug",
      "terminal",
      "rag",
      "coding",
    ],
  },
  {
    id: "ecommerce",
    label: "Lojas & Vendas",
    keywords: [
      "loja",
      "venda",
      "cliente",
      "anúncio",
      "marketing",
      "produto",
      "estoque",
      "catálogo",
      "shopify",
      "ecommerce",
      "e-commerce",
      "sales",
      "lead",
      "seo",
      "conversion",
      "landing page",
      "store",
    ],
  },
  {
    id: "creators",
    label: "Criadores de Conteúdo",
    keywords: [
      "vídeo",
      "youtube",
      "podcast",
      "áudio",
      "legenda",
      "roteiro",
      "criador",
      "newsletter",
      "redes sociais",
      "instagram",
      "tiktok",
      "design",
      "video",
      "thumbnail",
      "creator",
      "subtitle",
      "content",
    ],
  },
  {
    id: "local",
    label: "Negócios Locais",
    keywords: [
      "restaurante",
      "cardápio",
      "barbearia",
      "salão",
      "agendamento",
      "whatsapp",
      "imobiliária",
      "delivery",
      "comércio",
      "oficina",
      "booking",
      "appointment",
      "restaurant",
      "real estate",
      "local business",
    ],
  },
  {
    id: "entertainment",
    label: "Jogos & Lazer",
    keywords: [
      "jogo",
      "game",
      "música",
      "filme",
      "viagem",
      "esporte",
      "quiz",
      "comunidade",
      "gaming",
      "movie",
      "music",
      "travel",
      "trivia",
      "interactive",
    ],
  },
  {
    id: "sustainability",
    label: "Sustentabilidade",
    keywords: [
      "energia",
      "solar",
      "reciclagem",
      "desperdício",
      "meio ambiente",
      "sustentável",
      "água",
      "clima",
      "mobilidade",
      "climate",
      "energy",
      "carbon",
      "sustain",
      "food waste",
      "recycle",
    ],
  },
];

export const FORMATS: { id: ProductFormat; label: string }[] = [
  { id: "any", label: "Qualquer formato" },
  { id: "webapp", label: "Site / Aplicativo Web" },
  { id: "ai-agent", label: "Assistente com IA" },
  { id: "extension", label: "Extensão de Navegador" },
  { id: "bot", label: "Bot de WhatsApp / Telegram" },
  { id: "mobile", label: "App para Celular" },
  { id: "cli", label: "Ferramenta de Terminal" },
];

export const TIMEFRAMES: { id: TimeframeId; label: string; short: string }[] = [
  { id: "2h", label: "2 horas (rápido)", short: "2h" },
  { id: "1d", label: "1 dia", short: "1 dia" },
  { id: "48h", label: "Fim de semana (48h)", short: "48h" },
  { id: "1w", label: "1 semana ou mais", short: "1 sem+" },
];

export const LEVELS: { id: SkillLevel; label: string }[] = [
  { id: "beginner", label: "Iniciante" },
  { id: "intermediate", label: "Intermediário" },
  { id: "advanced", label: "Avançado" },
];

export const AUDIENCES: { id: AudienceId; label: string }[] = [
  { id: "any", label: "Qualquer público" },
  { id: "b2b", label: "Empresas e pequenos negócios" },
  { id: "b2c", label: "Uso pessoal" },
  { id: "creators", label: "Autônomos e criadores" },
  { id: "devs", label: "Desenvolvedores" },
];

export function getNicheLabel(id: NicheId): string {
  return NICHES.find((n) => n.id === id)?.label ?? id;
}

export function getFormatLabel(id: ProductFormat): string {
  return FORMATS.find((f) => f.id === id)?.label ?? id;
}

export function getTimeframeLabel(id: TimeframeId): string {
  return TIMEFRAMES.find((t) => t.id === id)?.label ?? id;
}

export function getLevelLabel(id: SkillLevel): string {
  return LEVELS.find((l) => l.id === id)?.label ?? id;
}

export function getAudienceLabel(id: AudienceId): string {
  return AUDIENCES.find((a) => a.id === id)?.label ?? id;
}
