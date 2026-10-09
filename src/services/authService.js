import api, { isNetworkError } from './api';
import {
  entrarMock,
  registarMock,
  atualizarPerfilMock,
  alterarPasswordMock,
} from './mocks/autenticacaoMock';

const CHAVE_SESSAO = '@sipi/sessao';

// Mapear utilizador do backend para o formato do frontend
function mapearUtilizador(user) {
  if (!user) return null;
  return {
    id: user.id,
    nome: user.nome_completo || user.nome || user.email,
    email: user.email,
    nif: user.nif || '000000000',
    telefone: user.telefone || '+244 923 000 000',
    perfil: user.perfil || 'REQUERENTE',
    tipo_utilizador: user.tipo_utilizador || 'PESSOA_FISICA',
  };
}

function guardarSessao(dados) {
  const token = dados.access || dados.token || 'mock-token';
  const refresh = dados.refresh || 'mock-refresh-token';
  localStorage.setItem('access_token', token);
  localStorage.setItem('refresh_token', refresh);

  const sessao = { user: mapearUtilizador(dados.user), token };
  localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
  return sessao;
}

export async function login(email, palavraPasse) {
  try {
    const resposta = await api.post('/auth/login/', {
      email,
      password: palavraPasse,
    });
    return guardarSessao(resposta.data);
  } catch (error) {
    if (isNetworkError(error)) {
      const mockResult = await entrarMock(email, palavraPasse);
      return guardarSessao(mockResult);
    }
    throw error;
  }
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
  try {
    const resposta = await api.post('/auth/google/', { credential, ...dadosExtra });

    if (resposta.status === 202 && resposta.data.registro_necessario) {
      return { registroNecessario: true, google: resposta.data.google };
    }
    return guardarSessao(resposta.data);
  } catch (error) {
    if (isNetworkError(error)) {
      // Mock Google session
      const mockUser = {
        id: 99,
        nome: dadosExtra.nome || 'Utilizador Google',
        email: dadosExtra.email || 'google.user@sipi.ao',
        nif: dadosExtra.nif || '123456789BA012',
        telefone: dadosExtra.telefone || '+244 923 000 000',
        perfil: 'REQUERENTE',
        tipo_utilizador: 'PESSOA_FISICA',
      };
      return guardarSessao({ user: mockUser, access: 'mock-google-token' });
    }
    throw error;
  }
}

export async function register(dadosUtilizador) {
  try {
    const resposta = await api.post('/auth/registro/', dadosUtilizador);
    return resposta.data;
  } catch (error) {
    if (isNetworkError(error)) {
      const mockResult = await registarMock(dadosUtilizador);
      return mockResult;
    }
    throw error;
  }
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
  try {
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
  } catch (error) {
    if (isNetworkError(error)) {
      const utilizadorMock = await atualizarPerfilMock(utilizadorId, dadosNovos);
      const utilizador = mapearUtilizador(utilizadorMock);
      const sessaoAtual = obterSessaoAtual();
      if (sessaoAtual) {
        localStorage.setItem(
          CHAVE_SESSAO,
          JSON.stringify({ ...sessaoAtual, user: utilizador })
        );
      }
      return utilizador;
    }
    throw error;
  }
}

export async function alterarPassword(passwordAtual, novaPassword) {
  try {
    const resposta = await api.post('/auth/password/change/', {
      old_password: passwordAtual,
      new_password: novaPassword,
    });
    return resposta.data;
  } catch (error) {
    if (isNetworkError(error)) {
      const sessaoAtual = obterSessaoAtual();
      if (sessaoAtual?.user?.id) {
        return await alterarPasswordMock(sessaoAtual.user.id, passwordAtual, novaPassword);
      }
      return { sucesso: true };
    }
    throw error;
  }
}

export async function refreshToken() {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    const resposta = await api.post('/auth/refresh/', {
      refresh: refreshToken,
    });
    
    localStorage.setItem('access_token', resposta.data.access);
    return resposta.data.access;
  } catch (error) {
    if (isNetworkError(error)) {
      return localStorage.getItem('access_token') || 'mock-access-token';
    }
    throw error;
  }
}

export async function obterMeuPerfil() {
  try {
    const resposta = await api.get('/auth/utilizadores/me/');
    return mapearUtilizador(resposta.data);
  } catch (error) {
    const sessaoAtual = obterSessaoAtual();
    if (sessaoAtual?.user) {
      return sessaoAtual.user;
    }
    throw error;
  }
}