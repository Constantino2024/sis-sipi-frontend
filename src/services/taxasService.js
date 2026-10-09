// src/services/taxasService.js
import api from './api';

function extrairLista(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

export async function listarTaxas() {
  const resposta = await api.get('/taxas/');
  return extrairLista(resposta.data);
}

export async function obterTaxaPorTipo(tipoPedido) {
  const resposta = await api.get('/taxas/', {
    params: { tipo_pedido: tipoPedido },
  });
  return extrairLista(resposta.data);
}

export async function criarTaxa(dados) {
  const resposta = await api.post('/taxas/', dados);
  return resposta.data;
}

export async function atualizarTaxa(id, dados) {
  const resposta = await api.patch(`/taxas/${id}/`, dados);
  return resposta.data;
}

export async function deletarTaxa(id) {
  await api.delete(`/taxas/${id}/`);
  return { sucesso: true };
}