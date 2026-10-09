// src/paginas/privadas/tecnico/TecnicoExigenciasPage.jsx

import { useEffect, useMemo, useState } from 'react';
import { useAutenticacao } from '../../../contexto/AutenticacaoContexto';
import CabecalhoPainel from '../../../components/privado/CabecalhoPainel';
import { listarPedidosDoTecnico, registarExigencia } from '../../../services/pedidosService';
import { podeEmitirExigencia } from '../../../utilitarios/estadosPedido';

export default function TecnicoExigenciasPage() {
  const { utilizador } = useAutenticacao();
  const [processos, setProcessos] = useState([]);
  const [aCarregar, setACarregar] = useState(true);
  const [processoSelecionadoId, setProcessoSelecionadoId] = useState('');
  const [descricao, setDescricao] = useState('');
  const [prazo, setPrazo] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [aGuardar, setAGuardar] = useState(false);
  const [erro, setErro] = useState('');

  async function carregar() {
    setACarregar(true);
    const resultado = await listarPedidosDoTecnico(utilizador.id);
    setProcessos(resultado);
    setACarregar(false);
  }

  useEffect(() => {
    carregar();
  }, [utilizador.id]);

  const processosElegiveis = useMemo(
    () => processos.filter((p) => podeEmitirExigencia(p.estado)),
    [processos]
  );

  const processoSelecionado = processosElegiveis.find((p) => p.id === Number(processoSelecionadoId)) ?? null;

  async function submeterExigencia(e) {
    e.preventDefault();
    if (!processoSelecionado || !descricao.trim() || !prazo) return;

    setAGuardar(true);
    setErro('');
    setMensagem('');
    try {
      await registarExigencia(processoSelecionado.id, { descricao, prazo });
    } catch (excecao) {
      setErro(excecao.response?.data?.error || 'Não foi possível emitir a exigência. Tente novamente.');
      setAGuardar(false);
      return;
    }
    setAGuardar(false);

    setMensagem(`Exigência emitida para o processo ${processoSelecionado.numeroProcesso}.`);
    setProcessoSelecionadoId('');
    setDescricao('');
    setPrazo('');
    await carregar();
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <CabecalhoPainel titulo="Emitir Exigência" />
      <main className="flex-grow max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <p className="text-sm text-gray-500 mb-6">
          Solicita correções ou documentos complementares ao requerente
        </p>

        {mensagem && (
          <div className="mb-5 px-4 py-3 bg-emerald-50 text-emerald-700 text-sm border border-emerald-100">
            {mensagem}
          </div>
        )}

        {erro && (
          <div role="alert" className="mb-5 px-4 py-3 bg-red-50 text-red-700 text-sm border border-red-200">
            {erro}
          </div>
        )}

        <form onSubmit={submeterExigencia} className="bg-white border border-gray-100 p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Processo</label>
            <select
              value={processoSelecionadoId}
              onChange={(e) => setProcessoSelecionadoId(e.target.value)}
              className="w-full border border-gray-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Seleciona um processo...</option>
              {processosElegiveis.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.numeroProcesso} — {p.requerenteNome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição da exigência
            </label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={4}
              className="w-full border border-gray-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Ex: Falta comprovativo de titularidade..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prazo para resposta
            </label>
            <input
              type="date"
              value={prazo}
              onChange={(e) => setPrazo(e.target.value)}
              className="border border-gray-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={aGuardar}
            className="px-4 py-2.5 bg-primary-500 text-white text-sm font-medium hover:bg-primary-900 disabled:opacity-50"
          >
            Emitir Exigência
          </button>
        </form>

        {/* Histórico rápido de processos pendentes */}
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Processos elegíveis</h2>
          <div className="grid gap-2">
            {aCarregar ? (
              <p className="text-gray-400 text-sm">A carregar…</p>
            ) : processosElegiveis.length === 0 ? (
              <p className="text-gray-400 text-sm">Sem processos pendentes de exigência.</p>
            ) : (
              processosElegiveis.map((p) => (
                <div key={p.id} className="bg-white border border-gray-100 px-4 py-2.5 text-sm text-gray-700 flex justify-between">
                  <span>{p.numeroProcesso} — {p.requerenteNome}</span>
                  <span className="text-gray-400">{p.tipoPropriedade}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}