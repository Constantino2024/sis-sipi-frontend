// src/services/pagamentosService.js
import api, { extrairMensagemErro } from './api';

function mapearRupe(rupe) {
  if (!rupe) return null;
  return {
    id: rupe.id,
    pedidoId: rupe.pedido || rupe.pedidoId,
    numeroProcesso: rupe.pedido_numero_processo || rupe.numeroProcesso,
    referencia: rupe.referencia,
    nif: rupe.nif,
    nomeContribuinte: rupe.nome_contribuinte || rupe.nomeContribuinte,
    codigoServico: rupe.codigo_servico || rupe.codigoServico,
    descricaoServico: rupe.descricao_servico || rupe.descricaoServico,
    valor: Number(rupe.valor),
    dataEmissao: rupe.data_emissao || rupe.dataEmissao,
    dataExpiracao: rupe.data_expiracao || rupe.dataExpiracao,
    estado: rupe.estado,
    expirada: Boolean(rupe.expirada),
    numeroRecibo: rupe.numero_recibo || rupe.numeroRecibo || null,
    dataPagamento: rupe.data_pagamento || rupe.dataPagamento || null,
  };
}

/**
 * Consulta a taxa e emolumentos oficiais de um serviço junto do back-end.
 */
export async function obterServicoDoTipo(tipo) {
  const resposta = await api.get('/pagamentos/rupes/servico/', { params: { tipo } });
  const dados = resposta.data;
  return {
    tipo: dados.tipo,
    codigo: dados.codigo,
    nome: dados.nome,
    valor: Number(dados.valor),
    emolumentos: (dados.emolumentos ?? []).map((e) => ({
      nome: e.nome,
      valor: Number(e.valor),
    })),
  };
}

/**
 * Emite a RUPE de pagamento para um determinado processo no back-end.
 */
export async function gerarRupe(pedidoId) {
  const resposta = await api.post('/pagamentos/rupes/', { pedido: pedidoId });
  return mapearRupe(resposta.data);
}

/**
 * Consulta e sincroniza a liquidação da RUPE junto do sistema CUTE/MinFin via back-end.
 */
export async function sincronizarRupe(rupeId) {
  const resposta = await api.post(`/pagamentos/rupes/${rupeId}/sincronizar/`);
  return mapearRupe(resposta.data);
}

export function mensagemDeErro(excecao) {
  return extrairMensagemErro(excecao, 'Não foi possível comunicar com o serviço de pagamento. Tente novamente.');
}
