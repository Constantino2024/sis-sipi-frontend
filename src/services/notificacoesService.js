// src/services/notificacoesService.js
import api from './api';

// Mapear notificação do backend para o formato do frontend
function mapearNotificacao(n) {
  return {
    id: n.id,
    requerenteId: n.utilizador,
    tipo: 'ATUALIZACAO',
    titulo: 'Notificação do Sistema',
    descricao: n.mensagem,
    data: n.data_envio,
    lida: n.lida,
  };
}

export async function listarNotificacoesDoRequerente(requerenteId) {
  const resposta = await api.get('/notificacoes/', {
    params: { utilizador: requerenteId },
  });
  return resposta.data.results.map(mapearNotificacao);
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