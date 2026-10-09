// src/services/pedidosService.js
import api from './api';

const DECISAO_POR_ESTADO_PARECER = {
  PARECER_FAVORAVEL: 'FAVORAVEL',
  PARECER_DESFAVORAVEL: 'DESFAVORAVEL',
};

function formatarPrazo(prazoIso) {
  if (!prazoIso) return '';
  const [ano, mes, dia] = prazoIso.split('-');
  return `${dia}/${mes}/${ano}`;
}

function derivarParecer(historico = []) {
  const registo = [...(historico || [])]
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

// Mapear pedido do back-end para o formato utilizado pelo front-end
function mapearPedido(pedido) {
  if (!pedido) return null;
  return {
    id: pedido.id,
    numeroProcesso: pedido.numero_processo || pedido.numeroProcesso,
    tipoPropriedade: pedido.tipo || pedido.tipoPropriedade,
    titulo: pedido.titulo,
    descricao: pedido.resumo || pedido.descricao || '',
    requerenteId: pedido.utilizador || pedido.requerenteId,
    requerenteNome: pedido.utilizador_nome || pedido.utilizador_email || pedido.requerenteNome || 'Requerente',
    estado: pedido.estado,
    dataSubmissao: pedido.data_deposito || pedido.dataSubmissao || new Date().toISOString(),
    dataUltimaAtualizacao: pedido.updated_at || pedido.dataUltimaAtualizacao || new Date().toISOString(),
    tecnicoResponsavelId: pedido.tecnico_id || pedido.tecnicoResponsavelId || null,
    tecnicoNome: pedido.tecnico_nome || pedido.tecnicoNome || null,
    observacoes: pedido.parecer_final || pedido.observacoes || null,
    pago: Boolean(pedido.pago),
    referenciaRupe: pedido.referencia_rup || pedido.referencia_rupe || pedido.referenciaRupe || null,
    dataPagamento: pedido.data_pagamento || pedido.dataPagamento || null,
    exigencias: pedido.exigencias || [],
    parecer: pedido.parecer || derivarParecer(pedido.historico_estados),
    documentos: pedido.documentos || [],
    detalhesMarca: pedido.detalhesMarca || pedido.detalhes_marca || null,
    classesNice: pedido.classesNice || pedido.classes_nice || [],
    titular: pedido.titular || null,
    taxas: pedido.taxas || null,
    documentosAnexados: pedido.documentosAnexados || pedido.documentos_anexados || [],
    historicoEstados: pedido.historicoEstados || pedido.historico_estados || [],
    certificado: pedido.certificado || null,
  };
}

function extrairLista(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

export async function listarPedidosDoRequerente(requerenteId) {
  const resposta = await api.get('/pedidos/', {
    params: { utilizador: requerenteId },
  });
  return extrairLista(resposta.data).map(mapearPedido);
}

export async function listarPedidosPendentesAnalise() {
  const resposta = await api.get('/pedidos/', {
    params: { estado: 'EM_AVALIACAO' },
  });
  return extrairLista(resposta.data).map(mapearPedido);
}

export const listarPedidosParaAnalise = listarPedidosPendentesAnalise;

export async function listarPedidosDoTecnico(tecnicoId) {
  const resposta = await api.get('/pedidos/', {
    params: { tecnico: tecnicoId },
  });
  return extrairLista(resposta.data).map(mapearPedido);
}

export async function listarTodosPedidos() {
  const resposta = await api.get('/pedidos/');
  return extrairLista(resposta.data).map(mapearPedido);
}

export async function criarPedido(dadosPedido) {
  const utilizadorId = dadosPedido.requerenteId || dadosPedido.utilizador;
  const corpo = {
    titulo: dadosPedido.titulo,
    resumo: dadosPedido.descricao || '',
    tipo: dadosPedido.tipoPropriedade,
    utilizador: utilizadorId,
    detalhes_marca: dadosPedido.detalhesMarca,
    classes_nice: dadosPedido.classesNice,
    titular: dadosPedido.titular,
    taxas: dadosPedido.taxas,
  };
  const resposta = await api.post('/pedidos/', corpo);
  return mapearPedido(resposta.data);
}

export async function obterPedidoPorId(pedidoId) {
  const resposta = await api.get(`/pedidos/${pedidoId}/`);
  return mapearPedido(resposta.data);
}

export async function atualizarPedido(pedidoId, dadosNovos) {
  const resposta = await api.patch(`/pedidos/${pedidoId}/`, {
    titulo: dadosNovos.titulo,
    resumo: dadosNovos.descricao || dadosNovos.resumo || '',
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

export async function registarExigencia(pedidoId, { descricao, prazo }) {
  return await mudarEstado(
    pedidoId,
    'AGUARDA_CORRECAO',
    `Exigência (prazo de resposta: ${formatarPrazo(prazo)}): ${descricao.trim()}`
  );
}

export async function registarParecer(pedidoId, { decisao, observacoes }) {
  const estado = decisao === 'FAVORAVEL' ? 'PARECER_FAVORAVEL' : 'PARECER_DESFAVORAVEL';
  return await mudarEstado(pedidoId, estado, observacoes?.trim() ?? '');
}

export async function deferirPedido(pedidoId) {
  const pedido = await obterPedidoPorId(pedidoId);
  if (!Object.hasOwn(DECISAO_POR_ESTADO_PARECER, pedido.estado)) {
    throw new Error('Só é possível decidir um pedido que já tenha parecer emitido.');
  }
  const final = pedido.estado === 'PARECER_FAVORAVEL' ? 'DEFERIDO' : 'INDEFERIDO';
  return await mudarEstado(pedidoId, final, 'Decisão final confirmada pelo técnico.');
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
  return extrairLista(resposta.data);
}

export async function listarMarcas(params = {}) {
  const resposta = await api.get('/pedidos/marcas/', { params });
  return extrairLista(resposta.data).map(mapearPedido);
}

export async function listarPatentes(params = {}) {
  const resposta = await api.get('/pedidos/patentes/', { params });
  return extrairLista(resposta.data).map(mapearPedido);
}

export async function listarDesenhos(params = {}) {
  const resposta = await api.get('/pedidos/desenhos/', { params });
  return extrairLista(resposta.data).map(mapearPedido);
}

export async function avancarFluxoIapi(pedidoId, proximoEstado, detalhes = {}) {
  const resposta = await api.post(`/pedidos/${pedidoId}/avancar_fluxo/`, {
    estado: proximoEstado,
    ...detalhes,
  });
  return mapearPedido(resposta.data);
}