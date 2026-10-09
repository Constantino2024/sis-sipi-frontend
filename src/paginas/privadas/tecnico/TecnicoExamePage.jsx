// src/paginas/privadas/tecnico/TecnicoExamePage.jsx

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Award,
  AlertCircle,
  CheckCircle2,
  Search,
  ArrowLeft,
} from 'lucide-react';
import CabecalhoPainel from '../../../components/privado/CabecalhoPainel';
import {
  obterPedidoPorId,
  registarParecer,
  deferirPedido,
  registarExigencia,
} from '../../../services/pedidosService';
import { obterInfoEstado, estaDecidido } from '../../../utilitarios/estadosPedido';
import { pesquisarRegistosPublicos } from '../../../services/consultaPublicaService';

const CRITERIOS_EXAME_MARCA = [
  {
    id: 'titularidade',
    rotulo: 'Titularidade e legitimidade do requerente (NIF activo na AGT e legitimidade jurídica)',
    artigo: 'Art. 25.º da Lei n.º 3/92',
  },
  {
    id: 'documentacao',
    rotulo: 'Instrução documental completa (BI/Certidão comercial, exemplar da marca e procuração se aplicável)',
    artigo: 'Regulamento IAPI',
  },
  {
    id: 'classificacao',
    rotulo: 'Classificação de Nice (Adequação das classes e especificação precisa dos produtos/serviços)',
    artigo: 'Acordo de Nice',
  },
  {
    id: 'distintividade',
    rotulo: 'Distintividade intrínseca (O sinal não é puramente descritivo, genérico ou de uso comum)',
    artigo: 'Art. 27.º da Lei n.º 3/92',
  },
  {
    id: 'liceidade',
    rotulo: 'Liceidade e ordem pública (Ausência de símbolos oficiais da República, ofensas ou sinais proibidos)',
    artigo: 'Art. 28.º da Lei n.º 3/92',
  },
  {
    id: 'anterioridade',
    rotulo: 'Inexistência de risco de confusão / Ausência de anterioridades colidentes no mercado angolano',
    artigo: 'Art. 30.º da Lei n.º 3/92',
  },
];

const CRITERIOS_EXAME_GENERICO = [
  { id: 'titularidade', rotulo: 'Titularidade e legitimidade do requerente', artigo: 'Lei n.º 3/92' },
  { id: 'documentacao', rotulo: 'Documentação obrigatória completa', artigo: 'Regulamento IAPI' },
  { id: 'classificacao', rotulo: 'Classificação correta (classe/categoria)', artigo: 'Classificação Oficial' },
  { id: 'anterioridade', rotulo: 'Ausência de conflito com registos anteriores', artigo: 'Pesquisa BPI' },
  { id: 'requisitos_formais', rotulo: 'Cumprimento dos requisitos formais', artigo: 'Formalidades' },
];

export default function TecnicoExamePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const pedidoId = Number(searchParams.get('pedido'));

  const [pedido, setPedido] = useState(null);
  const [aCarregar, setACarregar] = useState(Boolean(pedidoId));
  const [aGuardar, setAGuardar] = useState(false);
  const [checklist, setChecklist] = useState({});
  const [observacoes, setObservacoes] = useState('');
  const [erro, setErro] = useState('');

  // Busca de anterioridade em tempo real na tela do exame
  const [termoAnterioridade, setTermoAnterioridade] = useState('');
  const [resultadosAnterioridade, setResultadosAnterioridade] = useState([]);
  const [aBuscarAnterioridade, setABuscarAnterioridade] = useState(false);

  // Modal / Formulário de Exigência (notificação de irregularidade)
  const [mostrarFormExigencia, setMostrarFormExigencia] = useState(false);
  const [textoExigencia, setTextoExigencia] = useState('');
  const [prazoExigencia, setPrazoExigencia] = useState('30 dias');

  useEffect(() => {
    if (!pedidoId) return;
    let cancelado = false;
    async function carregar() {
      setACarregar(true);
      try {
        const resultado = await obterPedidoPorId(pedidoId);
        if (!cancelado) {
          setPedido(resultado);
          const criterios = resultado.tipoPropriedade === 'MARCA' ? CRITERIOS_EXAME_MARCA : CRITERIOS_EXAME_GENERICO;
          setChecklist(Object.fromEntries(criterios.map((c) => [c.id, false])));
          if (resultado.detalhesMarca?.denominacao) {
            setTermoAnterioridade(resultado.detalhesMarca.denominacao);
          }
        }
      } catch {
        if (!cancelado) setPedido(null);
      } finally {
        if (!cancelado) setACarregar(false);
      }
    }
    carregar();
    return () => {
      cancelado = true;
    };
  }, [pedidoId]);

  // Pesquisar anterioridades no IAPI
  async function executarBuscaAnterioridade(termo) {
    if (!termo?.trim()) return;
    setABuscarAnterioridade(true);
    try {
      const resp = await pesquisarRegistosPublicos({ termo: termo.trim() });
      // Excluir o próprio processo dos resultados
      setResultadosAnterioridade(
        resp.resultados.filter((r) => r.numero !== pedido?.numeroProcesso)
      );
    } catch (err) {
      console.error('Erro na pesquisa de anterioridade:', err);
    } finally {
      setABuscarAnterioridade(false);
    }
  }

  const criterios = pedido?.tipoPropriedade === 'MARCA' ? CRITERIOS_EXAME_MARCA : CRITERIOS_EXAME_GENERICO;
  const todosVerificados = criterios.every((c) => checklist[c.id]);
  const jaTemParecer = pedido?.estado === 'PARECER_FAVORAVEL' || pedido?.estado === 'PARECER_DESFAVORAVEL';
  const decidido = pedido ? estaDecidido(pedido.estado) : false;

  const toggleCriterio = (id) =>
    setChecklist((prev) => ({ ...prev, [id]: !prev[id] }));

  async function executar(acao) {
    setAGuardar(true);
    setErro('');
    try {
      await acao();
      navigate('/tecnico/processos');
    } catch (excecao) {
      setErro(excecao.response?.data?.error || excecao.message || 'Não foi possível concluir a operação.');
      setAGuardar(false);
    }
  }

  function concluirExame(decisao) {
    if (!pedido) return;
    const obsComFundamento = observacoes.trim() ||
      (decisao === 'FAVORAVEL'
        ? 'Processo examinado nos termos da Lei n.º 3/92 da Propriedade Industrial. Cumpre com todos os preceitos legais e regulamentares.'
        : 'Processo não atende aos requisitos de concessão nos termos da Lei n.º 3/92.');
    return executar(() => registarParecer(pedido.id, { criterios: checklist, decisao, observacoes: obsComFundamento }));
  }

  function confirmarDecisaoFinal() {
    if (!pedido) return;
    return executar(() => deferirPedido(pedido.id));
  }

  async function submeterExigencia(e) {
    e.preventDefault();
    if (!textoExigencia.trim()) return;
    setAGuardar(true);
    try {
      await registarExigencia(pedido.id, {
        descricao: textoExigencia.trim(),
        prazo: prazoExigencia,
      });
      navigate('/tecnico/processos');
    } catch (err) {
      setErro(err.message || 'Erro ao emitir notificação de exigência.');
      setAGuardar(false);
    }
  }

  if (!pedidoId) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
        <CabecalhoPainel titulo="Exame de Processos — IAPI" />
        <main className="flex-grow max-w-4xl mx-auto px-4 py-12 w-full">
          <div className="bg-white border border-gray-200 p-8 rounded-lg text-center shadow-sm">
            <ShieldCheck size={36} className="mx-auto text-primary-400 mb-3" />
            <h2 className="text-lg font-bold text-gray-800">Nenhum processo selecionado para exame</h2>
            <p className="text-sm text-gray-500 mt-1 mb-6">
              Aceda à lista de processos do IAPI para selecionar um pedido de marca para exame técnico.
            </p>
            <Link
              to="/tecnico/processos"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-900 text-white text-xs font-semibold rounded hover:bg-primary-800 transition"
            >
              Ir para Meus Processos
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (aCarregar) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
        <CabecalhoPainel titulo="Exame de Processo — IAPI" />
        <main className="flex-grow max-w-4xl mx-auto px-4 py-12 w-full text-center">
          <p className="text-sm text-gray-500">A carregar os autos do processo...</p>
        </main>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
        <CabecalhoPainel titulo="Exame de Processo — IAPI" />
        <main className="flex-grow max-w-4xl mx-auto px-4 py-12 w-full">
          <p className="text-gray-500 text-center">Processo não encontrado no sistema do IAPI.</p>
        </main>
      </div>
    );
  }

  const infoEstado = obterInfoEstado(pedido.estado);
  const detalhes = pedido.detalhesMarca || {};
  const titular = pedido.titular || {};
  const classesNice = pedido.classesNice || [];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <CabecalhoPainel titulo="Exame Técnico do Processo — IAPI" />

      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Navegação de regresso */}
        <Link
          to="/tecnico/processos"
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary-600 mb-4 transition"
        >
          <ArrowLeft size={14} />
          Voltar à Lista de Processos
        </Link>

        {/* Cabeçalho do Processo IAPI */}
        <div className="bg-primary-900 text-white p-6 rounded-lg shadow-sm border border-primary-950 mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-[11px] uppercase tracking-widest text-secondary-400 font-bold">
                Dossier de Marca · IAPI
              </span>
              <span className={`px-2 py-0.5 text-xs font-semibold border ${infoEstado.cor}`}>
                {infoEstado.rotulo}
              </span>
              {pedido.pago && (
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-900/60 text-emerald-300 border border-emerald-500/40">
                  Taxa Liquidada (RUPE)
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold font-serif">{pedido.titulo}</h1>
            <p className="text-xs text-primary-200 mt-1 font-mono">
              Processo N.º {pedido.numeroProcesso} · Depósito: {new Date(pedido.dataSubmissao).toLocaleDateString('pt-PT')}
            </p>
          </div>

          <div className="bg-primary-800/80 border border-primary-700/60 p-3 rounded text-right shrink-0">
            <span className="text-[11px] text-primary-300 block">Tipo de Propriedade</span>
            <strong className="text-sm font-semibold text-white uppercase">{pedido.tipoPropriedade}</strong>
            {detalhes.apresentacao && (
              <span className="text-[11px] text-secondary-400 block mt-0.5">
                {detalhes.apresentacao} ({detalhes.natureza || 'Produto'})
              </span>
            )}
          </div>
        </div>

        {erro && (
          <div role="alert" className="mb-6 p-4 bg-red-50 text-red-700 text-sm border-l-4 border-red-500 rounded">
            {erro}
          </div>
        )}

        {/* Ficha Técnica da Marca (quando for MARCA) */}
        {pedido.tipoPropriedade === 'MARCA' && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h2 className="text-base font-bold text-primary-900 font-serif flex items-center gap-2">
                <ShieldCheck className="text-secondary-600" size={18} />
                Caracterização Oficial do Sinal Distintivo (IAPI)
              </h2>
              <span className="text-xs text-gray-500 font-mono">
                {classesNice.length} Classe(s) de Nice
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {/* Imagem / Logótipo da Marca */}
              <div className="border border-gray-200 p-4 rounded-md bg-gray-50 flex flex-col items-center justify-center text-center">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Reprodução Gráfica do Sinal
                </span>
                {detalhes.logotipoUrl ? (
                  <img
                    src={detalhes.logotipoUrl}
                    alt={detalhes.denominacao || pedido.titulo}
                    className="max-h-36 max-w-full object-contain border border-gray-200 p-1 bg-white shadow-sm"
                  />
                ) : (
                  <div className="h-32 w-full flex items-center justify-center bg-white border border-dashed border-gray-300 text-gray-400 text-xs italic px-3">
                    {detalhes.denominacao
                      ? `Marca Nominativa pura: "${detalhes.denominacao}"`
                      : 'Sem reprodução figurativa anexada'}
                  </div>
                )}
                <span className="text-[11px] text-gray-600 mt-2 font-medium">
                  Forma: {detalhes.apresentacao || 'Mista'}
                </span>
              </div>

              {/* Elementos Nominativos e Reivindicações */}
              <div className="md:col-span-2 space-y-3 text-xs">
                <div>
                  <span className="text-gray-400 uppercase tracking-wider block text-[10px]">Denominação Verbal</span>
                  <strong className="text-sm text-primary-900 font-bold">{detalhes.denominacao || pedido.titulo}</strong>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-gray-400 uppercase tracking-wider block text-[10px]">Natureza da Marca</span>
                    <span className="text-gray-800 font-medium">{detalhes.natureza || 'Produto'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 uppercase tracking-wider block text-[10px]">Reivindicação de Cores</span>
                    <span className="text-gray-800 font-medium">
                      {detalhes.reivindicaCores ? detalhes.coresReivindicadas || 'Sim (Cores declaradas)' : 'Sem reivindicação de cor'}
                    </span>
                  </div>
                </div>

                {detalhes.elementosDesconsiderados && (
                  <div className="pt-1">
                    <span className="text-gray-400 uppercase tracking-wider block text-[10px]">
                      Renúncia de Exclusividade (Disclaimer)
                    </span>
                    <p className="text-amber-800 bg-amber-50 p-2 rounded border border-amber-200 text-[11px]">
                      {detalhes.elementosDesconsiderados}
                    </p>
                  </div>
                )}

                {/* Titular e Representante */}
                <div className="border-t border-gray-200 pt-3 grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-gray-400 uppercase tracking-wider block text-[10px]">Titular do Pedido</span>
                    <strong className="text-gray-900 font-medium block">{titular.nomeOuFirma || pedido.requerenteNome}</strong>
                    <span className="text-gray-500 font-mono text-[11px]">NIF: {titular.nif || 'Não informado'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 uppercase tracking-wider block text-[10px]">Representação / AOPI</span>
                    <span className="text-gray-800 block">
                      {titular.representanteTipo === 'AOPI'
                        ? `Agente Oficial: ${titular.representanteNome || 'Sim'} (${titular.representanteCedula || ''})`
                        : titular.representanteTipo === 'ADVOGADO'
                        ? `Advogado: ${titular.representanteNome || 'Sim'}`
                        : 'Próprio Requerente'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Classes de Nice e Especificação */}
            <div className="border-t border-gray-200 pt-4">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
                Classes Internacionais de Nice & Especificação dos Produtos/Serviços:
              </span>
              <div className="space-y-2">
                {classesNice.map((cl, i) => (
                  <div key={i} className="p-3 bg-gray-50 border border-gray-200 rounded text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-primary-900 font-mono font-bold">
                        Classe {cl.classe} — {cl.titulo}
                      </strong>
                      <span className="px-1.5 py-0.5 bg-gray-200 text-gray-700 text-[10px] rounded font-semibold uppercase">
                        {cl.tipo}
                      </span>
                    </div>
                    <p className="text-gray-700 text-[11px] leading-relaxed">
                      {cl.especificacao || 'Especificação em conformidade com o catálogo oficial.'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Ferramenta de Pesquisa de Anterioridade Integrada */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
            <h2 className="text-sm font-bold text-primary-900 font-serif flex items-center gap-2">
              <Search className="text-secondary-600" size={16} />
              Pesquisa de Anterioridade e Colidência no IAPI (BPI)
            </h2>
            <span className="text-xs text-gray-400">Verificação de marcas pré-existentes</span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={termoAnterioridade}
              onChange={(e) => setTermoAnterioridade(e.target.value)}
              placeholder="Pesquisar por radical da marca ou nome..."
              className="flex-1 border border-gray-300 rounded px-3 py-2 text-xs focus:ring-primary-500"
            />
            <button
              type="button"
              onClick={() => executarBuscaAnterioridade(termoAnterioridade)}
              disabled={aBuscarAnterioridade}
              className="px-4 py-2 bg-primary-900 hover:bg-primary-800 text-white text-xs font-semibold rounded flex items-center gap-1.5 transition"
            >
              <Search size={14} />
              {aBuscarAnterioridade ? 'A pesquisar...' : 'Verificar Colidências'}
            </button>
          </div>

          {resultadosAnterioridade.length > 0 && (
            <div className="mt-4 border border-amber-200 bg-amber-50/40 rounded p-3">
              <span className="text-[11px] font-bold text-amber-900 block mb-2">
                Registos potencialmente colidentes encontrados no IAPI ({resultadosAnterioridade.length}):
              </span>
              <ul className="space-y-1.5 text-xs text-gray-700">
                {resultadosAnterioridade.map((r, i) => (
                  <li key={i} className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                    <div>
                      <strong className="text-primary-900">{r.designacao}</strong> ({r.numero})
                      <span className="text-gray-500 text-[11px] ml-2">Titular: {r.titular}</span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">
                      {r.estadoDisplay}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Secção de Decisão e Exame */}
        {decidido ? (
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm text-center">
            <CheckCircle2 size={36} className="mx-auto text-emerald-600 mb-2" />
            <h2 className="text-base font-bold text-gray-900">Processo já decidido pelo IAPI</h2>
            <p className="text-xs text-gray-500 mt-1">
              Este processo atingiu a decisão definitiva de <strong>{infoEstado.rotulo}</strong> e já não admite novo exame substantivo.
            </p>
          </div>
        ) : jaTemParecer ? (
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
              <Award className="text-primary-600" size={20} />
              <h2 className="text-base font-bold text-primary-900 font-serif">
                Parecer Técnico Emitido — Confirmação do Despacho do Director Geral
              </h2>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded space-y-2 text-xs">
              <p>
                <strong>Sentido do Parecer Técnico:</strong>{' '}
                <span className={pedido.parecer?.decisao === 'FAVORAVEL' ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                  {pedido.parecer?.decisao === 'FAVORAVEL' ? 'FAVORÁVEL À CONCESSÃO' : 'DESFAVORÁVEL (RECUSA)'}
                </span>
              </p>
              {pedido.parecer?.observacoes && (
                <p className="text-gray-600">
                  <strong>Fundamentação:</strong> {pedido.parecer.observacoes}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={confirmarDecisaoFinal}
                disabled={aGuardar}
                className={`px-6 py-2.5 text-white text-xs font-bold rounded shadow transition disabled:opacity-50 ${
                  pedido.estado === 'PARECER_FAVORAVEL'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {aGuardar
                  ? 'A processar despacho...'
                  : pedido.estado === 'PARECER_FAVORAVEL'
                  ? 'Confirmar Despacho de Concessão de Registo (IAPI)'
                  : 'Confirmar Indeferimento Definitivo'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-6">
            <div className="border-b border-gray-200 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-primary-900 font-serif">
                  Critérios Oficiais de Exame de Mérito (Lei n.º 3/92)
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Assinale a conformidade de cada requisito legal para habilitar a emissão do parecer.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMostrarFormExigencia(!mostrarFormExigencia)}
                className="text-xs font-semibold text-amber-700 hover:text-amber-900 border border-amber-300 bg-amber-50 px-3 py-1.5 rounded transition"
              >
                {mostrarFormExigencia ? 'Ocultar Exigência' : 'Emitir Notificação de Exigência'}
              </button>
            </div>

            {/* Painel de Emissão de Exigência (se houver vício sanável) */}
            {mostrarFormExigencia && (
              <form onSubmit={submeterExigencia} className="p-4 bg-amber-50/70 border border-amber-300 rounded space-y-3">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <AlertCircle size={16} />
                  <span>Notificação Oficial de Exigência (Prazo Legal para Sanar Irregularidade)</span>
                </div>
                <textarea
                  rows={3}
                  value={textoExigencia}
                  onChange={(e) => setTextoExigencia(e.target.value)}
                  placeholder="Descreva a irregularidade documental ou vício a ser sanado pelo requerente (ex: juntar procuração com poderes especiais, emendar especificação de produtos na classe 32)..."
                  className="w-full border border-amber-300 rounded p-2.5 text-xs text-gray-800 bg-white"
                  required
                />
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-600">Prazo legal:</span>
                    <select
                      value={prazoExigencia}
                      onChange={(e) => setPrazoExigencia(e.target.value)}
                      className="border border-gray-300 rounded p-1 text-xs"
                    >
                      <option value="30 dias">30 dias úteis</option>
                      <option value="60 dias">60 dias úteis</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={aGuardar}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded transition"
                  >
                    Enviar Notificação ao Requerente
                  </button>
                </div>
              </form>
            )}

            {/* Checklist de Exame */}
            <div className="space-y-3">
              {criterios.map((c) => (
                <label
                  key={c.id}
                  className={`flex items-start gap-3 p-3 rounded border text-xs cursor-pointer transition ${
                    checklist[c.id]
                      ? 'bg-primary-50/60 border-primary-400 font-medium'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checklist[c.id] || false}
                    onChange={() => toggleCriterio(c.id)}
                    className="mt-0.5 rounded text-primary-600"
                  />
                  <div className="flex-1">
                    <span className="text-gray-900">{c.rotulo}</span>
                    <span className="text-[10px] text-gray-400 block font-mono mt-0.5">Fundamento: {c.artigo}</span>
                  </div>
                </label>
              ))}
            </div>

            {/* Fundamentação do Parecer */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Fundamentação Técnica e Jurídica do Parecer
              </label>
              <textarea
                rows={4}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Ex: O sinal 'CUANZA PREPA' foi analisado à luz dos arts. 25.º a 34.º da Lei n.º 3/92. O elemento nominativo possui suficiente capacidade distintiva e não colide com registos anteriores na Classe 32. Propõe-se a CONCESSÃO do registo de marca..."
                className="w-full border border-gray-300 rounded p-3 text-xs text-gray-800 focus:ring-primary-500"
              />
            </div>

            {/* Botões de Ação para Concluir */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => concluirExame('FAVORAVEL')}
                disabled={!todosVerificados || aGuardar}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded shadow transition"
              >
                Emitir Parecer Técnico Favorável (Concessão)
              </button>
              <button
                type="button"
                onClick={() => concluirExame('DESFAVORAVEL')}
                disabled={!todosVerificados || aGuardar}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded shadow transition"
              >
                Emitir Parecer Desfavorável (Indeferimento)
              </button>
              {!todosVerificados && (
                <span className="text-xs text-gray-400">
                  Confirme todos os critérios legais para habilitar a emissão do parecer.
                </span>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}