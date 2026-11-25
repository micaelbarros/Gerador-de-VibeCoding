import { z } from "zod";
import {
  AudienceId,
  GenerateRequest,
  IdeaMode,
  MODE_META,
  NicheId,
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

interface ConcreteIdeaSeed {
  title: string;
  tagline: string;
  problem: string;
  solution: string;
  preferredFormats: ConcreteFormat[];
  mvpFeatures: string[];
  antiScope: string[];
}

interface NicheCatalog {
  whyNowContext: string;
  personas: Record<ConcreteAudience, string>;
  monetization: {
    model: string;
    price: string;
    channel: string;
    whyPay: string;
  }[];
  ideas: ConcreteIdeaSeed[];
}

const NICHE_CATALOG: Record<ConcreteNiche, NicheCatalog> = {
  education: {
    whyNowContext:
      "Cada vez mais estudantes e profissionais buscam estudar de forma ativa e rápida usando o próprio material, em vez de assistir horas de aulas passivas.",
    personas: {
      b2c: "Estudantes de faculdade, ensino médio e concursos que acumulam apostilas e vídeos",
      b2b: "Escolas pequenas, cursinhos e professores particulares que querem melhorar o resultado dos alunos",
      creators: "Professores online e mentores que vendem cursos e materiais de apoio",
      devs: "Pessoas estudando programação e se preparando para testes técnicos",
    },
    monetization: [
      {
        model: "Plano grátis limitado + mensalidade",
        price: "R$ 19 a R$ 39 por mês",
        channel: "Vídeos curtos mostrando o uso real no TikTok, Instagram e grupos de estudo",
        whyPay: "Economiza horas fazendo resumos na mão e ajuda a fixar melhor a matéria antes da prova.",
      },
      {
        model: "Assinatura para professores e turmas",
        price: "R$ 149 por mês por turma",
        channel: "Contato direto com professores independentes e pequenos cursinhos",
        whyPay: "Facilita criar listas de exercícios e acompanhar onde os alunos mais erram.",
      },
    ],
    ideas: [
      {
        title: "SimulaJá",
        tagline: "Transforma qualquer apostila em PDF ou texto de aula em um simulado interativo com correção comentada.",
        problem: "Estudantes passam horas só lendo PDFs e grifando textos, mas descobrem tarde demais que não sabem responder questões na prática.",
        solution: "O usuário cola um texto ou envia um PDF, escolhe a quantidade de questões e recebe na hora um simulado com explicação simples de cada erro e um resumo do que precisa revisar.",
        preferredFormats: ["webapp", "mobile", "ai-agent"],
        mvpFeatures: [
          "Campo para colar texto da matéria ou enviar um arquivo PDF",
          "Geração automática de 5 a 15 perguntas de múltipla escolha com explicação da resposta",
          "Tela de resultado mostrando nota final e os tópicos que mais tiveram erro",
          "Histórico salvo no navegador para refazer apenas as questões erradas",
        ],
        antiScope: [
          "Não criar rede social ou fórum de estudantes na primeira versão",
          "Não hospedar vídeos longos nem montar plataforma completa de cursos",
          "Não criar sistema complexo de ranking global logo no início",
        ],
      },
      {
        title: "RevisãoCurta",
        tagline: "Cria cartões rápidos de revisão diária de 5 minutos para quem estuda idiomas, faculdade ou concursos.",
        problem: "A maioria das pessoas abandona aplicativos de revisão porque dá muito trabalho montar os cartões um por um.",
        solution: "A partir de uma lista de anotações ou assunto escolhido, a ferramenta gera cartões prontos e organiza sessões curtas que priorizam o que o aluno mais esquece.",
        preferredFormats: ["webapp", "mobile", "bot", "extension"],
        mvpFeatures: [
          "Entrada rápida de tema ou anotações para gerar um baralho de cartões",
          "Modo de estudo com botões simples: 'Lembrei fácil', 'Quase' e 'Esqueci'",
          "Contador de dias seguidos de estudo e progresso diário",
          "Exportação do baralho para compartilhar com colegas de turma",
        ],
        antiScope: [
          "Não fazer sincronização complexa entre vários aparelhos na v1",
          "Não criar loja de baralhos pagos antes de validar o uso básico",
          "Não adicionar áudio narrado com dezenas de vozes diferentes no começo",
        ],
      },
    ],
  },

  health: {
    whyNowContext:
      "Profissionais de saúde independentes e clínicas pequenas buscam soluções simples para reduzir faltas e organizar o dia sem depender de sistemas hospitalares caros.",
    personas: {
      b2c: "Pessoas que querem cuidar melhor do sono, alimentação, remédios ou rotina de treinos sem complicação",
      b2b: "Clínicas pequenas, psicólogos, nutricionistas, fisioterapeutas e dentistas",
      creators: "Personal trainers e nutricionistas que acompanham alunos à distância",
      devs: "Pessoas que passam o dia no computador e precisam melhorar postura, pausas e hábitos",
    },
    monetization: [
      {
        model: "Mensalidade por consultório ou profissional",
        price: "R$ 79 a R$ 169 por mês",
        channel: "Contato direto com clínicas de bairro, psicólogos e nutricionistas no Instagram e Google Maps",
        whyPay: "Evitar apenas 2 faltas no mês já paga o sistema com folga.",
      },
      {
        model: "Assinatura individual simples",
        price: "R$ 19,90 por mês",
        channel: "Grupos de corrida, academia, bem-estar e perfis de saúde nas redes sociais",
        whyPay: "Ajuda a manter a constância sem exigir preenchimento demorado todos os dias.",
      },
    ],
    ideas: [
      {
        title: "ConfirmaDia",
        tagline: "Organiza confirmações de consulta e lista de encaixe para clínicas pequenas reduzirem faltas.",
        problem: "Clínicas e consultórios pequenos perdem muito dinheiro com pacientes que esquecem a consulta e deixam horários vazios em cima da hora.",
        solution: "Um painel simples onde a recepção cadastra a agenda do dia, gera mensagens prontas de confirmação com 1 clique e aciona automaticamente pacientes da lista de espera quando alguém desmarca.",
        preferredFormats: ["webapp", "bot"],
        mvpFeatures: [
          "Cadastro rápido de consultas do dia (nome, horário, telefone e status)",
          "Botão de 1 clique para gerar/enviar mensagem pronta de confirmação no WhatsApp",
          "Lista de espera inteligente para avisar quem pode ocupar um horário vago",
          "Resumo semanal mostrando quantas faltas foram evitadas",
        ],
        antiScope: [
          "Não criar prontuário médico completo nem prescrição digital na v1",
          "Não integrar com convênios médicos logo no início",
          "Não fazer emissão de recibos fiscais na primeira versão",
        ],
      },
      {
        title: "RotinaLeve",
        tagline: "Registro de hábitos de saúde em 10 segundos por dia (água, sono, treino e humor) com resumo visual semanal.",
        problem: "Aplicativos de saúde costumam pedir dezenas de informações todos os dias, fazendo a pessoa desistir na primeira semana.",
        solution: "Uma tela limpa onde você marca como foi o seu dia em poucos cliques e enxerga padrões claros entre sono, energia e rotina — podendo exportar um resumo para levar ao médico ou nutricionista.",
        preferredFormats: ["webapp", "mobile", "bot"],
        mvpFeatures: [
          "Check-in diário super rápido (sono, água, exercício, humor e uma nota curta)",
          "Gráfico simples dos últimos 14 dias mostrando consistência e padrões",
          "Resumo pronto para baixar ou imprimir antes de uma consulta",
          "Lembrete configurável para não esquecer de registrar",
        ],
        antiScope: [
          "Não dar diagnósticos médicos (deixar claro que é um diário de organização pessoal)",
          "Não exigir conexão com relógio inteligente na primeira versão",
          "Não montar banco gigante de calorias de alimentos industrializados",
        ],
      },
    ],
  },

  finance: {
    whyNowContext:
      "Com o crescimento de trabalhadores autônomos e pequenos negócios, cresce a procura por ferramentas financeiras simples que substituam planilhas confusas.",
    personas: {
      b2c: "Pessoas que querem enxergar para onde vai o salário e cortar gastos esquecidos",
      b2b: "Autônomos, MEIs e pequenas empresas que sofrem com clientes atrasando pagamento",
      creators: "Freelancers e prestadores de serviço com renda que varia todo mês",
      devs: "Profissionais independentes recebendo de vários clientes ou projetos ao mesmo tempo",
    },
    monetization: [
      {
        model: "Assinatura mensal acessível",
        price: "R$ 29 a R$ 69 por mês",
        channel: "Grupos de autônomos, MEIs, freelancers e comunidades de pequenos empreendedores",
        whyPay: "Receber uma única cobrança atrasada ou cancelar assinaturas esquecidas já recupera o valor pago.",
      },
      {
        model: "Pagamento único (acesso vitalício)",
        price: "R$ 79 pagamento único",
        channel: "Divulgação orgânica mostrando o painel funcionando em vídeos curtos",
        whyPay: "Muita gente prefere pagar uma vez por um organizador simples do que assumir mais uma mensalidade.",
      },
    ],
    ideas: [
      {
        title: "CaixaClaro",
        tagline: "Painel simples para autônomos e MEIs preverem quanto vão receber, separar impostos e acompanhar cobranças.",
        problem: "Quem trabalha por conta própria mistura conta pessoal com trabalho, esquece de cobrar clientes e nunca sabe ao certo quanto sobra livre no fim do mês.",
        solution: "Um controle visual direto ao ponto: você lança seus clientes e valores, vê a previsão dos próximos 60 dias, separa automaticamente a porcentagem de impostos e copia lembretes educados de cobrança.",
        preferredFormats: ["webapp", "mobile", "bot"],
        mvpFeatures: [
          "Cadastro rápido de entradas, gastos fixos e pagamentos pendentes",
          "Previsão visual de quanto dinheiro vai sobrar nos próximos 30 e 60 dias",
          "Calculadora automática de reserva para impostos e contas fixas",
          "Mensagens prontas e educadas para lembrar clientes de pagamentos vencidos",
        ],
        antiScope: [
          "Não conectar direto em bancos (comece com cadastro simples e importação de planilha/extrato)",
          "Não emitir notas fiscais na primeira versão",
          "Não criar sistema completo de contabilidade empresarial",
        ],
      },
      {
        title: "RaioXAssinaturas",
        tagline: "Descobre serviços e assinaturas mensais esquecidas e calcula quanto você economiza cortando o que não usa.",
        problem: "Streaming, aplicativos e serviços pequenos somam centenas de reais por mês no cartão sem que a pessoa perceba.",
        solution: "Você importa um extrato simples (ou marca seus serviços em uma lista pronta) e o aplicativo mostra o gasto anual real de cada item, alertas de renovação e meta de economia.",
        preferredFormats: ["webapp", "extension", "mobile"],
        mvpFeatures: [
          "Lista rápida com serviços populares + campo para adicionar assinaturas próprias",
          "Cálculo imediato do custo mensal e anual somado",
          "Simulador visual: clique nos itens para ver quanto sobra no ano se cancelar",
          "Alerta de datas de cobrança próximas",
        ],
        antiScope: [
          "Não pedir senha de banco nem dados de cartão de crédito",
          "Não tentar cancelar serviços automaticamente em nome do usuário na v1",
          "Não incluir investimentos ou bolsa de valores",
        ],
      },
    ],
  },

  productivity: {
    whyNowContext:
      "O excesso de reuniões, áudios longos e mensagens espalhadas faz crescer a procura por ferramentas focadas em transformar bagunça em ações simples.",
    personas: {
      b2c: "Pessoas que se perdem com muitas abas abertas, tarefas acumuladas e falta de foco",
      b2b: "Equipes pequenas que perdem combinados importantes no meio de conversas e reuniões",
      creators: "Autônomos que atendem vários clientes e precisam organizar prazos sem sistemas pesados",
      devs: "Profissionais remotos que querem menos burocracia e resumos objetivos do trabalho",
    },
    monetization: [
      {
        model: "Plano gratuito + versão completa",
        price: "R$ 25 a R$ 49 por mês",
        channel: "LinkedIn, YouTube de organização pessoal e comunidades de trabalho remoto",
        whyPay: "Economiza horas por semana organizando anotações, prazos e relatórios manualmente.",
      },
    ],
    ideas: [
      {
        title: "AtaRápida",
        tagline: "Transforma anotações bagunçadas ou transcrição de reunião em uma lista limpa de decisões, responsáveis e prazos.",
        problem: "Depois de uma reunião longa, ninguém lembra exatamente o que foi combinado nem quem ficou responsável por cada tarefa.",
        solution: "Você cola o texto solto ou a transcrição da reunião e recebe em segundos: resumo em 5 linhas, decisões tomadas e lista de tarefas pronta para enviar no grupo da equipe.",
        preferredFormats: ["webapp", "ai-agent", "extension", "bot"],
        mvpFeatures: [
          "Área simples para colar anotações bagunçadas ou transcrição de reunião",
          "Extração automática de: Resumo, Decisões e Tarefas com responsável",
          "Botão de 1 clique para copiar o resumo formatado para WhatsApp ou e-mail",
          "Histórico das últimas reuniões salvo no navegador",
        ],
        antiScope: [
          "Não construir aplicativo próprio de chamada de vídeo",
          "Não tentar recriar o Notion inteiro com dezenas de tipos de página",
          "Não criar gestão complexa de permissões de empresa na v1",
        ],
      },
      {
        title: "Foco3",
        tagline: "Planejador minimalista que limita o seu dia às 3 tarefas que realmente importam, com cronômetro integrado.",
        problem: "Listas gigantes com 30 tarefas geram ansiedade e fazem a pessoa passar o dia ocupado sem terminar o que era prioridade.",
        solution: "Um espaço limpo que obriga você a escolher no máximo 3 prioridades do dia, divide cada uma em blocos de tempo e mostra um resumo honesto no fim do expediente.",
        preferredFormats: ["webapp", "extension", "mobile", "cli"],
        mvpFeatures: [
          "Seleção diária limitada a 3 tarefas principais (o resto fica em uma fila separada)",
          "Cronômetro de foco integrado (25 ou 50 minutos) ligado à tarefa atual",
          "Botão de encerrar o dia gerando um resumo do que foi concluído",
          "Estatística simples da semana mostrando dias em que você fechou as 3 metas",
        ],
        antiScope: [
          "Não adicionar calendário corporativo complexo na primeira versão",
          "Não criar chat de equipe nem notificações excessivas",
          "Não exigir login obrigatório para usar no primeiro acesso",
        ],
      },
    ],
  },

  devtools: {
    whyNowContext:
      "Com mais pessoas programando com ajuda de IA, ferramentas simples que organizam prompts, testam APIs e aceleram o desenvolvimento ganham adoção muito rápida.",
    personas: {
      b2c: "Iniciantes aprendendo a criar seus primeiros sites e projetos com ajuda de IA",
      b2b: "Equipes de tecnologia buscando padronizar testes, documentação e revisões",
      creators: "Criadores independentes lançando vários projetos digitais por ano",
      devs: "Programadores que querem utilitários rápidos e sem configuração pesada",
    },
    monetization: [
      {
        model: "Gratuito para uso pessoal + plano para equipes",
        price: "R$ 39 a R$ 99 por mês (ou licença única)",
        channel: "TabNews, GitHub, comunidades de programação no Discord e X/Twitter",
        whyPay: "Economiza tempo de teste, evita retrabalho e padroniza projetos em equipe.",
      },
    ],
    ideas: [
      {
        title: "CaixaDePrompts",
        tagline: "Organizador pessoal de prompts de programação com variáveis reutilizáveis e histórico de versões.",
        problem: "Quem programa com IA perde os melhores prompts em chats antigos e acaba reescrevendo as mesmas instruções dezenas de vezes.",
        solution: "Uma biblioteca limpa onde você salva prompts por categoria (layout, banco de dados, correção de bug), usa campos preenchíveis (ex: {{nome_do_projeto}}) e copia pronto em 1 clique.",
        preferredFormats: ["webapp", "extension", "cli"],
        mvpFeatures: [
          "Cadastro de prompts com título, categoria e tags simples",
          "Suporte a variáveis dinâmicas (ex: {{tema}}) que geram um formulário rápido antes de copiar",
          "Busca instantânea por palavra-chave e botão de copiar em 1 clique",
          "Exportar e importar sua biblioteca inteira em arquivo JSON",
        ],
        antiScope: [
          "Não construir um editor de código completo no navegador",
          "Não criar rede social de prompts na primeira versão",
          "Não depender de infraestrutura pesada para rodar",
        ],
      },
      {
        title: "RaioXProjeto",
        tagline: "Recebe o link de um repositório ou arquivo de dependências e gera um mapa visual simples de como o projeto funciona.",
        problem: "Entrar em um projeto novo (ou gerado rápido com IA) e entender quais pastas, bibliotecas e rotas existem toma muito tempo.",
        solution: "A ferramenta lê a estrutura básica do projeto e apresenta um resumo claro em português: tecnologias usadas, principais arquivos, possíveis pontos de atenção e um guia inicial de leitura.",
        preferredFormats: ["webapp", "cli", "ai-agent"],
        mvpFeatures: [
          "Entrada por link público do GitHub ou colagem do arquivo package.json",
          "Resumo automático explicando o que cada biblioteca faz em linguagem simples",
          "Checklist de boas práticas básicas (README, .env de exemplo, scripts de build)",
          "Exportação do guia gerado em arquivo Markdown",
        ],
        antiScope: [
          "Não fazer auditoria profunda de segurança corporativa na v1",
          "Não suportar 20 linguagens diferentes logo no início (foque em JavaScript/TypeScript e Python)",
          "Não exigir instalação de servidor externo para testar",
        ],
      },
    ],
  },

  ecommerce: {
    whyNowContext:
      "Lojas pequenas gastam dinheiro trazendo visitantes, mas perdem vendas por páginas confusas e descrições fracas — ferramentas focadas em melhorar conversão têm apelo direto.",
    personas: {
      b2c: "Compradores online querendo comparar preços reais e descobrir se um produto vale a pena",
      b2b: "Donos de lojas virtuais pequenas e médias querendo vender mais com o mesmo tráfego",
      creators: "Vendedores independentes no Instagram, Shopee, Mercado Livre ou site próprio",
      devs: "Criadores de aplicativos tentando melhorar a página de apresentação do próprio projeto",
    },
    monetization: [
      {
        model: "Assinatura mensal para lojistas",
        price: "R$ 69 a R$ 149 por mês",
        channel: "Grupos de lojistas (Nuvemshop, Shopify, Mercado Livre) e agências pequenas",
        whyPay: "Vender alguns pedidos a mais no mês já compensa o investimento várias vezes.",
      },
    ],
    ideas: [
      {
        title: "VitrineClara",
        tagline: "Analisa a descrição e as dúvidas de uma página de produto e sugere melhorias prontas para aumentar as vendas.",
        problem: "Muitas lojas pequenas copiam descrições técnicas do fornecedor que não tiram as dúvidas reais de quem vai comprar.",
        solution: "O lojista informa o produto e os comentários/perguntas dos clientes, e o aplicativo gera uma descrição clara, lista de benefícios, respostas para objeções comuns e ideias de texto para anúncio.",
        preferredFormats: ["webapp", "ai-agent", "extension"],
        mvpFeatures: [
          "Formulário rápido com nome do produto, público e descrição atual (ou perguntas de clientes)",
          "Diagnóstico simples apontando o que está faltando para convencer o comprador",
          "Geração de nova descrição pronta + seção de perguntas frequentes (FAQ)",
          "Comparativo lado a lado (antes e depois) com botão de copiar tudo",
        ],
        antiScope: [
          "Não criar sistema completo de carrinho ou pagamento de loja",
          "Não integrar automaticamente com plataformas de anúncio na v1",
          "Não gerenciar estoque de produtos",
        ],
      },
      {
        title: "CalculaMargem",
        tagline: "Calculadora visual de preço de venda para lojistas de marketplaces (taxas, frete, imposto e lucro líquido real).",
        problem: "Vendedores iniciantes no Mercado Livre, Shopee e Instagram muitas vezes vendem no prejuízo sem perceber por causa das taxas escondidas.",
        solution: "Uma calculadora limpa onde o vendedor escolhe o canal de venda, coloca custo do produto e frete, e vê na hora o preço mínimo seguro, o lucro real em reais e a margem ideal.",
        preferredFormats: ["webapp", "mobile", "extension"],
        mvpFeatures: [
          "Simulador com taxas pré-configuradas dos principais marketplaces (editáveis)",
          "Resultado imediato: preço ideal, lucro líquido por unidade e ponto de equilíbrio",
          "Comparador mostrando qual canal deixa mais lucro para o mesmo produto",
          "Tabela de cenários (com desconto de 5%, 10% e 15%) pronta para salvar",
        ],
        antiScope: [
          "Não integrar emissão de nota fiscal na primeira versão",
          "Não sincronizar estoque em tempo real com marketplaces",
          "Não criar sistema completo de ERP",
        ],
      },
    ],
  },

  creators: {
    whyNowContext:
      "Produzir conteúdo com frequência consome muito tempo; ferramentas que multiplicam uma única ideia em vários formatos ajudam criadores a manter constância.",
    personas: {
      b2c: "Pessoas começando um canal ou perfil e travando na hora de criar roteiros",
      b2b: "Agências pequenas e gestores de redes sociais que cuidam de vários clientes",
      creators: "YouTubers, podcasters e criadores do Instagram/TikTok que trabalham sozinhos",
      devs: "Programadores compartilhando seus projetos e aprendizados nas redes",
    },
    monetization: [
      {
        model: "Assinatura mensal (individual ou agência)",
        price: "R$ 39 por mês (individual) · R$ 119 por mês (agência)",
        channel: "Vídeos curtos mostrando a transformação de 1 texto em vários posts no Reels e TikTok",
        whyPay: "Economiza várias horas toda semana e ajuda a publicar com regularidade.",
      },
    ],
    ideas: [
      {
        title: "MultiplicaPost",
        tagline: "Transforma 1 texto, roteiro ou resumo de vídeo em ideias de Reels, carrossel e post para LinkedIn.",
        problem: "Criadores gastam horas produzindo um conteúdo longo e não têm tempo para adaptar o mesmo tema para as outras redes sociais.",
        solution: "Você cola um texto ou transcrição, escolhe seu estilo de fala (descontraído, direto ou didático) e recebe os formatos prontos com sugestões de título e abertura que prende atenção.",
        preferredFormats: ["webapp", "ai-agent", "extension"],
        mvpFeatures: [
          "Campo para colar roteiro/texto + seletor de tom de voz",
          "Geração simultânea de: 3 aberturas de vídeo curto, 1 carrossel de 6 telas e 1 texto curto",
          "Edição rápida direto na tela com contador de caracteres",
          "Banco local de ideias salvas para publicar durante a semana",
        ],
        antiScope: [
          "Não construir editor de vídeo completo na primeira versão",
          "Não publicar automaticamente nas redes sociais (evita integrações burocráticas na v1)",
          "Não criar gerador de imagens complexo logo no começo",
        ],
      },
      {
        title: "BancoDeGanchos",
        tagline: "Laboratório de títulos e aberturas de 3 segundos para vídeos curtos, organizado por assunto e objetivo.",
        problem: "Bons vídeos flopam nos primeiros 3 segundos porque o criador não sabe como abrir o assunto de forma interessante.",
        solution: "O usuário digita o tema do vídeo e recebe 10 variações de abertura testadas por estrutura (curiosidade, erro comum, lista rápida, história), com teleprompter simples na própria tela.",
        preferredFormats: ["webapp", "mobile"],
        mvpFeatures: [
          "Entrada simples com o assunto do vídeo e público",
          "Geração de 8 a 10 opções de abertura divididas por estilo",
          "Modo leitura (teleprompter simples) para gravar lendo a abertura",
          "Lista de favoritos para montar uma biblioteca pessoal",
        ],
        antiScope: [
          "Não incluir gravação e edição de vídeo dentro do site na v1",
          "Não exigir assinatura cara antes de deixar o usuário testar grátis",
          "Não criar painel de métricas integrado com APIs de redes sociais",
        ],
      },
    ],
  },

  local: {
    whyNowContext:
      "Comércios de bairro como barbearias, restaurantes e oficinas querem soluções simples no celular para fidelizar clientes e melhorar a reputação no Google.",
    personas: {
      b2c: "Moradores buscando serviços confiáveis no bairro sem precisar ficar ligando",
      b2b: "Donos de restaurantes, barbearias, salões, pet shops, oficinas e pequenos comércios",
      creators: "Prestadores de serviço locais (fotógrafos, eletricistas, professores particulares)",
      devs: "Freelancers criando sistemas simples para vender para comércios da própria cidade",
    },
    monetization: [
      {
        model: "Mensalidade por estabelecimento",
        price: "R$ 69 a R$ 129 por mês",
        channel: "Abordagem direta para comércios da própria cidade mostrando uma prévia com o nome da loja",
        whyPay: "Mais avaliações positivas no Google e clientes voltando trazem movimento real toda semana.",
      },
    ],
    ideas: [
      {
        title: "AvaliaBairro",
        tagline: "Gera QR Code de balcão para captar mais avaliações positivas no Google e organizar feedbacks de clientes.",
        problem: "A maioria dos clientes satisfeitos vai embora sem avaliar o negócio no Google, enquanto clientes insatisfeitos sempre reclamam.",
        solution: "O dono do comércio imprime um QR Code gerado na plataforma: quem elogia é direcionado para avaliar no Google com 1 toque; quem teve algum problema envia o relato direto ao gerente para resolver antes de virar reclamação pública.",
        preferredFormats: ["webapp", "mobile"],
        mvpFeatures: [
          "Cadastro do comércio (nome, link do Google Maps e WhatsApp) gerando uma página pronta",
          "Gerador de cartaz/QR Code pronto para imprimir e colocar no balcão ou mesa",
          "Tela rápida de avaliação com 5 estrelas em 1 clique no celular do cliente",
          "Painel simples para o dono ler elogios e sugestões recebidas",
        ],
        antiScope: [
          "Não criar sistema de caixa (PDV) nem emissão de cupom fiscal",
          "Não construir aplicativo separado na loja da Apple/Google (funciona direto no navegador)",
          "Não fazer controle de estoque",
        ],
      },
      {
        title: "CartãoFidelidadeZap",
        tagline: "Cartão fidelidade digital sem baixar aplicativo: o cliente acumula pontos pelo número de telefone.",
        problem: "Cartões fidelidade de papel sempre somem na carteira e sistemas de grandes redes são caros para uma barbearia ou cafeteria pequena.",
        solution: "No balcão, o atendente digita o telefone do cliente e soma 1 ponto em 3 segundos; o sistema gera uma mensagem pronta no WhatsApp mostrando quantos pontos faltam para ganhar o brinde.",
        preferredFormats: ["webapp", "mobile", "bot"],
        mvpFeatures: [
          "Configuração simples da regra (ex: a cada 10 cortes, ganha 1 grátis)",
          "Tela de balcão ultra rápida: buscar por telefone e adicionar carimbo",
          "Link ou mensagem pronta para enviar ao cliente o saldo de pontos no WhatsApp",
          "Lista de clientes que não voltam há mais de 30 dias",
        ],
        antiScope: [
          "Não exigir que o cliente baixe aplicativo nem crie senha",
          "Não integrar máquina de cartão na primeira versão",
          "Não criar programa de pontos entre lojas diferentes logo no início",
        ],
      },
    ],
  },

  entertainment: {
    whyNowContext:
      "Jogos curtos de navegador que qualquer pessoa consegue jogar em 2 minutos e compartilhar o resultado no WhatsApp continuam com altíssimo poder de viralização.",
    personas: {
      b2c: "Pessoas buscando uma pausa rápida e divertida no dia para competir com amigos",
      b2b: "Equipes remotas e eventos buscando dinâmicas rápidas de descontração",
      creators: "Streamers e criadores querendo jogos rápidos para jogar junto com o público",
      devs: "Pessoas querendo treinar lógica, animações e interfaces interativas divertidas",
    },
    monetization: [
      {
        model: "Gratuito (viral) + pacotes temáticos ou patrocínio de nicho",
        price: "Grátis para jogar · R$ 15 pacotes extras ou patrocínio semanal",
        channel: "Botão de compartilhar resultado (estilo grade de quadradinhos) no WhatsApp, X e Discord",
        whyPay: "Jogos rápidos crescem rápido no boca a boca e monetizam com patrocínio ou modo privado para eventos.",
      },
    ],
    ideas: [
      {
        title: "DesafioDoDia",
        tagline: "Jogo diário de 2 minutos no navegador com perguntas ou pistas sobre um tema popular (música, filmes, geografia ou futebol).",
        problem: "Muitos jogos de celular estão cheios de anúncios chatos e exigem cadastro antes de jogar.",
        solution: "Todo dia o site libera um mesmo desafio para todos os jogadores (em até 5 tentativas), sem precisar criar conta, e ao final gera um resumo visual pronto para colar no grupo de amigos sem dar spoiler.",
        preferredFormats: ["webapp", "mobile"],
        mvpFeatures: [
          "Partida jogável imediatamente ao abrir o site (zero cadastro)",
          "Desafio diário igual para todo mundo baseado na data atual + modo treino livre",
          "Botão 'Compartilhar resultado' gerando texto com emojis pronto para WhatsApp",
          "Estatísticas pessoais salvas no navegador (vitórias, sequência e melhor tentativa)",
        ],
        antiScope: [
          "Não construir jogo 3D pesado nem multiplayer em tempo real na v1",
          "Não colocar chat aberto entre desconhecidos",
          "Não exigir login antes de jogar a primeira partida",
        ],
      },
      {
        title: "SorteioDeFilme",
        tagline: "Ajuda casais ou grupos de amigos a escolherem um filme ou série em menos de 1 minuto sem discussão.",
        problem: "As pessoas passam 40 minutos passando o catálogo da TV e acabam desistindo sem assistir nada.",
        solution: "Cada pessoa escolhe rapidamente humor, duração máxima e 2 gêneros (ou dá 'sim/não' em 6 sugestões rápidas), e o site mostra os 3 títulos que mais combinam com todo mundo.",
        preferredFormats: ["webapp", "mobile"],
        mvpFeatures: [
          "Filtro rápido em 3 passos: clima do filme, tempo disponível e streaming",
          "Modo cartas rápidas (passar para esquerda ou direita) para escolher em dupla",
          "Tela final com o filme escolhido, sinopse curta e botão de sortear outro",
          "Lista de 'Quero ver depois' salva no navegador",
        ],
        antiScope: [
          "Não tentar reproduzir filmes dentro do site",
          "Não criar rede social completa de avaliações na v1",
          "Não exigir criação de conta para usar",
        ],
      },
    ],
  },

  sustainability: {
    whyNowContext:
      "Projetos que conectam sustentabilidade diretamente à economia de dinheiro no bolso (menos comida jogada fora, conta de luz menor) engajam muito mais usuários e jurados.",
    personas: {
      b2c: "Famílias e pessoas que moram sozinhas e querem economizar nas compras e na conta de luz",
      b2b: "Restaurantes, mercados pequenos e condomínios buscando cortar desperdício",
      creators: "Projetos escolares, ONGs e iniciativas comunitárias",
      devs: "Participantes de hackathons de impacto social e ambiental buscando demos claras",
    },
    monetization: [
      {
        model: "Gratuito para famílias + assinatura para restaurantes e condomínios",
        price: "R$ 99 a R$ 199 por mês para empresas ou editais de impacto",
        channel: "Hackathons, aceleradoras de impacto e abordagem direta a restaurantes pequenos",
        whyPay: "Reduzir desperdício de comida ou gasto de energia gera economia direta já no primeiro mês.",
      },
    ],
    ideas: [
      {
        title: "DespensaZero",
        tagline: "Controla a validade dos alimentos da geladeira e sugere receitas rápidas com o que está perto de vencer.",
        problem: "Famílias jogam fora uma parte considerável das compras do mês simplesmente porque esquecem ingredientes no fundo da geladeira.",
        solution: "Você cadastra os itens comprados de forma rápida, recebe avisos dos que vencem primeiro e clica em 1 botão para ver receitas práticas usando exatamente aqueles ingredientes.",
        preferredFormats: ["webapp", "mobile", "bot"],
        mvpFeatures: [
          "Cadastro rápido de alimentos com data de validade estimada",
          "Lista ordenada por urgência (o que precisa ser usado nos próximos 3 dias)",
          "Gerador de receitas simples combinando os ingredientes que vão vencer",
          "Contador estimado de quantos reais foram economizados no mês",
        ],
        antiScope: [
          "Não depender de leitor de código de barras complexo na v1",
          "Não integrar supermercado online para entrega de compras",
          "Não fazer cálculo nutricional avançado logo no início",
        ],
      },
      {
        title: "ContaVerde",
        tagline: "Simulador visual que mostra quais aparelhos da casa mais pesam na conta de luz e quanto você economiza ajustando hábitos.",
        problem: "As pessoas levam susto quando a conta de energia chega, mas não fazem ideia de quanto cada aparelho (chuveiro, ar-condicionado, geladeira) custa em reais por mês.",
        solution: "Você escolhe os aparelhos da casa e o tempo aproximado de uso diário, e o aplicativo monta um gráfico claro em reais + um plano prático de 3 ajustes para baixar a próxima fatura.",
        preferredFormats: ["webapp", "mobile"],
        mvpFeatures: [
          "Seleção rápida dos principais eletrodomésticos com consumo médio já preenchido",
          "Gráfico simples mostrando o custo estimado em reais de cada aparelho no mês",
          "Simulador de economia: ajuste o tempo de uso e veja o desconto na hora",
          "Relatório resumido com as 3 mudanças que mais geram economia",
        ],
        antiScope: [
          "Não exigir tomada inteligente ou sensores físicos na primeira versão",
          "Não conectar com sistemas de concessionárias de energia",
          "Não tentar calcular créditos oficiais de carbono no MVP",
        ],
      },
    ],
  },
};

const CREATIVE_CONSTRAINTS = [
  "Faça tudo funcionar em 1 única tela, sem menus escondidos.",
  "Não use banco de dados na primeira versão — salve tudo direto no navegador.",
  "O usuário precisa ver um resultado útil em menos de 15 segundos, sem precisar criar conta.",
  "Adicione um botão 'Testar com exemplo pronto' para qualquer pessoa testar em 1 clique.",
  "Use um visual ultra limpo com no máximo 2 cores principais.",
];

const STACK_BY_FORMAT: Record<ConcreteFormat, Record<SkillLevel, string[]>> = {
  webapp: {
    beginner: ["Next.js", "Tailwind CSS", "Armazenamento no navegador", "Vercel"],
    intermediate: ["Next.js + TypeScript", "Tailwind CSS", "API Routes", "Supabase ou SQLite"],
    advanced: ["Next.js + TypeScript", "API de IA (Gemini/OpenAI)", "PostgreSQL", "Pagamentos (Stripe/Pix)"],
  },
  "ai-agent": {
    beginner: ["Next.js", "API do Gemini (gratuita para começar)", "Tailwind CSS"],
    intermediate: ["Next.js + TypeScript", "Gemini/OpenAI com resposta em JSON", "Validação com Zod", "Supabase"],
    advanced: ["Next.js + TypeScript", "Fluxo de IA em múltiplas etapas", "Leitura de links/PDFs", "PostgreSQL"],
  },
  extension: {
    beginner: ["HTML + CSS + JavaScript", "Extensão Chrome (Manifest V3)", "Chrome Storage"],
    intermediate: ["React + TypeScript + Vite", "Tailwind CSS", "Painel lateral do Chrome"],
    advanced: ["WXT / Plasmo + TypeScript", "Painel lateral do Chrome", "Backend Next.js", "Assinaturas"],
  },
  bot: {
    beginner: ["Node.js + TypeScript", "Bot do Telegram (grammY)", "Arquivo JSON ou SQLite"],
    intermediate: ["Next.js Webhooks", "API do Telegram ou WhatsApp", "Supabase", "API de IA"],
    advanced: ["Node.js + Filas", "WhatsApp Business API + leitura de áudio", "PostgreSQL", "Painel Web"],
  },
  mobile: {
    beginner: ["Site responsivo para celular (PWA)", "Next.js", "Tailwind CSS"],
    intermediate: ["Expo (React Native) + TypeScript", "Tailwind (NativeWind)", "Supabase"],
    advanced: ["Expo + React Native", "Modo offline no aparelho", "Notificações Push"],
  },
  cli: {
    beginner: ["Node.js + TypeScript", "Commander.js", "Leitura de arquivos locais"],
    intermediate: ["TypeScript + Clack (menus interativos)", "Validação Zod", "Pacote npm"],
    advanced: ["TypeScript + Ink (interface no terminal)", "Integração com IA", "SQLite local"],
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
    potential: z.enum(["Alto", "Muito Alto", "Médio", "Opcional (Estudo)"]),
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

function resolveFilters(
  req: GenerateRequest,
  primarySignal: TrendSignal
): {
  niche: ConcreteNiche;
  format: ConcreteFormat;
  audience: ConcreteAudience;
  timeframe: TimeframeId;
  level: SkillLevel;
} {
  let niche: ConcreteNiche =
    req.niche !== "all" ? req.niche : primarySignal.niches[0] || "productivity";

  if (!NICHE_CATALOG[niche]) {
    niche = "productivity";
  }

  let audience: ConcreteAudience =
    req.audience !== "any"
      ? req.audience
      : req.mode === "money"
        ? pickRandom<ConcreteAudience>(["b2b", "creators"])
        : req.mode === "study"
          ? pickRandom<ConcreteAudience>(["devs", "b2c"])
          : pickRandom<ConcreteAudience>(["b2c", "b2b", "creators"]);

  let format: ConcreteFormat =
    req.format !== "any"
      ? req.format
      : pickRandom<ConcreteFormat>(["webapp", "ai-agent", "mobile", "extension"]);

  let timeframe = req.timeframe;
  const level = req.level;

  if (req.pivot === "b2b") audience = "b2b";
  if (req.pivot === "extension") format = "extension";
  if (req.pivot === "simpler") timeframe = "2h";
  if (req.pivot === "monetize") audience = "b2b";

  return { niche, format, audience, timeframe, level };
}

// Seleciona APENAS sinais realmente coerentes com o tema escolhido
export function selectRelevantTrends(
  allSignals: TrendSignal[],
  req: GenerateRequest
): TrendSignal[] {
  if (req.focusTrendId) {
    const focused = allSignals.find((s) => s.id === req.focusTrendId);
    if (focused) {
      const sameNiche = allSignals
        .filter((s) => s.id !== focused.id && s.niches.some((n) => focused.niches.includes(n)))
        .slice(0, 2);
      return [focused, ...sameNiche];
    }
  }

  const excluded = new Set(req.excludeTrendIds ?? []);

  // Se o usuário escolheu um nicho específico, filtramos estritamente por ele
  const nicheMatched =
    req.niche !== "all"
      ? allSignals.filter((s) => s.niches.includes(req.niche as Exclude<NicheId, "all">))
      : allSignals;

  const basePool = nicheMatched.length > 0 ? nicheMatched : allSignals;
  const freshPool = basePool.filter((s) => !excluded.has(s.id));
  const candidates = freshPool.length > 0 ? freshPool : basePool;

  const scored = candidates.map((sig) => {
    let weight = sig.heatScore;
    if (sig.source === "tabnews" || sig.source === "curated") weight += 15; // prioriza contexto em PT-BR claro
    if (sig.isLive) weight += 12;
    if (sig.bestModes.includes(req.mode)) weight += 20;
    weight += Math.random() * 25;
    return { sig, weight };
  });

  scored.sort((a, b) => b.weight - a.weight);

  const primary = scored[Math.floor(Math.random() * Math.min(3, scored.length))]?.sig ?? candidates[0];
  const primaryNiche = req.niche !== "all" ? req.niche : primary.niches[0];

  const related = scored
    .filter(
      (item) =>
        item.sig.id !== primary.id &&
        (!primaryNiche || item.sig.niches.includes(primaryNiche as Exclude<NicheId, "all">))
    )
    .slice(0, 2)
    .map((item) => item.sig);

  return [primary, ...related].filter(Boolean);
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
  creativeConstraint?: string;
}): string {
  const modeLabel = MODE_META[params.mode].label;
  return [
    `Quero criar a primeira versão funcional do projeto "${params.title}".`,
    `Resumo: ${params.tagline}`,
    ``,
    `CONTEXTO:`,
    `- Objetivo: ${modeLabel}`,
    `- Tema: ${getNicheLabel(params.niche)} | Formato: ${getFormatLabel(params.format)}`,
    `- Tempo disponível: ${getTimeframeLabel(params.timeframe)} | Nível: ${getLevelLabel(params.level)}`,
    `- Público: ${getAudienceLabel(params.audience)}`,
    ``,
    `PROBLEMA E SOLUÇÃO:`,
    `- Problema: ${params.problem}`,
    `- Como funciona: ${params.solutionSummary}`,
    ``,
    `O QUE CONSTRUIR PRIMEIRO (implemente apenas isso agora):`,
    ...params.mvpFeatures.map((f, i) => `${i + 1}. ${f}`),
    ``,
    `DEIXE PARA DEPOIS (não construa agora):`,
    ...params.antiScope.map((a) => `- ${a}`),
    params.creativeConstraint ? `\nDESAFIO EXTRA:\n- ${params.creativeConstraint}` : "",
    ``,
    `TECNOLOGIAS SUGERIDAS: ${params.suggestedStack.join(", ")}.`,
    ``,
    `PASSO A PASSO PARA COMEÇAR:`,
    `1. Monte uma interface limpa, intuitiva e em português do Brasil.`,
    `2. Inclua um botão "Carregar exemplo pronto" para testar o fluxo completo em 1 clique.`,
    `3. Priorize tudo funcionando de ponta a ponta antes de adicionar recursos extras.`,
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
  const catalog = NICHE_CATALOG[resolved.niche];

  // Escolhe uma ideia que combine bem com o formato escolhido (e diferente da anterior se possível)
  const formatCompatible = catalog.ideas.filter((idea) =>
    req.format === "any" ? true : idea.preferredFormats.includes(resolved.format)
  );
  const ideaPool = formatCompatible.length > 0 ? formatCompatible : catalog.ideas;
  const nonRepeatPool = req.previousTitle
    ? ideaPool.filter((i) => !req.previousTitle?.startsWith(i.title))
    : ideaPool;
  const seed = pickRandom(nonRepeatPool.length > 0 ? nonRepeatPool : ideaPool);

  // Se o usuário deixou formato como "Qualquer formato", usa um formato coerente com a ideia!
  const finalFormat: ConcreteFormat =
    req.pivot === "extension"
      ? "extension"
      : req.format !== "any"
        ? resolved.format
        : pickRandom(seed.preferredFormats);

  const pivotSuffix =
    req.pivot === "simpler"
      ? " Express"
      : req.pivot === "b2b"
        ? " para Empresas"
        : req.pivot === "extension"
          ? " (Extensão)"
          : "";

  const title = `${seed.title}${pivotSuffix}`;
  const persona = catalog.personas[resolved.audience];
  const monetizationBase = pickRandom(catalog.monetization);

  const pivotAdaptation =
    req.pivot === "simpler"
      ? " Versão enxuta focada em 1 única função principal para finalizar em até 2 horas."
      : req.pivot === "b2b"
        ? " Adaptado para pequenas empresas e equipes, com visão organizada para vários clientes."
        : req.pivot === "extension"
          ? " Adaptado como extensão leve de navegador para usar sem sair da página atual."
          : req.pivot === "monetize"
            ? " Estruturado com foco em valor claro para começar a cobrar já nas primeiras semanas."
            : "";

  const formatAdaptation =
    finalFormat === "extension" && !seed.preferredFormats.includes("extension")
      ? " Funciona como extensão rápida no navegador, capturando o contexto da página atual."
      : finalFormat === "bot" && !seed.preferredFormats.includes("bot")
        ? " Funciona direto por mensagens no WhatsApp ou Telegram, sem o usuário precisar abrir outro site."
        : finalFormat === "cli" && !seed.preferredFormats.includes("cli")
          ? " Roda direto no terminal com um único comando simples."
          : "";

  const whyNow = `${catalog.whyNowContext} Esse movimento aparece com força nas discussões recentes de ${getNicheLabel(resolved.niche).toLowerCase()} (confira as referências abaixo).`;

  const featureCount = resolved.timeframe === "2h" ? 3 : 4;
  const mvpFeatures = [...seed.mvpFeatures.slice(0, featureCount)];
  if (finalFormat === "extension") {
    mvpFeatures[0] = "Botão ou painel lateral no navegador que lê o conteúdo da aba aberta automaticamente";
  } else if (finalFormat === "bot") {
    mvpFeatures[0] = "Conversa direta no WhatsApp ou Telegram recebendo mensagem curta e respondendo na hora";
  } else if (finalFormat === "cli") {
    mvpFeatures[0] = "Comando simples no terminal que processa os dados e salva o resultado organizado";
  }

  const stack = STACK_BY_FORMAT[finalFormat][resolved.level];

  const monetizationPotential: VibeBlueprint["monetization"]["potential"] =
    req.mode === "money" || req.pivot === "monetize"
      ? "Muito Alto"
      : req.mode === "study"
        ? "Opcional (Estudo)"
        : req.mode === "hackathon"
          ? "Alto"
          : "Médio";

  const creativeConstraint =
    req.mode === "challenge" || req.pivot === "simpler"
      ? pickRandom(CREATIVE_CONSTRAINTS)
      : undefined;

  const hackathonHook =
    req.mode === "hackathon"
      ? "Na apresentação de 2 minutos, comece mostrando a dor real em 1 frase, clique no botão de exemplo pronto ao vivo e mostre o resultado funcionando na tela na frente dos jurados."
      : undefined;

  const learningGoals =
    req.mode === "study"
      ? [
          `Estruturar um projeto completo de ${getFormatLabel(finalFormat).toLowerCase()} com ${stack.slice(0, 2).join(" e ")}`,
          "Organizar o fluxo de entrada de dados, validação e respostas claras para o usuário",
          "Criar uma interface limpa e responsiva que funciona bem no celular e no computador",
          "Publicar o projeto online para usar como peça real no seu portfólio",
        ]
      : undefined;

  const solutionSummary = `${seed.solution}${formatAdaptation}${pivotAdaptation}`;

  const masterPrompt = buildMasterPrompt({
    title,
    tagline: seed.tagline,
    mode: req.mode,
    niche: resolved.niche,
    format: finalFormat,
    timeframe: resolved.timeframe,
    level: resolved.level,
    audience: resolved.audience,
    problem: seed.problem,
    solutionSummary,
    mvpFeatures,
    antiScope: seed.antiScope,
    suggestedStack: stack,
    creativeConstraint,
  });

  const opportunityScore = Math.min(
    97,
    Math.max(
      76,
      Math.round(primary.heatScore * 0.65 + (req.mode === "money" ? 27 : 22))
    )
  );

  return {
    id: `bp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title,
    tagline: seed.tagline,
    mode: req.mode,
    niche: resolved.niche,
    format: finalFormat,
    timeframe: resolved.timeframe,
    level: resolved.level,
    audience: resolved.audience,
    opportunityScore,
    whyNow,
    problem: seed.problem,
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
    antiScope: seed.antiScope,
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
    .map((s, i) => `${i + 1}. [${s.sourceLabel}] ${s.title} — ${s.summary}`)
    .join("\n");

  const pivotInstruction = req.pivot
    ? `ADAPTAÇÃO PEDIDA SOBRE A IDEIA ANTERIOR ("${req.previousTitle || ""}"): ${
        req.pivot === "simpler"
          ? "Deixe bem mais simples (para fazer em 2 horas, em 1 tela)."
          : req.pivot === "b2b"
            ? "Adapte para pequenas empresas e negócios."
            : req.pivot === "extension"
              ? "Transforme em uma extensão simples para o navegador."
              : "Foque no maior potencial de renda mensal."
      }`
    : "";

  const prompt = `Crie uma ideia ORIGINAL, prática e coerente de software em PORTUGUÊS DO BRASIL SIMPLES E CLARO.

REGRAS OBRIGATÓRIAS:
- EVITE jargões em inglês ou termos nichados de startup (não use palavras como churn, LTV, ROI, outbound, copy, micro-SaaS, B2B, B2C, ticket, PRD, anti-escopo). Fale de forma natural que qualquer pessoa entenda.
- O nome do projeto deve ser fácil de entender em português.
- Só conecte a ideia às tendências listadas abaixo se fizer sentido real com o tema escolhido; nunca force conexões absurdas.

ESCOLHAS DO USUÁRIO:
- Objetivo: ${modeMeta.label} (${modeMeta.description})
- Tema: ${getNicheLabel(resolved.niche)}
- Formato: ${getFormatLabel(resolved.format)}
- Tempo disponível: ${getTimeframeLabel(resolved.timeframe)}
- Nível: ${getLevelLabel(resolved.level)}
- Público: ${getAudienceLabel(resolved.audience)}
${pivotInstruction}

REFERÊNCIAS ATUAIS DO TEMA:
${signalsContext}

Retorne APENAS um JSON válido com esta estrutura exata:
{
  "title": "Nome criativo e simples em português",
  "tagline": "Resumo em 1 frase direta do que o projeto faz",
  "whyNow": "Explique em 2 frases simples por que essa ideia faz sentido hoje",
  "problem": "Qual dor do dia a dia esse projeto resolve",
  "targetPersona": "Para quem exatamente esse projeto serve",
  "solutionSummary": "Como funciona na prática em 2 a 3 frases fáceis de entender",
  "monetization": {
    "potential": "Alto" | "Muito Alto" | "Médio" | "Opcional (Estudo)",
    "model": "Como cobrar (ex: plano grátis + mensalidade)",
    "suggestedPrice": "Faixa de preço realista em R$",
    "firstChannel": "Onde achar as primeiras pessoas interessadas",
    "whyPeoplePay": "Por que alguém pagaria por isso"
  },
  "mvpFeatures": ["3 a 5 funcionalidades essenciais da primeira versão"],
  "antiScope": ["3 coisas para deixar para depois"],
  "suggestedStack": ["3 a 5 tecnologias coerentes com o nível"],
  "creativeConstraint": "Opcional: se for Desafio Rápido, 1 restrição divertida",
  "hackathonHook": "Opcional: se for Hackathon, dica curta para a apresentação",
  "learningGoals": ["Opcional: se for Estudo, 3 aprendizados práticos"],
  "masterPrompt": "Um prompt claro, completo e em português pronto para colar em uma IA e começar a construir o projeto"
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
              temperature: 0.85,
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
          temperature: 0.85,
          messages: [
            {
              role: "system",
              content: "Retorne apenas JSON válido em português simples e claro.",
            },
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
      opportunityScore: Math.min(98, Math.max(76, primary.heatScore + 4)),
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
