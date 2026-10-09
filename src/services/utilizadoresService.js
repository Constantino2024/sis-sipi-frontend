// src/services/utilizadoresService.js
import api, { extrairMensagemErro } from './api';

function normalizarPerfil(perfil) {
  if (perfil === 'TECNICO_EXAMINADOR') return 'TECNICO_EXAMINADOR';
  if (perfil === 'ADMINISTRADOR') return 'ADMINISTRADOR';
  return perfil || 'REQUERENTE';
}

function mapearUtilizador(u) {
  if (!u) return null;
  return {
    id: u.id,
    nome: u.nome_completo || u.nome || u.email,
    email: u.email,
    nif: u.nif || '',
    telefone: u.telefone || '',
    perfil: normalizarPerfil(u.perfil),
    activo: u.is_active !== undefined ? Boolean(u.is_active) : (u.activo !== undefined ? Boolean(u.activo) : true),
    dataCriacao: u.date_joined || u.created_at || u.dataCriacao || null,
  };
}

function extrairLista(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

/**
 * Lista utilizadores registados a partir do back-end.
 * Tenta /auth/utilizadores/ e se 404 tenta /utilizadores/
 */
export async function listarUtilizadores(params = {}) {
  try {
    const resposta = await api.get('/auth/utilizadores/', { params });
    return extrairLista(resposta.data).map(mapearUtilizador);
  } catch (erro) {
    if (erro?.response?.status === 404) {
      const resposta = await api.get('/utilizadores/', { params });
      return extrairLista(resposta.data).map(mapearUtilizador);
    }
    throw erro;
  }
}

/**
 * Obtém os detalhes de um utilizador pelo seu ID no back-end.
 */
export async function obterUtilizador(id) {
  try {
    const resposta = await api.get(`/auth/utilizadores/${id}/`);
    return mapearUtilizador(resposta.data);
  } catch (erro) {
    if (erro?.response?.status === 404) {
      const resposta = await api.get(`/utilizadores/${id}/`);
      return mapearUtilizador(resposta.data);
    }
    throw erro;
  }
}

/**
 * Cria um novo utilizador no back-end (Administrador / Gestor).
 */
export async function criarUtilizador(dados) {
  const corpo = {
    nome_completo: dados.nome,
    nome: dados.nome,
    email: dados.email,
    password: dados.password,
    nif: dados.nif || '',
    telefone: dados.telefone || '',
    perfil: dados.perfil || 'REQUERENTE',
    is_active: dados.activo !== undefined ? dados.activo : true,
  };

  try {
    const resposta = await api.post('/auth/utilizadores/', corpo);
    return mapearUtilizador(resposta.data);
  } catch (erro) {
    if (erro?.response?.status === 404) {
      const resposta = await api.post('/auth/registro/', corpo);
      return mapearUtilizador(resposta.data);
    }
    throw erro;
  }
}

/**
 * Atualiza os dados de um utilizador no back-end.
 */
export async function atualizarUtilizador(id, dados) {
  const corpo = {};
  if (dados.nome !== undefined) corpo.nome_completo = dados.nome;
  if (dados.email !== undefined) corpo.email = dados.email;
  if (dados.perfil !== undefined) corpo.perfil = dados.perfil;
  if (dados.activo !== undefined) {
    corpo.is_active = dados.activo;
    corpo.activo = dados.activo;
  }
  if (dados.nif !== undefined) corpo.nif = dados.nif;
  if (dados.telefone !== undefined) corpo.telefone = dados.telefone;

  try {
    const resposta = await api.patch(`/auth/utilizadores/${id}/`, corpo);
    return mapearUtilizador(resposta.data);
  } catch (erro) {
    if (erro?.response?.status === 404) {
      const resposta = await api.patch(`/utilizadores/${id}/`, corpo);
      return mapearUtilizador(resposta.data);
    }
    throw erro;
  }
}

/**
 * Alterna ou define o estado activo/inactivo do utilizador no back-end.
 */
export async function alterarEstadoUtilizador(id, activo) {
  return await atualizarUtilizador(id, { activo });
}

/**
 * Remove um utilizador no back-end.
 */
export async function removerUtilizador(id) {
  try {
    await api.delete(`/auth/utilizadores/${id}/`);
    return { sucesso: true };
  } catch (erro) {
    if (erro?.response?.status === 404) {
      await api.delete(`/utilizadores/${id}/`);
      return { sucesso: true };
    }
    throw erro;
  }
}

export { extrairMensagemErro };
