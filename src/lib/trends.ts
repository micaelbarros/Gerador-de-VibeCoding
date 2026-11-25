import * as cheerio from "cheerio";
import {
  IdeaMode,
  NicheId,
  NICHES,
  TrendFeedResponse,
  TrendSignal,
  TrendSource,
} from "./types";

const CACHE_TTL_MS = 15 * 60 * 1000;
const FETCH_TIMEOUT_MS = 7000;

interface CacheState {
  data: TrendFeedResponse | null;
  expiresAt: number;
}

const globalForTrends = globalThis as unknown as {
  __vibesparkTrendsCache?: CacheState;
};

if (!globalForTrends.__vibesparkTrendsCache) {
  globalForTrends.__vibesparkTrendsCache = { data: null, expiresAt: 0 };
}

// Filtra notícias que NÃO são oportunidades de projeto (incidentes, política, dramas, obituários)
const NOISE_PATTERNS = [
  /\bincident\b/i,
  /\bbreach\b/i,
  /\bhacked\b/i,
  /\blawsuit\b/i,
  /\bsued\b/i,
  /\bcourt\b/i,
  /\bsenate\b/i,
  /\bcongress\b/i,
  /\belection\b/i,
  /\bpresident\b/i,
  /\bwar\b/i,
  /\bdead\b/i,
  /\bdied\b/i,
  /\bobituary\b/i,
  /\barrested\b/i,
  /\blayoff/i,
  /\bantitrust\b/i,
  /\bscandal\b/i,
  /\boutage\b/i,
  /\bcve-\d+/i,
  /\bvulnerability\b/i,
  /\bexploit\b/i,
  /\bmurder\b/i,
  /\bprison\b/i,
  /\bstrike\b/i,
  /\bprotest\b/i,
  /\bgovernment\b/i,
  /\bpolítica\b/i,
  /\bdemiss(ão|ões)\b/i,
  /\bvazamento\b/i,
  /\bprocesso judicial\b/i,
];

function isRelevantProductSignal(text: string): boolean {
  if (!text || text.trim().length < 10) return false;
  return !NOISE_PATTERNS.some((rx) => rx.test(text));
}

async function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      cache: "no-store",
    });
  } finally {
    clearTimeout(timer);
  }
}

function classifyNichesStrict(text: string): Exclude<NicheId, "all">[] {
  const lower = text.toLowerCase();
  const scored: { id: Exclude<NicheId, "all">; hits: number }[] = [];

  for (const niche of NICHES) {
    if (niche.id === "all") continue;
    let hits = 0;
    for (const kw of niche.keywords) {
      if (lower.includes(kw)) hits += 1;
    }
    if (hits > 0) {
      scored.push({ id: niche.id, hits });
    }
  }

  scored.sort((a, b) => b.hits - a.hits);
  return scored.slice(0, 2).map((s) => s.id);
}

function inferBestModes(source: TrendSource, text: string, score: number): IdeaMode[] {
  const lower = text.toLowerCase();
  const modes = new Set<IdeaMode>();

  if (
    source === "reddit" ||
    lower.includes("saas") ||
    lower.includes("cliente") ||
    lower.includes("venda") ||
    lower.includes("dinheiro") ||
    lower.includes("cobrança") ||
    lower.includes("pay") ||
    lower.includes("business") ||
    lower.includes("somebodymakethis")
  ) {
    modes.add("money");
  }

  if (
    source === "huggingface" ||
    lower.includes("ia") ||
    lower.includes("ai") ||
    lower.includes("agente") ||
    lower.includes("agent") ||
    score >= 120
  ) {
    modes.add("hackathon");
  }

  if (
    source === "github" ||
    source === "tabnews" ||
    lower.includes("open source") ||
    lower.includes("estudo") ||
    lower.includes("aprender") ||
    lower.includes("projeto")
  ) {
    modes.add("study");
  }

  if (
    lower.includes("extensão") ||
    lower.includes("extension") ||
    lower.includes("simples") ||
    lower.includes("rápido") ||
    modes.size === 0
  ) {
    modes.add("challenge");
  }

  if (modes.size === 1) {
    modes.add("hackathon");
  }

  return Array.from(modes);
}

function computeHeatScore(score: number, source: TrendSource): number {
  if (source === "github") {
    return Math.min(98, Math.max(64, Math.round(58 + Math.log10(Math.max(10, score)) * 14)));
  }
  if (source === "tabnews") {
    return Math.min(96, Math.max(66, Math.round(62 + Math.log10(Math.max(5, score)) * 16)));
  }
  if (source === "hackernews") {
    return Math.min(98, Math.max(60, Math.round(52 + Math.log10(Math.max(10, score)) * 17)));
  }
  return Math.min(96, Math.max(62, Math.round(58 + Math.log10(Math.max(5, score)) * 15)));
}

// Fonte em português: TabNews (comunidade brasileira de tecnologia e negócios digitais)
async function scrapeTabNews(): Promise<TrendSignal[]> {
  const res = await fetchWithTimeout(
    "https://www.tabnews.com.br/api/v1/contents?strategy=relevant&per_page=18",
    {
      headers: {
        Accept: "application/json",
        "User-Agent": "VibeSpark/1.0",
      },
    }
  );
  if (!res.ok) return [];

  const posts = (await res.json()) as Array<{
    id: string;
    owner_username: string;
    slug: string;
    title?: string;
    tabcoins?: number;
    children_deep_count?: number;
  }>;

  const now = new Date().toISOString();
  const signals: TrendSignal[] = [];

  for (const post of posts) {
    if (!post.title || !isRelevantProductSignal(post.title)) continue;
    const niches = classifyNichesStrict(post.title);
    if (niches.length === 0) continue;

    const score = post.tabcoins ?? 10;
    const comments = post.children_deep_count ?? 0;

    signals.push({
      id: `tn-${post.id.slice(0, 10)}`,
      title: post.title,
      summary: `Discussão relevante na comunidade brasileira (${score} pontos, ${comments} comentários).`,
      url: `https://www.tabnews.com.br/${post.owner_username}/${post.slug}`,
      source: "tabnews",
      sourceLabel: "TabNews (BR)",
      score,
      heatScore: computeHeatScore(score, "tabnews"),
      tags: ["Brasil", "Comunidade"],
      niches,
      bestModes: inferBestModes("tabnews", post.title, score),
      fetchedAt: now,
      isLive: true,
    });
  }

  return signals.slice(0, 10);
}

// Hacker News: apenas "Show HN" (projetos reais lançados por criadores), evitando notícias aleatórias
async function scrapeHackerNewsShow(): Promise<TrendSignal[]> {
  const showRes = await fetchWithTimeout(
    "https://hacker-news.firebaseio.com/v0/showstories.json"
  );
  if (!showRes.ok) return [];

  const showIds = ((await showRes.json()) as number[]).slice(0, 16);
  const items = await Promise.all(
    showIds.map(async (id) => {
      try {
        const res = await fetchWithTimeout(
          `https://hacker-news.firebaseio.com/v0/item/${id}.json`
        );
        if (!res.ok) return null;
        return (await res.json()) as {
          id: number;
          title?: string;
          url?: string;
          score?: number;
          descendants?: number;
        };
      } catch {
        return null;
      }
    })
  );

  const now = new Date().toISOString();
  const results: TrendSignal[] = [];

  for (const item of items) {
    if (!item || !item.title) continue;
    const cleanTitle = item.title.replace(/^Show HN:\s*/i, "").trim();
    if (!isRelevantProductSignal(cleanTitle)) continue;

    const niches = classifyNichesStrict(`${cleanTitle} ${item.url ?? ""}`);
    if (niches.length === 0) continue;

    const score = item.score ?? 20;
    results.push({
      id: `hn-${item.id}`,
      title: cleanTitle,
      originalTitle: item.title,
      summary: `Projeto novo em destaque no Hacker News (${score} votos e ${item.descendants ?? 0} comentários).`,
      url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
      source: "hackernews",
      sourceLabel: "Hacker News",
      score,
      heatScore: computeHeatScore(score, "hackernews"),
      tags: ["Projeto Novo", "Tendência"],
      niches,
      bestModes: inferBestModes("hackernews", cleanTitle, score),
      fetchedAt: now,
      isLive: true,
    });
  }

  return results.slice(0, 8);
}

async function scrapeGitHubTrending(): Promise<TrendSignal[]> {
  const res = await fetchWithTimeout("https://github.com/trending?since=daily", {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; VibeSparkBot/1.0)",
      Accept: "text/html",
    },
  });
  if (!res.ok) return [];

  const html = await res.text();
  const $ = cheerio.load(html);
  const now = new Date().toISOString();
  const signals: TrendSignal[] = [];

  $("article.Box-row")
    .slice(0, 14)
    .each((idx, el) => {
      const repoPath = $(el).find("h2 a").attr("href")?.trim();
      if (!repoPath) return;

      const repoName = repoPath.replace(/^\//, "");
      const description = $(el).find("p").text().replace(/\s+/g, " ").trim();
      const language = $(el).find('[itemprop="programmingLanguage"]').text().trim();
      const combined = `${repoName} ${description} ${language}`;

      if (!isRelevantProductSignal(combined)) return;
      const niches = classifyNichesStrict(combined);
      if (niches.length === 0) return;

      const starsTodayText = $(el)
        .find("span.d-inline-block.float-sm-right")
        .text()
        .replace(/,/g, "");
      const starsMatch = starsTodayText.match(/(\d+)/);
      const starsToday = starsMatch ? parseInt(starsMatch[1], 10) : 80 + idx * 10;

      signals.push({
        id: `gh-${repoName.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}`,
        title: `${repoName}${language ? ` (${language})` : ""}`,
        summary:
          description ||
          `Projeto de código aberto em alta hoje no GitHub (+${starsToday} estrelas).`,
        url: `https://github.com${repoPath}`,
        source: "github",
        sourceLabel: "GitHub",
        score: starsToday,
        heatScore: computeHeatScore(starsToday, "github"),
        tags: [language || "Código aberto", `+${starsToday}★ hoje`],
        niches,
        bestModes: inferBestModes("github", combined, starsToday),
        fetchedAt: now,
        isLive: true,
      });
    });

  return signals.slice(0, 8);
}

async function scrapeRedditOpportunities(): Promise<TrendSignal[]> {
  const subreddits = ["SomebodyMakeThis", "microsaas", "SideProject"];
  const now = new Date().toISOString();

  const responses = await Promise.allSettled(
    subreddits.map(async (sub) => {
      const res = await fetchWithTimeout(
        `https://www.reddit.com/r/${sub}/hot.json?limit=8`,
        {
          headers: {
            "User-Agent": "web:vibespark.app:v0.2 (by /u/vibespark_builder)",
            Accept: "application/json",
          },
        }
      );
      if (!res.ok) return [];
      const json = (await res.json()) as {
        data?: {
          children?: Array<{
            data?: {
              id: string;
              title: string;
              selftext?: string;
              permalink: string;
              ups?: number;
              num_comments?: number;
              stickied?: boolean;
            };
          }>;
        };
      };

      const out: TrendSignal[] = [];
      for (const child of json.data?.children ?? []) {
        const d = child.data;
        if (!d || d.stickied || !d.title) continue;
        const snippet = (d.selftext ?? "").replace(/\s+/g, " ").trim().slice(0, 160);
        const combined = `${d.title} ${snippet}`;

        if (!isRelevantProductSignal(combined)) continue;
        const niches = classifyNichesStrict(combined);
        if (niches.length === 0) continue;

        const score = d.ups ?? 15;
        out.push({
          id: `rd-${d.id}`,
          title: d.title,
          summary:
            snippet.length > 35
              ? `${snippet}${snippet.length >= 160 ? "..." : ""}`
              : `Pedido real de usuários em r/${sub} (${score} votos).`,
          url: `https://www.reddit.com${d.permalink}`,
          source: "reddit",
          sourceLabel: `Reddit (${sub})`,
          score,
          heatScore: computeHeatScore(score, "reddit"),
          tags: ["Pedido real", "Mercado"],
          niches,
          bestModes: inferBestModes("reddit", combined, score),
          fetchedAt: now,
          isLive: true,
        });
      }
      return out;
    })
  );

  const all: TrendSignal[] = [];
  for (const r of responses) {
    if (r.status === "fulfilled") all.push(...r.value);
  }
  return all.slice(0, 10);
}

async function scrapeHuggingFaceTrending(): Promise<TrendSignal[]> {
  const res = await fetchWithTimeout(
    "https://huggingface.co/api/trending?limit=10&type=space",
    { headers: { Accept: "application/json" } }
  );
  if (!res.ok) return [];

  const json = (await res.json()) as {
    recentlyTrending?: Array<{
      repoData?: {
        id?: string;
        likes?: number;
        shortDescription?: string;
        title?: string;
      };
    }>;
  };

  const now = new Date().toISOString();
  const signals: TrendSignal[] = [];

  for (const entry of json.recentlyTrending ?? []) {
    const repo = entry.repoData;
    if (!repo?.id) continue;
    const title = repo.title || repo.id;
    const desc = repo.shortDescription || `Aplicativo de IA em alta no Hugging Face.`;
    const combined = `${title} ${desc} ia ai`;

    if (!isRelevantProductSignal(combined)) continue;
    const niches = classifyNichesStrict(combined);
    const likes = repo.likes ?? 40;

    signals.push({
      id: `hf-${repo.id.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}`,
      title: `Ferramenta de IA: ${title}`,
      summary: desc,
      url: `https://huggingface.co/spaces/${repo.id}`,
      source: "huggingface",
      sourceLabel: "Hugging Face",
      score: likes,
      heatScore: computeHeatScore(likes, "huggingface"),
      tags: ["IA em alta"],
      niches: niches.length > 0 ? niches : ["devtools"],
      bestModes: inferBestModes("huggingface", combined, likes),
      fetchedAt: now,
      isLive: true,
    });
  }

  return signals.slice(0, 6);
}

// Tendências curadas em português cobrindo todos os 10 temas de forma coerente
const CURATED_SIGNALS: Omit<TrendSignal, "fetchedAt">[] = [
  {
    id: "cur-health-clinic",
    title: "Consultórios pequenos perdem pacientes por demora na confirmação via WhatsApp",
    summary:
      "Profissionais autônomos de saúde buscam confirmação automática de horários, fila de encaixe e pré-atendimento simples.",
    url: "https://www.tabnews.com.br/",
    source: "curated",
    sourceLabel: "Tendência BR",
    score: 185,
    heatScore: 91,
    tags: ["Saúde", "WhatsApp"],
    niches: ["health", "local"],
    bestModes: ["money", "hackathon"],
    isLive: false,
  },
  {
    id: "cur-edu-simulados",
    title: "Estudantes querem transformar apostilas em PDF e vídeos em simulados práticos",
    summary:
      "Alta procura por ferramentas que geram questões comentadas e planos de revisão a partir do próprio material de estudo.",
    url: "https://www.tabnews.com.br/",
    source: "curated",
    sourceLabel: "Tendência BR",
    score: 210,
    heatScore: 89,
    tags: ["Educação", "Estudos"],
    niches: ["education"],
    bestModes: ["money", "study", "hackathon"],
    isLive: false,
  },
  {
    id: "cur-finance-mei",
    title: "Autônomos e MEIs sofrem para controlar cobranças, impostos e previsibilidade do mês",
    summary:
      "Ferramentas simples para prever quanto vai sobrar no mês, lembrar clientes de pagar e separar impostos têm forte demanda.",
    url: "https://www.tabnews.com.br/",
    source: "curated",
    sourceLabel: "Tendência BR",
    score: 240,
    heatScore: 93,
    tags: ["Finanças", "MEI"],
    niches: ["finance"],
    bestModes: ["money", "challenge"],
    isLive: false,
  },
  {
    id: "cur-prod-reunioes",
    title: "Equipes pequenas perdem tempo transformando áudios e reuniões em tarefas claras",
    summary:
      "Cresce a busca por ferramentas que recebem anotações bagunçadas ou transcrições e devolvem listas objetivas com prazos.",
    url: "https://www.tabnews.com.br/",
    source: "curated",
    sourceLabel: "Tendência BR",
    score: 190,
    heatScore: 88,
    tags: ["Produtividade", "Rotina"],
    niches: ["productivity"],
    bestModes: ["money", "challenge", "study"],
    isLive: false,
  },
  {
    id: "cur-ecom-reviews",
    title: "Lojistas precisam entender por que clientes abandonam páginas de produto",
    summary:
      "Análise automática de comentários negativos e melhoria de descrições ajuda lojas pequenas a vender mais sem gastar mais em anúncios.",
    url: "https://www.tabnews.com.br/",
    source: "curated",
    sourceLabel: "Tendência BR",
    score: 175,
    heatScore: 88,
    tags: ["Lojas Online", "Vendas"],
    niches: ["ecommerce"],
    bestModes: ["money", "hackathon"],
    isLive: false,
  },
  {
    id: "cur-creators-cortes",
    title: "Criadores querem transformar 1 vídeo longo em roteiros curtos, carrosséis e textos",
    summary:
      "Reaproveitar um mesmo conteúdo para Instagram, YouTube e LinkedIn economiza horas semanais de produção.",
    url: "https://www.tabnews.com.br/",
    source: "curated",
    sourceLabel: "Tendência BR",
    score: 195,
    heatScore: 90,
    tags: ["Criadores", "Conteúdo"],
    niches: ["creators"],
    bestModes: ["money", "challenge", "hackathon"],
    isLive: false,
  },
  {
    id: "cur-devtools-ai",
    title: "Desenvolvedores buscam ferramentas locais simples para testar APIs, prompts e bancos",
    summary:
      "Utilitários leves que aceleram o dia a dia de quem programa com IA ganham tração rápida em comunidades técnicas.",
    url: "https://github.com/trending",
    source: "curated",
    sourceLabel: "Tendência Tech",
    score: 300,
    heatScore: 94,
    tags: ["Programação", "IA"],
    niches: ["devtools"],
    bestModes: ["hackathon", "study", "challenge"],
    isLive: false,
  },
  {
    id: "cur-local-reputacao",
    title: "Comércios de bairro perdem clientes por avaliações sem resposta no Google Maps",
    summary:
      "Restaurantes, salões e oficinas pagam por painéis simples para captar avaliações 5 estrelas com QR Code e fidelizar clientes.",
    url: "https://www.tabnews.com.br/",
    source: "curated",
    sourceLabel: "Tendência BR",
    score: 165,
    heatScore: 87,
    tags: ["Negócios Locais", "Clientes"],
    niches: ["local"],
    bestModes: ["money", "challenge"],
    isLive: false,
  },
  {
    id: "cur-sustain-energia",
    title: "Famílias e restaurantes querem cortar desperdício de alimentos e conta de luz",
    summary:
      "Calculadoras visuais que transformam hábitos sustentáveis em economia real no bolso se destacam muito em hackathons.",
    url: "https://www.tabnews.com.br/",
    source: "curated",
    sourceLabel: "Tendência BR",
    score: 150,
    heatScore: 85,
    tags: ["Sustentabilidade", "Economia"],
    niches: ["sustainability"],
    bestModes: ["hackathon", "study"],
    isLive: false,
  },
  {
    id: "cur-games-diario",
    title: "Jogos rápidos de 2 minutos no navegador com desafio diário e placar para amigos",
    summary:
      "Experiências curtas sem cadastro obrigatório (no estilo Termo/Wordle) viralizam fácil em grupos de WhatsApp.",
    url: "https://github.com/trending",
    source: "curated",
    sourceLabel: "Tendência Web",
    score: 190,
    heatScore: 86,
    tags: ["Jogos", "Viral"],
    niches: ["entertainment"],
    bestModes: ["challenge", "study", "hackathon"],
    isLive: false,
  },
];

export async function getTrendSignals(forceRefresh = false): Promise<TrendFeedResponse> {
  const cache = globalForTrends.__vibesparkTrendsCache!;
  const nowMs = Date.now();

  if (!forceRefresh && cache.data && cache.expiresAt > nowMs) {
    return { ...cache.data, fromCache: true };
  }

  const [tnResult, hnResult, ghResult, rdResult, hfResult] = await Promise.allSettled([
    scrapeTabNews(),
    scrapeHackerNewsShow(),
    scrapeGitHubTrending(),
    scrapeRedditOpportunities(),
    scrapeHuggingFaceTrending(),
  ]);

  const liveSignals: TrendSignal[] = [];
  const sourcesActive: string[] = [];

  if (tnResult.status === "fulfilled" && tnResult.value.length > 0) {
    liveSignals.push(...tnResult.value);
    sourcesActive.push("TabNews (BR)");
  }
  if (hnResult.status === "fulfilled" && hnResult.value.length > 0) {
    liveSignals.push(...hnResult.value);
    sourcesActive.push("Hacker News");
  }
  if (ghResult.status === "fulfilled" && ghResult.value.length > 0) {
    liveSignals.push(...ghResult.value);
    sourcesActive.push("GitHub");
  }
  if (rdResult.status === "fulfilled" && rdResult.value.length > 0) {
    liveSignals.push(...rdResult.value);
    sourcesActive.push("Reddit");
  }
  if (hfResult.status === "fulfilled" && hfResult.value.length > 0) {
    liveSignals.push(...hfResult.value);
    sourcesActive.push("Hugging Face");
  }

  const nowIso = new Date().toISOString();
  const curatedWithTimestamp: TrendSignal[] = CURATED_SIGNALS.map((s) => ({
    ...s,
    fetchedAt: nowIso,
  }));

  // Garante que todo nicho tenha pelo menos 1 tendência coerente disponível
  const representedNiches = new Set<string>();
  for (const sig of liveSignals) {
    sig.niches.forEach((n) => representedNiches.add(n));
  }

  const supplementaryCurated =
    liveSignals.length === 0
      ? curatedWithTimestamp
      : curatedWithTimestamp.filter((c) => c.niches.some((n) => !representedNiches.has(n)));

  const combined = [...liveSignals, ...supplementaryCurated].sort(
    (a, b) => Number(b.isLive) - Number(a.isLive) || b.heatScore - a.heatScore
  );

  const response: TrendFeedResponse = {
    signals: combined,
    updatedAt: nowIso,
    liveCount: liveSignals.length,
    sourcesActive: sourcesActive.length > 0 ? sourcesActive : ["Tendências em Português"],
    fromCache: false,
  };

  cache.data = response;
  cache.expiresAt = nowMs + CACHE_TTL_MS;

  return response;
}
