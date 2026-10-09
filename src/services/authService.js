// src/services/authService.js
import api from './api';

const CHAVE_SESSAO = '@sipi/sessao';

// Mapear utilizador do backend para o formato do frontend
function mapearUtilizador(user) {
  return {
    id: user.id,
    nome: user.nome_completo || user.email,
    email: user.email,
    nif: user.nif,
    telefone: user.telefone,
    perfil: user.perfil,
    tipo_utilizador: user.tipo_utilizador,
  };
}

function guardarSessao(dados) {
  localStorage.setItem('access_token', dados.access);
  localStorage.setItem('refresh_token', dados.refresh);

  const sessao = { user: mapearUtilizador(dados.user), token: dados.access };
  localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
  return sessao;
}

export async function login(email, palavraPasse) {
  const resposta = await api.post('/auth/login/', {
    email,
    password: palavraPasse,
  });
  return guardarSessao(resposta.data);
}

/**
 * Login/registo com Google.
 *
 * @param {string} credential  ID token devolvido pelo Google Identity Services
 * @param {object} [dadosExtra] NIF, telefone, tipo_utilizador, ... (1.º acesso)
 * @returns {Promise<object>}
 *   - sessão `{ user, token }` quando a autenticação termina, ou
 *   - `{ registroNecessario: true, google: { email, nome, foto } }` quando a
 *     conta ainda não existe e é preciso recolher NIF/telefone/tipo.
 */
export async function loginComGoogle(credential, dadosExtra = {}) {
  const resposta = await api.post('/auth/google/', { credential, ...dadosExtra });

  if (resposta.status === 202 && resposta.data.registro_necessario) {
    return { registroNecessario: true, google: resposta.data.google };
  }
  return guardarSessao(resposta.data);
}

export async function register(dadosUtilizador) {
  const resposta = await api.post('/auth/registro/', dadosUtilizador);
  return resposta.data;
}

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

export async function alterarPassword(passwordAtual, novaPassword) {
  const resposta = await api.post('/auth/password/change/', {
    old_password: passwordAtual,
    new_password: novaPassword,
  });
  return resposta.data;
}

export async function refreshToken() {
  const refreshToken = localStorage.getItem('refresh_token');
  const resposta = await api.post('/auth/refresh/', {
    refresh: refreshToken,
  });
  
  localStorage.setItem('access_token', resposta.data.access);
  return resposta.data.access;
}

export async function obterMeuPerfil() {
  const resposta = await api.get('/auth/utilizadores/me/');
  return mapearUtilizador(resposta.data);
}