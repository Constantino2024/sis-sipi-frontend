// src/paginas/privadas/tecnico/TecnicoProcessosPage.jsx

import { useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAutenticacao } from '../../../contexto/AutenticacaoContexto';
import CabecalhoPainel from '../../../components/privado/CabecalhoPainel';
import { listarPedidosDoTecnico, atribuirTecnico } from '../../../services/pedidosService';
import { obterInfoEstado, listarEstados, podeEditarOuEliminar } from '../../../utilitarios/estadosPedido';

export default function TecnicoProcessosPage() {
  const { utilizador } = useAutenticacao();
  const [processos, setProcessos] = useState([]);
  const [aCarregar, setACarregar] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [busca, setBusca] = useState('');
  const [tecnicoAtual, setTecnicoAtual] = useState(null);

  useEffect(() => {
    async function carregar() {
      setACarregar(true);
      try {
        // Buscar todos os pedidos atribuídos ao técnico ou não atribuídos
        const resultado = await listarPedidosDoTecnico(utilizador.id);
        setProcessos(resultado);
      } catch (error) {
        console.error('Erro ao carregar processos:', error);
      } finally {
        setACarregar(false);
      }
    }
    carregar();
  }, [utilizador.id]);

  // Filtrar processos
  const processosFiltrados = useMemo(() => {
    return processos.filter((p) => {
      const passaEstado = filtroEstado === 'TODOS' || p.estado === filtroEstado;
      const termoBusca = busca.trim().toLowerCase();
      const passaBusca =
        termoBusca === '' ||
        p.numeroProcesso?.toLowerCase().includes(termoBusca) ||
        p.requerenteNome?.toLowerCase().includes(termoBusca);
      return passaEstado && passaBusca;
    });
  }, [processos, filtroEstado, busca]);

  // Atribuir técnico a um processo (quando não tem técnico)
  async function atribuirProcesso(pedidoId) {
    try {
      await atribuirTecnico(pedidoId, utilizador.id);
      // Atualizar lista
      const resultado = await listarPedidosDoTecnico(utilizador.id);
      setProcessos(resultado);
    } catch (error) {
      console.error('Erro ao atribuir processo:', error);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <CabecalhoPainel titulo="Meus Processos" />
      <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <p className="text-sm text-gray-500 mb-5">
          {processosFiltrados.length} de {processos.length} processo(s)
        </p>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3 mb-5">
          <input
            type="text"
            placeholder="Pesquisar por nº ou requerente..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="px-3 py-2 border border-gray-200 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-3 py-2 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="TODOS">Todos os estados</option>
            {Object.entries(listarEstados()).map(([chave, info]) => (
              <option key={chave} value={chave}>{info.rotulo}</option>
            ))}
          </select>
        </div>

        {/* Tabela */}
        <div className="bg-white border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-500 text-xs uppercase tracking-wide">
                <th className="px-4 py-3">Nº Processo</th>
                <th className="px-4 py-3">Requerente</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Data Submissão</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Técnico</th>
                <th className="px-4 py-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {aCarregar ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    A carregar…
                  </td>
                </tr>
              ) : processosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    Nenhum processo encontrado.
                  </td>
                </tr>
              ) : (
                processosFiltrados.map((p) => {
                  const infoEstado = obterInfoEstado(p.estado);
                  const editavel = podeEditarOuEliminar(p.estado);
                  return (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{p.numeroProcesso}</td>
                      <td className="px-4 py-3 text-gray-700">{p.requerenteNome}</td>
                      <td className="px-4 py-3 text-gray-700">{p.tipoPropriedade}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(p.dataSubmissao).toLocaleDateString('pt-PT')}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium border ${infoEstado.cor}`}>
                          {infoEstado.rotulo}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {p.tecnicoResponsavelId ? (
                          <span className="text-xs text-gray-600">
                            {p.tecnicoNome || `Técnico #${p.tecnicoResponsavelId}`}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">Não atribuído</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {p.tecnicoResponsavelId ? (
                          <NavLink
                            to={`/tecnico/exame?pedido=${p.id}`}
                            className="text-primary-500 font-medium hover:underline"
                          >
                            Analisar
                          </NavLink>
                        ) : (
                          <button
                            onClick={() => atribuirProcesso(p.id)}
                            className="text-primary-500 font-medium hover:underline"
                          >
                            Assumir Processo
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}