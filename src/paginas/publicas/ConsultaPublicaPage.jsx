import { useCallback, useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { pesquisarRegistosPublicos } from '../../services/consultaPublicaService';

export default function ConsultaPublicaPage() {
  const [termo, setTermo] = useState('');
  const [termoPesquisado, setTermoPesquisado] = useState('');
  const [resultados, setResultados] = useState([]);
  const [total, setTotal] = useState(0);
  const [aCarregar, setACarregar] = useState(true);
  const [erro, setErro] = useState('');
  const pedidoAtual = useRef(0);

  const carregar = useCallback((termoProcurado) => {
    // Só a resposta do pedido mais recente é aplicada (evita respostas fora de ordem).
    const idPedido = ++pedidoAtual.current;
    return pesquisarRegistosPublicos({ termo: termoProcurado })
      .then((dados) => {
        if (idPedido !== pedidoAtual.current) return;
        setResultados(dados.resultados);
        setTotal(dados.total);
        setTermoPesquisado(termoProcurado.trim());
        setACarregar(false);
      })
      .catch(() => {
        if (idPedido !== pedidoAtual.current) return;
        setResultados([]);
        setTotal(0);
        setErro('Não foi possível obter os resultados. Tente novamente dentro de instantes.');
        setACarregar(false);
      });
  }, []);

  // Ao abrir a página, mostra os registos públicos mais recentes
  // (o estado inicial já é «a carregar»).
  useEffect(() => {
    carregar('');
  }, [carregar]);

  function aoSubmeter(e) {
    e.preventDefault();
    setACarregar(true);
    setErro('');
    carregar(termo);
  }

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <Header />
      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <h1 className="text-3xl font-bold text-primary-500">Consulta Pública</h1>
        <p className="mt-3 text-gray-600 max-w-2xl">
          Pesquise marcas, patentes, desenhos industriais e modelos de utilidade já publicados,
          deferidos ou concedidos. Não são exibidos dados internos do processo (pareceres técnicos).
        </p>

        <form
          onSubmit={aoSubmeter}
          className="mt-8 flex gap-0 border border-gray-300 focus-within:border-primary-500"
          role="search"
        >
          <label htmlFor="termo" className="sr-only">Número, titular ou nome</label>
          <input
            id="termo"
            type="text"
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            placeholder="Número do processo, titular ou designação…"
            className="flex-grow px-4 py-3 text-sm focus:outline-none"
          />
          <button
            type="submit"
            className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 text-sm font-semibold transition"
          >
            <Search size={16} aria-hidden="true" />
            Pesquisar
          </button>
        </form>

        <div className="mt-10">
          {erro ? (
            <p role="alert" className="text-sm text-red-600 mb-3">{erro}</p>
          ) : (
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-3" aria-live="polite">
              {aCarregar
                ? 'A pesquisar…'
                : `${total} resultado(s)${termoPesquisado ? ` para "${termoPesquisado}"` : ''}${
                    total > resultados.length ? ` — a mostrar os primeiros ${resultados.length}` : ''
                  }`}
            </p>
          )}

          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-300 text-left text-gray-500">
                <th className="py-3 pr-4 font-medium">Número</th>
                <th className="py-3 pr-4 font-medium">Designação</th>
                <th className="py-3 pr-4 font-medium">Titular</th>
                <th className="py-3 pr-4 font-medium">Tipo</th>
                <th className="py-3 pr-4 font-medium">Classe</th>
                <th className="py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {resultados.map((r) => (
                <tr key={r.numero} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 pr-4 font-medium text-primary-500">{r.numero}</td>
                  <td className="py-3 pr-4 text-gray-700">{r.designacao || '—'}</td>
                  <td className="py-3 pr-4 text-gray-700">{r.titular ?? '—'}</td>
                  <td className="py-3 pr-4 text-gray-700">{r.tipoDisplay}</td>
                  <td className="py-3 pr-4 text-gray-700">{r.classe ?? '—'}</td>
                  <td className="py-3 text-gray-700">{r.estadoDisplay}</td>
                </tr>
              ))}
              {!aCarregar && !erro && resultados.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    Nenhum registo encontrado para esta pesquisa.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
      <Footer />
    </div>
  );
}