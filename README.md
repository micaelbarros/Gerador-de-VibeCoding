# VibeSpark — Gerador de VibeCoding

Gerador inteligente de ideias para **VibeCoding** conectado a tendências reais e atuais da internet — feito para **Retorno Monetário (Micro-SaaS)**, **Hackathons**, **Estudo & Portfólio** e **Desafios Relâmpago**.

## O que o MVP faz

- **Motor de Tendências Ao Vivo (`/api/trends`)**: coleta sinais em tempo real do **Hacker News** (Top & Show HN), **GitHub Trending** (web scraping leve com Cheerio), **Reddit** (`r/SomebodyMakeThis`, `r/microsaas`, `r/SaaS`, `r/SideProject`) e **Hugging Face Trending Spaces**, com cache de 15 minutos e fallback curado resiliente.
- **4 Modos de Uso**: Retorno Monetário, Hackathon, Estudo & Portfólio e Desafio Relâmpago.
- **Filtros Completos**: 10 nichos (Educação, Saúde, Finanças, Produtividade, DevTools & IA, E-commerce, Criadores, Negócios Locais, Entretenimento e Sustentabilidade), Formato, Tempo Disponível, Nível Técnico e Público-alvo.
- **Vibe Blueprint Completo (`/api/generate`)**: entrega nome, pitch, score de momento, fontes reais clicáveis, plano de monetização, escopo cirúrgico do MVP (com checklist interativo), anti-escopo (*o que não fazer na v1*), stack recomendada e um **Prompt Mestre pronto para copiar e colar na IA**.
- **Roleta (Me Surpreenda)**, **Pivôs rápidos** (*Mais simples*, *B2B*, *Extensão*, *Monetizar*), **Radar de Tendências Ao Vivo**, **Quadro de Salvos** (`Ideia → Vibecodando → Lançado`) e **Exportação para `PRD.md`**.

---

## Como rodar localmente

```bash
# 1. Instale as dependências
npm install

# 2. (Opcional) Configure uma chave de IA para síntese criativa com LLM
cp .env.example .env.local

# 3. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

> **Funciona sem API Key!** Se `GEMINI_API_KEY` ou `OPENAI_API_KEY` não estiverem configuradas, o VibeSpark usa automaticamente o **Motor Híbrido** cruzando as tendências reais raspadas no dia. Ao adicionar uma chave no `.env.local`, ele ativa automaticamente a síntese criativa via Gemini (`gemini-2.5-flash`) ou OpenAI (`gpt-4o-mini`).

---

## Documentação & Planejamento

- [BRAINSTORM.md](./BRAINSTORM.md) — Concepção do produto, naming, arquitetura do motor de tendências e roadmap de evolução.

## Stack

- **Next.js 15 (App Router)** + **React 19** + **TypeScript**
- **Tailwind CSS v4** + **Lucide Icons**
- **Cheerio** (scraping leve de tendências) + **Zod** (validação de schemas)
