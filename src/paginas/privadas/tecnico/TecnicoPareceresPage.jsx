// src/paginas/privadas/tecnico/TecnicoPareceresPage.jsx

import { useEffect, useState } from 'react';
import { useAutenticacao } from '../../../contexto/AutenticacaoContexto';
import CabecalhoPainel from '../../../components/privado/CabecalhoPainel';
import { listarPedidosDoTecnico } from '../../../services/pedidosService';

export default function TecnicoPareceresPage() {
  const { utilizador } = useAutenticacao();
  const [processos, setProcessos] = useState([]);
  const [aCarregar, setACarregar] = useState(true);
  const [filtro, setFiltro] = useState('TODOS');

  useEffect(() => {
    async function carregar() {
      setACarregar(true);
      const resultado = await listarPedidosDoTecnico(utilizador.id);
      // Só os processos que realmente têm parecer (um processo pode ser
      // deferido/indeferido pelo Gestor sem ter passado por parecer técnico).
      setProcessos(resultado.filter((p) => p.parecer));
      setACarregar(false);
    }
    carregar();
  }, [utilizador.id]);

  const pareceresFiltrados = processos.filter(
    (p) => filtro === 'TODOS' || p.parecer?.decisao === filtro
  );

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <CabecalhoPainel titulo="Pareceres Emitidos" />
      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <p className="text-sm text-gray-500 mb-6">
          Histórico de pareceres técnicos por ti emitidos
        </p>

        <div className="flex gap-2 mb-5">
          {[
            { valor: 'TODOS', rotulo: 'Todos' },
            { valor: 'FAVORAVEL', rotulo: 'Favoráveis' },
            { valor: 'DESFAVORAVEL', rotulo: 'Desfavoráveis' },
          ].map((opt) => (
            <button
              key={opt.valor}
              onClick={() => setFiltro(opt.valor)}
              className={`px-3 py-1.5 text-sm border transition-colors ${
                filtro === opt.valor
                  ? 'bg-primary-500 text-white border-primary-500'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-primary-500'
              }`}
            >
              {opt.rotulo}
            </button>
          ))}
        </div>

        <div className="grid gap-3">
          {aCarregar ? (
            <p className="text-center text-gray-400 py-8">A carregar…</p>
          ) : pareceresFiltrados.length === 0 ? (
            <p className="text-center text-gray-400 py-8">Nenhum parecer emitido ainda.</p>
          ) : (
            pareceresFiltrados.map((p) => (
              <div key={p.id} className="bg-white border border-gray-100 p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{p.numeroProcesso} — {p.requerenteNome}</p>
                  <p className="text-sm text-gray-500">
                    {p.tipoPropriedade} · {new Date(p.parecer?.dataEmissao).toLocaleDateString('pt-PT')}
                  </p>
                  {p.estado === 'DEFERIDO' || p.estado === 'INDEFERIDO' ? (
                    <p className="text-xs text-gray-400 mt-1">
                      Decisão final: {p.estado === 'DEFERIDO' ? 'Deferido' : 'Indeferido'}
                    </p>
                  ) : (
                    <p className="text-xs text-amber-600 mt-1">Aguarda confirmação da decisão final</p>
                  )}
                </div>
                <span
                  className={`px-3 py-1 text-xs font-medium ${
                    p.parecer?.decisao === 'FAVORAVEL'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {p.parecer?.decisao === 'FAVORAVEL' ? 'Favorável' : 'Desfavorável'}
                </span>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}