// src/components/privado/LayoutPrivado.jsx

import MenuLateral from './MenuLateral';
import { useAutenticacao } from "../../contexto/AutenticacaoContexto";

export default function LayoutPrivado({ children }) {
  const { utilizador } = useAutenticacao();

  return (
    <div className="h-screen flex bg-white overflow-hidden">
      <MenuLateral perfil={utilizador?.perfil} />
      <div className="flex-grow flex flex-col overflow-y-auto">{children}</div>
    </div>
  );
}