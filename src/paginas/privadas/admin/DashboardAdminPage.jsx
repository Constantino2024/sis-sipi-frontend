// src/paginas/privadas/DashboardAdminPage.jsx

import { useEffect, useMemo, useState } from 'react';
import CabecalhoPainel from "../../../components/privado/CabecalhoPainel";
import { listarTodosPedidos } from "../../../services/pedidosService";
import { obterInfoEstado } from "../../../utilitarios/estadosPedido";

export default function DashboardAdminPage() {
  const [pedidos, setPedidos] = useState([]);
  const [aCarregar, setACarregar] = useState(true);

  useEffect(() => {
    listarTodosPedidos().then((resultado) => {
      setPedidos(resultado);
      setACarregar(false);
    });
  }, []);

  // useMemo evita recalcular os totais em cada render — só quando
  // `pedidos` muda de facto (ex: após um refresh de dados).
  const totaisPorEstado = useMemo(() => {
    return pedidos.reduce((acumulador, p) => {
      acumulador[p.estado] = (acumulador[p.estado] || 0) + 1;
      return acumulador;
    }, {});
  }, [pedidos]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <CabecalhoPainel titulo="Visão Geral do Sistema" />
      <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {aCarregar ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 rounded-lg bg-white border border-gray-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Cartões de estatística */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5 mb-10">
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
                  Total de Processos
                </p>
                <p className="text-[28px] leading-none font-bold text-primary-900">{pedidos.length}</p>
              </div>
            </div>

            {/* Tabela de processos */}
            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-primary-900">Processos Registados</h2>
              </div>

              {pedidos.length === 0 ? (
                <p className="px-5 py-8 text-sm text-gray-400 text-center">
                  Ainda não existem processos registados no sistema.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr className="text-left text-gray-600 text-xs font-semibold uppercase tracking-wider">
                        <th className="py-3 px-5 font-semibold">Processo</th>
                        <th className="py-3 px-4 font-semibold">Título</th>
                        <th className="py-3 px-4 font-semibold">Requerente</th>
                        <th className="py-3 px-4 font-semibold">Tipo</th>
                        <th className="py-3 px-5 font-semibold">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pedidos.map((p, indice) => {
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
                            <td className="py-3 px-4 text-gray-700">{p.requerenteNome}</td>
                            <td className="py-3 px-4 text-gray-700">{p.tipoPropriedade.replaceAll('_', ' ')}</td>
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
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
