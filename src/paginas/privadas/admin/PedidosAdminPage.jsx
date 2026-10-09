// src/paginas/privadas/admin/PedidosAdminPage.jsx

import { useEffect, useMemo, useState } from 'react';
import { Search, Check, X as XIcon } from 'lucide-react';
import CabecalhoPainel from "../../../components/privado/CabecalhoPainel";
import { listarTodosPedidos, aceitarPedido, rejeitarPedido } from "../../../services/pedidosService";
import { obterInfoEstado, podeAceitarOuRejeitar } from "../../../utilitarios/estadosPedido";
import { useAutenticacao } from "../../../contexto/AutenticacaoContexto";
import BotaoExportarPdf from "../../../components/common/BotaoExportarPdf";
import { gerarRelatorioPedidosPdf } from "../../../utilitarios/relatorioPdf";
import { carregarLogoDataUrl } from "../../../utilitarios/relatorioLogo";

const OPCAO_TODOS = 'TODOS';

export default function PedidosAdminPage() {
  const { utilizador } = useAutenticacao();
  const [pedidos, setPedidos] = useState([]);
  const [aCarregar, setACarregar] = useState(true);
  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [filtroEstado, setFiltroEstado] = useState(OPCAO_TODOS);
  const [filtroTipo, setFiltroTipo] = useState(OPCAO_TODOS);

  // id do pedido cuja ação (aceitar/rejeitar) está em curso — desativa
  // os botões dessa linha para evitar duplo clique.
  const [idEmProcessamento, setIdEmProcessamento] = useState(null);
  const [erroAcao, setErroAcao] = useState('');

  // Pedido selecionado para rejeição — controla o modal do motivo.
  const [pedidoARejeitar, setPedidoARejeitar] = useState(null);
  const [motivoRejeicao, setMotivoRejeicao] = useState('');

  useEffect(() => {
    carregarPedidos();
  }, []);

  function carregarPedidos() {
    setACarregar(true);
    listarTodosPedidos().then((resultado) => {
      setPedidos(resultado);
      setACarregar(false);
    });
  }

  function atualizarPedidoNaLista(pedidoAtualizado) {
    setPedidos((atual) =>
      atual.map((p) => (p.id === pedidoAtualizado.id ? pedidoAtualizado : p))
    );
  }

  async function handleAceitar(pedido) {
    setErroAcao('');
    setIdEmProcessamento(pedido.id);
    try {
      const atualizado = await aceitarPedido(pedido.id);
      atualizarPedidoNaLista(atualizado);
    } catch (erro) {
      setErroAcao(erro.response?.data?.error || 'Não foi possível aceitar o pedido.');
    } finally {
      setIdEmProcessamento(null);
    }
  }

  function abrirModalRejeitar(pedido) {
    setErroAcao('');
    setMotivoRejeicao('');
    setPedidoARejeitar(pedido);
  }

  function fecharModalRejeitar() {
    setPedidoARejeitar(null);
    setMotivoRejeicao('');
  }

  async function confirmarRejeicao() {
    if (!pedidoARejeitar || !motivoRejeicao.trim()) return;
    setErroAcao('');
    setIdEmProcessamento(pedidoARejeitar.id);
    try {
      const atualizado = await rejeitarPedido(pedidoARejeitar.id, motivoRejeicao.trim());
      atualizarPedidoNaLista(atualizado);
      fecharModalRejeitar();
    } catch (erro) {
      setErroAcao(erro.response?.data?.error || 'Não foi possível rejeitar o pedido.');
    } finally {
      setIdEmProcessamento(null);
    }
  }

  const estadosDisponiveis = useMemo(
    () => [...new Set(pedidos.map((p) => p.estado))],
    [pedidos]
  );
  const tiposDisponiveis = useMemo(
    () => [...new Set(pedidos.map((p) => p.tipoPropriedade))],
    [pedidos]
  );

  const pedidosFiltrados = useMemo(() => {
    const termo = termoPesquisa.trim().toLowerCase();
    return pedidos.filter((p) => {
      const correspondeEstado = filtroEstado === OPCAO_TODOS || p.estado === filtroEstado;
      const correspondeTipo = filtroTipo === OPCAO_TODOS || p.tipoPropriedade === filtroTipo;
      const correspondeTermo =
        termo === '' ||
        p.numeroProcesso.toLowerCase().includes(termo) ||
        p.titulo.toLowerCase().includes(termo) ||
        p.requerenteNome.toLowerCase().includes(termo);
      return correspondeEstado && correspondeTipo && correspondeTermo;
    });
  }, [pedidos, termoPesquisa, filtroEstado, filtroTipo]);

  // O PDF reflecte exactamente o que está filtrado no ecrã.
  async function exportarPdf() {
    const filtros = [];
    if (filtroEstado !== OPCAO_TODOS) filtros.push(`Estado: ${obterInfoEstado(filtroEstado).rotulo}`);
    if (filtroTipo !== OPCAO_TODOS) filtros.push(`Modalidade: ${filtroTipo.replaceAll('_', ' ')}`);
    if (termoPesquisa.trim()) filtros.push(`Pesquisa: "${termoPesquisa.trim()}"`);

    await gerarRelatorioPedidosPdf({
      pedidos: pedidosFiltrados,
      titulo: 'Relatório de Pedidos',
      filtros: filtros.join('; ') || 'Nenhum (todos os processos)',
      geradoPor: utilizador?.nome,
      logoDataUrl: await carregarLogoDataUrl(),
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <CabecalhoPainel titulo="Gestão de Pedidos" />
      <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Barra de filtros */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              type="text"
              value={termoPesquisa}
              onChange={(evento) => setTermoPesquisa(evento.target.value)}
              placeholder="Pesquisar por processo, título ou requerente…"
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-300"
              style={{ borderRadius: '15px' }}
            />
          </div>
          <select
            value={filtroEstado}
            onChange={(evento) => setFiltroEstado(evento.target.value)}
            className="px-4 py-2.5 text-sm border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-300"
            style={{ borderRadius: '15px' }}
          >
            <option value={OPCAO_TODOS}>Todos os estados</option>
            {estadosDisponiveis.map((estado) => (
              <option key={estado} value={estado}>
                {obterInfoEstado(estado).rotulo}
              </option>
            ))}
          </select>
          <select
            value={filtroTipo}
            onChange={(evento) => setFiltroTipo(evento.target.value)}
            className="px-4 py-2.5 text-sm border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-300"
            style={{ borderRadius: '15px' }}
          >
            <option value={OPCAO_TODOS}>Todas as modalidades</option>
            {tiposDisponiveis.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo.replaceAll('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        {erroAcao && (
          <p role="alert" className="mb-4 text-sm text-danger border-l-2 border-danger pl-3 py-2 bg-red-50">
            {erroAcao}
          </p>
        )}

        {/* Tabela */}
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-primary-900">
              {pedidosFiltrados.length} processo{pedidosFiltrados.length !== 1 ? 's' : ''} encontrado{pedidosFiltrados.length !== 1 ? 's' : ''}
            </h2>
            <BotaoExportarPdf aoGerar={exportarPdf} desativado={aCarregar || pedidosFiltrados.length === 0} />
          </div>

          {aCarregar ? (
            <p className="px-5 py-8 text-sm text-gray-400 text-center">A carregar dados…</p>
          ) : pedidosFiltrados.length === 0 ? (
            <p className="px-5 py-8 text-sm text-gray-400 text-center">
              Nenhum processo corresponde aos filtros seleccionados.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-primary-500 text-left text-white">
                    <th className="py-3 px-5 font-medium">Processo</th>
                    <th className="py-3 px-4 font-medium">Título</th>
                    <th className="py-3 px-4 font-medium">Requerente</th>
                    <th className="py-3 px-4 font-medium">Tipo</th>
                    <th className="py-3 px-5 font-medium">Estado</th>
                    <th className="py-3 px-5 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidosFiltrados.map((p, indice) => {
                    const info = obterInfoEstado(p.estado);
                    const emProcessamento = idEmProcessamento === p.id;
                    const podeDecidir = podeAceitarOuRejeitar(p.estado);
                    return (
                      <tr
                        key={p.id}
                        className={`border-b border-gray-100 last:border-0 transition-colors hover:bg-gray-100 ${
                          indice % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <td className="py-3 px-5 font-medium text-primary-500">{p.numeroProcesso}</td>
                        <td className="py-3 px-4 text-gray-700">{p.titulo}</td>
                        <td className="py-3 px-4 text-gray-700">{p.requerenteNome}</td>
                        <td className="py-3 px-4 text-gray-700">{p.tipoPropriedade.replaceAll('_', ' ')}</td>
                        <td className="py-3 px-5">
                          <span className={`inline-block rounded-full border px-2.5 py-1 text-xs font-medium ${info.cor}`}>
                            {info.rotulo}
                          </span>
                        </td>
                        <td className="py-3 px-5">
                          {podeDecidir ? (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleAceitar(p)}
                                disabled={emProcessamento}
                                title="Aceitar pedido"
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-700 border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                              >
                                <Check size={14} aria-hidden="true" />
                                Aceitar
                              </button>
                              <button
                                type="button"
                                onClick={() => abrirModalRejeitar(p)}
                                disabled={emProcessamento}
                                title="Rejeitar pedido"
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 border border-red-300 bg-red-50 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                              >
                                <XIcon size={14} aria-hidden="true" />
                                Rejeitar
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal: motivo da rejeição */}
      {pedidoARejeitar && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="titulo-modal-rejeitar"
          onClick={fecharModalRejeitar}
        >
          <div
            className="bg-white w-full max-w-md p-6 relative"
            style={{ borderRadius: '15px' }}
            onClick={(evento) => evento.stopPropagation()}
          >
            <h2 id="titulo-modal-rejeitar" className="text-lg font-bold text-primary-900 mb-2">
              Rejeitar pedido {pedidoARejeitar.numeroProcesso}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Indique o motivo da rejeição. O requerente poderá consultar esta informação.
            </p>

            <label htmlFor="motivo-rejeicao" className="block text-sm font-medium text-gray-700 mb-1.5">
              Motivo <span className="text-danger">*</span>
            </label>
            <textarea
              id="motivo-rejeicao"
              value={motivoRejeicao}
              onChange={(evento) => setMotivoRejeicao(evento.target.value)}
              rows={4}
              autoFocus
              className="w-full border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 mb-2"
              placeholder="Ex.: Documentação incompleta, conflito com registo anterior…"
            />
            {erroAcao && (
              <p role="alert" className="text-sm text-danger mb-2">{erroAcao}</p>
            )}

            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={fecharModalRejeitar}
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 hover:border-gray-400 transition"
                style={{ borderRadius: '15px' }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarRejeicao}
                disabled={!motivoRejeicao.trim() || idEmProcessamento === pedidoARejeitar.id}
                className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
                style={{ borderRadius: '15px' }}
              >
                {idEmProcessamento === pedidoARejeitar.id ? 'A rejeitar…' : 'Confirmar rejeição'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
