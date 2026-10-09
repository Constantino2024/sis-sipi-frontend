// src/services/notificacoesService.js
import api, { isNetworkError } from './api';
import {
  listarPorRequerenteMock,
  marcarComoLidaMock,
  marcarComoNaoLidaMock,
} from './mocks/notificacoesMock';
import { obterNotificacoes } from '../data/notificacoesMock';

// Mapear notificação do backend para o formato do frontend
function mapearNotificacao(n) {
  if (!n) return null;
  return {
    id: n.id,
    requerenteId: n.utilizador || n.requerenteId,
    tipo: n.tipo || 'ATUALIZACAO',
    titulo: n.titulo || 'Notificação do Sistema',
    descricao: n.mensagem || n.descricao,
    data: n.data_envio || n.data,
    lida: Boolean(n.lida),
  };
}

export async function listarNotificacoesDoRequerente(requerenteId) {
  try {
    const resposta = await api.get('/notificacoes/', {
      params: { utilizador: requerenteId },
    });
    return resposta.data.results.map(mapearNotificacao);
  } catch (error) {
    if (isNetworkError(error)) {
      const mockResult = await listarPorRequerenteMock(requerenteId);
      return mockResult.map(mapearNotificacao);
    }
    throw error;
  }
}

export async function marcarNotificacaoComoLida(notificacaoId) {
  try {
    const resposta = await api.patch(`/notificacoes/${notificacaoId}/`, {
      lida: true,
    });
    return mapearNotificacao(resposta.data);
  } catch (error) {
    if (isNetworkError(error)) {
      const mockResult = await marcarComoLidaMock(notificacaoId);
      return mapearNotificacao(mockResult);
    }
    throw error;
  }
}

export async function marcarNotificacaoComoNaoLida(notificacaoId) {
  try {
    const resposta = await api.patch(`/notificacoes/${notificacaoId}/`, {
      lida: false,
    });
    return mapearNotificacao(resposta.data);
  } catch (error) {
    if (isNetworkError(error)) {
      const mockResult = await marcarComoNaoLidaMock(notificacaoId);
      return mapearNotificacao(mockResult);
    }
    throw error;
  }
}

export async function contarNaoLidas() {
  try {
    const resposta = await api.get('/notificacoes/nao_lidas/');
    return resposta.data;
  } catch (error) {
    if (isNetworkError(error)) {
      const list = obterNotificacoes() || [];
      const naoLidas = list.filter((n) => !n.lida).length;
      return { total: naoLidas, count: naoLidas };
    }
    throw error;
  }
}