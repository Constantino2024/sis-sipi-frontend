import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Upload,
  File as IconeFicheiro,
  X,
  Loader2,
  Search,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Building,
  User,
  Layers,
  FileCheck,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import CabecalhoPainel from '../../../components/privado/CabecalhoPainel';
import { criarPedido } from '../../../services/pedidosService';
import { uploadAnexo } from '../../../services/anexosService';
import { useAutenticacao } from '../../../contexto/AutenticacaoContexto';
import ModalRupe from '../../../components/pagamentos/ModalRupe';
import {
  CLASSES_NICE,
  PROVINCIAS_ANGOLA,
  calcularTaxaMarcaIapi,
} from '../../../data/classificacoesNice';

const NATUREZAS_MARCA = [
  {
    valor: 'PRODUTO',
    rotulo: 'Marca de Produto',
    descricao: 'Destinada a distinguir produtos de fabrico ou comércio (ex: bebidas, vestuário, alimentos, computadores).',
  },
  {
    valor: 'SERVICO',
    rotulo: 'Marca de Serviço',
    descricao: 'Destinada a distinguir actividades ou prestação de serviços (ex: bancos, hotéis, transportes, consultoria).',
  },
  {
    valor: 'COLECTIVA',
    rotulo: 'Marca Colectiva',
    descricao: 'Pertencente a uma associação ou cooperativa para distinguir produtos ou serviços dos seus associados.',
  },
  {
    valor: 'CERTIFICACAO',
    rotulo: 'Marca de Certificação',
    descricao: 'Atesta conformidade com normas, origem geográfica, composição ou características de qualidade.',
  },
];

const APRESENTACOES_MARCA = [
  {
    valor: 'NOMINATIVA',
    rotulo: 'Nominativa',
    descricao: 'Composta exclusivamente por palavras, letras, dígitos ou caracteres tipográficos padronizados (sem logotipo).',
  },
  {
    valor: 'FIGURATIVA',
    rotulo: 'Figurativa',
    descricao: 'Composta unicamente por elementos gráficos, símbolos, emblemas ou figuras sem texto.',
  },
  {
    valor: 'MISTA',
    rotulo: 'Mista (Recomendada)',
    descricao: 'Combinação de elemento nominativo (texto da marca) e elemento figurativo (logótipo ou grafismo).',
  },
  {
    valor: 'TRIDIMENSIONAL',
    rotulo: 'Tridimensional',
    descricao: 'Constituída pela forma plástica do próprio produto ou do seu acondicionamento/embalagem.',
  },
  {
    valor: 'SONORA',
    rotulo: 'Sonora',
    descricao: 'Composta por uma melodia, jingle, acorde sonoro ou pauta musical gravada.',
  },
];

export default function NovoPedidoPage() {
  const { utilizador } = useAutenticacao();
  const navigate = useNavigate();
  // Etapa do processo guiado do IAPI (1 a 5)
  const [passoAtual, setPassoAtual] = useState(1);
  const tipoPropriedade = 'MARCA';

  // --- Passo 1: Titular e Representação ---
  const [tipoPessoa, setTipoPessoa] = useState(utilizador?.tipo_utilizador || 'PESSOA_SINGULAR');
  const [nomeTitular, setNomeTitular] = useState(utilizador?.nome || '');
  const [nifTitular, setNifTitular] = useState(utilizador?.nif || '009150115UE044');
  const [nacionalidade, setNacionalidade] = useState('Angolana');
  const [provincia, setProvincia] = useState('Luanda');
  const [municipio, setMunicipio] = useState('Luanda');
  const [endereco, setEndereco] = useState('Avenida 4 de Fevereiro');
  const [telefone, setTelefone] = useState(utilizador?.telefone || '+244 923 000 001');
  const [email, setEmail] = useState(utilizador?.email || 'requerente@sipi.ao');
  const [tipoRepresentante, setTipoRepresentante] = useState('PROPRIO');
  const [nomeMandatario, setNomeMandatario] = useState('');
  const [cedulaMandatario, setCedulaMandatario] = useState('');

  // --- Passo 2: Caracterização da Marca ---
  const [naturezaMarca, setNaturezaMarca] = useState('PRODUTO');
  const [apresentacaoMarca, setApresentacaoMarca] = useState('MISTA');
  const [denominacaoMarca, setDenominacaoMarca] = useState('');
  const [logotipoFicheiro, setLogotipoFicheiro] = useState(null);
  const [logotipoPreview, setLogotipoPreview] = useState(null);
  const [reivindicaCores, setReivindicaCores] = useState(false);
  const [coresReivindicadas, setCoresReivindicadas] = useState('');
  const [disclaimer, setDisclaimer] = useState('');
  const [reivindicaPrioridade, setReivindicaPrioridade] = useState(false);
  const [paisPrioridade, setPaisPrioridade] = useState('');
  const [dataPrioridade, setDataPrioridade] = useState('');
  const [numeroPrioridade, setNumeroPrioridade] = useState('');
  const [descricaoGeral, setDescricaoGeral] = useState('');

  // --- Passo 3: Classificação de Nice ---
  const [buscaNice, setBuscaNice] = useState('');
  const [filtroTipoNice, setFiltroTipoNice] = useState('TODOS'); // 'TODOS' | 'PRODUTO' | 'SERVICO'
  const [classesSelecionadas, setClassesSelecionadas] = useState([32]); // Padrão: Classe 32 (Bebidas/Cervejas/Águas)
  const [especificacoesPorClasse, setEspecificacoesPorClasse] = useState({
    32: 'Cervejas nacionais; águas minerais e de mesa; sumos de frutas e refrigerantes gaseificados.',
  });

  // --- Passo 4: Documentos Anexados ---
  const [documentos, setDocumentos] = useState([]);

  // Estados de controlo
  const [aSubmeter, setASubmeter] = useState(false);
  const [erro, setErro] = useState(null);
  const [pedidoCriado, setPedidoCriado] = useState(null);

  function aplicarModeloPredefinido(tipoModelo) {
    if (tipoModelo === 'PRODUTO_BEBIDAS') {
      setNaturezaMarca('PRODUTO');
      setApresentacaoMarca('MISTA');
      setDenominacaoMarca('CUANZA OURO');
      setLogotipoPreview('https://placehold.co/400x300/0A2A44/FFFFFF?text=CUANZA+OURO');
      setReivindicaCores(true);
      setCoresReivindicadas('Dourado, Azul petróleo e Branco');
      setDisclaimer('Não se reivindica o uso exclusivo da palavra "Ouro".');
      setReivindicaPrioridade(false);
      setClassesSelecionadas([32]);
      setEspecificacoesPorClasse({
        32: 'Cervejas especiais artesanais e industriais; águas minerais gaseificadas; sumos de frutas e refrigerantes gaseificados fabricados em Angola.',
      });
      setNomeTitular('Sociedade Angolana de Bebidas, Lda.');
      setNifTitular('5418092314');
      setTipoPessoa('PESSOA_COLECTIVA');
      setProvincia('Luanda');
      setMunicipio('Viana');
      setEndereco('Polo Industrial de Viana, Estrada de Catete, Luanda');
      setTelefone('+244 923 111 222');
      setEmail('marcas@cuanzaouro.ao');
      setTipoRepresentante('PROPRIO');
    } else if (tipoModelo === 'SERVICO_FINTECH') {
      setNaturezaMarca('SERVICO');
      setApresentacaoMarca('MISTA');
      setDenominacaoMarca('KAMBAS PAY');
      setLogotipoPreview('https://placehold.co/400x300/0A2A44/FFFFFF?text=KAMBAS+PAY');
      setReivindicaCores(true);
      setCoresReivindicadas('Azul elétrico e Amarelo');
      setDisclaimer('');
      setReivindicaPrioridade(false);
      setClassesSelecionadas([36, 42]);
      setEspecificacoesPorClasse({
        36: 'Serviços de transferência monetária electrónica; pagamentos via telemóvel; serviços de cartões pré-pagos e banca digital.',
        42: 'Desenvolvimento e manutenção de software de processamento seguro de pagamentos e aplicações financeiras para smartphones.',
      });
      setNomeTitular('Kambas Pagamentos Digitais, S.A.');
      setNifTitular('5001239845');
      setTipoPessoa('PESSOA_COLECTIVA');
      setProvincia('Luanda');
      setMunicipio('Belas');
      setEndereco('Avenida Talatona, Centro Empresarial, Luanda');
      setTelefone('+244 934 888 999');
      setEmail('juridico@kambaspay.ao');
      setTipoRepresentante('AOPI');
      setNomeMandatario('Dr. Carlos Alberto Silva');
      setCedulaMandatario('AOPI N.º 018/IAPI');
    } else if (tipoModelo === 'COLECTIVA_CAFE') {
      setNaturezaMarca('COLECTIVA');
      setApresentacaoMarca('MISTA');
      setDenominacaoMarca('CAFÉ DO UÍGE COLECTIVO');
      setLogotipoPreview('https://placehold.co/400x300/0A2A44/FFFFFF?text=CAFE+DO+UIGE');
      setReivindicaCores(true);
      setCoresReivindicadas('Castanho torrado e Verde folha');
      setDisclaimer('Não se reivindica exclusividade sobre o termo "Café".');
      setReivindicaPrioridade(false);
      setClassesSelecionadas([30]);
      setEspecificacoesPorClasse({
        30: 'Café Robusta e Arábica cultivado e seleccionado pelos membros associados na província do Uíge, em grão e moído.',
      });
      setNomeTitular('Associação dos Produtores de Café do Uíge');
      setNifTitular('5109847120');
      setTipoPessoa('PESSOA_COLECTIVA');
      setProvincia('Uíge');
      setMunicipio('Uíge');
      setEndereco('Estrada Nacional 120, Km 4, Sede da Associação');
      setTelefone('+244 928 444 555');
      setEmail('contato@cafeuige.coop.ao');
      setTipoRepresentante('PROPRIO');
    } else if (tipoModelo === 'CERTIFICACAO_ORIGEM') {
      setNaturezaMarca('CERTIFICACAO');
      setApresentacaoMarca('FIGURATIVA');
      setDenominacaoMarca('SELO PRODUZIDO EM ANGOLA');
      setLogotipoPreview('https://placehold.co/400x300/0A2A44/FFFFFF?text=SELO+ANGOLA');
      setReivindicaCores(true);
      setCoresReivindicadas('Vermelho, Amarelo e Preto');
      setDisclaimer('');
      setReivindicaPrioridade(false);
      setClassesSelecionadas([29, 31]);
      setEspecificacoesPorClasse({
        29: 'Certificação de carnes, peixes, frutas e legumes processados e embalados em Angola com padrões oficiais de qualidade.',
        31: 'Certificação de produtos agrícolas em estado natural e sementes com garantia de origem em solo angolano.',
      });
      setNomeTitular('Instituto Nacional de Certificação e Normas');
      setNifTitular('5000123987');
      setTipoPessoa('PESSOA_COLECTIVA');
      setProvincia('Luanda');
      setMunicipio('Luanda');
      setEndereco('Rua Rainha Ginga, Edifício das Câmaras de Comércio');
      setTelefone('+244 923 000 777');
      setEmail('certificacao@origemangola.gov.ao');
      setTipoRepresentante('PROPRIO');
    } else if (tipoModelo === 'NOMINATIVA_HOTEL') {
      setNaturezaMarca('SERVICO');
      setApresentacaoMarca('NOMINATIVA');
      setDenominacaoMarca('LUANDA SKY RESORT');
      setLogotipoPreview(null);
      setLogotipoFicheiro(null);
      setReivindicaCores(false);
      setCoresReivindicadas('');
      setDisclaimer('Sem exclusividade para o termo geográfico "Luanda".');
      setReivindicaPrioridade(false);
      setClassesSelecionadas([43]);
      setEspecificacoesPorClasse({
        43: 'Serviços de alojamento hoteleiro de luxo; restauração, bares, catering e organização de banquetes turísticos.',
      });
      setNomeTitular('Empreendimentos Turísticos da Baía, Lda.');
      setNifTitular('5008172635');
      setTipoPessoa('PESSOA_COLECTIVA');
      setProvincia('Luanda');
      setMunicipio('Luanda');
      setEndereco('Avenida 4 de Fevereiro, Marginal de Luanda');
      setTelefone('+244 923 555 888');
      setEmail('reservas@luandasky.co.ao');
      setTipoRepresentante('PROPRIO');
    }
    setErro(null);
  }

  // Cálculos de Emolumentos Oficiais do IAPI
  const taxasCalculadas = useMemo(() => {
    return calcularTaxaMarcaIapi({
      numeroClasses: classesSelecionadas.length,
      reivindicaPrioridade,
    });
  }, [classesSelecionadas.length, reivindicaPrioridade]);

  // Classes de Nice filtradas
  const classesFiltradas = useMemo(() => {
    const termo = buscaNice.trim().toLowerCase();
    return CLASSES_NICE.filter((c) => {
      const matchTipo =
        filtroTipoNice === 'TODOS' || c.tipo === filtroTipoNice;
      const matchTermo =
        !termo ||
        c.classe.toString() === termo ||
        c.titulo.toLowerCase().includes(termo) ||
        c.descricao.toLowerCase().includes(termo) ||
        c.exemplos.toLowerCase().includes(termo);
      return matchTipo && matchTermo;
    });
  }, [buscaNice, filtroTipoNice]);

  useEffect(() => {
    if (!utilizador) {
      navigate('/login');
    }
  }, [utilizador, navigate]);

  function alternarClasseNice(numClasse) {
    if (classesSelecionadas.includes(numClasse)) {
      if (classesSelecionadas.length === 1) {
        setErro('É obrigatório seleccionar pelo menos uma Classe de Nice.');
        return;
      }
      setClassesSelecionadas((atuais) => atuais.filter((c) => c !== numClasse));
    } else {
      setClassesSelecionadas((atuais) => [...atuais, numClasse].sort((a, b) => a - b));
      // Preencher sugestão inicial de especificação
      const classeObj = CLASSES_NICE.find((c) => c.classe === numClasse);
      if (classeObj && !especificacoesPorClasse[numClasse]) {
        setEspecificacoesPorClasse((prev) => ({
          ...prev,
          [numClasse]: classeObj.exemplos,
        }));
      }
    }
    setErro(null);
  }

  function atualizarEspecificacaoClasse(numClasse, texto) {
    setEspecificacoesPorClasse((prev) => ({
      ...prev,
      [numClasse]: texto,
    }));
  }

  function aoSelecionarLogotipo(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErro('O logótipo excede o limite de 10 MB.');
      return;
    }

    setLogotipoFicheiro(file);
    const reader = new FileReader();
    reader.onload = () => {
      setLogotipoPreview(reader.result);
    };
    reader.readAsDataURL(file);
    setErro(null);
  }

  function aoSelecionarAnexos(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const novos = files.filter((f) => f.size <= 10 * 1024 * 1024);
    setDocumentos((prev) => [...prev, ...novos]);
  }

  function removerAnexo(index) {
    setDocumentos((prev) => prev.filter((_, i) => i !== index));
  }

  function validarPasso(passo) {
    setErro(null);
    if (passo === 1) {
      if (!nomeTitular.trim() || !nifTitular.trim() || !endereco.trim() || !telefone.trim()) {
        setErro('Por favor, preencha todos os campos obrigatórios do Titular (Nome, NIF, Endereço e Telefone).');
        return false;
      }
    }
    if (passo === 2) {
      if (!denominacaoMarca.trim() && apresentacaoMarca !== 'FIGURATIVA') {
        setErro('A denominação da marca é obrigatória para marcas Nominativas e Mistas.');
        return false;
      }
      if ((apresentacaoMarca === 'FIGURATIVA' || apresentacaoMarca === 'MISTA') && !logotipoPreview) {
        setErro('Para marcas Mistas ou Figurativas, é obrigatório carregar a reprodução gráfica / logótipo.');
        return false;
      }
      if (reivindicaCores && !coresReivindicadas.trim()) {
        setErro('Por favor, indique as cores reivindicadas pela marca.');
        return false;
      }
    }
    if (passo === 3) {
      if (classesSelecionadas.length === 0) {
        setErro('Seleccione pelo menos uma classe da Classificação Internacional de Nice.');
        return false;
      }
      for (const numClasse of classesSelecionadas) {
        if (!especificacoesPorClasse[numClasse]?.trim()) {
          setErro(`Por favor, detalhe a especificação dos produtos ou serviços para a Classe ${numClasse}.`);
          return false;
        }
      }
    }
    return true;
  }

  function proximoPasso() {
    if (validarPasso(passoAtual)) {
      setPassoAtual((p) => Math.min(5, p + 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function passoAnterior() {
    setErro(null);
    setPassoAtual((p) => Math.max(1, p - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function aoSubmeterFinal(e) {
    e.preventDefault();
    setErro(null);

    if (!validarPasso(1) || !validarPasso(2) || !validarPasso(3)) {
      return;
    }

    setASubmeter(true);

    try {
      // Montar dados completos da Marca segundo o IAPI
      const classesMontadas = classesSelecionadas.map((num) => {
        const obj = CLASSES_NICE.find((c) => c.classe === num);
        return {
          classe: num,
          titulo: obj?.titulo || `Classe ${num}`,
          tipo: obj?.tipo || 'PRODUTO',
          especificacao: especificacoesPorClasse[num] || obj?.exemplos || '',
        };
      });

      const detalhesMarca = {
        natureza: naturezaMarca,
        apresentacao: apresentacaoMarca,
        denominacao: denominacaoMarca.trim(),
        logotipoUrl: logotipoPreview || null,
        reivindicaCores,
        coresReivindicadas: reivindicaCores ? coresReivindicadas.trim() : null,
        elementosDesconsiderados: disclaimer.trim() || null,
        reivindicaPrioridade,
        dadosPrioridade: reivindicaPrioridade
          ? { pais: paisPrioridade, data: dataPrioridade, numeroProcesso: numeroPrioridade }
          : null,
      };

      const titular = {
        tipoPessoa,
        nomeOuFirma: nomeTitular.trim(),
        nif: nifTitular.trim(),
        nacionalidade,
        provincia,
        municipio,
        endereco: endereco.trim(),
        telefone: telefone.trim(),
        email: email.trim(),
        representanteTipo: tipoRepresentante,
        representanteNome: nomeMandatario.trim() || null,
        representanteCedula: cedulaMandatario.trim() || null,
      };

      const resumoDescricao = `${denominacaoMarca} — ${apresentacaoMarca} (${naturezaMarca}). Classes de Nice: ${classesSelecionadas.join(', ')}.`;

      const novoPedido = await criarPedido({
        tipoPropriedade,
        titulo: denominacaoMarca.trim() || `Marca Figurativa (${nomeTitular})`,
        descricao: descricaoGeral.trim() || resumoDescricao,
        requerenteId: utilizador.id,
        requerenteNome: nomeTitular.trim(),
        detalhesMarca,
        classesNice: classesMontadas,
        titular,
        taxas: taxasCalculadas,
        documentosAnexados: documentos.map((d) => ({
          nome: d.name,
          tamanho: d.size,
          data: new Date().toISOString(),
        })),
      });

      // Upload de anexos associados
      if (logotipoFicheiro) {
        await uploadAnexo(novoPedido.id, logotipoFicheiro, 'LOGOTIPO');
      }
      for (const doc of documentos) {
        await uploadAnexo(novoPedido.id, doc, 'DOCUMENTO_TITULAR');
      }

      setPedidoCriado(novoPedido);
    } catch (excecao) {
      console.error('Erro ao submeter pedido de marca:', excecao);
      setErro('Não foi possível submeter o pedido no sistema do IAPI. Tente novamente.');
    } finally {
      setASubmeter(false);
    }
  }

  function fecharModalRupe() {
    navigate('/meus-pedidos', {
      state: {
        mensagem: `Processo de Registo de Marca ${pedidoCriado.numeroProcesso} depositado com sucesso no IAPI!`,
      },
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <CabecalhoPainel titulo="Registo de Marca — IAPI" />

      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Voltar */}
        <Link
          to="/meus-pedidos"
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary-600 mb-5 transition"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Voltar a Os Meus Pedidos
        </Link>

        {/* Cabeçalho Institucional do IAPI */}
        <div className="bg-primary-900 text-white p-6 sm:p-8 rounded-lg shadow-sm border border-primary-950 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] font-semibold text-secondary-400 block mb-1">
                República de Angola · Ministério da Indústria e Comércio
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                Instituto Angolano da Propriedade Industrial — IAPI
              </h1>
              <p className="text-xs text-primary-200 mt-1 max-w-2xl leading-relaxed">
                Formulário Oficial de Pedido de Registo de Marca — Lei n.º 3/92 de 28 de Fevereiro (Lei da Propriedade Industrial).
                Protecção jurídica exclusiva em todo o território nacional.
              </p>
            </div>
            <div className="bg-primary-800/80 border border-primary-700/60 p-3.5 rounded text-right shrink-0">
              <span className="text-[11px] text-primary-300 block">Taxa Oficial de Depósito</span>
              <strong className="text-lg font-mono text-secondary-400">
                {taxasCalculadas.total.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} Kz
              </strong>
              <span className="text-[10px] text-primary-400 block mt-0.5">
                {classesSelecionadas.length} classe(s) de Nice incluída(s)
              </span>
            </div>
          </div>

          {/* Stepper das 5 Etapas do IAPI */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-8 pt-6 border-t border-primary-800">
            {[
              { num: 1, label: '1. Titular & Mandatário' },
              { num: 2, label: '2. Dados da Marca' },
              { num: 3, label: '3. Classes de Nice' },
              { num: 4, label: '4. Documentos' },
              { num: 5, label: '5. Taxas & Submissão' },
            ].map((etapa) => (
              <button
                key={etapa.num}
                type="button"
                onClick={() => {
                  if (etapa.num < passoAtual || validarPasso(passoAtual)) {
                    setPassoAtual(etapa.num);
                  }
                }}
                className={`text-left p-2.5 rounded transition ${
                  passoAtual === etapa.num
                    ? 'bg-secondary-500 text-primary-950 font-bold shadow-sm'
                    : passoAtual > etapa.num
                    ? 'bg-primary-800 text-primary-200 hover:bg-primary-750'
                    : 'bg-primary-950/40 text-primary-400 hover:bg-primary-950/60'
                }`}
              >
                <span className="text-xs block leading-tight">{etapa.label}</span>
              </button>
            ))}
          </div>

          {/* Modelos Oficiais de Demonstração Rápida */}
          <div className="mt-5 pt-4 border-t border-primary-800/70">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-secondary-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={13} />
                Exemplos Rápidos de Marcas (IAPI):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'PRODUTO_BEBIDAS', label: 'Produto (Bebidas)' },
                  { id: 'SERVICO_FINTECH', label: 'Serviço (Fintech)' },
                  { id: 'COLECTIVA_CAFE', label: 'Colectiva (Café)' },
                  { id: 'CERTIFICACAO_ORIGEM', label: 'Certificação (Selo)' },
                  { id: 'NOMINATIVA_HOTEL', label: 'Nominativa (Hotel)' },
                ].map((mod) => (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => aplicarModeloPredefinido(mod.id)}
                    className="px-2.5 py-1 bg-primary-800/90 hover:bg-secondary-500 hover:text-primary-950 text-primary-100 text-[11px] font-medium rounded border border-primary-700/80 transition"
                  >
                    {mod.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mensagem de Erro / Alerta */}
        {erro && (
          <div
            className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded text-sm flex items-start gap-3"
            role="alert"
          >
            <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-600" />
            <div>
              <strong className="font-semibold block">Atenção ao preenchimento:</strong>
              <span>{erro}</span>
            </div>
          </div>
        )}

        {/* Formulário com as Abas do Processo IAPI */}
        <form onSubmit={aoSubmeterFinal} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sm:p-8">
          {/* ========================================================
              ETAPA 1: TITULAR E REPRESENTAÇÃO
             ======================================================== */}
          {passoAtual === 1 && (
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-lg font-bold text-primary-900 font-serif flex items-center gap-2">
                  <User className="text-secondary-600" size={20} />
                  Etapa 1: Identificação do Requerente / Titular da Marca
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Indique os dados da pessoa singular ou colectiva que será titular exclusivo dos direitos sobre a marca perante o IAPI.
                </p>
              </div>

              {/* Tipo de Pessoa */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Tipo de Requerente / Titular <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3 max-w-md">
                  <button
                    type="button"
                    onClick={() => setTipoPessoa('PESSOA_SINGULAR')}
                    className={`py-3 px-4 border text-xs font-medium rounded flex items-center justify-center gap-2 transition ${
                      tipoPessoa === 'PESSOA_SINGULAR'
                        ? 'bg-primary-50 border-primary-500 text-primary-900 ring-1 ring-primary-500'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <User size={16} />
                    Pessoa Singular (Física)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoPessoa('PESSOA_COLECTIVA')}
                    className={`py-3 px-4 border text-xs font-medium rounded flex items-center justify-center gap-2 transition ${
                      tipoPessoa === 'PESSOA_COLECTIVA'
                        ? 'bg-primary-50 border-primary-500 text-primary-900 ring-1 ring-primary-500'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Building size={16} />
                    Pessoa Colectiva (Empresa)
                  </button>
                </div>
              </div>

              {/* Nome e NIF */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nomeTitular" className="block text-xs font-semibold text-gray-700 mb-1.5">
                    {tipoPessoa === 'PESSOA_COLECTIVA' ? 'Denominação Social / Firma' : 'Nome Completo'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="nomeTitular"
                    type="text"
                    value={nomeTitular}
                    onChange={(e) => setNomeTitular(e.target.value)}
                    placeholder={tipoPessoa === 'PESSOA_COLECTIVA' ? 'Ex: Refrescos de Angola, S.A.' : 'Ex: João António da Costa'}
                    className="w-full border border-gray-300 rounded px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="nifTitular" className="block text-xs font-semibold text-gray-700 mb-1.5">
                    NIF (Número de Identificação Fiscal Angolano) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="nifTitular"
                    type="text"
                    value={nifTitular}
                    onChange={(e) => setNifTitular(e.target.value.toUpperCase())}
                    placeholder="Ex: 5000123456 ou 009150115UE044"
                    maxLength={14}
                    className="w-full border border-gray-300 rounded px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>

              {/* Localização em Angola */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="nacionalidade" className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Nacionalidade / País de Origem
                  </label>
                  <input
                    id="nacionalidade"
                    type="text"
                    value={nacionalidade}
                    onChange={(e) => setNacionalidade(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label htmlFor="provincia" className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Província
                  </label>
                  <select
                    id="provincia"
                    value={provincia}
                    onChange={(e) => setProvincia(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {PROVINCIAS_ANGOLA.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="municipio" className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Município
                  </label>
                  <input
                    id="municipio"
                    type="text"
                    value={municipio}
                    onChange={(e) => setMunicipio(e.target.value)}
                    placeholder="Ex: Belas, Cazenga, Viana..."
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Morada e Contactos */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="endereco" className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Morada / Sede Social Completa <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="endereco"
                    type="text"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    placeholder="Ex: Rua Rainha Ginga, n.º 124"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="telefone" className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Telefone de Contacto <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="telefone"
                    type="tel"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="+244 923 000 000"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-gray-700 mb-1.5">
                    E-mail para Notificações Oficiais
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Representação e Mandato (AOPI / Advogado) */}
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-md space-y-3">
                <span className="text-xs font-bold text-gray-800 uppercase tracking-wide block">
                  Regime de Representação perante o IAPI
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { val: 'PROPRIO', label: 'Próprio Requerente' },
                    { val: 'AOPI', label: 'Agente Oficial (AOPI)' },
                    { val: 'ADVOGADO', label: 'Advogado com Procuração' },
                  ].map((rep) => (
                    <label
                      key={rep.val}
                      className={`flex items-center gap-2 p-2.5 border rounded cursor-pointer text-xs ${
                        tipoRepresentante === rep.val
                          ? 'border-primary-500 bg-white font-semibold text-primary-900 ring-1 ring-primary-500'
                          : 'border-gray-200 bg-white text-gray-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="tipoRepresentante"
                        value={rep.val}
                        checked={tipoRepresentante === rep.val}
                        onChange={() => setTipoRepresentante(rep.val)}
                      />
                      <span>{rep.label}</span>
                    </label>
                  ))}
                </div>

                {tipoRepresentante !== 'PROPRIO' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Nome do Mandatário / Representante
                      </label>
                      <input
                        type="text"
                        value={nomeMandatario}
                        onChange={(e) => setNomeMandatario(e.target.value)}
                        placeholder="Nome do AOPI ou Advogado"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Cédula Profissional / Registo IAPI
                      </label>
                      <input
                        type="text"
                        value={cedulaMandatario}
                        onChange={(e) => setCedulaMandatario(e.target.value)}
                        placeholder="Ex: AOPI N.º 42 ou OAA N.º 1254"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================
              ETAPA 2: CARACTERIZAÇÃO DA MARCA
             ======================================================== */}
          {passoAtual === 2 && (
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-lg font-bold text-primary-900 font-serif flex items-center gap-2">
                  <ShieldCheck className="text-secondary-600" size={20} />
                  Etapa 2: Caracterização Oficial da Marca
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Defina a natureza, a forma de apresentação e os elementos distintivos do sinal segundo as normas do IAPI.
                </p>
              </div>

              {/* Natureza da Marca */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Natureza da Marca <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {NATUREZAS_MARCA.map((nat) => (
                    <div
                      key={nat.valor}
                      onClick={() => setNaturezaMarca(nat.valor)}
                      className={`p-3.5 border rounded cursor-pointer transition ${
                        naturezaMarca === nat.valor
                          ? 'border-primary-500 bg-primary-50/50 ring-1 ring-primary-500'
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-semibold text-sm text-primary-900">
                        <input
                          type="radio"
                          name="naturezaMarca"
                          value={nat.valor}
                          checked={naturezaMarca === nat.valor}
                          onChange={() => setNaturezaMarca(nat.valor)}
                        />
                        <span>{nat.rotulo}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 pl-5">{nat.descricao}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Forma de Apresentação */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Forma de Apresentação (Apresentação do Sinal) <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {APRESENTACOES_MARCA.map((apr) => (
                    <div
                      key={apr.valor}
                      onClick={() => setApresentacaoMarca(apr.valor)}
                      className={`p-3 border rounded cursor-pointer transition ${
                        apresentacaoMarca === apr.valor
                          ? 'border-primary-500 bg-primary-50/50 ring-1 ring-primary-500 font-semibold'
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-xs text-primary-900 font-bold">
                        <input
                          type="radio"
                          name="apresentacaoMarca"
                          value={apr.valor}
                          checked={apresentacaoMarca === apr.valor}
                          onChange={() => setApresentacaoMarca(apr.valor)}
                        />
                        <span>{apr.rotulo}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1 pl-5 leading-snug">{apr.descricao}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Denominação Verbal da Marca */}
              <div>
                <label htmlFor="denominacaoMarca" className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Denominação da Marca (Texto da Marca) {apresentacaoMarca !== 'FIGURATIVA' && <span className="text-red-500">*</span>}
                </label>
                <input
                  id="denominacaoMarca"
                  type="text"
                  value={denominacaoMarca}
                  onChange={(e) => setDenominacaoMarca(e.target.value)}
                  placeholder="Ex: KILAMBA, BFA NET, OURO NEGRO..."
                  className="w-full border border-gray-300 rounded px-4 py-2.5 text-base font-semibold text-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 tracking-wide"
                  required={apresentacaoMarca !== 'FIGURATIVA'}
                />
                <span className="text-[11px] text-gray-500 mt-1 block">
                  Elemento nominativo principal que será pesquisado nas buscas de anterioridade fonética do IAPI.
                </span>
              </div>

              {/* Upload e Pré-visualização do Logótipo */}
              {(apresentacaoMarca === 'MISTA' ||
                apresentacaoMarca === 'FIGURATIVA' ||
                apresentacaoMarca === 'TRIDIMENSIONAL') && (
                <div className="border border-dashed border-gray-300 p-5 rounded-lg bg-gray-50/50">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Reprodução Gráfica do Sinal / Logótipo Oficial <span className="text-red-500">*</span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="logotipoUpload"
                        className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-primary-400 bg-white p-6 rounded cursor-pointer transition text-center"
                      >
                        <Upload size={24} className="text-gray-400 mb-1.5" />
                        <span className="text-xs font-semibold text-primary-700">
                          Carregar ficheiro do logótipo
                        </span>
                        <span className="text-[11px] text-gray-400 mt-0.5">
                          Ficheiro JPEG, PNG ou SVG em alta resolução (máx. 10 MB)
                        </span>
                        <input
                          id="logotipoUpload"
                          type="file"
                          accept="image/*"
                          onChange={aoSelecionarLogotipo}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Preview Box */}
                    <div className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded min-h-[140px] text-center">
                      <span className="text-[10px] text-gray-400 uppercase font-semibold mb-2">Pré-visualização</span>
                      {logotipoPreview ? (
                        <div className="relative group">
                          <img
                            src={logotipoPreview}
                            alt="Logótipo da Marca"
                            className="max-h-24 max-w-full object-contain"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setLogotipoFicheiro(null);
                              setLogotipoPreview(null);
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-0.5 rounded-full shadow"
                            title="Remover imagem"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="text-gray-300 text-xs italic">Nenhum logótipo carregado</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Reivindicação de Cores */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-800">
                  <input
                    type="checkbox"
                    checked={reivindicaCores}
                    onChange={(e) => setReivindicaCores(e.target.checked)}
                    className="rounded text-primary-600 focus:ring-primary-500"
                  />
                  <span>Reivindicar protecção para cores específicas (Reivindicação de Cores)</span>
                </label>

                {reivindicaCores && (
                  <div className="pl-6">
                    <label htmlFor="coresReivindicadas" className="block text-xs text-gray-600 mb-1">
                      Indicação das cores exactas reivindicadas e a sua disposição:
                    </label>
                    <input
                      id="coresReivindicadas"
                      type="text"
                      value={coresReivindicadas}
                      onChange={(e) => setCoresReivindicadas(e.target.value)}
                      placeholder="Ex: Vermelho Pantone 485 C, Amarelo Ouro e Preto"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:ring-primary-500"
                    />
                  </div>
                )}
              </div>

              {/* Disclaimer / Renúncia de Exclusividade */}
              <div className="border-t border-gray-200 pt-4">
                <label htmlFor="disclaimer" className="block text-xs font-semibold text-gray-700 mb-1">
                  Renúncia de Exclusividade de Elementos Comuns (Disclaimer) <span className="text-gray-400 font-normal">(Opcional)</span>
                </label>
                <input
                  id="disclaimer"
                  type="text"
                  value={disclaimer}
                  onChange={(e) => setDisclaimer(e.target.value)}
                  placeholder="Ex: Não se reivindica o uso exclusivo dos termos 'Água de Mesa' ou 'Angola'"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:ring-primary-500"
                />
                <span className="text-[11px] text-gray-400 mt-1 block">
                  Indique palavras descritivas ou geográficas contidas no sinal sobre as quais não reivindica monopólio exclusivo.
                </span>
              </div>

              {/* Prioridade Unionista (CUP) */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-800">
                  <input
                    type="checkbox"
                    checked={reivindicaPrioridade}
                    onChange={(e) => setReivindicaPrioridade(e.target.checked)}
                    className="rounded text-primary-600 focus:ring-primary-500"
                  />
                  <span>
                    Reivindicar Direito de Prioridade Unionista (Convenção da União de Paris - CUP)
                    <span className="text-secondary-600 ml-1 font-mono">+15.000 Kz</span>
                  </span>
                </label>

                {reivindicaPrioridade && (
                  <div className="pl-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-gray-600 mb-1">País do 1.º Depósito</label>
                      <input
                        type="text"
                        value={paisPrioridade}
                        onChange={(e) => setPaisPrioridade(e.target.value)}
                        placeholder="Ex: Portugal, África do Sul, Brasil..."
                        className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-600 mb-1">Data do Depósito de Origem</label>
                      <input
                        type="date"
                        value={dataPrioridade}
                        onChange={(e) => setDataPrioridade(e.target.value)}
                        className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-600 mb-1">N.º do Processo Anterior</label>
                      <input
                        type="text"
                        value={numeroPrioridade}
                        onChange={(e) => setNumeroPrioridade(e.target.value)}
                        placeholder="Ex: PT654921"
                        className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Descrição Geral / Conceito do Sinal */}
              <div className="border-t border-gray-200 pt-4">
                <label htmlFor="descricaoGeral" className="block text-xs font-semibold text-gray-700 mb-1">
                  Memória Descritiva / Conceito da Marca <span className="text-gray-400 font-normal">(Opcional)</span>
                </label>
                <textarea
                  id="descricaoGeral"
                  rows={2}
                  value={descricaoGeral}
                  onChange={(e) => setDescricaoGeral(e.target.value)}
                  placeholder="Descreva o conceito da marca, significado de palavras de fantasia ou detalhes adicionais..."
                  className="w-full border border-gray-300 rounded p-2.5 text-xs text-gray-800 focus:ring-primary-500"
                />
              </div>
            </div>
          )}

          {/* ========================================================
              ETAPA 3: CLASSIFICAÇÃO DE NICE E ESPECIFICAÇÃO
             ======================================================== */}
          {passoAtual === 3 && (
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-bold text-primary-900 font-serif flex items-center gap-2">
                      <Layers className="text-secondary-600" size={20} />
                      Etapa 3: Classificação Internacional de Nice (NCL)
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                      Seleccione as classes oficiais de produtos ou serviços que a sua marca irá assinalar e especifique detalhadamente cada item.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-primary-100 text-primary-800 text-xs font-bold font-mono rounded">
                    {classesSelecionadas.length} classe(s) seleccionada(s)
                  </span>
                </div>
              </div>

              {/* Barra de Pesquisa e Filtro de Nice */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={buscaNice}
                    onChange={(e) => setBuscaNice(e.target.value)}
                    placeholder="Pesquisar por classe, produto ou serviço (ex: cerveja, café, hotel, roupa, software)..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded focus:ring-primary-500"
                  />
                </div>
                <div className="flex gap-1.5">
                  {[
                    { val: 'TODOS', label: 'Todas as Classes' },
                    { val: 'PRODUTO', label: 'Produtos (1-34)' },
                    { val: 'SERVICO', label: 'Serviços (35-45)' },
                  ].map((filtro) => (
                    <button
                      key={filtro.val}
                      type="button"
                      onClick={() => setFiltroTipoNice(filtro.val)}
                      className={`px-3 py-1.5 text-xs font-medium rounded border transition ${
                        filtroTipoNice === filtro.val
                          ? 'bg-primary-900 text-white border-primary-900'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {filtro.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lista Seleccionada em Destaque */}
              <div className="bg-primary-50/60 p-4 border border-primary-200 rounded-md">
                <span className="text-xs font-bold text-primary-900 uppercase tracking-wide block mb-2">
                  Classes Incluídas no Depósito:
                </span>
                <div className="flex flex-wrap gap-2">
                  {classesSelecionadas.map((num) => {
                    const obj = CLASSES_NICE.find((c) => c.classe === num);
                    return (
                      <span
                        key={num}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-primary-300 text-primary-900 text-xs font-semibold rounded shadow-sm"
                      >
                        <span className="font-mono text-secondary-600 font-bold">Cl. {num}</span>
                        <span>{obj?.titulo}</span>
                        {classesSelecionadas.length > 1 && (
                          <button
                            type="button"
                            onClick={() => alternarClasseNice(num)}
                            className="text-gray-400 hover:text-red-500 ml-1"
                            title="Remover classe"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Especificação dos Produtos/Serviços para cada classe seleccionada */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Especificação Detalhada por Classe (Obrigatório pelo IAPI)
                </h3>
                {classesSelecionadas.map((num) => {
                  const obj = CLASSES_NICE.find((c) => c.classe === num);
                  return (
                    <div key={num} className="border border-gray-200 p-4 rounded-md bg-white space-y-2">
                      <div className="flex items-center justify-between">
                        <strong className="text-xs text-primary-900 font-mono font-bold">
                          Classe {num} — {obj?.titulo} ({obj?.tipo})
                        </strong>
                        <span className="text-[11px] text-gray-400">
                          {num === classesSelecionadas[0] ? 'Classe Principal' : 'Classe Adicional (+10.000 Kz)'}
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        value={especificacoesPorClasse[num] || ''}
                        onChange={(e) => atualizarEspecificacaoClasse(num, e.target.value)}
                        placeholder={`Indique os produtos ou serviços exactos assinalados nesta classe (ex: ${obj?.exemplos})...`}
                        className="w-full border border-gray-300 rounded p-2.5 text-xs text-gray-800 focus:ring-primary-500 resize-none"
                        required
                      />
                      <span className="text-[10px] text-gray-400 block">
                        Nota: Seja preciso na designação dos produtos ou serviços para garantir a delimitação correcta da protecção.
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Catálogo de Classes para Adicionar */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Catálogo da Classificação de Nice (Clique para activar/desactivar classes)
                </h3>
                <div className="max-h-64 overflow-y-auto space-y-1.5 border border-gray-200 rounded p-2 bg-gray-50/50">
                  {classesFiltradas.map((c) => {
                    const selecionada = classesSelecionadas.includes(c.classe);
                    return (
                      <div
                        key={c.classe}
                        onClick={() => alternarClasseNice(c.classe)}
                        className={`p-2.5 rounded border text-xs cursor-pointer flex items-start justify-between gap-3 transition ${
                          selecionada
                            ? 'bg-primary-100/70 border-primary-500 font-medium'
                            : 'bg-white border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.2 bg-gray-200 text-gray-800 font-mono font-bold text-[10px] rounded">
                              {c.classe}
                            </span>
                            <strong className="text-gray-900">{c.titulo}</strong>
                            <span className="text-[10px] text-gray-400 uppercase">({c.tipo})</span>
                          </div>
                          <p className="text-[11px] text-gray-500 line-clamp-1">{c.descricao}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={selecionada}
                          onChange={() => {}}
                          className="mt-1"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              ETAPA 4: DOCUMENTOS E ANEXOS
             ======================================================== */}
          {passoAtual === 4 && (
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-lg font-bold text-primary-900 font-serif flex items-center gap-2">
                  <FileCheck className="text-secondary-600" size={20} />
                  Etapa 4: Documentação Legal Obrigatória do IAPI
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Junte os comprovativos e documentos exigidos pelo Regulamento do IAPI para instrução do processo.
                </p>
              </div>

              {/* Checklist Oficial de Documentos */}
              <div className="bg-amber-50/50 border border-amber-200 p-4 rounded-md space-y-2">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wide block">
                  Documentos Oficiais Requeridos pelo IAPI:
                </span>
                <ul className="text-xs text-amber-800 space-y-1.5 list-disc pl-4">
                  <li>
                    <strong>Exemplar / Logótipo da Marca:</strong>{' '}
                    {logotipoPreview ? (
                      <span className="text-green-700 font-semibold">✓ Carregado na Etapa 2</span>
                    ) : (
                      <span className="text-gray-500">Opcional para marcas puramente nominativas</span>
                    )}
                  </li>
                  <li>
                    <strong>Documento de Identificação:</strong> Cópia do Bilhete de Identidade (Pessoa Singular) ou Certidão Comercial / Diário da República (Pessoa Colectiva).
                  </li>
                  <li>
                    <strong>Cartão de NIF:</strong> Comprovativo do Número de Identificação Fiscal do titular.
                  </li>
                  {tipoRepresentante !== 'PROPRIO' && (
                    <li>
                      <strong>Procuração Forense / Mandato:</strong> Obrigatório para processos submetidos por Advogado ou Agente Oficial (AOPI).
                    </li>
                  )}
                  {(naturezaMarca === 'COLECTIVA' || naturezaMarca === 'CERTIFICACAO') && (
                    <li>
                      <strong>Regulamento de Utilização da Marca:</strong> Obrigatório para marcas colectivas ou de garantia/certificação.
                    </li>
                  )}
                </ul>
              </div>

              {/* Área de Upload de Anexos */}
              <div>
                <label
                  htmlFor="anexosMultiplos"
                  className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-primary-400 bg-gray-50 hover:bg-primary-50/30 p-8 rounded-lg cursor-pointer transition text-center"
                >
                  <Upload size={28} className="text-gray-400 mb-2" />
                  <span className="text-sm font-semibold text-primary-900">
                    Carregar documentos do processo
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    PDF, Word (DOC/DOCX) ou imagens (JPG/PNG) — máx. 10 MB cada
                  </span>
                  <input
                    id="anexosMultiplos"
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={aoSelecionarAnexos}
                    className="hidden"
                  />
                </label>

                {documentos.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <span className="text-xs font-semibold text-gray-700 block">
                      Ficheiros anexados ({documentos.length}):
                    </span>
                    <ul className="space-y-2">
                      {documentos.map((doc, idx) => (
                        <li
                          key={idx}
                          className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-200 rounded text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <IconeFicheiro size={16} className="text-primary-600 shrink-0" />
                            <span className="text-gray-800 font-medium truncate">{doc.name}</span>
                            <span className="text-gray-400 shrink-0 text-[11px]">
                              ({(doc.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removerAnexo(idx)}
                            className="text-gray-400 hover:text-red-500 p-1"
                          >
                            <X size={14} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================
              ETAPA 5: RESUMO, TAXAS E SUBMISSÃO
             ======================================================== */}
          {passoAtual === 5 && (
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-lg font-bold text-primary-900 font-serif flex items-center gap-2">
                  <CreditCard className="text-secondary-600" size={20} />
                  Etapa 5: Resumo do Dossier e Emolumentos Oficiais
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Confirme os dados antes de gerar a entrada no IAPI e a respectiva guia RUPE para liquidação.
                </p>
              </div>

              {/* Quadro Resumo do Processo */}
              <div className="bg-gray-50 border border-gray-200 rounded p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <span className="text-[11px] text-gray-400 uppercase block">Denominação</span>
                    <strong className="text-base text-primary-900 font-serif">{denominacaoMarca || 'Sinal Figurativo'}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-400 uppercase block">Apresentação</span>
                    <span className="text-xs font-semibold text-gray-800">{apresentacaoMarca}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-400 uppercase block">Natureza</span>
                    <span className="text-xs font-semibold text-gray-800">{naturezaMarca}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-gray-200">
                  <div>
                    <span className="text-[11px] text-gray-400 uppercase block">Titular</span>
                    <strong className="text-xs text-gray-800">{nomeTitular}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-400 uppercase block">NIF</span>
                    <span className="text-xs font-mono text-gray-800">{nifTitular}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-400 uppercase block">Localização</span>
                    <span className="text-xs text-gray-800">{municipio}, {provincia}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <span className="text-[11px] text-gray-400 uppercase block mb-1">Classes de Nice Requeridas</span>
                  <div className="flex flex-wrap gap-1.5">
                    {classesSelecionadas.map((num) => (
                      <span key={num} className="px-2 py-0.5 bg-primary-100 text-primary-900 font-mono text-xs font-bold rounded">
                        Classe {num}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tabela de Emolumentos Oficiais do IAPI */}
              <div className="border border-primary-200 rounded overflow-hidden">
                <div className="bg-primary-900 text-white px-4 py-2.5 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Discriminação das Taxas Oficiais (IAPI / MinFin)
                  </span>
                  <span className="text-xs font-mono text-secondary-400 font-bold">Guia RUPE</span>
                </div>
                <div className="p-4 space-y-2 text-xs divide-y divide-gray-100">
                  <div className="flex justify-between py-1">
                    <span>Taxa de Depósito de Marca (1.ª Classe de Nice)</span>
                    <span className="font-mono font-medium">25.000,00 Kz</span>
                  </div>
                  {taxasCalculadas.classesAdicionais > 0 && (
                    <div className="flex justify-between py-1 text-gray-700">
                      <span>Classes Suplementares ({classesSelecionadas.length - 1} × 10.000,00 Kz)</span>
                      <span className="font-mono font-medium">
                        {taxasCalculadas.classesAdicionais.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} Kz
                      </span>
                    </div>
                  )}
                  {taxasCalculadas.prioridade > 0 && (
                    <div className="flex justify-between py-1 text-gray-700">
                      <span>Taxa de Reivindicação de Prioridade Internacional (CUP)</span>
                      <span className="font-mono font-medium">15.000,00 Kz</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-3 text-sm font-bold text-primary-900">
                    <span>Total a Pagar por RUPE</span>
                    <span className="font-mono text-base text-secondary-600">
                      {taxasCalculadas.total.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} Kz
                    </span>
                  </div>
                </div>
              </div>

              {/* Declaração Legal de Honra */}
              <div className="bg-gray-50 p-4 border border-gray-200 rounded text-xs space-y-2 text-gray-600">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input type="checkbox" required defaultChecked className="mt-0.5 rounded text-primary-600" />
                  <span>
                    Declaro sob compromisso de honra que as informações prestadas são verdadeiras e que o sinal
                    ora requerido não infringe direitos de marcas notórias ou registos anteriores no Instituto
                    Angolano da Propriedade Industrial (IAPI), em cumprimento da Lei n.º 3/92.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Navegação entre Etapas */}
          <div className="flex items-center justify-between pt-8 border-t border-gray-200 mt-8">
            {passoAtual > 1 ? (
              <button
                type="button"
                onClick={passoAnterior}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-semibold rounded transition"
              >
                <ChevronLeft size={16} />
                Etapa Anterior
              </button>
            ) : (
              <Link
                to="/meus-pedidos"
                className="text-xs font-medium text-gray-500 hover:text-gray-700"
              >
                Cancelar
              </Link>
            )}

            {passoAtual < 5 ? (
              <button
                type="button"
                onClick={proximoPasso}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-primary-900 hover:bg-primary-800 text-white text-xs font-semibold rounded transition shadow-sm"
              >
                Próxima Etapa
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={aSubmeter}
                className="inline-flex items-center gap-2 px-8 py-3 bg-secondary-500 hover:bg-secondary-400 text-primary-950 font-bold text-sm rounded shadow-md transition disabled:opacity-50"
              >
                {aSubmeter ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    A Registar no IAPI…
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    Submeter Pedido de Registo no IAPI
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </main>

      {/* Modal da RUPE pós-submissão */}
      {pedidoCriado && (
        <ModalRupe
          pedido={pedidoCriado}
          onFechar={fecharModalRupe}
        />
      )}
    </div>
  );
}