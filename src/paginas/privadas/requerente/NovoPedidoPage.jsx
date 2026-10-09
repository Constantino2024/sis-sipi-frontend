import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Upload, File as IconeFicheiro, X, Loader2 } from 'lucide-react';
import CabecalhoPainel from '../../../components/privado/CabecalhoPainel';
import { criarPedido } from '../../../services/pedidosService';
import { uploadAnexo } from '../../../services/anexosService';
import { listarClassificacoes } from '../../../services/classificacoesService';
import { obterServicoDoTipo } from '../../../services/pagamentosService';
import { useAutenticacao } from '../../../contexto/AutenticacaoContexto';
import ModalRupe from '../../../components/pagamentos/ModalRupe';

// Tem de corresponder exatamente ao enum TipoPedido do backend
// (core/enums.py) — o backend rejeita (400) qualquer valor fora destes.
const TIPOS_PROPRIEDADE = [
  { valor: 'MARCA', rotulo: 'Marca' },
  { valor: 'PATENTE', rotulo: 'Patente' },
  { valor: 'DESENHO_INDUSTRIAL', rotulo: 'Desenho ou Modelo Industrial' },
  { valor: 'MODELO_UTILIDADE', rotulo: 'Modelo de Utilidade' },
];

const TIPOS_FICHEIRO_ACEITES = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
const TAMANHO_MAXIMO_BYTES = 10 * 1024 * 1024; // 10 MB por ficheiro

function formatarTamanho(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function NovoPedidoPage() {
  const { utilizador } = useAutenticacao();
  const navigate = useNavigate();

  const [tipoPropriedade, setTipoPropriedade] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [classificacao, setClassificacao] = useState('');
  const [documentos, setDocumentos] = useState([]);
  const [classificacoes, setClassificacoes] = useState([]);
  // Última resposta do serviço (nome + preço) pedido ao backend, com o tipo a
  // que pertence. O que se mostra é derivado dela (ver mais abaixo).
  const [respostaServico, setRespostaServico] = useState({ tipo: null, servico: null, erro: false });
  const [aSubmeter, setASubmeter] = useState(false);
  const [erro, setErro] = useState(null);
  // Pedido acabado de criar: enquanto existir, mostra-se o modal da RUPE.
  const [pedidoCriado, setPedidoCriado] = useState(null);

  // Verificar autenticação
  useEffect(() => {
    if (!utilizador) {
      navigate('/login');
    }
  }, [utilizador, navigate]);

  // Carregar classificações ao montar o componente
  useEffect(() => {
    async function carregarClassificacoes() {
      try {
        const dados = await listarClassificacoes();
        setClassificacoes(dados);
      } catch (error) {
        console.error('Erro ao carregar classificações:', error);
        setClassificacoes([]);
      }
    }
    carregarClassificacoes();
  }, []);

  // Ao escolher o tipo, vai buscar o serviço (e o preço) desse tipo de pedido.
  useEffect(() => {
    if (!tipoPropriedade) return undefined;

    // `cancelado` evita que a resposta de um tipo antigo apareça depois de
    // o utilizador já ter mudado para outro.
    let cancelado = false;
    obterServicoDoTipo(tipoPropriedade)
      .then((servico) => {
        if (!cancelado) setRespostaServico({ tipo: tipoPropriedade, servico, erro: false });
      })
      .catch((error) => {
        console.error('Erro ao obter o serviço de pagamento:', error);
        if (!cancelado) setRespostaServico({ tipo: tipoPropriedade, servico: null, erro: true });
      });
    return () => {
      cancelado = true;
    };
  }, [tipoPropriedade]);

  // Só vale a resposta que corresponde ao tipo escolhido neste momento.
  const respostaAtual = respostaServico.tipo === tipoPropriedade ? respostaServico : null;
  const servico = respostaAtual?.servico ?? null;
  const erroServico = Boolean(respostaAtual?.erro);
  const aCarregarServico = Boolean(tipoPropriedade) && !respostaAtual;

  function aoSelecionarFicheiros(evento) {
    const ficheirosSelecionados = Array.from(evento.target.files ?? []);
    evento.target.value = '';

    const ficheirosValidos = [];
    for (const ficheiro of ficheirosSelecionados) {
      if (ficheiro.size > TAMANHO_MAXIMO_BYTES) {
        setErro(`O ficheiro "${ficheiro.name}" excede o limite de 10 MB.`);
        continue;
      }
      ficheirosValidos.push(ficheiro);
    }

    if (ficheirosValidos.length > 0) {
      setErro(null);
      setDocumentos((atual) => [...atual, ...ficheirosValidos]);
    }
  }

  function removerDocumento(indice) {
    setDocumentos((atual) => atual.filter((_, i) => i !== indice));
  }

  async function aoSubmeter(evento) {
    evento.preventDefault();
    setErro(null);

    if (!tipoPropriedade || !titulo.trim()) {
      setErro('Preencha o tipo de propriedade e o título do pedido.');
      return;
    }

    // VERIFICAR SE UTILIZADOR ESTÁ AUTENTICADO
    if (!utilizador?.id) {
      setErro('Precisa de estar autenticado para submeter um pedido.');
      return;
    }

    setASubmeter(true);
    try {
      const novoPedido = await criarPedido({
        tipoPropriedade,
        titulo: titulo.trim(),
        descricao: descricao.trim() || null,
        requerenteId: utilizador.id,
        requerenteNome: utilizador.nome,
      });

      // Upload de documentos (se houver)
      if (documentos.length > 0) {
        for (const ficheiro of documentos) {
          await uploadAnexo(novoPedido.id, ficheiro, 'LOGOTIPO');
        }
      }

      // Em vez de sair da página, mostra a RUPE para pagamento da taxa.
      setPedidoCriado(novoPedido);
    } catch (excecao) {
      console.error('Erro ao submeter pedido:', excecao);
      
      if (excecao.response?.data) {
        const dadosErro = excecao.response.data;
        if (dadosErro.titulo) setErro(dadosErro.titulo[0]);
        else if (dadosErro.resumo) setErro(dadosErro.resumo[0]);
        else if (dadosErro.tipo) setErro(dadosErro.tipo[0]);
        else if (dadosErro.utilizador) setErro(dadosErro.utilizador[0]);
        else if (dadosErro.detail) setErro(dadosErro.detail);
        else setErro('Erro ao submeter pedido. Verifique os dados e tente novamente.');
      } else {
        setErro('Não foi possível submeter o pedido. Tente novamente.');
      }
    } finally {
      setASubmeter(false);
    }
  }

  function fecharModalRupe() {
    navigate('/meus-pedidos', {
      state: { mensagem: `Pedido ${pedidoCriado.numeroProcesso} submetido com sucesso.` },
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <CabecalhoPainel titulo="Novo Pedido" />
      <main className="flex-grow max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <Link
          to="/meus-pedidos"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-500 mb-6"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Voltar aos meus pedidos
        </Link>

        <div className="bg-white border border-gray-200 p-6 sm:p-8" style={{ borderRadius: '15px' }}>
          <h1 className="text-lg font-semibold text-primary-900 mb-1">Submeter Novo Pedido</h1>
          <p className="text-sm text-gray-500 mb-6">
            Preencha os dados abaixo para dar entrada de um novo pedido de propriedade industrial.
          </p>

          {erro && (
            <div className="bg-red-50 border border-red-300 text-red-700 text-sm px-4 py-3 mb-5" style={{ borderRadius: '10px' }}>
              {erro}
            </div>
          )}

          <form onSubmit={aoSubmeter} className="space-y-5">
            <div>
              <label htmlFor="tipoPropriedade" className="block text-sm font-medium text-gray-700 mb-1.5">
                Tipo de Propriedade Industrial
              </label>
              <select
                id="tipoPropriedade"
                value={tipoPropriedade}
                onChange={(e) => setTipoPropriedade(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                style={{ borderRadius: '10px' }}
                required
              >
                <option value="">Selecione o tipo…</option>
                {TIPOS_PROPRIEDADE.map((tipo) => (
                  <option key={tipo.valor} value={tipo.valor}>
                    {tipo.rotulo}
                  </option>
                ))}
              </select>
            </div>

            {aCarregarServico && (
              <div
                role="status"
                className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-600"
              >
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                A obter o valor da taxa…
              </div>
            )}

            {servico && (
              <div className="bg-primary-50 border border-primary-200 rounded-lg px-4 py-3">
                <p className="text-sm text-primary-700">
                  <span className="font-semibold">Taxa:</span> {servico.nome}
                </p>
                <p className="text-lg font-bold text-primary-900 mt-1">
                  {servico.valor.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} Kz
                </p>
              </div>
            )}

            {erroServico && (
              <p
                role="status"
                className="bg-amber-50 border border-amber-300 text-amber-700 text-sm px-4 py-3"
                style={{ borderRadius: '10px' }}
              >
                Não foi possível obter o valor da taxa agora. Pode submeter o pedido na mesma:
                o valor será mostrado na referência de pagamento.
              </p>
            )}

            <div>
              <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1.5">
                Título do Pedido
              </label>
              <input
                id="titulo"
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Padaria Bom Dia Luanda"
                className="w-full border border-gray-300 px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                style={{ borderRadius: '10px' }}
                required
              />
            </div>

            <div>
              <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1.5">
                Descrição <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <textarea
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={5}
                placeholder="Descreva o objeto do pedido…"
                className="w-full border border-gray-300 px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                style={{ borderRadius: '10px' }}
              />
            </div>

            {classificacoes.length > 0 && (
              <div>
                <label htmlFor="classificacao" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Classificação
                </label>
                <select
                  id="classificacao"
                  value={classificacao}
                  onChange={(e) => setClassificacao(e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  style={{ borderRadius: '10px' }}
                >
                  <option value="">Selecione a classificação…</option>
                  {classificacoes
                    .filter(c => 
                      (tipoPropriedade === 'MARCA' && c.tipo === 'NICE') ||
                      (tipoPropriedade === 'PATENTE' && c.tipo === 'IPC') ||
                      (tipoPropriedade === 'DESENHO_INDUSTRIAL' && c.tipo === 'LOCARNO')
                    )
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.tipo} - {c.codigo}: {c.descricao}
                      </option>
                    ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Documentos da Obra <span className="text-gray-400 font-normal">(opcional)</span>
              </label>

              <label
                htmlFor="documentos"
                className="flex flex-col items-center justify-center gap-2 border border-dashed border-gray-300 hover:border-primary-400 bg-gray-50 hover:bg-primary-50/40 px-4 py-8 text-center cursor-pointer transition"
                style={{ borderRadius: '10px' }}
              >
                <Upload size={22} className="text-gray-400" aria-hidden="true" />
                <span className="text-sm text-gray-600">
                  Clique para carregar ou arraste os ficheiros para aqui
                </span>
                <span className="text-xs text-gray-400">
                  PDF, Word ou imagens — máx. 10 MB por ficheiro
                </span>
                <input
                  id="documentos"
                  type="file"
                  multiple
                  accept={TIPOS_FICHEIRO_ACEITES}
                  onChange={aoSelecionarFicheiros}
                  className="hidden"
                />
              </label>

              {documentos.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {documentos.map((ficheiro, indice) => (
                    <li
                      key={`${ficheiro.name}-${indice}`}
                      className="flex items-center justify-between gap-3 bg-white border border-gray-200 px-3.5 py-2.5"
                      style={{ borderRadius: '10px' }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <IconeFicheiro size={16} className="text-primary-500 shrink-0" aria-hidden="true" />
                        <span className="text-sm text-gray-700 truncate">{ficheiro.name}</span>
                        <span className="text-xs text-gray-400 shrink-0">
                          {formatarTamanho(ficheiro.size)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removerDocumento(indice)}
                        className="text-gray-400 hover:text-red-500 shrink-0"
                        aria-label={`Remover ${ficheiro.name}`}
                      >
                        <X size={16} aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={aSubmeter}
                className="bg-primary-500 hover:bg-primary-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2.5 transition"
                style={{ borderRadius: '15px' }}
              >
                {aSubmeter ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    A submeter…
                  </>
                ) : (
                  'Submeter Pedido'
                )}
              </button>
              <Link
                to="/meus-pedidos"
                className="text-sm font-medium text-gray-500 hover:text-gray-700 px-3 py-2.5"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </main>

      {pedidoCriado && (
        <ModalRupe pedido={pedidoCriado} onFechar={fecharModalRupe} />
      )}
    </div>
  );
}