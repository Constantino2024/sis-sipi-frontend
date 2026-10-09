// src/paginas/privadas/admin/UtilizadoresAdminPage.jsx

import { useMemo, useState } from 'react';
import { Search, UserPlus } from 'lucide-react';
import CabecalhoPainel from "../../../components/privado/CabecalhoPainel";

// TODO: substituir por chamadas reais a um utilizadoresService.js
// (ex: listarUtilizadores(), alterarEstadoUtilizador(id, activo)),
// seguindo o mesmo padrão USAR_DADOS_MOCK do pedidosService.js.
const UTILIZADORES_EXEMPLO = [
  { id: 1, nome: 'Ana Ferreira', email: 'ana.ferreira@exemplo.ao', perfil: 'REQUERENTE', activo: true },
  { id: 2, nome: 'Carlos Neto', email: 'carlos.neto@exemplo.ao', perfil: 'REQUERENTE', activo: true },
  { id: 3, nome: 'Beatriz Lopes', email: 'beatriz.lopes@sipi.gov.ao', perfil: 'TECNICO_EXAMINADOR', activo: true },
  { id: 4, nome: 'João Miguel', email: 'joao.miguel@sipi.gov.ao', perfil: 'TECNICO_EXAMINADOR', activo: false },
  { id: 5, nome: 'Helena Costa', email: 'helena.costa@sipi.gov.ao', perfil: 'ADMINISTRADOR', activo: true },
];

const ROTULO_PERFIL = {
  REQUERENTE: 'Requerente',
  TECNICO_EXAMINADOR: 'Técnico Examinador',
  ADMINISTRADOR: 'Administrador',
};

const OPCAO_TODOS = 'TODOS';

export default function UtilizadoresAdminPage() {
  const [utilizadores, setUtilizadores] = useState(UTILIZADORES_EXEMPLO);
  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [filtroPerfil, setFiltroPerfil] = useState(OPCAO_TODOS);

  const utilizadoresFiltrados = useMemo(() => {
    const termo = termoPesquisa.trim().toLowerCase();
    return utilizadores.filter((u) => {
      const correspondePerfil = filtroPerfil === OPCAO_TODOS || u.perfil === filtroPerfil;
      const correspondeTermo =
        termo === '' ||
        u.nome.toLowerCase().includes(termo) ||
        u.email.toLowerCase().includes(termo);
      return correspondePerfil && correspondeTermo;
    });
  }, [utilizadores, termoPesquisa, filtroPerfil]);

  function alternarEstado(id) {
    // TODO: chamar alterarEstadoUtilizador(id, novoValor) no serviço real.
    setUtilizadores((atual) =>
      atual.map((u) => (u.id === id ? { ...u, activo: !u.activo } : u))
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <CabecalhoPainel titulo="Gestão de Utilizadores" />
      <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              type="text"
              value={termoPesquisa}
              onChange={(evento) => setTermoPesquisa(evento.target.value)}
              placeholder="Pesquisar por nome ou email…"
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
            {Object.entries(ROTULO_PERFIL).map(([chave, rotulo]) => (
              <option key={chave} value={chave}>{rotulo}</option>
            ))}
          </select>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium px-4 py-2.5 transition whitespace-nowrap"
            style={{ borderRadius: '15px' }}
          >
            <UserPlus size={16} aria-hidden="true" />
            Novo Utilizador
          </button>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-primary-900">
              {utilizadoresFiltrados.length} utilizador{utilizadoresFiltrados.length !== 1 ? 'es' : ''}
            </h2>
          </div>

          {utilizadoresFiltrados.length === 0 ? (
            <p className="px-5 py-8 text-sm text-gray-400 text-center">
              Nenhum utilizador corresponde aos filtros seleccionados.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-primary-500 text-left text-white">
                    <th className="py-3 px-5 font-medium">Nome</th>
                    <th className="py-3 px-4 font-medium">Email</th>
                    <th className="py-3 px-4 font-medium">Perfil</th>
                    <th className="py-3 px-5 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {utilizadoresFiltrados.map((u, indice) => (
                    <tr
                      key={u.id}
                      className={`border-b border-gray-100 last:border-0 transition-colors hover:bg-gray-100 ${
                        indice % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="py-3 px-5 font-medium text-primary-900">{u.nome}</td>
                      <td className="py-3 px-4 text-gray-700">{u.email}</td>
                      <td className="py-3 px-4 text-gray-700">{ROTULO_PERFIL[u.perfil]}</td>
                      <td className="py-3 px-5">
                        <button
                          type="button"
                          onClick={() => alternarEstado(u.id)}
                          className={`inline-block rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                            u.activo
                              ? 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100'
                              : 'border-gray-300 bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
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
    </div>
  );
}