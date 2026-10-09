// src/rotas/RotaPrivada.jsx

import { Navigate, useLocation } from 'react-router-dom';
import { useAutenticacao } from '../contexto/AutenticacaoContexto';
import LayoutPrivado from '../components/privado/LayoutPrivado';

export default function RotaPrivada({ perfisPermitidos, children }) {
  const { utilizador, estaAutenticado } = useAutenticacao();
  const localizacao = useLocation();

  if (!estaAutenticado) {
    return <Navigate to="/login" state={{ de: localizacao }} replace />;
  }

  if (perfisPermitidos && !perfisPermitidos.includes(utilizador.perfil)) {
    return <Navigate to="/nao-autorizado" replace />;
  }

  return <LayoutPrivado>{children}</LayoutPrivado>;
}