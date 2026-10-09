import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const LOGO_IAPI = 'https://c2a.portais.gov.ao/uploads/iapi_df03906d75.png';

const mainNavItems = [
  { to: '/', label: 'Início', end: true },
  { to: '/servicos', label: 'Serviços' },
  { to: '/consulta', label: 'Consulta Pública' },
  { to: '/noticias', label: 'Notícias' },
  { to: '/formularios', label: 'Formulários' },
];

// Nenhum ícone decorativo na navegação — a hierarquia é feita por
// tipografia e pelo estado activo, não por glifos.
export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const linkClasses = ({ isActive }) =>
    `px-3 py-2 text-sm font-medium transition-colors border-b-2 ${
      isActive
        ? 'text-primary-500 border-secondary-500'
        : 'text-gray-700 border-transparent hover:text-primary-500 hover:border-primary-200'
    }`;

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-3 shrink-0" aria-label="SIPI - Página inicial">
            <img
              src={LOGO_IAPI}
              alt="IAPI - Instituto Angolano da Propriedade Industrial"
              className="h-10 w-auto md:h-11"
            />
          </Link>

          <nav
            className="hidden md:flex items-center h-full"
            role="navigation"
            aria-label="Navegação principal"
          >
            {mainNavItems.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={linkClasses}>
                {item.label}
              </NavLink>
            ))}

            <span className="h-6 w-px bg-gray-200 mx-3" aria-hidden="true" />

            <NavLink to="/login" className={linkClasses}>
              Entrar
            </NavLink>
            <Link
              to="/registro"
              className="ml-2 bg-primary-500 text-white hover:bg-primary-600 px-5 py-2 text-sm font-semibold transition-colors"
            >
              Registar
            </Link>
          </nav>

          <button
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="md:hidden p-2 text-gray-700 hover:text-primary-500 transition"
            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div id="mobile-menu" className="md:hidden py-3 border-t border-gray-200" role="menu">
            {mainNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-2 py-3 text-sm font-medium border-l-2 ${
                    isActive
                      ? 'text-primary-500 border-secondary-500 bg-primary-50'
                      : 'text-gray-700 border-transparent'
                  }`
                }
                role="menuitem"
              >
                {item.label}
              </NavLink>
            ))}
            <NavLink
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-2 py-3 text-sm font-medium text-gray-700"
              role="menuitem"
            >
              Entrar
            </NavLink>
            <Link
              to="/registro"
              onClick={() => setMobileMenuOpen(false)}
              className="block mt-2 bg-primary-500 text-white text-center px-4 py-3 text-sm font-semibold"
              role="menuitem"
            >
              Registar
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
