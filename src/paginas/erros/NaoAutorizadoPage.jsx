// src/paginas/erros/NaoAutorizadoPage.jsx

import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAutenticacao } from '../../contexto/AutenticacaoContexto';

export default function NaoAutorizadoPage() {
  const { utilizador } = useAutenticacao();

  const rotaDeOrigemPorPerfil = {
    REQUERENTE: '/meus-pedidos',
    TECNICO: '/dashboard-tecnico',
    GESTOR: '/dashboard-admin',
  };
  const rotaDeOrigem = rotaDeOrigemPorPerfil[utilizador?.perfil] ?? '/';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 text-center">
      <ShieldAlert size={48} className="text-danger mb-4" aria-hidden="true" />
      <h1 className="text-2xl font-bold text-primary-500 mb-2">Acesso Não Autorizado</h1>
      <p className="text-sm text-gray-500 max-w-md mb-6">
        O seu perfil não tem permissão para aceder a esta página. Se acredita que isto é um
        engano, contacte o administrador do sistema.
      </p>
      <Link
        to={rotaDeOrigem}
        className="bg-primary-500 hover:bg-primary-600 text-white font-medium px-6 py-3 text-sm transition"
      >
        Voltar à minha área
      </Link>
    </div>
  );
}