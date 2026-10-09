// src/contexto/AutenticacaoContexto.jsx
import { createContext, useContext, useState, useCallback } from 'react';
import {
  login as loginServico,
  loginComGoogle as loginComGoogleServico,
  logout as logoutServico,
  obterSessaoAtual,
  atualizarPerfil as atualizarPerfilServico,
} from '../services/authService';

const AutenticacaoContexto = createContext(null);

export function AutenticacaoProvider({ children }) {
  const [sessao, setSessao] = useState(() => obterSessaoAtual());

  const entrar = useCallback(async (email, palavraPasse) => {
    const resultado = await loginServico(email, palavraPasse);
    setSessao(resultado);
    return resultado;
  }, []);

  // Devolve a sessão, ou { registroNecessario, google } se a conta não existir
  const entrarComGoogle = useCallback(async (credential, dadosExtra) => {
    const resultado = await loginComGoogleServico(credential, dadosExtra);
    if (!resultado.registroNecessario) {
      setSessao(resultado);
    }
    return resultado;
  }, []);

  const sair = useCallback(() => {
    logoutServico();
    setSessao(null);
  }, []);

  const atualizarPerfil = useCallback(async (dadosNovos) => {
    const utilizadorAtualizado = await atualizarPerfilServico(sessao.user.id, dadosNovos);
    setSessao((atual) => ({ ...atual, user: utilizadorAtualizado }));
    return utilizadorAtualizado;
  }, [sessao]);

  const valor = {
    utilizador: sessao?.user ?? null,
    estaAutenticado: sessao !== null,
    entrar,
    entrarComGoogle,
    sair,
    atualizarPerfil,
  };

  return (
    <AutenticacaoContexto.Provider value={valor}>
      {children}
    </AutenticacaoContexto.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAutenticacao() {
  const contexto = useContext(AutenticacaoContexto);
  if (!contexto) {
    throw new Error('useAutenticacao tem de ser usado dentro de <AutenticacaoProvider>.');
  }
  return contexto;
}