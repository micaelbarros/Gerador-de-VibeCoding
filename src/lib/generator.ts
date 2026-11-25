import { z } from "zod";
import {
  AudienceId,
  GenerateRequest,
  IdeaMode,
  MODE_META,
  NicheId,
  PivotAction,
  ProductFormat,
  SkillLevel,
  TimeframeId,
  TrendSignal,
  VibeBlueprint,
  getAudienceLabel,
  getFormatLabel,
  getLevelLabel,
  getNicheLabel,
  getTimeframeLabel,
} from "./types";

type ConcreteNiche = Exclude<NicheId, "all">;
type ConcreteFormat = Exclude<ProductFormat, "any">;
type ConcreteAudience = Exclude<AudienceId, "any">;

interface NicheArchetype {
  namePrefixes: string[];
  nameSuffixes: string[];
  personas: Record<ConcreteAudience, string>;
  painAngles: string[];
  solutionAngles: string[];
  monetizationModels: {
    model: string;
    price: string;
    channel: string;
    whyPay: string;
  }[];
  mvpBlocks: string[];
  antiScope: string[];
}

const NICHE_ARCHETYPES: Record<ConcreteNiche, NicheArchetype> = {
  education: {
    namePrefixes: ["Study", "Learn", "Quiz", "Mind", "Tutor", "Recall"],
    nameSuffixes: ["Pulse", "Spark", "Flow", "Craft", "Forge", "Loop"],
    personas: {
      b2c: "Estudantes universitários, concurseiros e autodidatas sobrecarregados com PDFs e vídeos longos",
      b2b: "Escolas de idiomas, infoprodutores e coordenadores de cursos livres buscando retenção de alunos",
      creators: "Professores independentes e mentores que vendem cursos online ou preparatórios",
      devs: "Desenvolvedores aprendendo novas stacks, arquiteturas ou estudando para entrevistas técnicas",
    },
    painAngles: [
      "Estudantes acumulam dezenas de PDFs, links e aulas gravadas, mas não conseguem transformar esse material em prática ativa nem medir o que realmente aprenderam.",
      "Cursos tradicionais são passivos e genéricos — quem estuda perde horas resumindo conteúdo manualmente em vez de treinar questões direcionadas às próprias lacunas.",
    ],
    solutionAngles: [
      "Converte automaticamente qualquer link, PDF ou anotação em trilhas de revisão ativa, flashcards adaptativos e mini-desafios práticos com feedback imediato.",
      "Um tutor focado em micro-sessões de 10 minutos que identifica exatamente onde o aluno trava e adapta a dificuldade em tempo real.",
    ],
    monetizationModels: [
      {
        model: "Freemium + Plano Pro Mensal",
        price: "R$ 29/mês ou US$ 9/mês",
        channel: "TikTok/Reels de rotina de estudos, comunidades de concursos e grupos universitários",
        whyPay: "Economiza horas de revisão semanal e aumenta diretamente a nota/aprovação em provas.",
      },
      {
        model: "Licença por Turma (B2B EdTech)",
        price: "R$ 199/mês por professor/turma",
        channel: "Prospecção direta para mentores e escolas de nicho no Instagram/LinkedIn",
        whyPay: "Eleva o engajamento dos alunos e reduz cancelamento (churn) de cursos pagos.",
      },
    ],
    mvpBlocks: [
      "Upload ou colagem de texto/link/PDF com extração automática de conceitos-chave",
      "Gerador de quiz interativo + flashcards com algoritmo simples de repetição espaçada",
      "Painel de progresso mostrando pontos fracos e sequência diária (streak)",
      "Modo simulado cronometrado com explicação passo a passo de cada erro",
    ],
    antiScope: [
      "Não criar rede social de alunos nem fórum completo na v1",
      "Não construir plataforma de hospedagem de vídeos (LMS completo)",
      "Não implementar gamificação complexa com loja de avatares",
    ],
  },
  health: {
    namePrefixes: ["Vital", "Care", "Clinic", "Pulse", "Nutri", "Zen"],
    nameSuffixes: ["Flow", "Sync", "Pilot", "Check", "Mate", "AI"],
    personas: {
      b2c: "Pessoas ocupadas tentando manter rotina de sono, treino, alimentação ou controle de sintomas sem planilhas chatas",
      b2b: "Clínicas pequenas, psicólogos, nutricionistas e dentistas que perdem pacientes por atendimento lento",
      creators: "Personal trainers e nutricionistas online que acompanham dezenas de alunos pelo WhatsApp",
      devs: "Profissionais de tecnologia com rotina sedentária que querem hábitos mensuráveis e alertas inteligentes",
    },
    painAngles: [
      "Clínicas e profissionais autônomos de saúde perdem até 30% da receita com faltas não avisadas, remarcações manuais e pré-atendimento lento.",
      "Apps de saúde atuais exigem preenchimento manual exaustivo — 80% das pessoas abandonam na primeira semana por fricção.",
    ],
    solutionAngles: [
      "Interface de zero fricção (por voz, foto ou mensagem curta) que registra rotinas/triagens e gera relatórios visuais prontos para ação ou consulta.",
      "Copiloto de acompanhamento que reduz faltas, organiza pré-consulta e envia lembretes contextualizados automaticamente.",
    ],
    monetizationModels: [
      {
        model: "Assinatura B2B por Profissional/Clínica",
        price: "R$ 97–197/mês por consultório",
        channel: "Contato direto com nutricionistas, psicólogos e clínicas no Instagram/Google Maps",
        whyPay: "Evitar apenas 2 faltas no mês já paga a ferramenta com folga.",
      },
      {
        model: "Assinatura Pessoal + Teste Gratuito de 7 dias",
        price: "R$ 24,90/mês ou US$ 7/mês",
        channel: "Comunidades de corrida, academia, bem-estar e criadores fitness",
        whyPay: "Entrega clareza visual de evolução sem o atrito de registrar tudo manualmente.",
      },
    ],
    mvpBlocks: [
      "Entrada ultrarrápida (1 clique, texto livre ou formulário guiado de 30 segundos)",
      "Linha do tempo visual de evolução, sintomas ou confirmações de consulta",
      "Resumo automático pronto para compartilhar em PDF/link com profissional ou paciente",
      "Alertas inteligentes de lembrete e detecção de queda de consistência",
    ],
    antiScope: [
      "Não oferecer diagnóstico médico (sempre deixar aviso claro de apoio organizacional/educativo)",
      "Não integrar prontuário eletrônico hospitalar complexo na v1",
      "Não exigir integração com Apple Watch/Garmin antes de validar o fluxo web",
    ],
  },
  finance: {
    namePrefixes: ["Cash", "Margin", "Ledger", "Flow", "Pix", "Profit"],
    nameSuffixes: ["Pulse", "Pilot", "Radar", "Guard", "Spark", "OS"],
    personas: {
      b2c: "Jovens adultos e famílias que querem enxergar para onde o dinheiro vai e cortar assinaturas invisíveis",
      b2b: "MEIs, agências enxutas e pequenas empresas que sofrem com cobranças atrasadas e fluxo de caixa imprevisível",
      creators: "Freelancers e criadores com renda variável que precisam separar impostos, reserva e pró-labore",
      devs: "Indie hackers e devs PJ gerenciando múltiplas fontes de receita (Stripe, Pix, dólar, clientes)",
    },
    painAngles: [
      "Freelancers e pequenos negócios perdem dinheiro todos os meses com assinaturas esquecidas, inadimplência sem cobrança amigável e falta de previsibilidade de caixa.",
      "Planilhas financeiras ficam desatualizadas em 3 dias e ERPs tradicionais são caros e complexos demais para quem fatura até R$ 50k/mês.",
    ],
    solutionAngles: [
      "Painel enxuto focado em 1 métrica vital: previsibilidade de caixa em 30/60/90 dias, alertas de cobrança e importação rápida de extratos CSV/OFX.",
      "Simulador e auditor automático que lê faturas/extratos, aponta vazamentos de caixa e gera lembretes prontos de cobrança.",
    ],
    monetizationModels: [
      {
        model: "Assinatura Micro-SaaS (Tier único simples)",
        price: "R$ 49–89/mês ou US$ 19/mês",
        channel: "Comunidades de freelancers, devs PJ, LinkedIn e grupos de empreendedores",
        whyPay: "Recuperar uma única fatura atrasada ou cortar ferramentas ociosas gera ROI imediato de 5x+.",
      },
      {
        model: "Pagamento Único (Lifetime / Pack de Auditoria)",
        price: "R$ 99 pagamento único",
        channel: "Product Hunt, X/Twitter indie hackers e Reddit",
        whyPay: "Público cansado de mais uma assinatura mensal prefere pagar uma vez por utilitário claro.",
      },
    ],
    mvpBlocks: [
      "Importação simples de CSV/extrato ou cadastro rápido de receitas e despesas recorrentes",
      "Detector automático de assinaturas recorrentes e projeção visual de saldo para 90 dias",
      "Gerador de lembretes educados de cobrança (WhatsApp/e-mail) com status pago/pendente",
      "Simulador 'E se?' (ex: reserva de impostos, meta mensal e impacto de novos custos)",
    ],
    antiScope: [
      "Não conectar Open Finance regulamentado na v1 (comece com CSV/manual + templates)",
      "Não emitir notas fiscais eletrônicas (NF-e/NFS-e) no MVP",
      "Não construir contabilidade completa com balanço patrimonial",
    ],
  },
  productivity: {
    namePrefixes: ["Focus", "Flow", "Brief", "Task", "Clear", "Tempo"],
    nameSuffixes: ["OS", "Pilot", "Craft", "Spark", "Box", "Deck"],
    personas: {
      b2c: "Profissionais remotos afogados em abas abertas, reuniões improdutivas e notas espalhadas",
      b2b: "Times pequenos de produto e operações que perdem contexto entre Slack, e-mail, Notion e reuniões",
      creators: "Solopreneurs que precisam gerenciar clientes, entregas e agenda sem montar um ERP no Notion",
      devs: "Engenheiros que querem menos reuniões e resumos objetivos de decisões e tarefas pendentes",
    },
    painAngles: [
      "Profissionais perdem de 4 a 6 horas por semana caçando decisões em atas longas, e-mails intermináveis e abas esquecidas.",
      "Ferramentas tudo-em-um viram cemitérios de tarefas — falta um fluxo opinativo que transforme bagunça em 3 prioridades acionáveis.",
    ],
    solutionAngles: [
      "Recebe texto bruto (ata, áudio transcrito, e-mail ou lista bagunçada) e devolve instantaneamente um plano de ação com donos, prazos e blocos de foco.",
      "Workspace minimalista orientado a execução diária que elimina ruído e exporta resumos prontos para o time ou cliente.",
    ],
    monetizationModels: [
      {
        model: "Freemium + Pro Individual / Equipe",
        price: "US$ 12/mês ou R$ 39/mês",
        channel: "Product Hunt, Reddit r/productivity, LinkedIn e newsletters de produtividade",
        whyPay: "Economiza horas de trabalho operacional repetitivo toda semana.",
      },
    ],
    mvpBlocks: [
      "Caixa de entrada única ('jogue sua bagunça aqui') que estrutura tarefas, prazos e resumos",
      "Modo Foco diário limitado às 3 prioridades críticas com timer integrado",
      "Exportação em 1 clique para Markdown, Notion ou mensagem pronta de status semanal",
      "Histórico pesquisável com tags automáticas",
    ],
    antiScope: [
      "Não tentar clonar o Notion inteiro com dezenas de tipos de blocos",
      "Não construir chat em tempo real ou videoconferência própria",
      "Não adicionar permissões corporativas complexas (RBAC) na v1",
    ],
  },
  devtools: {
    namePrefixes: ["Dev", "Prompt", "Trace", "Ship", "Code", "Agent"],
    nameSuffixes: ["Pulse", "Kit", "Craft", "Forge", "Lens", "Hub"],
    personas: {
      b2c: "Entusiastas de IA e makers no-code/vibecoders querendo automatizar tarefas técnicas",
      b2b: "Times de engenharia de startups buscando reduzir tempo de debug, revisão e documentação",
      creators: "Indie hackers e vibecoders lançando múltiplos projetos rápidos por mês",
      devs: "Desenvolvedores full-stack e engenheiros de IA construindo apps com LLMs, APIs e agentes",
    },
    painAngles: [
      "Com o avanço de agentes e VibeCoding, projetos crescem rápido mas sofrem com falta de visibilidade, prompts desorganizados, regressões silenciosas e setup repetitivo.",
      "Devs perdem tempo alternando entre logs, documentação desatualizada e testes manuais de endpoints/prompts.",
    ],
    solutionAngles: [
      "Ferramenta developer-first ultrarrápida que conecta direto no fluxo (Git/URL/JSON/Prompt) e gera diagnósticos, artefatos ou automações reutilizáveis em segundos.",
      "Painel visual + exportação amigável para código/CLI que elimina trabalho braçal em projetos modernos com IA.",
    ],
    monetizationModels: [
      {
        model: "Open-Core / Pro para Devs e Times",
        price: "US$ 15–29/mês por assento (ou licença vitalícia US$ 49)",
        channel: "Show HN (Hacker News), GitHub, X/Twitter dev community e Discord de IA",
        whyPay: "Devs e empresas pagam rápido por ferramentas que cortam horas de debug ou aceleram entregas.",
      },
    ],
    mvpBlocks: [
      "Input técnico direto (colar URL de repo, schema, log, prompt ou arquivo JSON/YAML)",
      "Análise/transformação instantânea com diff visual claro e métricas acionáveis",
      "Exportação pronta para copiar (CLI command, Markdown, JSON ou snippet de código)",
      "Biblioteca local de presets/templates reutilizáveis com histórico",
    ],
    antiScope: [
      "Não construir uma IDE completa no navegador",
      "Não exigir instalação complexa de infraestrutura própria (Kubernetes/Docker) para testar",
      "Não suportar 20 linguagens de programação no dia 1 — foque em JS/TS + Python",
    ],
  },
  ecommerce: {
    namePrefixes: ["Cart", "Convert", "Offer", "Shop", "Lead", "Pitch"],
    nameSuffixes: ["Boost", "Pulse", "Radar", "Lab", "Spark", "AI"],
    personas: {
      b2c: "Compradores online buscando comparar ofertas reais, alertas de queda de preço e resumos honestos de reviews",
      b2b: "Donos de e-commerce (Shopify/Nuvemshop) e gestores de tráfego buscando aumentar taxa de conversão",
      creators: "Infoprodutores e vendedores independentes otimizando páginas de vendas e anúncios",
      devs: "Builders de SaaS tentando melhorar copy da landing page e prospecção outbound",
    },
    painAngles: [
      "Lojas virtuais gastam pesado em tráfego pago, mas perdem vendas por páginas de produto genéricas, FAQs que não respondem objeções reais e falta de análise dos reviews dos concorrentes.",
      "Times comerciais perdem horas pesquisando leads manualmente antes de mandar uma abordagem personalizada.",
    ],
    solutionAngles: [
      "Recebe a URL de uma página de produto/landing ou lista de reviews e entrega uma auditoria acionável de conversão + reescrita pronta de copy, objeções e oferta.",
      "Radar competitivo que monitora argumentos de venda, avaliações negativas do mercado e sugere ângulos prontos para anúncios e e-mails.",
    ],
    monetizationModels: [
      {
        model: "Assinatura por Créditos / Lojas",
        price: "R$ 97–247/mês ou US$ 29/mês",
        channel: "Grupos de Shopify/Nuvemshop, agências de performance e LinkedIn",
        whyPay: "Subir 0,5% na taxa de conversão de uma loja já gera milhares de reais extras por mês.",
      },
    ],
    mvpBlocks: [
      "Entrada via URL ou texto da página de produto/reviews com extração estruturada",
      "Relatório de diagnóstico com nota de conversão, objeções ocultas e pontos de melhoria",
      "Gerador de variações prontas (headline, bullet points, FAQ e 3 roteiros de anúncio)",
      "Comparativo antes/depois exportável para enviar ao cliente ou time",
    ],
    antiScope: [
      "Não construir plataforma completa de checkout ou carrinho próprio",
      "Não integrar APIs de Meta Ads e Google Ads na v1",
      "Não criar CRM completo com funil de vendas multi-equipes",
    ],
  },
  creators: {
    namePrefixes: ["Hook", "Clip", "Creator", "Reel", "Story", "Studio"],
    nameSuffixes: ["Spark", "Flow", "Lab", "Pulse", "Deck", "Kit"],
    personas: {
      b2c: "Pessoas começando a produzir conteúdo no YouTube, TikTok ou LinkedIn sem saber o que postar",
      b2b: "Agências de conteúdo e social media managers gerenciando vários perfis ao mesmo tempo",
      creators: "YouTubers, podcasters, escritores de newsletter e criadores solo querendo multiplicar alcance",
      devs: "DevRels e builders fazendo 'build in public' que precisam transformar commits em conteúdo envolvente",
    },
    painAngles: [
      "Criadores passam horas produzindo um vídeo, podcast ou artigo longo e depois não têm tempo/energia para adaptar o material em ganchos, carrosséis, shorts e newsletters.",
      "Bloqueio criativo na hora de criar títulos, thumbnails e roteiros alinhados com os assuntos quentes da semana.",
    ],
    solutionAngles: [
      "Fábrica de reaproveitamento criativo: cola 1 link, roteiro ou transcrição e recebe um pacote multiformato (ganchos virais, carrossel, post LinkedIn e roteiro curto) mantendo o tom de voz do criador.",
      "Radar de pautas + laboratório de ganchos que cruza tendências da semana com o nicho do criador.",
    ],
    monetizationModels: [
      {
        model: "Assinatura Mensal Creator / Agência",
        price: "R$ 49/mês (Solo) · R$ 149/mês (Agência)",
        channel: "Vídeos curtos mostrando o antes/depois no TikTok, Reels e X/Twitter",
        whyPay: "Economiza 5+ horas semanais de produção e mantém consistência de postagem.",
      },
    ],
    mvpBlocks: [
      "Entrada por texto, link de artigo ou transcrição de vídeo + seleção de tom de voz",
      "Geração simultânea de 4 formatos (ganchos de vídeo curto, thread, carrossel e newsletter)",
      "Preview visual estilo card/carrossel com edição inline rápida",
      "Calendário enxuto de pautas salvas e botão de copiar tudo em 1 clique",
    ],
    antiScope: [
      "Não construir editor de vídeo completo na timeline na v1",
      "Não integrar publicação automática em 6 redes sociais (OAuth complexo) no MVP",
      "Não criar marketplace de patrocínios",
    ],
  },
  local: {
    namePrefixes: ["Local", "Bairro", "Agenda", "Mesa", "Ponto", "Balcao"],
    nameSuffixes: ["Flow", "Pulse", "Zap", "Pro", "Radar", "Hub"],
    personas: {
      b2c: "Moradores procurando serviços confiáveis no bairro com agendamento simples",
      b2b: "Donos de restaurantes, barbearias, salões, oficinas e imobiliárias locais",
      creators: "Prestadores de serviço autônomos (fotógrafos, arquitetos, professores particulares)",
      devs: "Freelancers construindo soluções white-label para vender para comércios da própria cidade",
    },
    painAngles: [
      "Negócios locais deixam dinheiro na mesa todos os dias com avaliações negativas sem resposta no Google, filas desorganizadas e clientes que somem após o primeiro atendimento.",
      "Softwares tradicionais para comércio local têm visual dos anos 2000 e exigem treinamento longo.",
    ],
    solutionAngles: [
      "Painel super simples focado em celular para o dono do negócio gerenciar reputação, captar reviews via QR Code e automatizar retorno de clientes.",
      "Ferramenta plug-and-play que funciona em 5 minutos sem precisar de computador nem equipe de TI.",
    ],
    monetizationModels: [
      {
        model: "Assinatura Mensal Local (Alto LTV)",
        price: "R$ 79–149/mês por estabelecimento",
        channel: "Abordagem local via WhatsApp/visita rápida mostrando uma prévia personalizada com o nome da loja",
        whyPay: "Mais avaliações 5 estrelas e clientes recorrentes trazem faturamento direto toda semana.",
      },
    ],
    mvpBlocks: [
      "Gerador de página/QR Code de captura de avaliação + redirecionamento inteligente",
      "Painel de respostas sugeridas para avaliações e mensagens rápidas de pós-venda (WhatsApp)",
      "Cadastro simples de clientes recorrentes com lembrete de retorno",
      "Relatório mensal de 1 página mostrando impacto gerado",
    ],
    antiScope: [
      "Não fazer frente de caixa (PDV) fiscal com emissão de NFC-e na v1",
      "Não construir app nativo separado nas lojas (comece mobile-first web/PWA)",
      "Não criar gestão de estoque de milhares de SKUs",
    ],
  },
  entertainment: {
    namePrefixes: ["Vibe", "Pixel", "Daily", "Quest", "Arena", "Play"],
    nameSuffixes: ["Drop", "Loop", "Clash", "Pulse", "Spark", "Box"],
    personas: {
      b2c: "Pessoas buscando pausas divertidas de 3 minutos no dia e desafios para competir com amigos",
      b2b: "Empresas e eventos buscando dinâmicas interativas de quebra-gelo para times remotos",
      creators: "Streamers e criadores de comunidade que querem mini-games ao vivo com o chat",
      devs: "Devs criativos explorando interações, animações, áudio web e mecânicas virais",
    },
    painAngles: [
      "Jogos casuais modernos estão entupidos de anúncios invasivos e pay-to-win — há forte demanda por micro-experiências diárias limpas, rápidas e compartilháveis.",
      "Comunidades online e grupos de amigos adoram desafios diários com placar compartilhável (efeito Wordle).",
    ],
    solutionAngles: [
      "Micro-experiência diária jogável no navegador em menos de 2 minutos, com geração dinâmica baseada em temas atuais e card visual pronto para compartilhar o placar sem spoilers.",
      "Sala interativa instantânea por link (sem cadastro obrigatório) para jogar solo ou desafiar amigos.",
    ],
    monetizationModels: [
      {
        model: "Patrocínio de Nicho / Pacotes Temáticos / Apoio da Comunidade",
        price: "Grátis (viral) + US$ 5 pacotes extras ou patrocínio semanal",
        channel: "Compartilhamento orgânico do placar no X/Twitter, WhatsApp, Discord e Reddit",
        whyPay: "Experiências virais monetizam com patrocínios de nicho, modos privados para empresas ou cosméticos.",
      },
    ],
    mvpBlocks: [
      "Loop principal jogável completo em menos de 10 segundos ao abrir o site (zero login obrigatório)",
      "Desafio diário determinístico (igual para todos no mesmo dia) + modo infinito",
      "Botão 'Compartilhar Resultado' estilo grade de emojis/card visual pronto para WhatsApp/X",
      "Estatísticas locais (sequência de vitórias, recorde pessoal e histórico)",
    ],
    antiScope: [
      "Não construir engine 3D multiplayer massiva na v1",
      "Não exigir criação de conta antes da primeira partida",
      "Não adicionar chat aberto sem moderação",
    ],
  },
  sustainability: {
    namePrefixes: ["Eco", "Green", "Zero", "Terra", "Solar", "Ciclo"],
    nameSuffixes: ["Pulse", "Lens", "Track", "Spark", "Map", "Flow"],
    personas: {
      b2c: "Famílias e consumidores querendo reduzir desperdício de alimentos e economizar na conta de energia/água",
      b2b: "Restaurantes, condomínios e PMEs buscando reduzir custos operacionais e comprovar metas ESG",
      creators: "Projetos comunitários, ONGs e educadores ambientais",
      devs: "Participantes de hackathons de impacto cívico e climático buscando demos visuais memoráveis",
    },
    painAngles: [
      "Famílias e restaurantes jogam fora parte relevante da compra mensal por esquecer validades ou não enxergar picos invisíveis de consumo de energia.",
      "Sustentabilidade só engaja de verdade quando se traduz em economia financeira visível no bolso do usuário.",
    ],
    solutionAngles: [
      "Transforma uma foto ou registro rápido (conta de luz, despensa ou sobras) em plano prático de economia financeira + impacto ambiental mensurável em reais e kg de CO₂.",
      "Painel visual de impacto que conecta ações cotidianas simples a economia real no fim do mês.",
    ],
    monetizationModels: [
      {
        model: "B2B (Condomínios/Restaurantes) ou Editais/Parcerias ESG",
        price: "R$ 149/mês para estabelecimentos ou patrocínio institucional",
        channel: "Hackathons de impacto, aceleradoras ESG e abordagem a restaurantes/condomínios",
        whyPay: "Redução direta de desperdício operacional e conta de energia paga o software no primeiro mês.",
      },
    ],
    mvpBlocks: [
      "Entrada guiada ou por foto/fatura para calcular desperdício ou consumo atual",
      "Calculadora de impacto duplo: economia em Reais (R$) + redução de CO₂/desperdício",
      "Plano semanal de ações práticas (ex: receitas anti-desperdício ou alertas de horário de pico)",
      "Relatório visual compartilhável de impacto acumulado",
    ],
    antiScope: [
      "Não depender de sensores IoT proprietários na v1 (simule ou use entrada manual/foto)",
      "Não construir certificação oficial de créditos de carbono no MVP",
      "Não tentar cobrir todas as verticais ambientais de uma vez — escolha 1 hábito claro",
    ],
  },
};

const CREATIVE_CONSTRAINTS = [
  "Interface completa em 1 única tela (zero páginas secundárias ou menus escondidos).",
  "Zero banco de dados na v1 — toda persistência via URL compartilhável ou localStorage.",
  "Resultado útil em menos de 15 segundos após abrir o site, sem pedir login ou cadastro.",
  "Inclua 1 micro-interação memorável (atalho de teclado Cmd+K, som sutil ou efeito visual satisfatório).",
  "Design brutalista-minimalista com no máximo 3 cores e tipografia gigante.",
  "Modo 'Demo Instantânea' com 1 clique carregando dados reais de exemplo para impressionar na hora.",
];

const STACK_BY_FORMAT: Record<ConcreteFormat, Record<SkillLevel, string[]>> = {
  webapp: {
    beginner: ["Next.js (App Router)", "Tailwind CSS", "Lucide Icons", "localStorage", "Vercel"],
    intermediate: ["Next.js + TypeScript", "Tailwind CSS + shadcn/ui", "API Routes + Zod", "SQLite / Supabase", "Gemini API"],
    advanced: ["Next.js + TypeScript", "Vercel AI SDK (Streaming)", "Neon Postgres + Drizzle", "Background Jobs / Cron", "Stripe Checkout"],
  },
  "ai-agent": {
    beginner: ["Next.js + TypeScript", "Gemini API (JSON Mode)", "Tailwind CSS", "Fetch API"],
    intermediate: ["Next.js + Vercel AI SDK", "Tool Calling + Zod", "Cheerio / Scraping leve", "Supabase"],
    advanced: ["Next.js + Vercel AI SDK Agents", "Structured Outputs + Multi-step Tools", "Playwright/Browser API", "Postgres + pgvector"],
  },
  extension: {
    beginner: ["Manifest V3", "React + Vite + Tailwind", "Chrome Storage API", "TypeScript"],
    intermediate: ["Plasmo / WXT Framework", "TypeScript + Tailwind", "Content Scripts + Side Panel API", "Gemini API"],
    advanced: ["WXT + React + TypeScript", "Chrome Side Panel + Background Worker", "Backend Next.js Sync", "Stripe / LemonSqueezy"],
  },
  bot: {
    beginner: ["Node.js + TypeScript", "Telegram Bot API (grammY)", "JSON/SQLite", "Gemini API"],
    intermediate: ["Next.js Webhooks", "WhatsApp Cloud API ou Telegram", "Supabase", "Vercel AI SDK"],
    advanced: ["TypeScript + Queue Worker", "WhatsApp Business API + Áudio (Whisper)", "Postgres + Redis", "Painel Admin Next.js"],
  },
  mobile: {
    beginner: ["Next.js PWA (Mobile-First)", "Tailwind CSS", "Web Share API", "localStorage"],
    intermediate: ["Expo (React Native) + TypeScript", "NativeWind", "Supabase", "Gemini API"],
    advanced: ["Expo + Expo Router", "Offline-First Sync (SQLite)", "Push Notifications", "RevenueCat"],
  },
  cli: {
    beginner: ["Node.js + TypeScript", "Commander.js", "Chalk / Ora", "FS local"],
    intermediate: ["TypeScript + Clack Prompts", "Zod", "APIs REST / Cheerio", "NPM Package"],
    advanced: ["TypeScript + Ink (React no Terminal)", "MCP Server / AI SDK", "SQLite local", "GitHub Actions Release"],
  },
};

const llmResponseSchema = z.object({
  title: z.string().min(2),
  tagline: z.string().min(10),
  whyNow: z.string().min(20),
  problem: z.string().min(20),
  targetPersona: z.string().min(10),
  solutionSummary: z.string().min(20),
  monetization: z.object({
    potential: z.enum(["Alto", "Muito Alto", "Médio", "Opcional (Portfólio)"]),
    model: z.string(),
    suggestedPrice: z.string(),
    firstChannel: z.string(),
    whyPeoplePay: z.string(),
  }),
  mvpFeatures: z.array(z.string()).min(3).max(5),
  antiScope: z.array(z.string()).min(2).max(4),
  suggestedStack: z.array(z.string()).min(3).max(6),
  creativeConstraint: z.string().optional(),
  hackathonHook: z.string().optional(),
  learningGoals: z.array(z.string()).optional(),
  masterPrompt: z.string().min(80),
});

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function resolveFilters(req: GenerateRequest, primarySignal: TrendSignal): {
  niche: ConcreteNiche;
  format: ConcreteFormat;
  audience: ConcreteAudience;
  timeframe: TimeframeId;
  level: SkillLevel;
} {
  let niche: ConcreteNiche =
    req.niche !== "all"
      ? req.niche
      : primarySignal.niches[0] || "productivity";

  let format: ConcreteFormat =
    req.format !== "any"
      ? req.format
      : req.mode === "challenge"
        ? pickRandom<ConcreteFormat>(["webapp", "extension", "cli"])
        : req.mode === "hackathon"
          ? pickRandom<ConcreteFormat>(["ai-agent", "webapp", "extension"])
          : req.mode === "money"
            ? pickRandom<ConcreteFormat>(["webapp", "ai-agent", "bot"])
            : pickRandom<ConcreteFormat>(["webapp", "cli", "ai-agent", "mobile"]);

  let audience: ConcreteAudience =
    req.audience !== "any"
      ? req.audience
      : req.mode === "money"
        ? pickRandom<ConcreteAudience>(["b2b", "creators"])
        : req.mode === "study"
          ? pickRandom<ConcreteAudience>(["devs", "b2c"])
          : pickRandom<ConcreteAudience>(["b2c", "b2b", "creators", "devs"]);

  let timeframe = req.timeframe;
  const level = req.level;

  if (req.pivot === "b2b") audience = "b2b";
  if (req.pivot === "extension") format = "extension";
  if (req.pivot === "simpler") timeframe = "2h";
  if (req.pivot === "monetize") audience = "b2b";

  if (!NICHE_ARCHETYPES[niche]) {
    niche = "productivity";
  }

  return { niche, format, audience, timeframe, level };
}

export function selectRelevantTrends(
  allSignals: TrendSignal[],
  req: GenerateRequest
): TrendSignal[] {
  if (req.focusTrendId) {
    const focused = allSignals.find((s) => s.id === req.focusTrendId);
    if (focused) {
      const others = allSignals
        .filter((s) => s.id !== focused.id && s.niches.some((n) => focused.niches.includes(n)))
        .slice(0, 2);
      return [focused, ...others];
    }
  }

  const excluded = new Set(req.excludeTrendIds ?? []);
  const pool = allSignals.filter((s) => !excluded.has(s.id));
  const candidates = pool.length > 0 ? pool : allSignals;

  const scored = candidates.map((sig) => {
    let weight = sig.heatScore;
    if (sig.isLive) weight += 18;
    if (req.niche !== "all" && sig.niches.includes(req.niche)) weight += 45;
    if (sig.bestModes.includes(req.mode)) weight += 22;
    // Ruído controlado para manter variedade a cada sorteio
    weight += Math.random() * 28;
    return { sig, weight };
  });

  scored.sort((a, b) => b.weight - a.weight);

  const topPool = scored.slice(0, Math.min(8, scored.length));
  const primary = topPool[Math.floor(Math.random() * Math.min(4, topPool.length))]?.sig ?? candidates[0];
  const secondary = scored
    .filter((item) => item.sig.id !== primary.id)
    .slice(0, 2)
    .map((item) => item.sig);

  return [primary, ...secondary].filter(Boolean);
}

function buildMasterPrompt(params: {
  title: string;
  tagline: string;
  mode: IdeaMode;
  niche: ConcreteNiche;
  format: ConcreteFormat;
  timeframe: TimeframeId;
  level: SkillLevel;
  audience: ConcreteAudience;
  problem: string;
  solutionSummary: string;
  mvpFeatures: string[];
  antiScope: string[];
  suggestedStack: string[];
  primarySignal: TrendSignal;
  creativeConstraint?: string;
}): string {
  const modeLabel = MODE_META[params.mode].label;
  return [
    `Atue como um Engenheiro Full-Stack Sênior e Product Designer especialista em VibeCoding.`,
    `Vamos construir o MVP do "${params.title}" — ${params.tagline}`,
    ``,
    `CONTEXTO DO PROJETO:`,
    `- Objetivo: ${modeLabel} | Nicho: ${getNicheLabel(params.niche)} | Formato: ${getFormatLabel(params.format)}`,
    `- Tempo alvo: ${getTimeframeLabel(params.timeframe)} | Nível: ${getLevelLabel(params.level)} | Público: ${getAudienceLabel(params.audience)}`,
    `- Inspiração / Tendência atual: "${params.primarySignal.title}" (${params.primarySignal.sourceLabel})`,
    ``,
    `PROBLEMA & SOLUÇÃO:`,
    `- Dor: ${params.problem}`,
    `- Solução: ${params.solutionSummary}`,
    ``,
    `ESCOPO EXATO DO MVP (implemente somente isso primeiro):`,
    ...params.mvpFeatures.map((f, i) => `${i + 1}. ${f}`),
    ``,
    `ANTI-ESCOPO (NÃO implemente agora):`,
    ...params.antiScope.map((a) => `- ${a}`),
    params.creativeConstraint ? `\nRESTRIÇÃO CRIATIVA OBRIGATÓRIA:\n- ${params.creativeConstraint}` : "",
    ``,
    `STACK SUGERIDA: ${params.suggestedStack.join(", ")}.`,
    ``,
    `COMO COMEÇAR:`,
    `1. Crie primeiro a arquitetura limpa de pastas e os tipos de dados.`,
    `2. Monte uma interface moderna, responsiva e já com um botão "Carregar Exemplo" para testar o fluxo completo em 1 clique.`,
    `3. Priorize experiência real funcionando ponta a ponta antes de otimizações secundárias.`,
  ]
    .filter((line) => line !== "")
    .join("\n");
}

function buildHybridBlueprint(
  req: GenerateRequest,
  sources: TrendSignal[]
): VibeBlueprint {
  const primary = sources[0];
  const resolved = resolveFilters(req, primary);
  const arch = NICHE_ARCHETYPES[resolved.niche];

  const prefix = pickRandom(arch.namePrefixes);
  const suffix = pickRandom(arch.nameSuffixes);
  const pivotTag =
    req.pivot === "simpler"
      ? " Lite"
      : req.pivot === "b2b"
        ? " Pro"
        : req.pivot === "extension"
          ? " Clip"
          : "";
  const title = `${prefix}${suffix}${pivotTag}`;

  const formatLabel = getFormatLabel(resolved.format);
  const nicheLabel = getNicheLabel(resolved.niche);
  const persona = arch.personas[resolved.audience];
  const pain = pickRandom(arch.painAngles);
  const solutionBase = pickRandom(arch.solutionAngles);
  const monetizationBase = pickRandom(arch.monetizationModels);

  const pivotNote =
    req.pivot === "simpler"
      ? " Versão ultra-enxuta focada em 1 única ação executável em menos de 2 horas."
      : req.pivot === "b2b"
        ? " Reposicionada para equipes e PMEs, priorizando relatório pronto para gestores e ticket recorrente."
        : req.pivot === "extension"
          ? " Entregue como extensão leve de navegador que atua diretamente na aba onde o usuário já trabalha."
          : req.pivot === "monetize"
            ? " Estruturada com paywall de valor claro e foco agressivo em ROI mensurável."
            : "";

  const tagline = `${formatLabel} para ${nicheLabel.toLowerCase()} inspirado na tendência "${primary.title.slice(0, 68)}${primary.title.length > 68 ? "..." : ""}".`;

  const whyNow = `O sinal "${primary.title}" está em destaque no ${primary.sourceLabel} (índice de tração ${primary.heatScore}/100). Cruzando essa movimentação atual com o mercado de ${nicheLabel}, existe uma janela clara para lançar uma ferramenta focada e moderna antes dos players tradicionais reagirem.`;

  const solutionSummary = `${solutionBase} Construído como ${formatLabel.toLowerCase()} voltado para ${persona.toLowerCase()}, adaptando o padrão em alta visto em "${primary.title}" para um fluxo direto de alto valor.${pivotNote}`;

  const featureCount = resolved.timeframe === "2h" ? 3 : 4;
  const mvpFeatures = arch.mvpBlocks.slice(0, featureCount);
  if (resolved.format === "extension") {
    mvpFeatures[0] = `Botão flutuante/Side Panel na aba ativa que captura o contexto da página automaticamente`;
  } else if (resolved.format === "bot") {
    mvpFeatures[0] = `Fluxo conversacional via WhatsApp/Telegram recebendo texto ou áudio curto e respondendo em segundos`;
  } else if (resolved.format === "cli") {
    mvpFeatures[0] = `Comando único no terminal (npx ${title.toLowerCase().replace(/\s+/g, "-")}) com output colorido e exportação em Markdown/JSON`;
  }

  const stack = STACK_BY_FORMAT[resolved.format][resolved.level];

  const monetizationPotential: VibeBlueprint["monetization"]["potential"] =
    req.mode === "money" || req.pivot === "monetize"
      ? "Muito Alto"
      : req.mode === "study"
        ? "Opcional (Portfólio)"
        : req.mode === "hackathon"
          ? "Alto"
          : "Médio";

  const creativeConstraint =
    req.mode === "challenge" || req.pivot === "simpler"
      ? pickRandom(CREATIVE_CONSTRAINTS)
      : undefined;

  const hackathonHook =
    req.mode === "hackathon"
      ? `Faça a demo ao vivo em 90 segundos: abra com um dado real do dia (${primary.sourceLabel}), clique em 1 botão e mostre o resultado gerado em tempo real com métrica de impacto na tela.`
      : undefined;

  const learningGoals =
    req.mode === "study"
      ? [
          `Arquitetura limpa para ${formatLabel} usando ${stack.slice(0, 2).join(" e ")}`,
          `Integração de coleta de dados/APIs reais com tratamento de erros e cache`,
          `Design de interface responsiva focada em clareza e micro-interações`,
          `Deploy em produção e documentação de caso de estudo para portfólio`,
        ]
      : undefined;

  const masterPrompt = buildMasterPrompt({
    title,
    tagline,
    mode: req.mode,
    niche: resolved.niche,
    format: resolved.format,
    timeframe: resolved.timeframe,
    level: resolved.level,
    audience: resolved.audience,
    problem: pain,
    solutionSummary,
    mvpFeatures,
    antiScope: arch.antiScope,
    suggestedStack: stack,
    primarySignal: primary,
    creativeConstraint,
  });

  const opportunityScore = Math.min(
    98,
    Math.max(
      72,
      Math.round(
        primary.heatScore * 0.65 +
          (req.mode === "money" ? 28 : 22) +
          (primary.isLive ? 6 : 0)
      )
    )
  );

  return {
    id: `bp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title,
    tagline,
    mode: req.mode,
    niche: resolved.niche,
    format: resolved.format,
    timeframe: resolved.timeframe,
    level: resolved.level,
    audience: resolved.audience,
    opportunityScore,
    whyNow,
    problem: pain,
    targetPersona: persona,
    solutionSummary,
    monetization: {
      potential: monetizationPotential,
      model: monetizationBase.model,
      suggestedPrice: monetizationBase.price,
      firstChannel: monetizationBase.channel,
      whyPeoplePay: monetizationBase.whyPay,
    },
    mvpFeatures,
    antiScope: arch.antiScope,
    suggestedStack: stack,
    creativeConstraint,
    hackathonHook,
    learningGoals,
    masterPrompt,
    sources,
    engine: "hybrid-live",
    generatedAt: new Date().toISOString(),
  };
}

async function tryGenerateWithLLM(
  req: GenerateRequest,
  sources: TrendSignal[],
  resolved: ReturnType<typeof resolveFilters>
): Promise<{ parsed: z.infer<typeof llmResponseSchema>; engine: "gemini" | "openai" } | null> {
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  if (!geminiKey && !openaiKey) return null;

  const modeMeta = MODE_META[req.mode];
  const signalsContext = sources
    .map((s, i) => `${i + 1}. [${s.sourceLabel} | heat ${s.heatScore}/100] ${s.title} — ${s.summary}`)
    .join("\n");

  const pivotInstruction = req.pivot
    ? `PIVÔ SOLICITADO SOBRE A IDEIA ANTERIOR ("${req.previousTitle || ""}"): ${
        req.pivot === "simpler"
          ? "Torne radicalmente mais simples (executável em 2h, 1 tela)."
          : req.pivot === "b2b"
            ? "Reposicione para B2B / PMEs com ticket recorrente maior."
            : req.pivot === "extension"
              ? "Adapte para ser uma Extensão de Chrome/Navegador."
              : "Maximize o potencial de retorno monetário imediato."
      }`
    : "";

  const prompt = `Você é um estrategista de produtos digitais e especialista em VibeCoding.
Crie uma ideia ORIGINAL, concreta e altamente acionável em PORTUGUÊS (pt-BR), fundamentada nos sinais reais de tendência coletados hoje.

FILTROS DO USUÁRIO:
- Modo: ${modeMeta.label} (${modeMeta.description})
- Nicho: ${getNicheLabel(resolved.niche)}
- Formato: ${getFormatLabel(resolved.format)}
- Tempo disponível: ${getTimeframeLabel(resolved.timeframe)}
- Nível técnico: ${getLevelLabel(resolved.level)}
- Público-alvo: ${getAudienceLabel(resolved.audience)}
${pivotInstruction}

TENDÊNCIAS REAIS COLETADAS HOJE:
${signalsContext}

Retorne APENAS um JSON válido com esta estrutura exata (sem markdown):
{
  "title": "Nome criativo e curto do projeto",
  "tagline": "Pitch de 1 frase direta",
  "whyNow": "Explique em 2-3 frases por que esta ideia é quente agora conectando explicitamente aos sinais acima",
  "problem": "Dor real e específica que o produto resolve",
  "targetPersona": "Quem exatamente vai usar/comprar isso",
  "solutionSummary": "Como funciona na prática em 2-3 frases",
  "monetization": {
    "potential": "Alto" | "Muito Alto" | "Médio" | "Opcional (Portfólio)",
    "model": "Modelo de negócio",
    "suggestedPrice": "Faixa de preço realista em R$ ou US$",
    "firstChannel": "Como conseguir os primeiros 10 clientes/usuários",
    "whyPeoplePay": "Motivo racional/ROI para pagar"
  },
  "mvpFeatures": ["3 a 5 features essenciais e concretas"],
  "antiScope": ["3 coisas para NÃO construir na v1"],
  "suggestedStack": ["4 a 5 tecnologias coerentes com o formato e nível"],
  "creativeConstraint": "Opcional: se modo for Desafio, inclua uma restrição divertida",
  "hackathonHook": "Opcional: se modo for Hackathon, dica de demo de 90s para jurados",
  "learningGoals": ["Opcional: se modo for Estudo, 3-4 aprendizados técnicos"],
  "masterPrompt": "Um prompt completo, detalhado e pronto para o usuário copiar e colar em uma IA de VibeCoding para construir este MVP do zero"
}`;

  try {
    if (geminiKey) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(geminiKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.9,
            },
          }),
        }
      );

      if (res.ok) {
        const data = (await res.json()) as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        };
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = llmResponseSchema.safeParse(JSON.parse(rawText));
          if (parsed.success) {
            return { parsed: parsed.data, engine: "gemini" };
          }
        }
      }
    }

    if (openaiKey) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          response_format: { type: "json_object" },
          temperature: 0.9,
          messages: [
            { role: "system", content: "Retorne apenas JSON válido em português do Brasil." },
            { role: "user", content: prompt },
          ],
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const rawText = data.choices?.[0]?.message?.content;
        if (rawText) {
          const parsed = llmResponseSchema.safeParse(JSON.parse(rawText));
          if (parsed.success) {
            return { parsed: parsed.data, engine: "openai" };
          }
        }
      }
    }
  } catch (err) {
    console.warn("LLM generation failed, falling back to hybrid engine:", err);
  }

  return null;
}

export async function generateVibeBlueprint(
  req: GenerateRequest,
  allSignals: TrendSignal[]
): Promise<VibeBlueprint> {
  const sources = selectRelevantTrends(allSignals, req);
  const primary = sources[0];
  const resolved = resolveFilters(req, primary);

  const llmResult = await tryGenerateWithLLM(req, sources, resolved);
  if (llmResult) {
    const d = llmResult.parsed;
    return {
      id: `bp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: d.title,
      tagline: d.tagline,
      mode: req.mode,
      niche: resolved.niche,
      format: resolved.format,
      timeframe: resolved.timeframe,
      level: resolved.level,
      audience: resolved.audience,
      opportunityScore: Math.min(99, Math.max(76, primary.heatScore + 4)),
      whyNow: d.whyNow,
      problem: d.problem,
      targetPersona: d.targetPersona,
      solutionSummary: d.solutionSummary,
      monetization: d.monetization,
      mvpFeatures: d.mvpFeatures,
      antiScope: d.antiScope,
      suggestedStack: d.suggestedStack,
      creativeConstraint: d.creativeConstraint,
      hackathonHook: d.hackathonHook,
      learningGoals: d.learningGoals,
      masterPrompt: d.masterPrompt,
      sources,
      engine: llmResult.engine,
      generatedAt: new Date().toISOString(),
    };
  }

  return buildHybridBlueprint(req, sources);
}
