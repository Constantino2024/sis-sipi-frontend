// src/services/pagamentosService.js
// O frontend só fala com o nosso backend; é o backend que comunica com a API RUPE.
import api from './api';

function mapearRupe(rupe) {
  return {
    id: rupe.id,
    pedidoId: rupe.pedido,
    numeroProcesso: rupe.pedido_numero_processo,
    referencia: rupe.referencia,
    nif: rupe.nif,
    nomeContribuinte: rupe.nome_contribuinte,
    codigoServico: rupe.codigo_servico,
    descricaoServico: rupe.descricao_servico,
    valor: Number(rupe.valor),
    dataEmissao: rupe.data_emissao,
    dataExpiracao: rupe.data_expiracao,
    estado: rupe.estado,
    expirada: rupe.expirada,
    numeroRecibo: rupe.numero_recibo || null,
    dataPagamento: rupe.data_pagamento,
  };
}

/**
 * Serviço cobrado ao dar entrada de um pedido deste tipo (MARCA, PATENTE, …):
 * `{ tipo, codigo, nome, valor, emolumentos }`. O backend vai buscá-lo ao
 * catálogo da API de pagamento, por isso `valor` é exactamente o que ficará
 * na RUPE.
 */
export async function obterServicoDoTipo(tipo) {
  const resposta = await api.get('/pagamentos/rupes/servico/', { params: { tipo } });
  const dados = resposta.data;
  return {
    tipo: dados.tipo,
    codigo: dados.codigo,
    nome: dados.nome,
    valor: Number(dados.valor),
    emolumentos: (dados.emolumentos ?? []).map((e) => ({ nome: e.nome, valor: Number(e.valor) })),
  };
}

/** Gera a RUPE do pedido (ou devolve a que já está em aberto). */
export async function gerarRupe(pedidoId) {
  const resposta = await api.post('/pagamentos/rupes/', { pedido: pedidoId });
  return mapearRupe(resposta.data);
}

/** Pede ao backend para confirmar na API de pagamento se a RUPE já foi paga. */
export async function sincronizarRupe(rupeId) {
  const resposta = await api.post(`/pagamentos/rupes/${rupeId}/sincronizar/`);
  return mapearRupe(resposta.data);
}

/** Mensagem legível a partir de um erro de pedido HTTP. */
export function mensagemDeErro(excecao) {
  const dados = excecao.response?.data;
  if (dados?.error) return dados.error;
  if (dados?.pedido?.[0]) return dados.pedido[0];
  if (dados?.detail) return dados.detail;
  return 'Não foi possível comunicar com o serviço de pagamento. Tente novamente.';
}
