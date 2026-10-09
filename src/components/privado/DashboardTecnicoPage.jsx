// src/paginas/privadas/DashboardTecnicoPage.jsx

import { useEffect, useMemo, useState } from 'react';
import CabecalhoPainel from '../../components/privado/CabecalhoPainel';
import { listarPedidosParaAnalise } from '../../services/pedidosService';
import { obterInfoEstado } from '../../utilitarios/estadosPedido';

export default function DashboardTecnicoPage() {
  const [pedidos, setPedidos] = useState([]);
  const [aCarregar, setACarregar] = useState(true);

  useEffect(() => {
    listarPedidosParaAnalise().then((resultado) => {
      setPedidos(resultado);
      setACarregar(false);
    });
  }, []);

  const pendentesDeAnalise = useMemo(
    () => pedidos.filter((p) => p.estado === 'EM_ANALISE' || p.estado === 'SUBMETIDO'),
    [pedidos]
  );

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <CabecalhoPainel titulo="Processos para Análise" />
      <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {aCarregar ? (
          <p className="text-sm text-gray-400">A carregar dados…</p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
              <div className="border border-amber-400 bg-amber-50 p-4">
                <p className="text-2xl font-bold">{pendentesDeAnalise.length}</p>
                <p className="text-xs mt-1">Aguardam Análise</p>
              </div>
              <div className="border border-primary-500 bg-primary-500 text-white p-4">
                <p className="text-2xl font-bold">{pedidos.length}</p>
                <p className="text-xs mt-1">Total Atribuído</p>
              </div>
            </div>

            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-300 text-left text-gray-500">
                  <th className="py-3 pr-4 font-medium">Processo</th>
                  <th className="py-3 pr-4 font-medium">Título</th>
                  <th className="py-3 pr-4 font-medium">Requerente</th>
                  <th className="py-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((p) => {
                  const info = obterInfoEstado(p.estado);
                  return (
                    <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 pr-4 font-medium text-primary-500">{p.numeroProcesso}</td>
                      <td className="py-3 pr-4 text-gray-700">{p.titulo}</td>
                      <td className="py-3 pr-4 text-gray-700">{p.requerenteNome}</td>
                      <td className="py-3">
                        <span className={`inline-block border px-2 py-1 text-xs font-medium ${info.cor}`}>
                          {info.rotulo}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}
      </main>
    </div>
  );
}