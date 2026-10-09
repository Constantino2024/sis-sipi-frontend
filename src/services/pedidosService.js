// src/services/pedidosService.js
import api, { isNetworkError } from './api';
import {
  listarPorRequerenteMock,
  listarPendentesAnaliseMock,
  listarPorTecnicoMock,
  listarTodosMock,
  criarPedidoMock,
  obterPedidoPorIdMock,
  atualizarPedidoMock,
  removerPedidoMock,
  atualizarEstadoMock,
  registarExigenciaMock,
  registarParecerMock,
  deferirPedidoMock,
  avancarFluxoIapiMock,
} from './mocks/pedidosMock';
import { obterPedidos } from '../data/pedidosMock';

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
    referenciaRupe: pedido.referencia_rup || pedido.referenciaRupe || null,
    dataPagamento: pedido.data_pagamento || pedido.dataPagamento || null,
    exigencias: pedido.exigencias || [],
    parecer: pedido.parecer || derivarParecer(pedido.historico_estados),
    documentos: pedido.documentos || [],
    detalhesMarca: pedido.detalhesMarca || null,
    classesNice: pedido.classesNice || [],
    titular: pedido.titular || null,
    taxas: pedido.taxas || null,
    documentosAnexados: pedido.documentosAnexados || [],
    historicoEstados: pedido.historicoEstados || [],
    certificado: pedido.certificado || null,
  };
}

export async function listarPedidosDoRequerente(requerenteId) {
  try {
    const resposta = await api.get('/pedidos/', {
      params: { utilizador: requerenteId },
    });
    return resposta.data.results.map(mapearPedido);
  } catch (error) {
    if (isNetworkError(error)) {
      const mockResult = await listarPorRequerenteMock(requerenteId);
      return mockResult.map(mapearPedido);
    }
    throw error;
  }
}

export async function listarPedidosPendentesAnalise() {
  try {
    const resposta = await api.get('/pedidos/', {
      params: { estado: 'EM_AVALIACAO' },
    });
    return resposta.data.results.map(mapearPedido);
  } catch (error) {
    if (isNetworkError(error)) {
      const mockResult = await listarPendentesAnaliseMock();
      return mockResult.map(mapearPedido);
    }
    throw error;
  }
}

export async function listarPedidosDoTecnico(tecnicoId) {
  try {
    const resposta = await api.get('/pedidos/', {
      params: { tecnico: tecnicoId },
    });
    return resposta.data.results.map(mapearPedido);
  } catch (error) {
    if (isNetworkError(error)) {
      const mockResult = await listarPorTecnicoMock(tecnicoId);
      return mockResult.map(mapearPedido);
    }
    throw error;
  }
}

export async function listarTodosPedidos() {
  try {
    const resposta = await api.get('/pedidos/');
    return resposta.data.results.map(mapearPedido);
  } catch (error) {
    if (isNetworkError(error)) {
      const mockResult = await listarTodosMock();
      return mockResult.map(mapearPedido);
    }
    throw error;
  }
}

export async function criarPedido(dadosPedido) {
  try {
    const utilizadorId = dadosPedido.requerenteId || dadosPedido.utilizador;
    const resposta = await api.post('/pedidos/', {
      titulo: dadosPedido.titulo,
      resumo: dadosPedido.descricao || '',
      tipo: dadosPedido.tipoPropriedade,
      utilizador: utilizadorId,
    });
    return mapearPedido(resposta.data);
  } catch (error) {
    if (isNetworkError(error)) {
      const mockResult = await criarPedidoMock(dadosPedido);
      return mapearPedido(mockResult);
    }
    throw error;
  }
}

export async function obterPedidoPorId(pedidoId) {
  try {
    const resposta = await api.get(`/pedidos/${pedidoId}/`);
    return mapearPedido(resposta.data);
  } catch (error) {
    if (isNetworkError(error)) {
      const mockResult = await obterPedidoPorIdMock(Number(pedidoId));
      return mapearPedido(mockResult);
    }
    throw error;
  }
}

export async function atualizarPedido(pedidoId, dadosNovos) {
  try {
    const resposta = await api.patch(`/pedidos/${pedidoId}/`, {
      titulo: dadosNovos.titulo,
      resumo: dadosNovos.descricao || '',
    });
    return mapearPedido(resposta.data);
  } catch (error) {
    if (isNetworkError(error)) {
      const mockResult = await atualizarPedidoMock(Number(pedidoId), dadosNovos);
      return mapearPedido(mockResult);
    }
    throw error;
  }
}

export async function removerPedido(pedidoId) {
  try {
    await api.delete(`/pedidos/${pedidoId}/`);
    return { sucesso: true };
  } catch (error) {
    if (isNetworkError(error)) {
      return await removerPedidoMock(Number(pedidoId));
    }
    throw error;
  }
}

export async function mudarEstado(pedidoId, novoEstado, observacao = '') {
  try {
    const resposta = await api.post(`/pedidos/${pedidoId}/mudar_estado/`, {
      estado: novoEstado,
      observacao,
    });
    return mapearPedido(resposta.data);
  } catch (error) {
    if (isNetworkError(error)) {
      const mockResult = await atualizarEstadoMock(Number(pedidoId), novoEstado, null, observacao);
      return mapearPedido(mockResult);
    }
    throw error;
  }
}

function formatarPrazo(prazoIso) {
  if (!prazoIso) return '';
  const [ano, mes, dia] = prazoIso.split('-');
  return `${dia}/${mes}/${ano}`;
}

export async function registarExigencia(pedidoId, { descricao, prazo }) {
  try {
    return await mudarEstado(
      pedidoId,
      'AGUARDA_CORRECAO',
      `Exigência (prazo de resposta: ${formatarPrazo(prazo)}): ${descricao.trim()}`
    );
  } catch (error) {
    if (isNetworkError(error)) {
      const mockResult = await registarExigenciaMock(Number(pedidoId), { descricao, prazo });
      return mapearPedido(mockResult);
    }
    throw error;
  }
}

export async function registarParecer(pedidoId, { decisao, observacoes }) {
  try {
    const estado = decisao === 'FAVORAVEL' ? 'PARECER_FAVORAVEL' : 'PARECER_DESFAVORAVEL';
    return await mudarEstado(pedidoId, estado, observacoes?.trim() ?? '');
  } catch (error) {
    if (isNetworkError(error)) {
      const mockResult = await registarParecerMock(Number(pedidoId), { decisao, observacoes });
      return mapearPedido(mockResult);
    }
    throw error;
  }
}

export async function deferirPedido(pedidoId) {
  try {
    const pedido = await obterPedidoPorId(pedidoId);
    if (!Object.hasOwn(DECISAO_POR_ESTADO_PARECER, pedido.estado)) {
      throw new Error('Só é possível decidir um pedido que já tenha parecer emitido.');
    }
    const final = pedido.estado === 'PARECER_FAVORAVEL' ? 'DEFERIDO' : 'INDEFERIDO';
    return await mudarEstado(pedidoId, final, 'Decisão final confirmada pelo técnico.');
  } catch (error) {
    if (isNetworkError(error)) {
      const mockResult = await deferirPedidoMock(Number(pedidoId));
      return mapearPedido(mockResult);
    }
    throw error;
  }
}

export async function aceitarPedido(pedidoId, observacao = '') {
  try {
    const resposta = await api.post(`/pedidos/${pedidoId}/aceitar/`, {
      observacao,
    });
    return mapearPedido(resposta.data);
  } catch (error) {
    if (isNetworkError(error)) {
      const mockResult = await atualizarEstadoMock(Number(pedidoId), 'EM_AVALIACAO', null, observacao);
      return mapearPedido(mockResult);
    }
    throw error;
  }
}

export async function rejeitarPedido(pedidoId, observacao) {
  try {
    const resposta = await api.post(`/pedidos/${pedidoId}/rejeitar/`, {
      observacao,
    });
    return mapearPedido(resposta.data);
  } catch (error) {
    if (isNetworkError(error)) {
      const mockResult = await atualizarEstadoMock(Number(pedidoId), 'INDEFERIDO', null, observacao);
      return mapearPedido(mockResult);
    }
    throw error;
  }
}

export async function atribuirTecnico(pedidoId, tecnicoId) {
  try {
    const resposta = await api.post(`/pedidos/${pedidoId}/atribuir_tecnico/`, {
      tecnico_id: tecnicoId,
    });
    return mapearPedido(resposta.data);
  } catch (error) {
    if (isNetworkError(error)) {
      const mockResult = await atualizarEstadoMock(Number(pedidoId), 'EM_ANALISE', tecnicoId, 'Técnico atribuído');
      return mapearPedido(mockResult);
    }
    throw error;
  }
}

export async function obterHistorico(pedidoId) {
  try {
    const resposta = await api.get(`/pedidos/${pedidoId}/historico/`);
    return resposta.data;
  } catch (error) {
    if (isNetworkError(error)) {
      return [
        {
          id: 1,
          estado_anterior: null,
          estado_novo: 'SUBMETIDO',
          data_mudanca: new Date().toISOString(),
          observacao: 'Pedido submetido com sucesso.',
        },
      ];
    }
    throw error;
  }
}

export async function listarMarcas(params = {}) {
  try {
    const resposta = await api.get('/pedidos/marcas/', { params });
    return resposta.data.results;
  } catch (error) {
    if (isNetworkError(error)) {
      return obterPedidos().filter((p) => p.tipoPropriedade === 'MARCA');
    }
    throw error;
  }
}

export async function listarPatentes(params = {}) {
  try {
    const resposta = await api.get('/pedidos/patentes/', { params });
    return resposta.data.results;
  } catch (error) {
    if (isNetworkError(error)) {
      return obterPedidos().filter((p) => p.tipoPropriedade === 'PATENTE');
    }
    throw error;
  }
}

export async function listarDesenhos(params = {}) {
  try {
    const resposta = await api.get('/pedidos/desenhos/', { params });
    return resposta.data.results;
  } catch (error) {
    if (isNetworkError(error)) {
      return obterPedidos().filter((p) => p.tipoPropriedade === 'DESENHO_INDUSTRIAL');
    }
    throw error;
  }
}

export async function avancarFluxoIapi(pedidoId, proximoEstado, detalhes = {}) {
  try {
    const resposta = await api.post(`/pedidos/${pedidoId}/avancar_fluxo/`, {
      estado: proximoEstado,
      ...detalhes,
    });
    return mapearPedido(resposta.data);
  } catch (error) {
    if (isNetworkError(error)) {
      const mockResult = await avancarFluxoIapiMock(Number(pedidoId), proximoEstado, detalhes);
      return mapearPedido(mockResult);
    }
    throw error;
  }
}