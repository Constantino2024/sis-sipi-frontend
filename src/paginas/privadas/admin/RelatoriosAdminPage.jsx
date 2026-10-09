// src/paginas/privadas/admin/RelatoriosAdminPage.jsx

import { useEffect, useMemo, useState } from 'react';
import CabecalhoPainel from "../../../components/privado/CabecalhoPainel";
import { listarTodosPedidos } from "../../../services/pedidosService";
import { obterInfoEstado } from "../../../utilitarios/estadosPedido";
import { useAutenticacao } from "../../../contexto/AutenticacaoContexto";
import BotaoExportarPdf from "../../../components/common/BotaoExportarPdf";
import { gerarRelatorioPedidosPdf } from "../../../utilitarios/relatorioPdf";
import { carregarLogoDataUrl } from "../../../utilitarios/relatorioLogo";

export default function RelatoriosAdminPage() {
  const { utilizador } = useAutenticacao();
  const [pedidos, setPedidos] = useState([]);
  const [aCarregar, setACarregar] = useState(true);

  useEffect(() => {
    listarTodosPedidos().then((resultado) => {
      setPedidos(resultado);
      setACarregar(false);
    });
  }, []);

  const totaisPorEstado = useMemo(() => {
    return pedidos.reduce((acumulador, p) => {
      acumulador[p.estado] = (acumulador[p.estado] || 0) + 1;
      return acumulador;
    }, {});
  }, [pedidos]);

  const totaisPorTipo = useMemo(() => {
    return pedidos.reduce((acumulador, p) => {
      acumulador[p.tipoPropriedade] = (acumulador[p.tipoPropriedade] || 0) + 1;
      return acumulador;
    }, {});
  }, [pedidos]);

  async function exportarPdf() {
    await gerarRelatorioPedidosPdf({
      pedidos,
      titulo: 'Relatório Geral de Processos',
      geradoPor: utilizador?.nome,
      logoDataUrl: await carregarLogoDataUrl(),
    });
  }

  const maiorTotalPorTipo = useMemo(
    () => Math.max(1, ...Object.values(totaisPorTipo)),
    [totaisPorTipo]
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <CabecalhoPainel titulo="Relatórios" />
      <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {aCarregar ? (
          <p className="text-sm text-gray-400">A carregar dados…</p>
        ) : (
          <>
          <div className="flex items-center justify-between gap-4 mb-6">
            <p className="text-sm text-gray-500">
              Resumo dos processos registados no sistema.
            </p>
            <BotaoExportarPdf aoGerar={exportarPdf} desativado={pedidos.length === 0} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribuição por estado */}
            <div
              className="bg-white border border-gray-200 p-6"
              style={{ borderRadius: '15px' }}
            >
              <h2 className="text-sm font-semibold text-primary-900 mb-1">Processos por Estado</h2>
              <p className="text-xs text-gray-500 mb-5">
                Distribuição actual de {pedidos.length} processo{pedidos.length !== 1 ? 's' : ''} registado{pedidos.length !== 1 ? 's' : ''}.
              </p>
              <ul className="space-y-3">
                {Object.entries(totaisPorEstado).map(([estado, total]) => {
                  const info = obterInfoEstado(estado);
                  const percentagem = pedidos.length ? Math.round((total / pedidos.length) * 100) : 0;
                  return (
                    <li key={estado}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-700">{info.rotulo}</span>
                        <span className="text-gray-400">{total} ({percentagem}%)</span>
                      </div>
                      <div className="h-2 bg-gray-100 overflow-hidden" style={{ borderRadius: '15px' }}>
                        <div
                          className="h-full bg-primary-500"
                          style={{ width: `${percentagem}%`, borderRadius: '15px' }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Distribuição por modalidade */}
            <div
              className="bg-white border border-gray-200 p-6"
              style={{ borderRadius: '15px' }}
            >
              <h2 className="text-sm font-semibold text-primary-900 mb-1">Processos por Modalidade</h2>
              <p className="text-xs text-gray-500 mb-5">
                Comparação entre os tipos de propriedade industrial submetidos.
              </p>
              <ul className="space-y-3">
                {Object.entries(totaisPorTipo).map(([tipo, total]) => (
                  <li key={tipo}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-700">{tipo.replaceAll('_', ' ')}</span>
                      <span className="text-gray-400">{total}</span>
                    </div>
                    <div className="h-2 bg-gray-100 overflow-hidden" style={{ borderRadius: '15px' }}>
                      <div
                        className="h-full bg-[#C9A227]"
                        style={{ width: `${(total / maiorTotalPorTipo) * 100}%`, borderRadius: '15px' }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          </>
        )}
      </main>
    </div>
  );
}