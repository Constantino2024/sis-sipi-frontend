// src/services/oposicoesService.js
import api from './api';

export async function listarOposicoes(params = {}) {
  const resposta = await api.get('/oposicoes/', { params });
  return resposta.data.results;
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

export async function atualizarDecisao(id, decisao, parecerTecnico) {
  const resposta = await api.patch(`/oposicoes/${id}/`, {
    decisao,
    parecer_tecnico: parecerTecnico,
  });
  return resposta.data;
}