// src/paginas/privadas/requerente/DashboardRequerentePage.jsx

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import CabecalhoPainel from "../../../components/privado/CabecalhoPainel";
import { listarPedidosDoRequerente } from "../../../services/pedidosService";
import { obterInfoEstado } from "../../../utilitarios/estadosPedido";
import { useAutenticacao } from "../../../contexto/AutenticacaoContexto";

const NUMERO_PEDIDOS_RECENTES = 5;

export default function DashboardRequerentePage() {
  const { utilizador } = useAutenticacao();
  const [pedidos, setPedidos] = useState([]);
  const [aCarregar, setACarregar] = useState(true);

  useEffect(() => {
    if (!utilizador?.id) return;
    listarPedidosDoRequerente(utilizador.id).then((resultado) => {
      setPedidos(resultado);
      setACarregar(false);
    });
  }, [utilizador?.id]);

  // useMemo evita recalcular os totais em cada render — só quando
  // `pedidos` muda de facto (ex: após um refresh de dados).
  const totaisPorEstado = useMemo(() => {
    return pedidos.reduce((acumulador, p) => {
      acumulador[p.estado] = (acumulador[p.estado] || 0) + 1;
      return acumulador;
    }, {});
  }, [pedidos]);

  const pedidosRecentes = useMemo(() => {
    return [...pedidos]
      .sort((a, b) => new Date(b.dataSubmissao) - new Date(a.dataSubmissao))
      .slice(0, NUMERO_PEDIDOS_RECENTES);
  }, [pedidos]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <CabecalhoPainel titulo="O Meu Painel" />
      <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">
            Bem-vindo{utilizador?.nome ? `, ${utilizador.nome}` : ''}. Aqui tem um resumo dos seus processos.
          </p>
          <Link
            to="/meus-pedidos/novo"
            className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium px-4 py-2.5 transition"
            style={{ borderRadius: '15px' }}
          >
            <Plus size={16} aria-hidden="true" />
            Novo Pedido
          </Link>
        </div>

        {aCarregar ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-10">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-32 bg-white border border-gray-200 animate-pulse"
                style={{ borderRadius: '15px' }}
              />
            ))}
          </div>
        ) : pedidos.length === 0 ? (
          <div
            className="bg-white border border-gray-200 px-5 py-14 text-center"
            style={{ borderRadius: '15px' }}
          >
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
          <>
            {/* Cartões de estatística */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-10">
              {Object.entries(totaisPorEstado).map(([estado, total]) => {
                const info = obterInfoEstado(estado);
                return (
                  <div
                    key={estado}
                    style={{ borderRadius: '15px' }}
                    className={`group relative overflow-hidden flex flex-col justify-center bg-white border border-gray-200 h-32 py-[18px] px-5 pl-6 transition-transform duration-150 ease-out hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(10,25,48,0.12)] ${info.cor ? `before:absolute before:inset-y-0 before:left-0 before:w-1 ${info.cor}` : ''}`}
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-2.5">
                      {info.rotulo}
                    </p>
                    <p className="text-[28px] leading-none font-bold text-primary-900">{total}</p>
                  </div>
                );
              })}
              <div
                style={{ borderRadius: '15px' }}
                className="relative overflow-hidden flex flex-col justify-center bg-white border border-gray-200 h-32 py-[18px] px-5 pl-6 transition-transform duration-150 ease-out hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(10,25,48,0.12)] before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-[#C9A227]"
              >
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-2.5">
                  Total de Pedidos
                </p>
                <p className="text-[28px] leading-none font-bold text-primary-900">{pedidos.length}</p>
              </div>
            </div>

            {/* Pedidos recentes */}
            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-primary-900">Pedidos Recentes</h2>
                <Link to="/meus-pedidos" className="text-xs font-medium text-primary-500 hover:text-primary-600">
                  Ver todos
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr className="text-left text-gray-600 text-xs font-semibold uppercase tracking-wider">
                      <th className="py-3 px-5 font-semibold">Processo</th>
                      <th className="py-3 px-4 font-semibold">Título</th>
                      <th className="py-3 px-4 font-semibold">Tipo</th>
                      <th className="py-3 px-4 font-semibold">Data de Submissão</th>
                      <th className="py-3 px-5 font-semibold">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedidosRecentes.map((p, indice) => {
                      const info = obterInfoEstado(p.estado);
                      return (
                        <tr
                          key={p.id}
                          className={`border-b border-gray-100 last:border-0 transition-colors hover:bg-gray-100 ${
                            indice % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          }`}
                        >
                          <td className="py-3 px-5 font-medium text-primary-500">{p.numeroProcesso}</td>
                          <td className="py-3 px-4 text-gray-700">{p.titulo}</td>
                          <td className="py-3 px-4 text-gray-700">{p.tipoPropriedade.replaceAll('_', ' ')}</td>
                          <td className="py-3 px-4 text-gray-700">
                            {p.dataSubmissao
                              ? new Date(p.dataSubmissao).toLocaleDateString('pt-PT')
                              : '—'}
                          </td>
                          <td className="py-3 px-5">
                            <span className={`inline-block rounded-full border px-2.5 py-1 text-xs font-medium ${info.cor}`}>
                              {info.rotulo}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
