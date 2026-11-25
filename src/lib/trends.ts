import * as cheerio from "cheerio";
import {
  IdeaMode,
  NicheId,
  NICHES,
  TrendFeedResponse,
  TrendSignal,
  TrendSource,
} from "./types";

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutos
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

function classifyNiches(text: string): Exclude<NicheId, "all">[] {
  const lower = text.toLowerCase();
  const matched: Exclude<NicheId, "all">[] = [];

  for (const niche of NICHES) {
    if (niche.id === "all") continue;
    if (niche.keywords.some((kw) => lower.includes(kw))) {
      matched.push(niche.id);
    }
  }

  if (matched.length === 0) {
    matched.push("productivity", "devtools");
  }

  return matched.slice(0, 3);
}

function inferBestModes(source: TrendSource, text: string, score: number): IdeaMode[] {
  const lower = text.toLowerCase();
  const modes = new Set<IdeaMode>();

  if (
    source === "reddit" ||
    lower.includes("saas") ||
    lower.includes("mrr") ||
    lower.includes("pay") ||
    lower.includes("client") ||
    lower.includes("invoice") ||
    lower.includes("business") ||
    lower.includes("somebodymakethis")
  ) {
    modes.add("money");
  }

  if (
    source === "huggingface" ||
    lower.includes("ai") ||
    lower.includes("agent") ||
    lower.includes("realtime") ||
    lower.includes("voice") ||
    lower.includes("vision") ||
    score >= 120
  ) {
    modes.add("hackathon");
  }

  if (
    source === "github" ||
    lower.includes("open source") ||
    lower.includes("framework") ||
    lower.includes("tutorial") ||
    lower.includes("sdk") ||
    lower.includes("cli")
  ) {
    modes.add("study");
  }

  if (
    lower.includes("extension") ||
    lower.includes("tool") ||
    lower.includes("simple") ||
    lower.includes("tiny") ||
    lower.includes("weekend") ||
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
    return Math.min(99, Math.max(62, Math.round(58 + Math.log10(Math.max(10, score)) * 14)));
  }
  if (source === "hackernews") {
    return Math.min(99, Math.max(58, Math.round(50 + Math.log10(Math.max(10, score)) * 18)));
  }
  if (source === "reddit") {
    return Math.min(98, Math.max(60, Math.round(55 + Math.log10(Math.max(5, score)) * 17)));
  }
  return Math.min(97, Math.max(64, Math.round(62 + Math.log10(Math.max(10, score)) * 13)));
}

async function scrapeHackerNews(): Promise<TrendSignal[]> {
  const [topRes, showRes] = await Promise.all([
    fetchWithTimeout("https://hacker-news.firebaseio.com/v0/topstories.json"),
    fetchWithTimeout("https://hacker-news.firebaseio.com/v0/showstories.json"),
  ]);

  const topIds: number[] = topRes.ok ? ((await topRes.json()) as number[]).slice(0, 10) : [];
  const showIds: number[] = showRes.ok ? ((await showRes.json()) as number[]).slice(0, 8) : [];
  const uniqueIds = Array.from(new Set([...showIds.slice(0, 6), ...topIds.slice(0, 10)]));

  const items = await Promise.all(
    uniqueIds.map(async (id) => {
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
    const score = item.score ?? 20;
    const comments = item.descendants ?? 0;
    const combined = `${item.title} ${item.url ?? ""}`;
    const isShow = item.title.toLowerCase().startsWith("show hn");

    results.push({
      id: `hn-${item.id}`,
      title: item.title,
      summary: isShow
        ? `Lançamento em destaque no Hacker News com ${score} pontos e ${comments} comentários da comunidade tech.`
        : `Discussão em alta no Hacker News com ${score} pontos e ${comments} comentários.`,
      url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
      source: "hackernews",
      sourceLabel: isShow ? "Show HN" : "Hacker News",
      score,
      heatScore: computeHeatScore(score, "hackernews"),
      tags: isShow ? ["Show HN", "Lançamento", "Tech"] : ["Hacker News", "Tendência"],
      niches: classifyNiches(combined),
      bestModes: inferBestModes("hackernews", combined, score),
      fetchedAt: now,
      isLive: true,
    });
  }

  return results;
}

async function scrapeGitHubTrending(): Promise<TrendSignal[]> {
  const res = await fetchWithTimeout("https://github.com/trending?since=daily", {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; VibeSparkBot/1.0; +https://github.com)",
      Accept: "text/html",
    },
  });

  if (!res.ok) return [];

  const html = await res.text();
  const $ = cheerio.load(html);
  const now = new Date().toISOString();
  const signals: TrendSignal[] = [];

  $("article.Box-row")
    .slice(0, 12)
    .each((idx, el) => {
      const repoPath = $(el).find("h2 a").attr("href")?.trim();
      if (!repoPath) return;

      const repoName = repoPath.replace(/^\//, "");
      const description = $(el).find("p").text().replace(/\s+/g, " ").trim();
      const language = $(el).find('[itemprop="programmingLanguage"]').text().trim();
      const starsTodayText = $(el)
        .find("span.d-inline-block.float-sm-right")
        .text()
        .replace(/,/g, "");
      const starsMatch = starsTodayText.match(/(\d+)/);
      const starsToday = starsMatch ? parseInt(starsMatch[1], 10) : 80 + idx * 10;

      const combined = `${repoName} ${description} ${language}`;

      signals.push({
        id: `gh-${repoName.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}`,
        title: `${repoName}${language ? ` (${language})` : ""}`,
        summary:
          description ||
          `Repositório em forte aceleração no GitHub Trending hoje (+${starsToday} estrelas).`,
        url: `https://github.com${repoPath}`,
        source: "github",
        sourceLabel: "GitHub Trending",
        score: starsToday,
        heatScore: computeHeatScore(starsToday, "github"),
        tags: [language || "Open Source", `+${starsToday}★ hoje`, "GitHub"],
        niches: classifyNiches(combined),
        bestModes: inferBestModes("github", combined, starsToday),
        fetchedAt: now,
        isLive: true,
      });
    });

  return signals;
}

async function scrapeRedditOpportunities(): Promise<TrendSignal[]> {
  const subreddits = ["SomebodyMakeThis", "microsaas", "SaaS", "SideProject"];
  const now = new Date().toISOString();

  const responses = await Promise.allSettled(
    subreddits.map(async (sub) => {
      const res = await fetchWithTimeout(
        `https://www.reddit.com/r/${sub}/hot.json?limit=6`,
        {
          headers: {
            "User-Agent": "web:vibespark.app:v0.1 (by /u/vibespark_builder)",
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

      const posts = json.data?.children ?? [];
      const out: TrendSignal[] = [];

      for (const child of posts) {
        const d = child.data;
        if (!d || d.stickied || !d.title) continue;
        const snippet = (d.selftext ?? "").replace(/\s+/g, " ").trim().slice(0, 180);
        const score = d.ups ?? 15;
        const combined = `${sub} ${d.title} ${snippet}`;

        out.push({
          id: `rd-${d.id}`,
          title: d.title,
          summary:
            snippet.length > 30
              ? `${snippet}${snippet.length >= 180 ? "..." : ""}`
              : `Dor/oportunidade discutida em r/${sub} com ${score} upvotes e ${d.num_comments ?? 0} comentários.`,
          url: `https://www.reddit.com${d.permalink}`,
          source: "reddit",
          sourceLabel: `r/${sub}`,
          score,
          heatScore: computeHeatScore(score, "reddit"),
          tags: [`r/${sub}`, "Dor Real", "Mercado"],
          niches: classifyNiches(combined),
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
    if (r.status === "fulfilled") {
      all.push(...r.value);
    }
  }
  return all.slice(0, 14);
}

async function scrapeHuggingFaceTrending(): Promise<TrendSignal[]> {
  const res = await fetchWithTimeout(
    "https://huggingface.co/api/trending?limit=10&type=space",
    {
      headers: { Accept: "application/json" },
    }
  );
  if (!res.ok) return [];

  const json = (await res.json()) as {
    recentlyTrending?: Array<{
      repoData?: {
        id?: string;
        likes?: number;
        sdk?: string;
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
    const desc = repo.shortDescription || `App de IA em alta no Hugging Face Spaces (${repo.id}).`;
    const likes = repo.likes ?? 40;
    const combined = `${title} ${desc} ai model space`;

    signals.push({
      id: `hf-${repo.id.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}`,
      title: `AI Space: ${title}`,
      summary: desc,
      url: `https://huggingface.co/spaces/${repo.id}`,
      source: "huggingface",
      sourceLabel: "Hugging Face",
      score: likes,
      heatScore: computeHeatScore(likes, "huggingface"),
      tags: ["IA em Alta", repo.sdk || "Space", "Hugging Face"],
      niches: classifyNiches(combined),
      bestModes: inferBestModes("huggingface", combined, likes),
      fetchedAt: now,
      isLive: true,
    });
  }

  return signals;
}

const CURATED_FALLBACK_SIGNALS: Omit<TrendSignal, "fetchedAt">[] = [
  {
    id: "cur-health-triage",
    title: "Clínicas pequenas perdem 30%+ dos agendamentos por demora no WhatsApp",
    summary:
      "Profissionais de saúde independentes buscam triagem automática, confirmação de consultas e redução de faltas sem sistemas hospitalares complexos.",
    url: "https://www.reddit.com/r/SaaS/",
    source: "curated",
    sourceLabel: "Radar Curado",
    score: 185,
    heatScore: 91,
    tags: ["HealthTech", "WhatsApp", "B2B PME"],
    niches: ["health", "local"],
    bestModes: ["money", "hackathon"],
    isLive: false,
  },
  {
    id: "cur-edu-active-recall",
    title: "Estudantes querem transformar PDFs e aulas longas em simulados interativos",
    summary:
      "Forte demanda por ferramentas que convertem apostilas, vídeos e artigos científicos em trilhas adaptativas de revisão espaçada e mapas mentais.",
    url: "https://news.ycombinator.com/",
    source: "curated",
    sourceLabel: "Radar Curado",
    score: 210,
    heatScore: 89,
    tags: ["EdTech", "IA Generativa", "Estudo"],
    niches: ["education", "productivity"],
    bestModes: ["money", "study", "hackathon"],
    isLive: false,
  },
  {
    id: "cur-finance-freelancer",
    title: "Freelancers e MEIs sofrem para prever impostos, fluxo de caixa e cobranças",
    summary:
      "Micro-SaaS financeiros focados em automação de cobranças recorrentes, alertas de inadimplência e conciliação bancária simples crescem rápido.",
    url: "https://www.reddit.com/r/microsaas/",
    source: "curated",
    sourceLabel: "Radar Curado",
    score: 240,
    heatScore: 93,
    tags: ["FinTech", "Micro-SaaS", "MEI/Freelancer"],
    niches: ["finance", "productivity"],
    bestModes: ["money", "challenge"],
    isLive: false,
  },
  {
    id: "cur-ecom-ugc",
    title: "Lojas virtuais precisam auditar páginas de produto e reviews automaticamente",
    summary:
      "Ferramentas que analisam avaliações negativas de concorrentes e sugerem melhorias de copy, FAQ e oferta geram ROI direto para lojistas.",
    url: "https://www.reddit.com/r/Entrepreneur/",
    source: "curated",
    sourceLabel: "Radar Curado",
    score: 175,
    heatScore: 88,
    tags: ["E-commerce", "Conversão", "Scraping"],
    niches: ["ecommerce", "creators"],
    bestModes: ["money", "hackathon"],
    isLive: false,
  },
  {
    id: "cur-creators-repurpose",
    title: "Criadores buscam transformar 1 vídeo longo em cortes, carrosséis e newsletter",
    summary:
      "Fluxos multimodais que extraem os melhores ganchos, legendas estilizadas e threads a partir de podcasts ou lives economizam horas por semana.",
    url: "https://huggingface.co/spaces",
    source: "curated",
    sourceLabel: "Radar Curado",
    score: 195,
    heatScore: 90,
    tags: ["Creator Economy", "Vídeo", "Automação"],
    niches: ["creators", "productivity"],
    bestModes: ["money", "challenge", "hackathon"],
    isLive: false,
  },
  {
    id: "cur-devtools-mcp",
    title: "Explosão de servidores MCP e agentes locais para automação de fluxo dev",
    summary:
      "Desenvolvedores estão criando micro-ferramentas que conectam bancos locais, logs, GitHub e browsers a agentes autônomos de código.",
    url: "https://github.com/trending",
    source: "curated",
    sourceLabel: "Radar Curado",
    score: 320,
    heatScore: 95,
    tags: ["MCP", "Agentes IA", "DevTools"],
    niches: ["devtools", "productivity"],
    bestModes: ["hackathon", "study", "challenge"],
    isLive: false,
  },
  {
    id: "cur-local-reviews",
    title: "Negócios locais perdem clientes por avaliações sem resposta no Google Maps",
    summary:
      "Restaurantes, salões e oficinas pagam por painéis simples que monitoram reputação local, geram respostas humanizadas e captam novos reviews via QR Code.",
    url: "https://www.reddit.com/r/SomebodyMakeThis/",
    source: "curated",
    sourceLabel: "Radar Curado",
    score: 160,
    heatScore: 87,
    tags: ["Local SEO", "PMEs", "Recorrência"],
    niches: ["local", "ecommerce"],
    bestModes: ["money", "challenge"],
    isLive: false,
  },
  {
    id: "cur-sustainability-energy",
    title: "Monitoramento de consumo energético e desperdício alimentar com visão computacional",
    summary:
      "Projetos de impacto que usam fotos de contas de luz, geladeiras ou estoque para reduzir desperdício se destacam muito em hackathons e editais.",
    url: "https://news.ycombinator.com/",
    source: "curated",
    sourceLabel: "Radar Curado",
    score: 145,
    heatScore: 84,
    tags: ["ESG", "Visão IA", "Impacto"],
    niches: ["sustainability", "health"],
    bestModes: ["hackathon", "study"],
    isLive: false,
  },
  {
    id: "cur-entertainment-microgames",
    title: "Micro-jogos diários no navegador (estilo Wordle/GeoGuessr) com temática de nicho",
    summary:
      "Jogos rápidos de 2 minutos com ranking diário e compartilhamento de resultado viralizam organicamente e são excelentes para speedruns e estudo de UI.",
    url: "https://github.com/trending",
    source: "curated",
    sourceLabel: "Radar Curado",
    score: 190,
    heatScore: 86,
    tags: ["Daily Game", "Viral", "Canvas/UI"],
    niches: ["entertainment", "education"],
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

  const [hnResult, ghResult, rdResult, hfResult] = await Promise.allSettled([
    scrapeHackerNews(),
    scrapeGitHubTrending(),
    scrapeRedditOpportunities(),
    scrapeHuggingFaceTrending(),
  ]);

  const liveSignals: TrendSignal[] = [];
  const sourcesActive: string[] = [];

  if (hnResult.status === "fulfilled" && hnResult.value.length > 0) {
    liveSignals.push(...hnResult.value);
    sourcesActive.push("Hacker News");
  }
  if (ghResult.status === "fulfilled" && ghResult.value.length > 0) {
    liveSignals.push(...ghResult.value);
    sourcesActive.push("GitHub Trending");
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
  const curatedWithTimestamp: TrendSignal[] = CURATED_FALLBACK_SIGNALS.map((s) => ({
    ...s,
    fetchedAt: nowIso,
  }));

  // Garantimos cobertura de todos os nichos mesclando sinais ao vivo (prioritários) + curados de cobertura
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
    sourcesActive: sourcesActive.length > 0 ? sourcesActive : ["Radar Curado (Offline)"],
    fromCache: false,
  };

  cache.data = response;
  cache.expiresAt = nowMs + CACHE_TTL_MS;

  return response;
}
