// src/paginas/publicas/LoginPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import GoogleAuthSection from '../../components/forms/GoogleAuthSection';
import { useAutenticacao } from '../../contexto/AutenticacaoContexto';
import { ROTA_INICIAL_POR_PERFIL } from '../../utilitarios/rotasPorPerfil';


export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { entrar } = useAutenticacao();
  const navegar = useNavigate();

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const resultado = await entrar(form.email, form.password);
      
      // Redirecionar baseado no perfil do backend
      const destino = ROTA_INICIAL_POR_PERFIL[resultado.user.perfil] ?? '/';
      navegar(destino, { replace: true });
    } catch (erro) {
      setError(erro.response?.data?.email?.[0] || erro.response?.data?.detail || 'Erro ao entrar. Verifique as suas credenciais.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <Header />
      <main className="flex-grow flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md bg-white border border-gray-200">
          <div className="bg-primary-500 px-6 py-6">
            <h1 className="text-2xl font-bold text-white text-center">Entrar no SIPI</h1>
            <p className="text-primary-200 text-sm text-center mt-1">
              Acesso à área de requerente, técnico ou administrador
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                placeholder="nome@exemplo.ao"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Palavra-passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-danger border-l-2 border-danger pl-3 py-1">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-semibold py-3 transition"
            >
              {submitting ? 'A validar…' : 'Entrar'}
            </button>

          </form>

          <div className="px-6 pb-6 space-y-5">
            <div className="flex items-center gap-3" aria-hidden="true">
              <span className="flex-1 h-px bg-gray-200" />
              <span className="text-xs uppercase tracking-wide text-gray-400">ou</span>
              <span className="flex-1 h-px bg-gray-200" />
            </div>

            <GoogleAuthSection texto="signin_with" />

            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 text-center">
                Acesso Rápido de Demonstração
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ email: 'requerente@sipi.ao', password: '123456' })}
                  className="text-xs py-1.5 px-2 bg-gray-50 hover:bg-primary-50 hover:text-primary-600 border border-gray-200 rounded text-gray-700 font-medium transition text-center"
                >
                  Requerente
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ email: 'tecnico@sipi.ao', password: '123456' })}
                  className="text-xs py-1.5 px-2 bg-gray-50 hover:bg-primary-50 hover:text-primary-600 border border-gray-200 rounded text-gray-700 font-medium transition text-center"
                >
                  Técnico
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ email: 'admin@sipi.ao', password: '123456' })}
                  className="text-xs py-1.5 px-2 bg-gray-50 hover:bg-primary-50 hover:text-primary-600 border border-gray-200 rounded text-gray-700 font-medium transition text-center"
                >
                  Admin
                </button>
              </div>
            </div>

            <p className="text-center text-sm text-gray-500">
              Ainda não tem conta?{' '}
              <Link to="/registro" className="text-primary-500 hover:text-secondary-600 font-medium">
                Registe-se
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}