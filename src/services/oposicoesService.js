// src/services/oposicoesService.js
import api from './api';

function extrairLista(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

export async function listarOposicoes(params = {}) {
  const resposta = await api.get('/oposicoes/', { params });
  return extrairLista(resposta.data);
}

export async function obterOposicao(id) {
  const resposta = await api.get(`/oposicoes/${id}/`);
  return resposta.data;
}

export async function criarOposicao(dados) {
  const resposta = await api.post('/oposicoes/', dados);
  return resposta.data;
}

export async function atualizarOposicao(id, dados) {
  const resposta = await api.patch(`/oposicoes/${id}/`, dados);
  return resposta.data;
}

export async function deletarOposicao(id) {
  await api.delete(`/oposicoes/${id}/`);
  return { sucesso: true };
}