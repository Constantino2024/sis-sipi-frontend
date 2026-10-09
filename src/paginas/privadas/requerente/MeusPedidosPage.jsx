// src/paginas/privadas/requerente/MeusPedidosPage.jsx

import { useEffect, useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus, Pencil, Trash2, X, FileText, Clock, Receipt, Award, Eye, RefreshCw, AlertTriangle } from 'lucide-react';
import CabecalhoPainel from "../../../components/privado/CabecalhoPainel";
import { listarPedidosDoRequerente, removerPedido, obterHistorico } from "../../../services/pedidosService";
import { obterServicoDoTipo } from "../../../services/pagamentosService";
import { extrairMensagemErro } from "../../../services/api";
import { obterInfoEstado, podeEditarOuEliminar, podePagar } from "../../../utilitarios/estadosPedido";
import { useAutenticacao } from "../../../contexto/AutenticacaoContexto";
import ModalRupe from "../../../components/pagamentos/ModalRupe";
import ModalDetalhesPedidoIapi from "../../../components/pedidos/ModalDetalhesPedidoIapi";
import CertificadoMarcaModal from "../../../components/pedidos/CertificadoMarcaModal";
import BotaoExportarPdf from "../../../components/common/BotaoExportarPdf";
import { gerarRelatorioPedidosPdf } from "../../../utilitarios/relatorioPdf";
import { carregarLogoDataUrl } from "../../../utilitarios/relatorioLogo";

export default function MeusPedidosPage() {
  const { utilizador } = useAutenticacao();
  const location = useLocation();
  const [pedidos, setPedidos] = useState([]);
  const [aCarregar, setACarregar] = useState(true);
  const [mensagemSucesso, setMensagemSucesso] = useState(location.state?.mensagem ?? null);
  // Serviço (com preço) por tipo de pedido, vindo da API de pagamento.
  const [servicos, setServicos] = useState({});
  const [historicoAberto, setHistoricoAberto] = useState(null);
  const [historico, setHistorico] = useState([]);

  const [pedidoParaPagar, setPedidoParaPagar] = useState(null);
  const [pedidoDossier, setPedidoDossier] = useState(null);
  const [certificadoParaVer, setCertificadoParaVer] = useState(null);

  const [pedidoParaEliminar, setPedidoParaEliminar] = useState(null);
  const [aEliminar, setAEliminar] = useState(false);
  const [erroEliminar, setErroEliminar] = useState(null);

  const [erroCarregamento, setErroCarregamento] = useState(null);

  const carregarPrecos = useCallback((lista) => {
    const tipos = [...new Set(lista.map((p) => p.tipoPropriedade))];
    Promise.all(
      tipos.map((tipo) =>
        obterServicoDoTipo(tipo)
          .then((servico) => [tipo, servico])
          .catch((erro) => {
            console.error(`Erro ao obter a taxa de ${tipo}:`, erro);
            return null;
          })
      )
    ).then((pares) => setServicos(Object.fromEntries(pares.filter(Boolean))));
  }, []);

  const carregarPedidos = useCallback(() => {
    if (!utilizador?.id) return;
    setACarregar(true);
    setErroCarregamento(null);
    listarPedidosDoRequerente(utilizador.id)
      .then((resultado) => {
        setPedidos(resultado);
        setACarregar(false);
        carregarPrecos(resultado);
      })
      .catch((erro) => {
        console.error('Erro ao carregar pedidos do back-end:', erro);
        setErroCarregamento(extrairMensagemErro(erro, 'Não foi possível comunicar com o servidor back-end.'));
        setACarregar(false);
      });
  }, [utilizador, carregarPrecos]);

  useEffect(() => {
    if (!utilizador?.id) return;
    let cancelado = false;
    listarPedidosDoRequerente(utilizador.id)
      .then((resultado) => {
        if (cancelado) return;
        setPedidos(resultado);
        setACarregar(false);
        carregarPrecos(resultado);
      })
      .catch((erro) => {
        if (cancelado) return;
        console.error('Erro ao carregar pedidos do back-end:', erro);
        setErroCarregamento(extrairMensagemErro(erro, 'Não foi possível comunicar com o servidor back-end.'));
        setACarregar(false);
      });
    return () => {
      cancelado = true;
    };
  }, [utilizador?.id, carregarPrecos]);

  function obterTaxaDoPedido(pedido) {
    return servicos[pedido.tipoPropriedade]?.valor ?? null;
  }

  async function exportarPdf() {
    await gerarRelatorioPedidosPdf({
      pedidos,
      titulo: 'Os Meus Processos',
      geradoPor: utilizador?.nome,
      incluirResumo: false,
      incluirRequerente: false,
      logoDataUrl: await carregarLogoDataUrl(),
      nomeFicheiro: `meus-processos-${new Date().toISOString().slice(0, 10)}.pdf`,
    });
  }

  function pedirConfirmacaoEliminar(pedido) {
    setErroEliminar(null);
    setPedidoParaEliminar(pedido);
  }

  async function confirmarEliminar() {
    if (!pedidoParaEliminar) return;
    setAEliminar(true);
    setErroEliminar(null);
    try {
      await removerPedido(pedidoParaEliminar.id);
      setPedidos((atual) => atual.filter((p) => p.id !== pedidoParaEliminar.id));
      setPedidoParaEliminar(null);
    } catch (excecao) {
      setErroEliminar(excecao.response?.data?.error || excecao.message || 'Não foi possível eliminar o pedido.');
    } finally {
      setAEliminar(false);
    }
  }

  async function verHistorico(pedidoId) {
    try {
      const dados = await obterHistorico(pedidoId);
      setHistorico(dados);
      setHistoricoAberto(pedidoId);
    } catch (erro) {
      console.error('Erro ao obter histórico:', erro);
    }
  }

  function fecharHistorico() {
    setHistoricoAberto(null);
    setHistorico([]);
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <CabecalhoPainel titulo="Meus Pedidos" />
      <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {mensagemSucesso && (
          <div
            className="flex items-center justify-between gap-3 bg-green-50 border border-green-300 text-green-700 text-sm px-4 py-3 mb-6"
            style={{ borderRadius: '10px' }}
          >
            <span>{mensagemSucesso}</span>
            <button type="button" onClick={() => setMensagemSucesso(null)} className="text-green-600 hover:text-green-800">
              <X size={15} aria-hidden="true" />
            </button>
          </div>
        )}

        {erroCarregamento && (
          <div
            className="flex items-center justify-between gap-3 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 mb-6"
            style={{ borderRadius: '10px' }}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} />
              <span>{erroCarregamento}</span>
            </div>
            <button
              type="button"
              onClick={carregarPedidos}
              className="text-xs font-semibold underline hover:text-red-900"
            >
              Tentar novamente
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">
            Consulte aqui o estado dos processos que submeteu ao SIPI.
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={carregarPedidos}
              disabled={aCarregar}
              title="Recarregar do back-end"
              className="p-2 border border-gray-200 bg-white hover:bg-gray-100 text-gray-600 transition"
              style={{ borderRadius: '10px' }}
            >
              <RefreshCw size={15} className={aCarregar ? 'animate-spin' : ''} />
            </button>
            <BotaoExportarPdf aoGerar={exportarPdf} desativado={aCarregar || pedidos.length === 0} />
            <Link
              to="/meus-pedidos/novo"
              className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium px-4 py-2.5 transition"
              style={{ borderRadius: '15px' }}
            >
              <Plus size={16} aria-hidden="true" />
              Novo Pedido
            </Link>
          </div>
        </div>

        {aCarregar ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 rounded-lg bg-white border border-gray-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-primary-900">Os Meus Processos</h2>
            </div>

            {pedidos.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <p className="text-sm text-gray-400 mb-4">
                  Ainda não submeteu nenhum pedido ao sistema.
                </p>
                <Link
                  to="/meus-pedidos/novo"
                  className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium px-4 py-2.5 transition"
                  style={{ borderRadius: '15px' }}
                >
                  <Plus size={16} aria-hidden="true" />
                  Submeter o Meu Primeiro Pedido
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr className="text-left text-gray-600 text-xs font-semibold uppercase tracking-wider">
                      <th className="py-3 px-5 font-semibold">Processo</th>
                      <th className="py-3 px-4 font-semibold">Título</th>
                      <th className="py-3 px-4 font-semibold">Tipo</th>
                      <th className="py-3 px-4 font-semibold">Data de Submissão</th>
                      <th className="py-3 px-4 font-semibold">Taxa</th>
                      <th className="py-3 px-4 font-semibold">Estado</th>
                      <th className="py-3 px-5 font-semibold text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedidos.map((p, indice) => {
                      const info = obterInfoEstado(p.estado);
                      const editavel = podeEditarOuEliminar(p.estado);
                      const taxa = obterTaxaDoPedido(p);
                      return (
                        <tr
                          key={p.id}
                          className={`border-b border-gray-100 last:border-0 transition-colors hover:bg-gray-100 ${
                            indice % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          }`}
                        >
                          <td className="py-3 px-5 font-medium">
                            <button
                              type="button"
                              onClick={() => setPedidoDossier(p)}
                              className="text-primary-600 hover:text-primary-800 font-semibold hover:underline text-left"
                              title="Ver Dossier e Tramitação no IAPI"
                            >
                              {p.numeroProcesso}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-gray-700 font-medium">{p.titulo}</td>
                          <td className="py-3 px-4 text-gray-700">{p.tipoPropriedade.replaceAll('_', ' ')}</td>
                          <td className="py-3 px-4 text-gray-700">
                            {p.dataSubmissao
                              ? new Date(p.dataSubmissao).toLocaleDateString('pt-PT')
                              : '—'}
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            {taxa ? (
                              <span className="font-medium">
                                {taxa.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} Kz
                              </span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-block rounded-full border px-2.5 py-1 text-xs font-medium ${info.cor}`}>
                              {info.rotulo}
                            </span>
                            {p.pago && (
                              <span className="ml-1.5 inline-block rounded-full border border-green-300 bg-green-50 text-green-700 px-2.5 py-1 text-xs font-medium">
                                Taxa paga
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-5">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Botão de Dossier e Tramitação Oficial do IAPI */}
                              <button
                                type="button"
                                onClick={() => setPedidoDossier(p)}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-200 px-2 py-1 rounded"
                                title="Ver Dossier Oficial e Linha de Tramitação do IAPI"
                              >
                                <Eye size={12} />
                                Tramitação IAPI
                              </button>

                              {/* Se deferido ou concedido, mostra botão para ver o Certificado Oficial */}
                              {(p.estado === 'DEFERIDO' || p.estado === 'CONCEDIDO') && (
                                <button
                                  type="button"
                                  onClick={() => setCertificadoParaVer(p)}
                                  className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2 py-1 rounded"
                                  title="Ver Certificado de Registo de Marca"
                                >
                                  <Award size={12} />
                                  Certificado
                                </button>
                              )}

                              {(p.referenciaRupe || podePagar(p.estado)) && (
                                <button
                                  type="button"
                                  onClick={() => setPedidoParaPagar(p)}
                                  className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded border transition ${
                                    p.pago
                                      ? 'text-gray-700 bg-gray-50 hover:bg-gray-100 border-gray-200'
                                      : 'text-green-800 bg-green-50 hover:bg-green-100 border-green-300'
                                  }`}
                                  title="Ver RUPE e Descarregar Nota de Cobrança em PDF"
                                >
                                  <Receipt size={13} aria-hidden="true" />
                                  {p.pago ? 'Nota RUPE' : 'Pagar (RUPE)'}
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => verHistorico(p.id)}
                                className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-primary-600 px-1.5 py-1"
                              >
                                <Clock size={13} aria-hidden="true" />
                                Histórico
                              </button>

                              {editavel && (
                                <>
                                  <Link
                                    to={`/meus-pedidos/${p.id}/editar`}
                                    className="inline-flex items-center gap-1 text-xs font-medium text-primary-500 hover:text-primary-600 px-1.5 py-1"
                                  >
                                    <Pencil size={13} aria-hidden="true" />
                                    Editar
                                  </Link>
                                  <button
                                    type="button"
                                    onClick={() => pedirConfirmacaoEliminar(p)}
                                    className="inline-flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600 px-1.5 py-1"
                                  >
                                    <Trash2 size={13} aria-hidden="true" />
                                    Eliminar
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal da RUPE (pagamento da taxa) */}
      {pedidoParaPagar && (
        <ModalRupe
          pedido={pedidoParaPagar}
          onFechar={() => {
            setPedidoParaPagar(null);
            carregarPedidos();
          }}
        />
      )}

      {/* Modal de confirmação de eliminação */}
      {pedidoParaEliminar && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50"
          onClick={() => !aEliminar && setPedidoParaEliminar(null)}
        >
          <div
            className="bg-white w-full max-w-sm p-6"
            style={{ borderRadius: '15px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-primary-900 mb-2">Eliminar Pedido</h3>
            <p className="text-sm text-gray-600 mb-4">
              Tem a certeza que deseja eliminar o pedido{' '}
              <span className="font-medium text-gray-800">{pedidoParaEliminar.numeroProcesso}</span>?
              Esta ação não pode ser desfeita.
            </p>

            {erroEliminar && (
              <div
                className="bg-red-50 border border-red-300 text-red-700 text-sm px-4 py-2.5 mb-4"
                style={{ borderRadius: '10px' }}
              >
                {erroEliminar}
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={confirmarEliminar}
                disabled={aEliminar}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-sm font-medium px-4 py-2.5 transition"
                style={{ borderRadius: '10px' }}
              >
                {aEliminar ? 'A eliminar…' : 'Eliminar'}
              </button>
              <button
                type="button"
                onClick={() => setPedidoParaEliminar(null)}
                disabled={aEliminar}
                className="flex-1 text-gray-600 hover:text-gray-800 text-sm font-medium px-4 py-2.5 border border-gray-200"
                style={{ borderRadius: '10px' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de histórico */}
      {historicoAberto && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50"
          onClick={fecharHistorico}
        >
          <div
            className="bg-white w-full max-w-md p-6"
            style={{ borderRadius: '15px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-primary-900">
                Histórico do Pedido
              </h3>
              <button
                type="button"
                onClick={fecharHistorico}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            {historico.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Sem histórico disponível.
              </p>
            ) : (
              <ul className="space-y-3">
                {historico.map((item, indice) => (
                  <li key={indice} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
                      <FileText size={14} className="text-primary-500" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {item.estado_anterior} → {item.estado_novo}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.data_mudanca ? new Date(item.data_mudanca).toLocaleString('pt-PT') : ''}
                      </p>
                      {item.observacao && (
                        <p className="text-xs text-gray-600 mt-1">{item.observacao}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Modal de Dossier e Tramitação Oficial do IAPI */}
      {pedidoDossier && (
        <ModalDetalhesPedidoIapi
          pedidoInicial={pedidoDossier}
          onFechar={() => setPedidoDossier(null)}
          onAtualizar={(atualizado) => {
            setPedidoDossier(atualizado);
            carregarPedidos();
          }}
        />
      )}

      {/* Modal de Visualização do Certificado de Registo de Marca */}
      {certificadoParaVer && (
        <CertificadoMarcaModal
          pedido={certificadoParaVer}
          onFechar={() => setCertificadoParaVer(null)}
        />
      )}
    </div>
  );
}