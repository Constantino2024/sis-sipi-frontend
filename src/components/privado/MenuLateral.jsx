// src/components/privado/MenuLateral.jsx

import { NavLink } from 'react-router-dom';

// Ícones em SVG puro (24x24, stroke currentColor) — sem dependências externas,
// consistente com o padrão de ícones já usado no resto do SIPI.
const Icone = {
  Visao: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" {...props}>
      <rect x="3" y="3" width="7" height="9" />
      <rect x="14" y="3" width="7" height="5" />
      <rect x="14" y="12" width="7" height="9" />
      <rect x="3" y="16" width="7" height="5" />
    </svg>
  ),
  Pedidos: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" {...props}>
      <path d="M7 3h7l5 5v13H7z" />
      <path d="M14 3v5h5" />
      <path d="M9.5 12.5h5M9.5 16h5" />
    </svg>
  ),
  Analise: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4.3-4.3" />
      <path d="M9 11l1.5 1.5L14 9" />
    </svg>
  ),
  Utilizadores: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" {...props}>
      <circle cx="9" cy="8" r="3.25" />
      <path d="M3.5 20c0-3.5 2.5-6 5.5-6s5.5 2.5 5.5 6" />
      <path d="M16 9.5a2.75 2.75 0 100-5.5" />
      <path d="M18.5 20c0-2.6-1.3-4.7-3.2-5.7" />
    </svg>
  ),
  Relatorios: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" {...props}>
      <path d="M4 20V10M11 20V4M18 20v-7" />
    </svg>
  ),
  Exame: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" {...props}>
      <path d="M6 3h9l4 4v14H6z" />
      <path d="M15 3v4h4" />
      <circle cx="10.5" cy="13.5" r="2.5" />
      <path d="M12.3 15.3L15 18" />
    </svg>
  ),
  Parecer: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" {...props}>
      <path d="M6 3h9l4 4v14H6z" />
      <path d="M15 3v4h4" />
      <path d="M9 13.5l2 2 4-4.5" />
    </svg>
  ),
  Exigencia: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" {...props}>
      <path d="M12 3l9 16H3z" />
      <path d="M12 10v4" />
      <path d="M12 17.2v.1" />
    </svg>
  ),
  Notificacoes: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" {...props}>
      <path d="M6 10a6 6 0 1112 0c0 4 1.5 5.5 2 6H4c.5-.5 2-2 2-6z" />
      <path d="M10 20a2 2 0 004 0" />
    </svg>
  ),
  Perfil: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c0-4.1 3.4-7 7.5-7s7.5 2.9 7.5 7" />
    </svg>
  ),
};

const ESTRUTURA_POR_PERFIL = {
  REQUERENTE: [
    {
      grupo: 'Processo',
      itens: [
        { rota: '/dashboard-requerente', rotulo: 'Dashboard', icone: Icone.Visao },
        { rota: '/meus-pedidos', rotulo: 'Meus Pedidos', icone: Icone.Pedidos },
        { rota: '/notificacoes', rotulo: 'Notificações', icone: Icone.Notificacoes },
      ],
    },
    {
      grupo: 'Conta',
      itens: [{ rota: '/perfil', rotulo: 'Meu Perfil', icone: Icone.Perfil }],
    },
  ],
  TECNICO: [
    {
      grupo: 'Trabalho',
      itens: [
        { rota: '/dashboard-tecnico', rotulo: 'Dashboard', icone: Icone.Visao },
        { rota: '/tecnico/processos', rotulo: 'Meus Processos', icone: Icone.Pedidos },
        { rota: '/tecnico/exame', rotulo: 'Exame', icone: Icone.Exame },
        { rota: '/tecnico/pareceres', rotulo: 'Pareceres', icone: Icone.Parecer },
        { rota: '/tecnico/exigencias', rotulo: 'Exigências', icone: Icone.Exigencia },
      ],
    },
    {
      grupo: 'Conta',
      itens: [{ rota: '/perfil', rotulo: 'Perfil', icone: Icone.Perfil }],
    },
  ],
  GESTOR: [
    {
      grupo: 'Geral',
      itens: [{ rota: '/dashboard-admin', rotulo: 'Visão Geral', icone: Icone.Visao }],
    },
    {
      grupo: 'Gestão',
      itens: [
        { rota: '/admin/pedidos', rotulo: 'Pedidos', icone: Icone.Pedidos },
        { rota: '/admin/utilizadores', rotulo: 'Utilizadores', icone: Icone.Utilizadores },
        { rota: '/admin/relatorios', rotulo: 'Relatórios', icone: Icone.Relatorios },
      ],
    },
    {
      grupo: 'Conta',
      itens: [{ rota: '/perfil', rotulo: 'Perfil', icone: Icone.Perfil }],
    },
  ],
};
ESTRUTURA_POR_PERFIL.TECNICO_EXAMINADOR = ESTRUTURA_POR_PERFIL.TECNICO;
ESTRUTURA_POR_PERFIL.ADMINISTRADOR = ESTRUTURA_POR_PERFIL.GESTOR;

const ROTULO_PERFIL = {
  REQUERENTE: 'Requerente',
  TECNICO: 'Técnico',
  TECNICO_EXAMINADOR: 'Técnico',
  GESTOR: 'Administrador',
  ADMINISTRADOR: 'Administrador',
};

export default function MenuLateral({ perfil, nomeUtilizador }) {
  const grupos = ESTRUTURA_POR_PERFIL[perfil] ?? [];

  return (
    <nav className="w-64 shrink-0 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Marca */}
      <div className="h-16 flex items-center gap-2 px-5 border-b border-gray-200 bg-white">
        <div className="w-8 h-8 bg-primary-600 flex items-center justify-center">
          <span className="text-[#C9A227] font-bold text-sm tracking-wide">SI</span>
        </div>
        <span className="text-primary-900 font-bold tracking-wide text-sm">SIPI</span>
      </div>

      {/* Navegação */}
      <div className="flex-1 overflow-y-auto py-5 px-3">
        {grupos.map((grupo) => (
          <div key={grupo.grupo} className="mb-6">
            <p className="px-3 mb-2 text-[11px] font-semibold tracking-wider uppercase text-gray-400">
              {grupo.grupo}
            </p>
            <ul className="space-y-0.5">
              {grupo.itens.map((item) => {
                const IconeItem = item.icone;
                return (
                  <li key={item.rota}>
                    <NavLink
                      to={item.rota}
                      className={({ isActive }) =>
                        `group relative flex items-center gap-3 px-3 py-2.5 text-sm border-l-2 transition-colors ${
                          isActive
                            ? 'bg-primary-50 border-[#C9A227] text-primary-900 font-semibold'
                            : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-primary-900'
                        }`
                      }
                    >
                      <IconeItem className="w-[18px] h-[18px] shrink-0" />
                      <span>{item.rotulo}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Rodapé — perfil actual */}
      <div className="px-5 py-4 border-t border-gray-200 flex items-center gap-3 bg-gray-50/50">
        <div className="w-8 h-8 bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
          <Icone.Perfil className="w-4 h-4 text-gray-600" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {nomeUtilizador ?? ROTULO_PERFIL[perfil] ?? 'Utilizador'}
          </p>
          <p className="text-xs text-gray-500 truncate">{ROTULO_PERFIL[perfil]}</p>
        </div>
      </div>
    </nav>
  );
}