// src/paginas/privadas/tecnico/TecnicoExamePage.jsx

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CabecalhoPainel from '../../../components/privado/CabecalhoPainel';
import { obterPedidoPorId, registarParecer, deferirPedido } from '../../../services/pedidosService';
import { obterInfoEstado, estaDecidido } from '../../../utilitarios/estadosPedido';

const CRITERIOS_EXAME = [
  { id: 'titularidade', rotulo: 'Titularidade e legitimidade do requerente' },
  { id: 'documentacao', rotulo: 'Documentação obrigatória completa' },
  { id: 'classificacao', rotulo: 'Classificação correta (classe/categoria)' },
  { id: 'anterioridade', rotulo: 'Ausência de conflito com registos anteriores' },
  { id: 'requisitos_formais', rotulo: 'Cumprimento dos requisitos formais' },
];

export default function TecnicoExamePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const pedidoId = Number(searchParams.get('pedido'));

  const [pedido, setPedido] = useState(null);
  const [aCarregar, setACarregar] = useState(true);
  const [aGuardar, setAGuardar] = useState(false);
  const [checklist, setChecklist] = useState(
    Object.fromEntries(CRITERIOS_EXAME.map((c) => [c.id, false]))
  );
  const [observacoes, setObservacoes] = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!pedidoId) {
      setACarregar(false);
      return;
    }
    async function carregar() {
      setACarregar(true);
      try {
        const resultado = await obterPedidoPorId(pedidoId);
        setPedido(resultado);
      } catch {
        setPedido(null);
      }
      setACarregar(false);
    }
    carregar();
  }, [pedidoId]);

  const todosVerificados = CRITERIOS_EXAME.every((c) => checklist[c.id]);
  const jaTemParecer = pedido?.estado === 'PARECER_FAVORAVEL' || pedido?.estado === 'PARECER_DESFAVORAVEL';

  const decidido = pedido ? estaDecidido(pedido.estado) : false;

  const toggleCriterio = (id) =>
    setChecklist((prev) => ({ ...prev, [id]: !prev[id] }));

  async function executar(acao) {
    setAGuardar(true);
    setErro('');
    try {
      await acao();
      navigate('/tecnico/processos');
    } catch (excecao) {
      setErro(excecao.response?.data?.error || excecao.message || 'Não foi possível concluir a operação.');
      setAGuardar(false);
    }
  }

  function concluirExame(decisao) {
    if (!pedido) return;
    return executar(() => registarParecer(pedido.id, { decisao, observacoes }));
  }

  function confirmarDecisaoFinal() {
    if (!pedido) return;
    return executar(() => deferirPedido(pedido.id));
  }

  if (!pedidoId) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <CabecalhoPainel titulo="Exame" />
        <main className="flex-grow max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
          <p className="text-gray-500">
            Seleciona um processo em <span className="font-medium">Meus Processos</span> para iniciar o exame.
          </p>
        </main>
      </div>
    );
  }

  if (aCarregar) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <CabecalhoPainel titulo="Exame" />
        <main className="flex-grow max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
          <p className="text-sm text-gray-400">A carregar…</p>
        </main>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <CabecalhoPainel titulo="Exame" />
        <main className="flex-grow max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
          <p className="text-gray-500">Processo não encontrado.</p>
        </main>
      </div>
    );
  }

  const infoEstado = obterInfoEstado(pedido.estado);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <CabecalhoPainel titulo="Exame do Processo" />
      <main className="flex-grow max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <p className="text-sm text-gray-500 mb-1">
          Nº {pedido.numeroProcesso} — {pedido.requerenteNome}
        </p>
        <span className={`inline-block border px-2 py-1 text-xs font-medium mb-6 ${infoEstado.cor}`}>
          {infoEstado.rotulo}
        </span>

        {/* Resumo do pedido */}
        <div className="bg-white border border-gray-100 p-5 mb-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wide">Tipo</p>
            <p className="text-gray-900 font-medium">{pedido.tipoPropriedade}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wide">Data de Submissão</p>
            <p className="text-gray-900 font-medium">
              {new Date(pedido.dataSubmissao).toLocaleDateString('pt-PT')}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-400 text-xs uppercase tracking-wide">Título</p>
            <p className="text-gray-700">{pedido.titulo ?? '—'}</p>
          </div>
        </div>

        {erro && (
          <div role="alert" className="mb-5 px-4 py-3 bg-red-50 text-red-700 text-sm border border-red-200">
            {erro}
          </div>
        )}

        {decidido ? (
          <div className="bg-white border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-1">Processo já decidido</h2>
            <p className="text-sm text-gray-500">
              Este processo tem decisão final ({infoEstado.rotulo.toLowerCase()}) e já não admite novo exame.
            </p>
          </div>
        ) : jaTemParecer ? (
          // Já foi emitido parecer — falta só a confirmação da decisão final.
          <div className="bg-white border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Parecer já emitido</h2>
            <p className="text-sm text-gray-700 mb-1">
              Decisão: <span className="font-medium">{pedido.parecer?.decisao === 'FAVORAVEL' ? 'Favorável' : 'Desfavorável'}</span>
            </p>
            {pedido.parecer?.observacoes && (
              <p className="text-sm text-gray-500 mb-4">{pedido.parecer.observacoes}</p>
            )}
            <button
              onClick={confirmarDecisaoFinal}
              disabled={aGuardar}
              className="px-4 py-2.5 bg-primary-500 text-white text-sm font-medium hover:bg-primary-900 disabled:opacity-50"
            >
              {pedido.estado === 'PARECER_FAVORAVEL' ? 'Confirmar Deferimento' : 'Confirmar Indeferimento'}
            </button>
          </div>
        ) : (
          <>
            {/* Checklist de exame */}
            <div className="bg-white border border-gray-100 p-5 mb-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Critérios de Exame</h2>
              <ul className="space-y-3">
                {CRITERIOS_EXAME.map((c) => (
                  <li key={c.id} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={checklist[c.id]}
                      onChange={() => toggleCriterio(c.id)}
                      className="w-4 h-4 accent-primary-500"
                    />
                    <span className="text-sm text-gray-700">{c.rotulo}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Observações */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações técnicas
              </label>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={4}
                className="w-full border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Notas sobre o exame realizado..."
              />
            </div>

            {/* Decisão */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => concluirExame('FAVORAVEL')}
                disabled={!todosVerificados || aGuardar}
                className="px-4 py-2.5 bg-emerald-600 text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-700"
              >
                Emitir Parecer Favorável
              </button>
              <button
                onClick={() => concluirExame('DESFAVORAVEL')}
                disabled={!todosVerificados || aGuardar}
                className="px-4 py-2.5 bg-rose-600 text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-rose-700"
              >
                Emitir Parecer Desfavorável
              </button>
              {!todosVerificados && (
                <span className="text-xs text-gray-400">
                  Verifica todos os critérios para concluir.
                </span>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}