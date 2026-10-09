// src/services/pedidosService.js
import api from './api';

const DECISAO_POR_ESTADO_PARECER = {
  PARECER_FAVORAVEL: 'FAVORAVEL',
  PARECER_DESFAVORAVEL: 'DESFAVORAVEL',
};

/** O parecer não tem tabela própria: é a entrada do histórico de estados em
 *  que o pedido passou a PARECER_*. Usa-se a mais recente. */
function derivarParecer(historico = []) {
  const registo = [...historico]
    .sort((a, b) => new Date(b.data_mudanca) - new Date(a.data_mudanca))
    .find((h) => Object.hasOwn(DECISAO_POR_ESTADO_PARECER, h.estado_novo));
  if (!registo) return null;
  return {
    decisao: DECISAO_POR_ESTADO_PARECER[registo.estado_novo],
    observacoes: registo.observacao || null,
    tecnicoId: registo.alterado_por ?? null,
    dataEmissao: registo.data_mudanca,
  };
}

// Mapear pedido do backend para o formato do frontend
function mapearPedido(pedido) {
  return {
    id: pedido.id,
    numeroProcesso: pedido.numero_processo,
    tipoPropriedade: pedido.tipo,
    titulo: pedido.titulo,
    descricao: pedido.resumo,
    requerenteId: pedido.utilizador,
    requerenteNome: pedido.utilizador_nome || pedido.utilizador_email || 'Requerente',
    estado: pedido.estado,
    dataSubmissao: pedido.data_deposito,
    dataUltimaAtualizacao: pedido.updated_at,
    tecnicoResponsavelId: pedido.tecnico_id || null,
    tecnicoNome: pedido.tecnico_nome || null,
    observacoes: pedido.parecer_final || null,
    pago: Boolean(pedido.pago),
    referenciaRupe: pedido.referencia_rup || null,
    dataPagamento: pedido.data_pagamento || null,
    exigencias: [],
    parecer: derivarParecer(pedido.historico_estados),
    documentos: [],
  };
}

export async function listarPedidosDoRequerente(requerenteId) {
  const resposta = await api.get('/pedidos/', {
    params: { utilizador: requerenteId },
  });
  return resposta.data.results.map(mapearPedido);
}

export async function listarPedidosPendentesAnalise() {
  const resposta = await api.get('/pedidos/', {
    params: { estado: 'EM_AVALIACAO' },
  });
  return resposta.data.results.map(mapearPedido);
}

export async function listarPedidosDoTecnico(tecnicoId) {
  const resposta = await api.get('/pedidos/', {
    params: { tecnico: tecnicoId },
  });
  return resposta.data.results.map(mapearPedido);
}

export async function listarTodosPedidos() {
  const resposta = await api.get('/pedidos/');
  return resposta.data.results.map(mapearPedido);
}

export async function criarPedido(dadosPedido) {
  // Garantir que utilizador não é undefined
  const utilizadorId = dadosPedido.requerenteId || dadosPedido.utilizador;
  
  const resposta = await api.post('/pedidos/', {
    titulo: dadosPedido.titulo,
    resumo: dadosPedido.descricao || '',
    tipo: dadosPedido.tipoPropriedade,
    utilizador: utilizadorId,
  });
  return mapearPedido(resposta.data);
}

export async function obterPedidoPorId(pedidoId) {
  const resposta = await api.get(`/pedidos/${pedidoId}/`);
  return mapearPedido(resposta.data);
}

export async function atualizarPedido(pedidoId, dadosNovos) {
  const resposta = await api.patch(`/pedidos/${pedidoId}/`, {
    titulo: dadosNovos.titulo,
    resumo: dadosNovos.descricao || '',
  });
  return mapearPedido(resposta.data);
}

export async function removerPedido(pedidoId) {
  await api.delete(`/pedidos/${pedidoId}/`);
  return { sucesso: true };
}

export async function mudarEstado(pedidoId, novoEstado, observacao = '') {
  const resposta = await api.post(`/pedidos/${pedidoId}/mudar_estado/`, {
    estado: novoEstado,
    observacao,
  });
  return mapearPedido(resposta.data);
}

/** "2026-10-15" → "15/10/2026" (sem passar por Date, para não deslocar o dia por fuso). */
function formatarPrazo(prazoIso) {
  const [ano, mes, dia] = prazoIso.split('-');
  return `${dia}/${mes}/${ano}`;
}

/**
 * Técnico emite uma exigência: o pedido passa a AGUARDA_CORRECAO e o texto
 * (com o prazo) fica no histórico, visível ao requerente.
 * Quem emite é o utilizador autenticado — o backend regista-o no histórico.
 */
export async function registarExigencia(pedidoId, { descricao, prazo }) {
  return mudarEstado(
    pedidoId,
    'AGUARDA_CORRECAO',
    `Exigência (prazo de resposta: ${formatarPrazo(prazo)}): ${descricao.trim()}`
  );
}

/**
 * Técnico emite o parecer depois do exame. `decisao` é 'FAVORAVEL' ou
 * 'DESFAVORAVEL'. A checklist é obrigatória na interface (todos os critérios
 * marcados) e não é guardada; ficam registadas a decisão e as observações.
 */
export async function registarParecer(pedidoId, { decisao, observacoes }) {
  const estado = decisao === 'FAVORAVEL' ? 'PARECER_FAVORAVEL' : 'PARECER_DESFAVORAVEL';
  return mudarEstado(pedidoId, estado, observacoes?.trim() ?? '');
}

/**
 * Confirma a decisão final de um pedido que já tem parecer:
 * parecer favorável → DEFERIDO, desfavorável → INDEFERIDO.
 * Vai buscar o estado ao servidor em vez de confiar no que a página mostra.
 */
export async function deferirPedido(pedidoId) {
  const pedido = await obterPedidoPorId(pedidoId);
  if (!Object.hasOwn(DECISAO_POR_ESTADO_PARECER, pedido.estado)) {
    throw new Error('Só é possível decidir um pedido que já tenha parecer emitido.');
  }
  const final = pedido.estado === 'PARECER_FAVORAVEL' ? 'DEFERIDO' : 'INDEFERIDO';
  return mudarEstado(pedidoId, final, 'Decisão final confirmada pelo técnico.');
}

export async function aceitarPedido(pedidoId, observacao = '') {
  const resposta = await api.post(`/pedidos/${pedidoId}/aceitar/`, {
    observacao,
  });
  return mapearPedido(resposta.data);
}

export async function rejeitarPedido(pedidoId, observacao) {
  const resposta = await api.post(`/pedidos/${pedidoId}/rejeitar/`, {
    observacao,
  });
  return mapearPedido(resposta.data);
}

export async function atribuirTecnico(pedidoId, tecnicoId) {
  const resposta = await api.post(`/pedidos/${pedidoId}/atribuir_tecnico/`, {
    tecnico_id: tecnicoId,
  });
  return mapearPedido(resposta.data);
}

export async function obterHistorico(pedidoId) {
  const resposta = await api.get(`/pedidos/${pedidoId}/historico/`);
  return resposta.data;
}

export async function listarMarcas(params = {}) {
  const resposta = await api.get('/pedidos/marcas/', { params });
  return resposta.data.results;
}

export async function listarPatentes(params = {}) {
  const resposta = await api.get('/pedidos/patentes/', { params });
  return resposta.data.results;
}

export async function listarDesenhos(params = {}) {
  const resposta = await api.get('/pedidos/desenhos/', { params });
  return resposta.data.results;
}