// src/data/iapiData.js
// Dados estáticos/mock do SIPI. Numa fase posterior, cada bloco aqui é
// substituído por uma chamada aos services correspondentes (servicoService,
// publicoService, etc.), mantendo o mesmo formato para não quebrar as páginas.

export const sobreIAPI = {
  missao:
    'Garantir a protecção da propriedade industrial em Angola, promovendo a inovação e o desenvolvimento tecnológico.',
  visao: 'Ser referência na gestão da propriedade industrial em Angola e na SADC.',
  valores: ['Integridade', 'Transparência', 'Inovação', 'Excelência', 'Eficiência'],
};

// Slides do carrossel principal da homepage.
// Cada slide representa um dos tipos de propriedade industrial cobertos
// pelo âmbito oficial do projecto (Agenda GOVERNO.AO 27 — FIRP 386ATDAP.IMA.27).
export const heroSlides = [
  {
    id: 'marca',
    imagem: '/images/carrossel/1.jpg',
    titulo: 'Registo de Marcas',
    descricao:
      'Proteja o nome, logótipo ou sinal que distingue os seus produtos e serviços no mercado nacional.',
  },
  {
    id: 'patente',
    imagem: '/images/carrossel/2.jpg',
    titulo: 'Patentes de Invenção',
    descricao:
      'Garanta exclusividade sobre as suas invenções técnicas com um processo de depósito totalmente electrónico.',
  },
  {
    id: 'desenho',
    imagem: '/images/carrossel/3.jpeg',
    titulo: 'Desenhos e Modelos Industriais',
    descricao:
      'Registe a aparência ornamental e o design dos seus produtos e acompanhe o processo em tempo real.',
  },
  {
    id: 'tramitacao',
    imagem: '/images/carrossel/4.jpg',
    titulo: 'Tramitação 100% Electrónica',
    descricao:
      'Do depósito ao certificado digital, sem papel — pagamento, análise técnica e notificações num só sistema.',
  },
];

// Serviços — âmbito alinhado com a Ficha de Identificação e Registo de
// Projecto (FIRP 386ATDAP.IMA.27, pág. 115 da Agenda GOVERNO.AO 27).
export const servicos = [
  {
    id: 'marca',
    titulo: 'Marcas',
    prazo: '10 anos, renovável',
    descricao: 'Proteja o nome ou logótipo que identifica os seus produtos ou serviços no mercado nacional.',
    descricaoLonga:
      'A marca distingue os produtos ou serviços de uma empresa dos da concorrência. O registo confere ao titular o uso exclusivo do sinal em todo o território angolano, por um período inicial de 10 anos, renovável indefinidamente.',
    imagem: 'https://placehold.co/400x300/0A2A44/FFFFFF?text=Marca',
    link: '/servicos/marca',
    requisitos: ['Denominação ou representação gráfica do sinal', 'Classe(s) de Nice aplicável(eis)', 'Identificação do requerente (NIF)'],
  },
  {
    id: 'patente',
    titulo: 'Patentes de Invenção',
    prazo: '20 anos',
    descricao: 'Garanta a exclusividade sobre as suas invenções e inovações técnicas por 20 anos.',
    descricaoLonga:
      'A patente protege uma solução técnica nova, com actividade inventiva e aplicação industrial. O titular obtém o direito exclusivo de exploração da invenção por 20 anos a contar da data de depósito.',
    imagem: 'https://placehold.co/400x300/C8102E/FFFFFF?text=Patente',
    link: '/servicos/patente',
    requisitos: ['Memória descritiva da invenção', 'Reivindicações', 'Desenhos técnicos (se aplicável)'],
  },
  {
    id: 'desenho',
    titulo: 'Desenhos Industriais',
    prazo: '5 anos, renovável até 25',
    descricao: 'Proteja a aparência ornamental e o design dos seus produtos.',
    descricaoLonga:
      'O desenho ou modelo industrial protege o aspecto visual de um produto — forma, linhas, contornos, cores ou textura — sem cobrir a sua função técnica.',
    imagem: 'https://placehold.co/400x300/FFCD00/0A2A44?text=Desenho',
    link: '/servicos/desenho',
    requisitos: ['Representações gráficas ou fotográficas do desenho', 'Indicação do produto a que se aplica'],
  },
  {
    id: 'modelo-utilidade',
    titulo: 'Modelos de Utilidade',
    prazo: '10 anos',
    descricao: 'Protecção mais rápida e simples para invenções de menor complexidade técnica.',
    descricaoLonga:
      'O modelo de utilidade protege uma nova configuração ou disposição que confira melhor utilização a um objecto, com requisitos de exame menos exigentes do que a patente.',
    imagem: 'https://placehold.co/400x300/082236/FFFFFF?text=Modelo',
    link: '/servicos/modelo-utilidade',
    requisitos: ['Descrição técnica do modelo', 'Desenhos ilustrativos'],
  },
  {
    id: 'insignia',
    titulo: 'Insígnias e Nomes de Estabelecimento',
    prazo: '10 anos, renovável',
    descricao: 'Identifique e proteja o seu estabelecimento comercial ou industrial.',
    descricaoLonga:
      'A insígnia identifica um estabelecimento; o nome comercial identifica a entidade que o explora. Ambos podem ser registados para uso exclusivo numa área geográfica.',
    imagem: 'https://placehold.co/400x300/061928/FFFFFF?text=Insignia',
    link: '/servicos/insignia',
    requisitos: ['Denominação do estabelecimento', 'Ramo de actividade', 'Localização'],
  },
  {
    id: 'indicacao-proveniencia',
    titulo: 'Indicações de Proveniência',
    prazo: 'Sem limite temporal',
    descricao: 'Reconhecimento oficial da origem geográfica de um produto.',
    descricaoLonga:
      'Protege o nome de uma região ou local usado para identificar um produto que dela é originário, quando essa origem é relevante para a reputação ou características do produto.',
    imagem: 'https://placehold.co/400x300/0A2A44/FFCD00?text=Proveniencia',
    link: '/servicos/indicacao-proveniencia',
    requisitos: ['Delimitação geográfica', 'Ligação do produto à região'],
  },
];

// Notícias — usadas na faixa contínua da homepage (apenas imagem) e na
// página /noticias (listagem completa com texto).
export const noticias = [
  {
    id: 1,
    titulo: 'IAPI promove formação sobre Propriedade Industrial',
    data: '15/06/2026',
    resumo: 'Professor Doutor Pascoal Comprido, especialista em Políticas e Assuntos Internacionais.',
    imagem: '/images/noticias/12.jpg',
    link: '/noticias/1',
  },
  {
    id: 2,
    titulo: 'Angola adere à Classificação de Nice 2026',
    data: '10/06/2026',
    resumo: 'O país adoptou a nova versão da Classificação Internacional de Produtos e Serviços para o registo de marcas.',
    imagem: '/images/noticias/5.png',
    link: '/noticias/2',
  },
  {
    id: 3,
    titulo: 'Prazo para renovação de marcas termina em Julho',
    data: '05/06/2026',
    resumo: 'Os titulares de marcas têm até 31 de Julho para renovar os seus registos junto ao IAPI.',
    imagem: '/images/noticias/6.jpg',
    link: '/noticias/3',
  },
  {
    id: 4,
    titulo: 'SIPI entra em fase de testes com requerentes piloto',
    data: '28/05/2026',
    resumo: 'Um grupo de empresas e inventores está a testar o depósito electrónico antes do lançamento nacional.',
    imagem: '/images/noticias/7.jpeg',
    link: '/noticias/4',
  },
  {
    id: 5,
    titulo: 'IAPI assina protocolo de interoperabilidade com o CUTE',
    data: '20/05/2026',
    resumo: 'O acordo permite a geração automática de referências de pagamento (RUPE) para os pedidos submetidos.',
    imagem: '/images/noticias/8.jpeg',
    link: '/noticias/5',
  },
  {
    id: 6,
    titulo: 'Digitalização do arquivo histórico do IAPI avança para 60%',
    data: '12/05/2026',
    resumo: 'Mais de seis décadas de processos em papel estão a ser convertidas para o acervo digital do SIPI.',
    imagem: '/images/noticias/9.jpeg',
    link: '/noticias/6',
  },
  {
    id: 6,
    titulo: 'Digitalização do arquivo histórico do IAPI avança para 60%',
    data: '12/05/2026',
    resumo: 'Mais de seis décadas de processos em papel estão a ser convertidas para o acervo digital do SIPI.',
    imagem: '/images/noticias/10.png',
    link: '/noticias/6',
  },
];

export const formularios = [
  {
    id: 'marca',
    titulo: 'Formulário de Depósito de Marca',
    descricao: 'Formulário para registo de marcas nacionais.',
    link: 'https://iapi.gov.ao/web/documentos/formulario-marca.pdf',
    tipo: 'Depósito',
  },
  {
    id: 'patente',
    titulo: 'Formulário de Depósito de Patente',
    descricao: 'Formulário para registo de patentes de invenção.',
    link: 'https://iapi.gov.ao/web/documentos/formulario-patente.pdf',
    tipo: 'Depósito',
  },
  {
    id: 'desenho',
    titulo: 'Formulário de Depósito de Desenho Industrial',
    descricao: 'Formulário para registo de desenhos industriais.',
    link: 'https://iapi.gov.ao/web/documentos/formulario-desenho.pdf',
    tipo: 'Depósito',
  },
  {
    id: 'modelo',
    titulo: 'Formulário de Depósito de Modelo de Utilidade',
    descricao: 'Formulário para registo de modelos de utilidade.',
    link: 'https://iapi.gov.ao/web/documentos/formulario-modelo.pdf',
    tipo: 'Depósito',
  },
  {
    id: 'certidao',
    titulo: 'Formulário de Pedido de Certidão',
    descricao: 'Solicitação de certidões de registo.',
    link: 'https://iapi.gov.ao/web/documentos/formulario-certidao.pdf',
    tipo: 'Serviço',
  },
  {
    id: 'transferencia',
    titulo: 'Formulário de Transferência de Titularidade',
    descricao: 'Pedido de transferência de direitos de propriedade industrial.',
    link: 'https://iapi.gov.ao/web/documentos/formulario-transferencia.pdf',
    tipo: 'Serviço',
  },
  {
    id: 'renovacao',
    titulo: 'Formulário de Renovação de Registo',
    descricao: 'Pedido de renovação de marcas ou outros títulos.',
    link: 'https://iapi.gov.ao/web/documentos/formulario-renovacao.pdf',
    tipo: 'Serviço',
  },
];

// Perguntas frequentes exibidas na secção final da homepage.
export const faqs = [
  {
    pergunta: 'Quanto tempo demora o registo de uma marca?',
    resposta:
      'Após a submissão, o pedido passa por exame formal, publicação e um prazo de oposição de 60 dias. Se não houver oposições procedentes, o exame substantivo e a decisão final ocorrem tipicamente entre 8 e 12 meses.',
  },
  {
    pergunta: 'Que documentos preciso para submeter um pedido?',
    resposta:
      'Depende do tipo de propriedade: para marcas, a representação do sinal e a classe de Nice; para patentes, a memória descritiva e reivindicações; para desenhos industriais, as representações gráficas do produto. O SIPI indica os campos obrigatórios em cada formulário.',
  },
  {
    pergunta: 'Como acompanho o estado do meu processo?',
    resposta:
      'Depois de autenticado, a área "Os Meus Pedidos" mostra o estado actual e o histórico completo de cada processo, desde o rascunho até à concessão do certificado.',
  },
  {
    pergunta: 'Posso registar online sem sair de casa?',
    resposta:
      'Sim. Todo o processo — submissão, pagamento via CUTE e emissão de comprovativos — é feito electronicamente no SIPI, sem necessidade de deslocação ao IAPI.',
  },
  {
    pergunta: 'O que acontece se alguém se opuser ao meu pedido?',
    resposta:
      'O pedido passa ao estado "Em Oposição" e um Técnico Examinador analisa os fundamentos apresentados. Será notificado e poderá responder antes da decisão final.',
  },
];
