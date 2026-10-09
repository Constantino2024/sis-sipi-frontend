import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Upload, File as IconeFicheiro, X } from 'lucide-react';
import CabecalhoPainel from '../../../components/privado/CabecalhoPainel';
import { obterPedidoPorId, atualizarPedido } from '../../../services/pedidosService';
import { podeEditarOuEliminar } from '../../../utilitarios/estadosPedido';

const TIPOS_PROPRIEDADE = [
  { valor: 'MARCA', rotulo: 'Marca' },
  { valor: 'PATENTE', rotulo: 'Patente' },
  { valor: 'DESENHO_INDUSTRIAL', rotulo: 'Desenho ou Modelo Industrial' },
  { valor: 'MODELO_UTILIDADE', rotulo: 'Modelo de Utilidade' },
  { valor: 'INSIGNIA', rotulo: 'Insígnia' },
  { valor: 'INDICACAO_PROVENIENCIA', rotulo: 'Indicação de Proveniência' },
];

const TIPOS_FICHEIRO_ACEITES = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
const TAMANHO_MAXIMO_BYTES = 10 * 1024 * 1024;

function formatarTamanho(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function EditarPedidoPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [aCarregar, setACarregar] = useState(true);
  const [naoEditavel, setNaoEditavel] = useState(false);

  const [tipoPropriedade, setTipoPropriedade] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [documentos, setDocumentos] = useState([]); // mistura: metadados existentes + novos File
  const [aSubmeter, setASubmeter] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    obterPedidoPorId(Number(id)).then((pedido) => {
      if (!podeEditarOuEliminar(pedido.estado)) {
        setNaoEditavel(true);
        setACarregar(false);
        return;
      }
      setTipoPropriedade(pedido.tipoPropriedade);
      setTitulo(pedido.titulo);
      setDescricao(pedido.descricao ?? '');
      setDocumentos(pedido.documentos ?? []);
      setACarregar(false);
    });
  }, [id]);

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

    setASubmeter(true);
    try {
      await atualizarPedido(Number(id), {
        tipoPropriedade,
        titulo: titulo.trim(),
        descricao: descricao.trim() || null,
        documentos,
      });
      navigate('/meus-pedidos', { state: { mensagem: 'Pedido atualizado com sucesso.' } });
    } catch (excecao) {
      setErro(excecao.message ?? 'Não foi possível guardar as alterações.');
    } finally {
      setASubmeter(false);
    }
  }

  if (aCarregar) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <CabecalhoPainel titulo="Editar Pedido" />
        <main className="flex-grow max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
          <div className="h-64 bg-white border border-gray-200 animate-pulse" style={{ borderRadius: '15px' }} />
        </main>
      </div>
    );
  }

  if (naoEditavel) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <CabecalhoPainel titulo="Editar Pedido" />
        <main className="flex-grow max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full text-center">
          <p className="text-sm text-gray-500 mb-4">
            Este pedido já não pode ser editado devido ao seu estado atual.
          </p>
          <Link to="/meus-pedidos" className="text-sm font-medium text-primary-500 hover:text-primary-600">
            Voltar aos meus pedidos
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <CabecalhoPainel titulo="Editar Pedido" />
      <main className="flex-grow max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <Link
          to="/meus-pedidos"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-500 mb-6"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Voltar aos meus pedidos
        </Link>

        <div className="bg-white border border-gray-200 p-6 sm:p-8" style={{ borderRadius: '15px' }}>
          <h1 className="text-lg font-semibold text-primary-900 mb-1">Editar Pedido</h1>
          <p className="text-sm text-gray-500 mb-6">Atualize os dados do seu pedido de propriedade industrial.</p>

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
                  <option key={tipo.valor} value={tipo.valor}>{tipo.rotulo}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1.5">
                Título do Pedido
              </label>
              <input
                id="titulo"
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
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
                className="w-full border border-gray-300 px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                style={{ borderRadius: '10px' }}
              />
            </div>

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
                <span className="text-sm text-gray-600">Clique para carregar ou arraste os ficheiros para aqui</span>
                <span className="text-xs text-gray-400">PDF, Word ou imagens — máx. 10 MB por ficheiro</span>
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
                  {documentos.map((doc, indice) => {
                    const nome = doc instanceof File ? doc.name : doc.nome;
                    const tamanho = doc instanceof File ? doc.size : doc.tamanhoBytes;
                    return (
                      <li
                        key={`${nome}-${indice}`}
                        className="flex items-center justify-between gap-3 bg-white border border-gray-200 px-3.5 py-2.5"
                        style={{ borderRadius: '10px' }}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <IconeFicheiro size={16} className="text-primary-500 shrink-0" aria-hidden="true" />
                          <span className="text-sm text-gray-700 truncate">{nome}</span>
                          <span className="text-xs text-gray-400 shrink-0">{formatarTamanho(tamanho)}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removerDocumento(indice)}
                          className="text-gray-400 hover:text-red-500 shrink-0"
                          aria-label={`Remover ${nome}`}
                        >
                          <X size={16} aria-hidden="true" />
                        </button>
                      </li>
                    );
                  })}
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
                {aSubmeter ? 'A guardar…' : 'Guardar Alterações'}
              </button>
              <Link to="/meus-pedidos" className="text-sm font-medium text-gray-500 hover:text-gray-700 px-3 py-2.5">
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}