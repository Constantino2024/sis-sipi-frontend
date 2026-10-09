// src/paginas/privadas/admin/UtilizadoresAdminPage.jsx

import { useEffect, useMemo, useState, useCallback } from 'react';
import { Search, UserPlus, RefreshCw, X, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import CabecalhoPainel from "../../../components/privado/CabecalhoPainel";
import {
  listarUtilizadores,
  alterarEstadoUtilizador,
  criarUtilizador,
  extrairMensagemErro,
} from "../../../services/utilizadoresService";

const ROTULO_PERFIL = {
  REQUERENTE: 'Requerente',
  TECNICO_EXAMINADOR: 'Técnico Examinador',
  TECNICO: 'Técnico Examinador',
  ADMINISTRADOR: 'Administrador',
  GESTOR: 'Administrador',
};

const OPCAO_TODOS = 'TODOS';

export default function UtilizadoresAdminPage() {
  const [utilizadores, setUtilizadores] = useState([]);
  const [aCarregar, setACarregar] = useState(true);
  const [erro, setErro] = useState(null);
  const [mensagemSucesso, setMensagemSucesso] = useState(null);

  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [filtroPerfil, setFiltroPerfil] = useState(OPCAO_TODOS);

  // Modal Novo Utilizador
  const [modalNovoAberto, setModalNovoAberto] = useState(false);
  const [novoForm, setNovoForm] = useState({
    nome: '',
    email: '',
    password: '',
    perfil: 'REQUERENTE',
    nif: '',
    telefone: '',
  });
  const [aCriar, setACriar] = useState(false);
  const [erroCriacao, setErroCriacao] = useState(null);

  // ID do utilizador cujo estado está a ser alterado
  const [idEmProcessamento, setIdEmProcessamento] = useState(null);

  const carregar = useCallback(async () => {
    setACarregar(true);
    setErro(null);
    try {
      const lista = await listarUtilizadores();
      setUtilizadores(lista);
    } catch (err) {
      console.error('Erro ao carregar utilizadores do back-end:', err);
      setErro(extrairMensagemErro(err, 'Não foi possível carregar os utilizadores do back-end.'));
    } finally {
      setACarregar(false);
    }
  }, []);

  useEffect(() => {
    let cancelado = false;
    listarUtilizadores()
      .then((lista) => {
        if (!cancelado) {
          setUtilizadores(lista);
          setACarregar(false);
        }
      })
      .catch((err) => {
        if (!cancelado) {
          console.error('Erro ao carregar utilizadores do back-end:', err);
          setErro(extrairMensagemErro(err, 'Não foi possível carregar os utilizadores do back-end.'));
          setACarregar(false);
        }
      });
    return () => {
      cancelado = true;
    };
  }, []);

  const utilizadoresFiltrados = useMemo(() => {
    const termo = termoPesquisa.trim().toLowerCase();
    return utilizadores.filter((u) => {
      const correspondePerfil =
        filtroPerfil === OPCAO_TODOS ||
        u.perfil === filtroPerfil ||
        (filtroPerfil === 'TECNICO_EXAMINADOR' && u.perfil === 'TECNICO') ||
        (filtroPerfil === 'ADMINISTRADOR' && u.perfil === 'GESTOR');
      const correspondeTermo =
        termo === '' ||
        u.nome?.toLowerCase().includes(termo) ||
        u.email?.toLowerCase().includes(termo) ||
        u.nif?.toLowerCase().includes(termo);
      return correspondePerfil && correspondeTermo;
    });
  }, [utilizadores, termoPesquisa, filtroPerfil]);

  async function alternarEstado(id, estadoAtual) {
    setIdEmProcessamento(id);
    const novoEstado = !estadoAtual;

    // Atualização otimista
    setUtilizadores((atual) =>
      atual.map((u) => (u.id === id ? { ...u, activo: novoEstado } : u))
    );

    try {
      await alterarEstadoUtilizador(id, novoEstado);
      setMensagemSucesso(`Estado do utilizador atualizado com sucesso.`);
      setTimeout(() => setMensagemSucesso(null), 3000);
    } catch (err) {
      // Reverter em caso de falha
      setUtilizadores((atual) =>
        atual.map((u) => (u.id === id ? { ...u, activo: estadoAtual } : u))
      );
      setErro(extrairMensagemErro(err, 'Erro ao atualizar estado do utilizador no servidor.'));
    } finally {
      setIdEmProcessamento(null);
    }
  }

  async function handleSubmeterNovoUtilizador(e) {
    e.preventDefault();
    setErroCriacao(null);
    setACriar(true);

    try {
      const criado = await criarUtilizador(novoForm);
      setUtilizadores((prev) => [criado, ...prev]);
      setModalNovoAberto(false);
      setNovoForm({
        nome: '',
        email: '',
        password: '',
        perfil: 'REQUERENTE',
        nif: '',
        telefone: '',
      });
      setMensagemSucesso(`Utilizador "${criado.nome}" criado com sucesso no back-end!`);
      setTimeout(() => setMensagemSucesso(null), 4000);
    } catch (err) {
      console.error('Erro ao criar utilizador:', err);
      setErroCriacao(extrairMensagemErro(err, 'Não foi possível registar o utilizador no back-end.'));
    } finally {
      setACriar(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <CabecalhoPainel titulo="Gestão de Utilizadores" />
      <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {mensagemSucesso && (
          <div
            className="flex items-center justify-between gap-3 bg-green-50 border border-green-300 text-green-700 text-sm px-4 py-3 mb-6"
            style={{ borderRadius: '10px' }}
          >
            <div className="flex items-center gap-2">
              <CheckCircle size={16} />
              <span>{mensagemSucesso}</span>
            </div>
            <button
              type="button"
              onClick={() => setMensagemSucesso(null)}
              className="text-green-600 hover:text-green-800"
            >
              <X size={15} aria-hidden="true" />
            </button>
          </div>
        )}

        {erro && (
          <div
            className="flex items-center justify-between gap-3 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 mb-6"
            style={{ borderRadius: '10px' }}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} />
              <span>{erro}</span>
            </div>
            <button
              type="button"
              onClick={carregar}
              className="text-xs font-semibold underline hover:text-red-900"
            >
              Tentar novamente
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              type="text"
              value={termoPesquisa}
              onChange={(evento) => setTermoPesquisa(evento.target.value)}
              placeholder="Pesquisar por nome, email ou NIF…"
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-300"
              style={{ borderRadius: '15px' }}
            />
          </div>
          <select
            value={filtroPerfil}
            onChange={(evento) => setFiltroPerfil(evento.target.value)}
            className="px-4 py-2.5 text-sm border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-300"
            style={{ borderRadius: '15px' }}
          >
            <option value={OPCAO_TODOS}>Todos os perfis</option>
            <option value="REQUERENTE">Requerente</option>
            <option value="TECNICO_EXAMINADOR">Técnico Examinador</option>
            <option value="ADMINISTRADOR">Administrador</option>
          </select>
          <button
            type="button"
            onClick={carregar}
            disabled={aCarregar}
            title="Recarregar do back-end"
            className="inline-flex items-center justify-center p-2.5 border border-gray-200 bg-white hover:bg-gray-100 text-gray-600 transition"
            style={{ borderRadius: '15px' }}
          >
            <RefreshCw size={16} className={aCarregar ? 'animate-spin' : ''} />
          </button>
          <button
            type="button"
            onClick={() => setModalNovoAberto(true)}
            className="inline-flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium px-4 py-2.5 transition whitespace-nowrap"
            style={{ borderRadius: '15px' }}
          >
            <UserPlus size={16} aria-hidden="true" />
            Novo Utilizador
          </button>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-primary-900">
              {utilizadoresFiltrados.length} utilizador{utilizadoresFiltrados.length !== 1 ? 'es' : ''} registado{utilizadoresFiltrados.length !== 1 ? 's' : ''} no back-end
            </h2>
            {aCarregar && (
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                <Loader2 size={13} className="animate-spin" /> A sincronizar com o back-end…
              </span>
            )}
          </div>

          {aCarregar && utilizadores.length === 0 ? (
            <div className="p-8 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 animate-pulse rounded" />
              ))}
            </div>
          ) : utilizadoresFiltrados.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-sm text-gray-500">
                {erro
                  ? 'Não foi possível carregar os utilizadores do back-end.'
                  : 'Nenhum utilizador encontrado no back-end com os filtros seleccionados.'}
              </p>
              {erro && (
                <button
                  type="button"
                  onClick={carregar}
                  className="mt-3 text-sm text-primary-600 font-semibold hover:underline"
                >
                  Tentar novamente
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr className="text-left text-gray-600 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-3 px-5 font-semibold">Nome</th>
                    <th className="py-3 px-4 font-semibold">Email</th>
                    <th className="py-3 px-4 font-semibold">NIF</th>
                    <th className="py-3 px-4 font-semibold">Perfil</th>
                    <th className="py-3 px-5 font-semibold text-center">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {utilizadoresFiltrados.map((u, indice) => (
                    <tr
                      key={u.id}
                      className={`border-b border-gray-100 last:border-0 transition-colors hover:bg-gray-50 ${
                        indice % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                      }`}
                    >
                      <td className="py-3 px-5 font-medium text-primary-900">{u.nome}</td>
                      <td className="py-3 px-4 text-gray-700">{u.email}</td>
                      <td className="py-3 px-4 text-gray-500 font-mono text-xs">{u.nif || '—'}</td>
                      <td className="py-3 px-4 text-gray-700">
                        <span className="inline-block text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
                          {ROTULO_PERFIL[u.perfil] || u.perfil}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-center">
                        <button
                          type="button"
                          disabled={idEmProcessamento === u.id}
                          onClick={() => alternarEstado(u.id, u.activo)}
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                            u.activo
                              ? 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100'
                              : 'border-gray-300 bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {idEmProcessamento === u.id && <Loader2 size={11} className="animate-spin" />}
                          {u.activo ? 'Activo' : 'Inactivo'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal Criar Novo Utilizador */}
      {modalNovoAberto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            className="bg-white max-w-lg w-full p-6 shadow-2xl relative border border-gray-200"
            style={{ borderRadius: '15px' }}
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-primary-900">Registar Novo Utilizador</h3>
                <p className="text-xs text-gray-500 mt-0.5">Criar conta diretamente no back-end do SIPI</p>
              </div>
              <button
                type="button"
                onClick={() => setModalNovoAberto(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            {erroCriacao && (
              <div className="my-4 bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded">
                {erroCriacao}
              </div>
            )}

            <form onSubmit={handleSubmeterNovoUtilizador} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={novoForm.nome}
                  onChange={(e) => setNovoForm((prev) => ({ ...prev, nome: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="ex: Dr. António Silva"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={novoForm.email}
                    onChange={(e) => setNovoForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="utilizador@sipi.ao"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Palavra-passe *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={novoForm.password}
                    onChange={(e) => setNovoForm((prev) => ({ ...prev, password: e.target.value }))}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Perfil de Acesso *
                  </label>
                  <select
                    value={novoForm.perfil}
                    onChange={(e) => setNovoForm((prev) => ({ ...prev, perfil: e.target.value }))}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                  >
                    <option value="REQUERENTE">Requerente (Cidadão / Empresa)</option>
                    <option value="TECNICO_EXAMINADOR">Técnico Examinador (IAPI)</option>
                    <option value="ADMINISTRADOR">Administrador Geral</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    NIF (Número Fiscal)
                  </label>
                  <input
                    type="text"
                    value={novoForm.nif}
                    onChange={(e) => setNovoForm((prev) => ({ ...prev, nif: e.target.value }))}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                    placeholder="5412345678"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={novoForm.telefone}
                  onChange={(e) => setNovoForm((prev) => ({ ...prev, telefone: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="+244 9..."
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalNovoAberto(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={aCriar}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white text-sm font-semibold rounded shadow-sm"
                >
                  {aCriar && <Loader2 size={14} className="animate-spin" />}
                  {aCriar ? 'A registar no back-end…' : 'Criar Utilizador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}