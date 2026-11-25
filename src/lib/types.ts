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

export type TrendSource = "hackernews" | "reddit" | "github" | "huggingface" | "curated";

export type PivotAction = "simpler" | "b2b" | "extension" | "monetize";

export interface TrendSignal {
  id: string;
  title: string;
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
  potential: "Alto" | "Muito Alto" | "Médio" | "Opcional (Portfólio)";
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
    accent: string;
    badgeBg: string;
  }
> = {
  money: {
    label: "Retorno Monetário",
    shortLabel: "Monetização",
    description: "Micro-SaaS e ferramentas para dores reais com potencial de receita rápida.",
    accent: "text-emerald-400",
    badgeBg: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  },
  hackathon: {
    label: "Hackathon",
    shortLabel: "Hackathon",
    description: "Alto impacto de demo em 24h–48h, problema urgente e fator uau para jurados.",
    accent: "text-amber-400",
    badgeBg: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  },
  study: {
    label: "Estudo & Portfólio",
    shortLabel: "Estudo",
    description: "Projetos modernos para dominar stacks atuais e impressionar recrutadores.",
    accent: "text-sky-400",
    badgeBg: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  },
  challenge: {
    label: "Desafio Relâmpago",
    shortLabel: "Desafio",
    description: "Speedruns criativos com escopo cirúrgico e restrições divertidas.",
    accent: "text-rose-400",
    badgeBg: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  },
};

export const NICHES: { id: NicheId; label: string; keywords: string[] }[] = [
  { id: "all", label: "Todos os Nichos", keywords: [] },
  {
    id: "education",
    label: "Educação",
    keywords: [
      "learn",
      "study",
      "course",
      "student",
      "teacher",
      "school",
      "tutor",
      "flashcard",
      "language",
      "quiz",
      "edtech",
      "book",
      "research",
      "paper",
      "university",
      "exam",
    ],
  },
  {
    id: "health",
    label: "Saúde & Bem-estar",
    keywords: [
      "health",
      "medical",
      "fitness",
      "sleep",
      "mental",
      "therapy",
      "doctor",
      "clinic",
      "diet",
      "nutrition",
      "workout",
      "patient",
      "habit",
      "wellness",
      "bio",
      "med",
    ],
  },
  {
    id: "finance",
    label: "Finanças",
    keywords: [
      "finance",
      "money",
      "invoice",
      "tax",
      "budget",
      "billing",
      "payment",
      "stripe",
      "bank",
      "crypto",
      "invest",
      "pricing",
      "revenue",
      "mrr",
      "accounting",
      "expense",
      "subscription",
    ],
  },
  {
    id: "productivity",
    label: "Produtividade",
    keywords: [
      "productivity",
      "workflow",
      "calendar",
      "meeting",
      "note",
      "notion",
      "email",
      "inbox",
      "task",
      "focus",
      "time",
      "automation",
      "schedule",
      "docs",
      "pdf",
      "resume",
      "crm",
    ],
  },
  {
    id: "devtools",
    label: "DevTools & IA",
    keywords: [
      "ai",
      "llm",
      "agent",
      "mcp",
      "code",
      "git",
      "api",
      "cli",
      "sdk",
      "open source",
      "model",
      "dev",
      "database",
      "sql",
      "docker",
      "debug",
      "terminal",
      "browser",
      "scrape",
      "rag",
      "voice",
    ],
  },
  {
    id: "ecommerce",
    label: "E-commerce & Vendas",
    keywords: [
      "shop",
      "store",
      "shopify",
      "ecommerce",
      "sales",
      "lead",
      "marketing",
      "seo",
      "ads",
      "landing",
      "conversion",
      "cold email",
      "b2b",
      "saas",
      "client",
      "outreach",
      "product",
    ],
  },
  {
    id: "creators",
    label: "Criadores & Mídia",
    keywords: [
      "video",
      "youtube",
      "podcast",
      "audio",
      "image",
      "design",
      "social",
      "newsletter",
      "content",
      "thumbnail",
      "edit",
      "music",
      "creator",
      "stream",
      "tiktok",
      "subtitle",
    ],
  },
  {
    id: "local",
    label: "Negócios Locais",
    keywords: [
      "restaurant",
      "local",
      "booking",
      "appointment",
      "whatsapp",
      "real estate",
      "property",
      "hotel",
      "salon",
      "delivery",
      "small business",
      "agency",
      "freelance",
      "service",
    ],
  },
  {
    id: "entertainment",
    label: "Entretenimento & Games",
    keywords: [
      "game",
      "gaming",
      "movie",
      "music",
      "travel",
      "sport",
      "community",
      "social",
      "chat",
      "trivia",
      "3d",
      "canvas",
      "interactive",
      "fun",
    ],
  },
  {
    id: "sustainability",
    label: "Sustentabilidade",
    keywords: [
      "climate",
      "energy",
      "solar",
      "carbon",
      "green",
      "sustain",
      "food waste",
      "recycle",
      "water",
      "mobility",
      "city",
      "civic",
      "impact",
    ],
  },
];

export const FORMATS: { id: ProductFormat; label: string }[] = [
  { id: "any", label: "Qualquer formato" },
  { id: "webapp", label: "Web App / Micro-SaaS" },
  { id: "ai-agent", label: "Agente de IA / Automação" },
  { id: "extension", label: "Extensão de Navegador" },
  { id: "bot", label: "Bot (WhatsApp / Telegram)" },
  { id: "mobile", label: "App Mobile / PWA" },
  { id: "cli", label: "CLI / Ferramenta Dev" },
];

export const TIMEFRAMES: { id: TimeframeId; label: string; short: string }[] = [
  { id: "2h", label: "2 horas (Sprint)", short: "2h" },
  { id: "1d", label: "1 dia (8h)", short: "1 dia" },
  { id: "48h", label: "Fim de semana (48h)", short: "48h" },
  { id: "1w", label: "1 semana+", short: "1 sem+" },
];

export const LEVELS: { id: SkillLevel; label: string }[] = [
  { id: "beginner", label: "Iniciante" },
  { id: "intermediate", label: "Intermediário" },
  { id: "advanced", label: "Avançado" },
];

export const AUDIENCES: { id: AudienceId; label: string }[] = [
  { id: "any", label: "Qualquer público" },
  { id: "b2b", label: "B2B / PMEs" },
  { id: "b2c", label: "Consumidor Final (B2C)" },
  { id: "creators", label: "Freelancers & Criadores" },
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
