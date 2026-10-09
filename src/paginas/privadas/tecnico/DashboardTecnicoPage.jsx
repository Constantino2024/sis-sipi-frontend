// src/paginas/privadas/tecnico/DashboardTecnicoPage.jsx

import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import CabecalhoPainel from '../../../components/privado/CabecalhoPainel';
import { listarPedidosPendentesAnalise } from '../../../services/pedidosService';
import { obterInfoEstado } from '../../../utilitarios/estadosPedido';

export default function DashboardTecnicoPage() {
  const [pedidos, setPedidos] = useState([]);
  const [aCarregar, setACarregar] = useState(true);

  useEffect(() => {
    async function carregarFila() {
      setACarregar(true);
      const resultado = await listarPedidosPendentesAnalise();
      setPedidos(resultado);
      setACarregar(false);
    }
    carregarFila();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <CabecalhoPainel titulo="Fila de Análise" />
      <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {aCarregar ? (
          <p className="text-sm text-gray-400">A carregar fila de análise…</p>
        ) : pedidos.length === 0 ? (
          <p className="text-sm text-gray-500">Não há pedidos pendentes de análise.</p>
        ) : (
          <div className="space-y-4">
            {pedidos.map((p) => {
              const infoEstado = obterInfoEstado(p.estado);
              return (
                <div
                  key={p.id}
                  className="border border-gray-200 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <div>
                    <p className="font-medium text-primary-500">
                      {p.numeroProcesso} — {p.titulo}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Requerente: {p.requerenteNome}</p>
                    <span className={`inline-block border px-2 py-1 text-xs font-medium mt-2 ${infoEstado.cor}`}>
                      {infoEstado.rotulo}
                    </span>
                  </div>
                  <NavLink
                    to={`/tecnico/exame?pedido=${p.id}`}
                    className="border border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white text-xs font-medium px-4 py-2 transition text-center"
                  >
                    Analisar
                  </NavLink>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}