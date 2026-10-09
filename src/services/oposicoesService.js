// src/services/oposicoesService.js
import api, { isNetworkError } from './api';

export async function listarOposicoes(params = {}) {
  try {
    const resposta = await api.get('/oposicoes/', { params });
    return resposta.data.results;
  } catch (error) {
    if (isNetworkError(error)) {
      return [];
    }
    throw error;
  }
}

export async function obterOposicao(id) {
  try {
    const resposta = await api.get(`/oposicoes/${id}/`);
    return resposta.data;
  } catch (error) {
    if (isNetworkError(error)) {
      return null;
    }
    throw error;
  }
}

export async function criarOposicao(dados) {
  try {
    const resposta = await api.post('/oposicoes/', dados);
    return resposta.data;
  } catch (error) {
    if (isNetworkError(error)) {
      return { id: Date.now(), ...dados, data_registo: new Date().toISOString() };
    }
    throw error;
  }
}

export async function atualizarOposicao(id, dados) {
  try {
    const resposta = await api.patch(`/oposicoes/${id}/`, dados);
    return resposta.data;
  } catch (error) {
    if (isNetworkError(error)) {
      return { id, ...dados };
    }
    throw error;
  }
}

export async function deletarOposicao(id) {
  try {
    await api.delete(`/oposicoes/${id}/`);
    return { sucesso: true };
  } catch (error) {
    if (isNetworkError(error)) {
      return { sucesso: true };
    }
    throw error;
  }
}

export async function atualizarDecisao(id, decisao, parecerTecnico) {
  try {
    const resposta = await api.patch(`/oposicoes/${id}/`, {
      decisao,
      parecer_tecnico: parecerTecnico,
    });
    return resposta.data;
  } catch (error) {
    if (isNetworkError(error)) {
      return { id, decisao, parecer_tecnico: parecerTecnico };
    }
    throw error;
  }
}