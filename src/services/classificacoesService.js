// src/services/classificacoesService.js
import api from './api';

export async function listarClassificacoes(params = {}) {
  const resposta = await api.get('/classificacoes/', { params });
  return resposta.data.results;
}

export async function obterClassificacao(id) {
  const resposta = await api.get(`/classificacoes/${id}/`);
  return resposta.data;
}

export async function criarClassificacao(dados) {
  const resposta = await api.post('/classificacoes/', dados);
  return resposta.data;
}

export async function atualizarClassificacao(id, dados) {
  const resposta = await api.patch(`/classificacoes/${id}/`, dados);
  return resposta.data;
}

export async function deletarClassificacao(id) {
  await api.delete(`/classificacoes/${id}/`);
  return { sucesso: true };
}