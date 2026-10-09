// src/services/authService.js
import api from './api';

const CHAVE_SESSAO = '@sipi/sessao';

function normalizarPerfil(perfil) {
  if (perfil === 'TECNICO_EXAMINADOR') return 'TECNICO';
  if (perfil === 'ADMINISTRADOR') return 'GESTOR';
  return perfil || 'REQUERENTE';
}

// Mapear utilizador do back-end para o formato do front-end
function mapearUtilizador(user) {
  if (!user) return null;
  return {
    id: user.id,
    nome: user.nome_completo || user.nome || user.email,
    email: user.email,
    nif: user.nif || '',
    telefone: user.telefone || '',
    perfil: normalizarPerfil(user.perfil),
    tipo_utilizador: user.tipo_utilizador || 'PESSOA_SINGULAR',
  };
}

function guardarSessao(dados) {
  const token = dados.access || dados.token;
  const refresh = dados.refresh;
  if (token) localStorage.setItem('access_token', token);
  if (refresh) localStorage.setItem('refresh_token', refresh);

  const sessao = { user: mapearUtilizador(dados.user), token };
  localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
  return sessao;
}

/**
 * Autenticação por e-mail e palavra-passe no back-end.
 */
export async function login(email, palavraPasse) {
  const resposta = await api.post('/auth/login/', {
    email: email.trim(),
    password: palavraPasse,
  });
  return guardarSessao(resposta.data);
}

/**
 * Login/registo com Google no back-end.
 */
export async function loginComGoogle(credential, dadosExtra = {}) {
  const resposta = await api.post('/auth/google/', { credential, ...dadosExtra });

  if (resposta.status === 202 && resposta.data.registro_necessario) {
    return { registroNecessario: true, google: resposta.data.google };
  }
  return guardarSessao(resposta.data);
}

/**
 * Registo de novo utilizador no back-end.
 */
export async function register(dadosUtilizador) {
  const resposta = await api.post('/auth/registro/', dadosUtilizador);
  return resposta.data;
}

/**
 * Terminar sessão e revogar token no back-end.
 */
export function logout() {
  const refreshToken = localStorage.getItem('refresh_token');
  if (refreshToken) {
    api.post('/auth/logout/', { refresh: refreshToken }).catch(() => {});
  }

  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem(CHAVE_SESSAO);
}

export function obterSessaoAtual() {
  const sessaoGuardada = localStorage.getItem(CHAVE_SESSAO);
  return sessaoGuardada ? JSON.parse(sessaoGuardada) : null;
}

/**
 * Atualizar perfil do utilizador no back-end.
 */
export async function atualizarPerfil(utilizadorId, dadosNovos) {
  const resposta = await api.patch(`/auth/utilizadores/${utilizadorId}/`, dadosNovos);
  const utilizador = mapearUtilizador(resposta.data);

  const sessaoAtual = obterSessaoAtual();
  if (sessaoAtual) {
    localStorage.setItem(
      CHAVE_SESSAO,
      JSON.stringify({ ...sessaoAtual, user: utilizador })
    );
  }

  return utilizador;
}

/**
 * Alterar palavra-passe no back-end.
 */
export async function alterarPassword(passwordAtual, novaPassword) {
  const resposta = await api.post('/auth/password/change/', {
    old_password: passwordAtual,
    new_password: novaPassword,
  });
  return resposta.data;
}

/**
 * Atualizar token de acesso no back-end.
 */
export async function refreshToken() {
  const tokenAtual = localStorage.getItem('refresh_token');
  if (!tokenAtual) throw new Error('Sem refresh token');

  const resposta = await api.post('/auth/refresh/', {
    refresh: tokenAtual,
  });

  localStorage.setItem('access_token', resposta.data.access);
  return resposta.data.access;
}

/**
 * Obter dados do perfil autenticado diretamente do back-end.
 */
export async function obterMeuPerfil() {
  const resposta = await api.get('/auth/utilizadores/me/');
  const utilizador = mapearUtilizador(resposta.data);

  const sessaoAtual = obterSessaoAtual();
  if (sessaoAtual) {
    localStorage.setItem(
      CHAVE_SESSAO,
      JSON.stringify({ ...sessaoAtual, user: utilizador })
    );
  }

  return utilizador;
}