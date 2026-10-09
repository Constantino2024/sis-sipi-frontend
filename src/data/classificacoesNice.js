// src/data/classificacoesNice.js
// Classificação Internacional de Produtos e Serviços para o Registo de Marcas
// (Acordo de Nice - Edição em vigor adoptada por Angola e pelo IAPI).

export const PROVINCIAS_ANGOLA = [
  'Bengo',
  'Benguela',
  'Bié',
  'Cabinda',
  'Cuando Cubango',
  'Cuanza Norte',
  'Cuanza Sul',
  'Cunene',
  'Huambo',
  'Huíla',
  'Luanda',
  'Lunda Norte',
  'Lunda Sul',
  'Malanje',
  'Moxico',
  'Namibe',
  'Uíge',
  'Zaire',
];

export const CLASSES_NICE = [
  // --- PRODUTOS (Classes 1 a 34) ---
  {
    classe: 1,
    tipo: 'PRODUTO',
    titulo: 'Produtos químicos',
    descricao: 'Produtos químicos destinados à indústria, às ciências, à fotografia, assim como à agricultura, à horticultura e à silvicultura; resinas artificiais em estado bruto, matérias plásticas em estado bruto; adubos para as terras; composições extintoras de incêndios.',
    exemplos: 'fertilizantes, reagentes industriais, polímeros brutos, colas industriais',
  },
  {
    classe: 2,
    tipo: 'PRODUTO',
    titulo: 'Tintas e vernizes',
    descricao: 'Tintas, vernizes, lacas; produtos de preservação contra a oxidação e contra a deterioração da madeira; matérias tintoriais; mordentes; resinas naturais no estado bruto; metais em folhas e em pó para pintores, decoradores, impressores e artistas.',
    exemplos: 'tintas para construção, vernizes, corantes, revestimentos protectores',
  },
  {
    classe: 3,
    tipo: 'PRODUTO',
    titulo: 'Cosméticos e limpeza',
    descricao: 'Substâncias não medicinais para lavagem e cosméticos; dentífricos; produtos de perfumaria, óleos essenciais; preparações para branquear e outras substâncias para a lavagem de roupa.',
    exemplos: 'perfumes, sabonetes, cremes faciais, maquilhagem, champôs, detergentes',
  },
  {
    classe: 4,
    tipo: 'PRODUTO',
    titulo: 'Combustíveis e lubrificantes',
    descricao: 'Óleos e gorduras industriais; produtos de cera; lubrificantes; composições para absorver, humedecer e ligar poeiras; combustíveis (incluindo as gasolinas e gasóleos para motores) e matérias de iluminação; velas e mechas para a iluminação.',
    exemplos: 'gasolina, gasóleo, gás butano, carvão vegetal, óleos para motores, velas',
  },
  {
    classe: 5,
    tipo: 'PRODUTO',
    titulo: 'Produtos farmacêuticos',
    descricao: 'Produtos farmacêuticos, preparações para uso médico e veterinário; produtos higiénicos para medicina; alimentos e substâncias dietéticas adaptadas para uso médico ou veterinário; pensos e materiais para curativos; desinfectantes.',
    exemplos: 'medicamentos, suplementos alimentares, desinfectantes, vacinas, produtos oftálmicos',
  },
  {
    classe: 6,
    tipo: 'PRODUTO',
    titulo: 'Metais e ferragens',
    descricao: 'Metais comuns e suas ligas; minérios; materiais de construção metálicos; construções transportáveis metálicas; cabos e fios metálicos não eléctricos; artigos de serralharia e ferragens metálicas.',
    exemplos: 'tubos de aço, vigas metálicas, fechaduras, contentores metálicos, cabos de aço',
  },
  {
    classe: 7,
    tipo: 'PRODUTO',
    titulo: 'Máquinas e motores industriais',
    descricao: 'Máquinas-ferramentas; motores (com excepção dos motores para veículos terrestres); engates e órgãos de transmissão (com excepção dos de veículos terrestres); instrumentos agrícolas que não sejam accionados manualmente; chocadeiras para ovos.',
    exemplos: 'geradores de energia, bombas de água, escavadoras, teares, motores eléctricos',
  },
  {
    classe: 8,
    tipo: 'PRODUTO',
    titulo: 'Ferramentas manuais',
    descricao: 'Ferramentas e instrumentos manuais accionados manualmente; artigos de cutelaria, garfos e colheres; armas brancas; lâminas de barbear.',
    exemplos: 'chaves de fenda, martelos, facas, alicates, tesouras, alfaias manuais',
  },
  {
    classe: 9,
    tipo: 'PRODUTO',
    titulo: 'Aparelhos electrónicos e software',
    descricao: 'Aparelhos e instrumentos científicos, de navegação, de vigilância, fotográficos, cinematográficos, audiovisuais, ópticos; software de computador gravado ou descarregável; computadores e periféricos; telemóveis; suportes de registo de som.',
    exemplos: 'aplicações móveis, sistemas de computador, smartphones, câmaras, painéis solares',
  },
  {
    classe: 10,
    tipo: 'PRODUTO',
    titulo: 'Aparelhos médicos',
    descricao: 'Aparelhos e instrumentos cirúrgicos, médicos, dentários e veterinários; membros, olhos e dentes artificiais; artigos ortopédicos; material de sutura; dispositivos terapêuticos e de assistência adaptados para pessoas com deficiência.',
    exemplos: 'estetoscópios, próteses, seringas, monitores cardíacos, luvas cirúrgicas',
  },
  {
    classe: 11,
    tipo: 'PRODUTO',
    titulo: 'Aparelhos de iluminação e climatização',
    descricao: 'Aparelhos e instalações de iluminação, aquecimento, arrefecimento, produção de vapor, cozedura, secagem, ventilação, distribuição de água e instalações sanitárias.',
    exemplos: 'aparelhos de ar condicionado, lâmpadas, frigoríficos, fornos, autoclismos, purificadores de água',
  },
  {
    classe: 12,
    tipo: 'PRODUTO',
    titulo: 'Veículos',
    descricao: 'Veículos; aparelhos de locomoção por terra, por ar ou por água.',
    exemplos: 'automóveis, camiões, motociclos, barcos, drones, aviões, bicicletas',
  },
  {
    classe: 13,
    tipo: 'PRODUTO',
    titulo: 'Armas de fogo e explosivos',
    descricao: 'Armas de fogo; munições e projécteis; explosivos; fogos-de-artifício.',
    exemplos: 'cartuchos, pólvora, pirotecnia, espingardas de caça',
  },
  {
    classe: 14,
    tipo: 'PRODUTO',
    titulo: 'Ourivesaria e relojoaria',
    descricao: 'Metais preciosos e suas ligas; artigos de joalharia, bijuteria, pedras preciosas e semipreciosas; instrumentos de relojoaria e cronométricos.',
    exemplos: 'anéis de ouro, diamantes lapidados, relógios de pulso, colares, pulseiras',
  },
  {
    classe: 15,
    tipo: 'PRODUTO',
    titulo: 'Instrumentos musicais',
    descricao: 'Instrumentos musicais; estantes de música e suportes para instrumentos musicais; batutas para maestros.',
    exemplos: 'guitarras, marimbas, tambores, pianos, saxofones, sintetizadores',
  },
  {
    classe: 16,
    tipo: 'PRODUTO',
    titulo: 'Papelaria e publicações',
    descricao: 'Papel e cartão; produtos de impressão; artigos de encadernação; fotografias; artigos de papelaria e material de escritório; adesivos para papelaria ou uso doméstico; materiais para artistas e desenho; pincéis.',
    exemplos: 'livros, revistas, cadernos, blocos, embalagens de papelão, canetas',
  },
  {
    classe: 17,
    tipo: 'PRODUTO',
    titulo: 'Borracha e isolamentos',
    descricao: 'Borracha, guta-percha, goma, amianto, mica e produtos fabricados com estas matérias; plásticos e resinas extrudidos sob a forma de folhas, blocos ou barras para utilização no fabrico; materiais de vedação, calafetagem e isolamento; tubos flexíveis não metálicos.',
    exemplos: 'isolamento térmico, juntas de vedação, mangueiras, películas plásticas industriais',
  },
  {
    classe: 18,
    tipo: 'PRODUTO',
    titulo: 'Couro e malas',
    descricao: 'Couro e imitações de couro; peles de animais; malas e sacos de viagem; guarda-chuvas e pára-sóis; bengalas; chicotes e artigos de selaria; coleiras e trelas para animais.',
    exemplos: 'carteiras, bolsas, mochilas, malas de viagem, cintos de couro, pastas',
  },
  {
    classe: 19,
    tipo: 'PRODUTO',
    titulo: 'Materiais de construção não metálicos',
    descricao: 'Materiais de construção (não metálicos); tubos rígidos não metálicos para a construção; asfalto, pez, alcatrão e betume; construções transportáveis não metálicas; monumentos não metálicos.',
    exemplos: 'cimento, tijolos, brita, areia, madeira para construção, tubagens de PVC, granito',
  },
  {
    classe: 20,
    tipo: 'PRODUTO',
    titulo: 'Móveis e artigos de decoração',
    descricao: 'Móveis, espelhos, molduras; recipientes não metálicos para armazenamento ou transporte; osso, chifre, baleia ou madrepérola em bruto ou semitrabalhados; conchas; meerschaum; âmbar amarelo.',
    exemplos: 'camas, mesas, sofás, armários de cozinha, colchões, estantes de madeira',
  },
  {
    classe: 21,
    tipo: 'PRODUTO',
    titulo: 'Utensílios domésticos e vidros',
    descricao: 'Utensílios e recipientes para a casa ou cozinha; pentes e esponjas; escovas; materiais para fabrico de escovas; material de limpeza; vidro em bruto ou semitrabalhado; artigos de vidro, porcelana e faiança.',
    exemplos: 'panelas, pratos, copos de vidro, bacias plásticas, garrafas isotérmicas, escovas de dentes',
  },
  {
    classe: 22,
    tipo: 'PRODUTO',
    titulo: 'Cordas e sacaria',
    descricao: 'Cordas e fios; redes; tendas e oleados; toldos de matérias têxteis ou sintéticas; velas de embarcações; sacos para transporte e armazenamento de mercadorias a granel; matérias de acolchoamento e enchimento.',
    exemplos: 'cordas de sisal, tendas de campismo, sacos de ráfia, lonas, redes de pesca',
  },
  {
    classe: 23,
    tipo: 'PRODUTO',
    titulo: 'Fios para uso têxtil',
    descricao: 'Fios para uso têxtil.',
    exemplos: 'linhas de costura, fios de algodão, fios de lã, fios de seda para tecelagem',
  },
  {
    classe: 24,
    tipo: 'PRODUTO',
    titulo: 'Tecidos e têxteis',
    descricao: 'Têxteis e sucedâneos de têxteis; roupa de casa; cortinados de matérias têxteis ou de plástico.',
    exemplos: 'tecidos de samakaka, lençóis de cama, toalhas de banho, cortinas, panos de mesa',
  },
  {
    classe: 25,
    tipo: 'PRODUTO',
    titulo: 'Vestuário, calçado e chapelaria',
    descricao: 'Vestuário, calçado e chapelaria.',
    exemplos: 'fatos, vestidos, camisas, calças, sapatos, ténis, botas, bonés, chapéus',
  },
  {
    classe: 26,
    tipo: 'PRODUTO',
    titulo: 'Artigos de retrosaria',
    descricao: 'Rendas, tranças e bordados, fitas e laços; botões, ganchos e ilhoses, alfinetes e agulhas; flores artificiais; decorações para o cabelo; cabelo falso.',
    exemplos: 'perucas, fechos de correr, fitas adesivas para tecido, ganchos de cabelo, emblemas de tecido',
  },
  {
    classe: 27,
    tipo: 'PRODUTO',
    titulo: 'Tapetes e revestimentos de chão',
    descricao: 'Tapetes, capachos, esteiras, linóleo e outros revestimentos de pavimentos; tapeçarias murais que não sejam em matérias têxteis.',
    exemplos: 'alcatifas, tapetes decorativos, relva artificial, papel de parede',
  },
  {
    classe: 28,
    tipo: 'PRODUTO',
    titulo: 'Jogos, brinquedos e artigos de desporto',
    descricao: 'Jogos e brinquedos; aparelhos para videojogos; artigos de ginástica e de desporto; decorações para árvores de Natal.',
    exemplos: 'bolas de futebol, jogos de tabuleiro, bonecas, consolas portáteis, pesos de ginásio',
  },
  {
    classe: 29,
    tipo: 'PRODUTO',
    titulo: 'Carnes, peixes e lacticínios',
    descricao: 'Carne, peixe, aves e caça; extractos de carne; frutas, legumes, leguminosas e hortaliças em conserva, congelados, secos e cozinhados; geleias, doces, compotas; ovos; leite, queijo, manteiga, iogurte e outros produtos lácteos; óleos e gorduras para uso alimentar.',
    exemplos: 'peixe seco/fresco, carne de vaca, chouriços, queijo, leite condensado, óleo vegetal, azeite',
  },
  {
    classe: 30,
    tipo: 'PRODUTO',
    titulo: 'Café, cereais, pão e massas',
    descricao: 'Café, chá, cacau e sucedâneos do café; arroz, massas alimentícias e noodles; tapioca e sagu; farinhas e preparações feitas de cereais; pão, pastelaria e confeitaria; chocolate; gelados comestíveis; açúcar, mel, melaço; levedura, fermento em pó; sal; condimentos, especiarias; vinagre, molhos.',
    exemplos: 'café de Angola, fuba de milho/bombó, pão, arroz, massas, bolos, mel, sal, especiarias',
  },
  {
    classe: 31,
    tipo: 'PRODUTO',
    titulo: 'Produtos agrícolas e flores',
    descricao: 'Produtos agrícolas, aquícolas, hortícolas e florestais em bruto e não transformados; sementes e sementes em bruto; plantas e flores vivas; animais vivos; alimentos para animais; malte.',
    exemplos: 'grãos de milho, mandioca in natura, frutas frescas, gado bovino, ração para aves, sementes',
  },
  {
    classe: 32,
    tipo: 'PRODUTO',
    titulo: 'Cervejas, águas e sumos',
    descricao: 'Cervejas; bebidas não alcoólicas; águas minerais e gasosas; bebidas à base de frutas e sumos de frutas; xaropes e outras preparações não alcoólicas para fazer bebidas.',
    exemplos: 'cervejas nacionais, águas de mesa, sumos naturais, refrigerantes, bebidas energéticas',
  },
  {
    classe: 33,
    tipo: 'PRODUTO',
    titulo: 'Bebidas alcoólicas (excepto cervejas)',
    descricao: 'Bebidas alcoólicas (excepto cervejas); preparações alcoólicas para o fabrico de bebidas.',
    exemplos: 'vinhos, licores, uísque, aguardente, rum, gin, conhaque',
  },
  {
    classe: 34,
    tipo: 'PRODUTO',
    titulo: 'Tabaco e cigarros',
    descricao: 'Tabaco e sucedâneos do tabaco; cigarros e charutos; cigarros electrónicos e vaporizadores orais para fumadores; artigos para fumadores; fósforos.',
    exemplos: 'cigarros, charutos, tabaco para cachimbo, isqueiros, filtros de cigarro',
  },

  // --- SERVIÇOS (Classes 35 a 45) ---
  {
    classe: 35,
    tipo: 'SERVICO',
    titulo: 'Publicidade, gestão e comércio',
    descricao: 'Publicidade; gestão, organização e administração de negócios comerciais; trabalhos de escritório; serviços de comércio a retalho ou por grosso.',
    exemplos: 'lojas comerciais, supermercados, agências de publicidade, consultoria de gestão, contabilidade',
  },
  {
    classe: 36,
    tipo: 'SERVICO',
    titulo: 'Banca, finanças e seguros',
    descricao: 'Serviços financeiros, monetários e bancários; serviços de seguros; operações imobiliárias.',
    exemplos: 'bancos comerciais, corretagem de seguros, mediação imobiliária, crédito ao consumo',
  },
  {
    classe: 37,
    tipo: 'SERVICO',
    titulo: 'Construção civil e reparações',
    descricao: 'Serviços de construção; serviços de instalação e de reparação; extracção mineira, perfuração de petróleo e gás.',
    exemplos: 'empreitadas de construção civil, mecânica automóvel, manutenção eléctrica, perfuração',
  },
  {
    classe: 38,
    tipo: 'SERVICO',
    titulo: 'Telecomunicações',
    descricao: 'Serviços de telecomunicações; emissão de rádio e de televisão; fornecimento de acesso à Internet e canais de telecomunicações.',
    exemplos: 'operadoras móveis, fornecedores de Internet (ISP), rádio, televisão por cabo, streaming',
  },
  {
    classe: 39,
    tipo: 'SERVICO',
    titulo: 'Transporte e armazenagem',
    descricao: 'Transporte; embalagem e entrepostagem de mercadorias; organização de viagens.',
    exemplos: 'aviação civil, transporte rodoviário de passageiros/cargas, logística, despachantes, agências de viagens',
  },
  {
    classe: 40,
    tipo: 'SERVICO',
    titulo: 'Tratamento de materiais',
    descricao: 'Tratamento de materiais; reciclagem de resíduos e lixo; purificação do ar e tratamento da água; serviços de impressão; conservação de alimentos e bebidas.',
    exemplos: 'impressão gráfica, refinação petrolífera, moagem de cereais, soldadura, tratamento de água',
  },
  {
    classe: 41,
    tipo: 'SERVICO',
    titulo: 'Educação, formação e entretenimento',
    descricao: 'Educação; formação; divertimento; actividades desportivas e culturais; produção de filmes e eventos.',
    exemplos: 'escolas, universidades, centros de formação, espectáculos musicais, academias desportivas',
  },
  {
    classe: 42,
    tipo: 'SERVICO',
    titulo: 'Serviços científicos e TI / software',
    descricao: 'Serviços científicos e tecnológicos, bem como serviços de pesquisa e concepção a eles associados; serviços de análise e de investigação industrial; concepção e desenvolvimento de computadores e de software.',
    exemplos: 'desenvolvimento de software, alojamento web, engenharia, arquitectura, segurança informática',
  },
  {
    classe: 43,
    tipo: 'SERVICO',
    titulo: 'Restauração e alojamento hoteleiro',
    descricao: 'Serviços de restauração (alimentação); alojamento temporário.',
    exemplos: 'restaurantes, hotéis, cafetarias, pensões, catering, bares',
  },
  {
    classe: 44,
    tipo: 'SERVICO',
    titulo: 'Serviços médicos, veterinários e estética',
    descricao: 'Serviços médicos; serviços veterinários; cuidados de higiene e de beleza para seres humanos ou animais; serviços de agricultura, aquicultura, horticultura e silvicultura.',
    exemplos: 'clínicas médicas, hospitais, clínicas veterinárias, salões de beleza, barbearias, paisagismo',
  },
  {
    classe: 45,
    tipo: 'SERVICO',
    titulo: 'Serviços jurídicos e segurança',
    descricao: 'Serviços jurídicos; serviços de segurança para a protecção física de bens tangíveis e indivíduos; serviços pessoais e sociais prestados por terceiros para satisfazer necessidades de indivíduos.',
    exemplos: 'escritórios de advogados, empresas de segurança privada, investigações, consultoria jurídica',
  },
];

export const TAXAS_OFICIAIS_IAPI_MARCAS = {
  TAXA_BASE_PRIMEIRA_CLASSE: 25000, // 25.000,00 Kz (Taxa de Depósito de Marca em 1 Classe)
  TAXA_CLASSE_ADICIONAL: 10000,    // 10.000,00 Kz por cada classe suplementar
  TAXA_REIVINDICACAO_PRIORIDADE: 15000, // 15.000,00 Kz (se reivindicada prioridade internacional CUP)
};

export function calcularTaxaMarcaIapi({ numeroClasses = 1, reivindicaPrioridade = false }) {
  const classes = Math.max(1, numeroClasses);
  const base = TAXAS_OFICIAIS_IAPI_MARCAS.TAXA_BASE_PRIMEIRA_CLASSE;
  const classesAdicionais = Math.max(0, classes - 1) * TAXAS_OFICIAIS_IAPI_MARCAS.TAXA_CLASSE_ADICIONAL;
  const prioridade = reivindicaPrioridade ? TAXAS_OFICIAIS_IAPI_MARCAS.TAXA_REIVINDICACAO_PRIORIDADE : 0;
  const total = base + classesAdicionais + prioridade;

  return {
    base,
    classesAdicionais,
    prioridade,
    total,
    numeroClasses: classes,
  };
}
