// src/services/notificacoesService.js
import api from './api';

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

function extrairLista(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

export async function listarNotificacoesDoRequerente(requerenteId) {
  const resposta = await api.get('/notificacoes/', {
    params: { utilizador: requerenteId },
  });
  return extrairLista(resposta.data).map(mapearNotificacao);
}

export async function marcarNotificacaoComoLida(notificacaoId) {
  const resposta = await api.patch(`/notificacoes/${notificacaoId}/`, {
    lida: true,
  });
  return mapearNotificacao(resposta.data);
}

export async function marcarNotificacaoComoNaoLida(notificacaoId) {
  const resposta = await api.patch(`/notificacoes/${notificacaoId}/`, {
    lida: false,
  });
  return mapearNotificacao(resposta.data);
}

export async function contarNaoLidas() {
  const resposta = await api.get('/notificacoes/nao_lidas/');
  return resposta.data;
}