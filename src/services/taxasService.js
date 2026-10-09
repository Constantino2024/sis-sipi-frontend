// src/services/taxasService.js
import api, { isNetworkError } from './api';

const TAXAS_PADRAO = [
  { id: 1, tipo_pedido: 'MARCA', descricao: 'Depósito e registo de marca nacional', valor: 25000 },
  { id: 2, tipo_pedido: 'PATENTE', descricao: 'Depósito de pedido de patente de invenção', valor: 50000 },
  { id: 3, tipo_pedido: 'DESENHO_INDUSTRIAL', descricao: 'Registo de desenho ou modelo industrial', valor: 30000 },
  { id: 4, tipo_pedido: 'MODELO_UTILIDADE', descricao: 'Depósito de modelo de utilidade', valor: 20000 },
];

export async function listarTaxas() {
  try {
    const resposta = await api.get('/taxas/');
    return resposta.data.results;
  } catch (error) {
    if (isNetworkError(error)) {
      return TAXAS_PADRAO;
    }
    throw error;
  }
}

export async function obterTaxaPorTipo(tipoPedido) {
  try {
    const resposta = await api.get('/taxas/', {
      params: { tipo_pedido: tipoPedido },
    });
    return resposta.data.results;
  } catch (error) {
    if (isNetworkError(error)) {
      return TAXAS_PADRAO.filter((t) => t.tipo_pedido === tipoPedido);
    }
    throw error;
  }
}

export async function criarTaxa(dados) {
  try {
    const resposta = await api.post('/taxas/', dados);
    return resposta.data;
  } catch (error) {
    if (isNetworkError(error)) {
      return { id: Date.now(), ...dados };
    }
    throw error;
  }
}

export async function atualizarTaxa(id, dados) {
  try {
    const resposta = await api.patch(`/taxas/${id}/`, dados);
    return resposta.data;
  } catch (error) {
    if (isNetworkError(error)) {
      return { id, ...dados };
    }
    throw error;
  }
}

export async function deletarTaxa(id) {
  try {
    await api.delete(`/taxas/${id}/`);
    return { sucesso: true };
  } catch (error) {
    if (isNetworkError(error)) {
      return { sucesso: true };
    }
    throw error;
  }
}