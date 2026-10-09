// src/services/mocks/notificacoesMock.js

import { obterNotificacoes, guardarNotificacoes } from '../../data/notificacoesMock';

function atrasoDeRede(dados, duracaoMs = 300) {
  return new Promise((resolve) => setTimeout(() => resolve(dados), duracaoMs));
}

/** Usado pela página de Notificações do Requerente. */
export async function listarPorRequerenteMock(requerenteId) {
  const notificacoes = obterNotificacoes().filter((n) => n.requerenteId === requerenteId);
  return atrasoDeRede(notificacoes);
}

function alterarEstadoLeituraMock(notificacaoId, lida) {
  const notificacoes = obterNotificacoes();
  const indice = notificacoes.findIndex((n) => n.id === notificacaoId);
  if (indice === -1) throw new Error('Notificação não encontrada.');

  notificacoes[indice] = { ...notificacoes[indice], lida };
  guardarNotificacoes(notificacoes);
  return atrasoDeRede(notificacoes[indice]);
}

export async function marcarComoLidaMock(notificacaoId) {
  return alterarEstadoLeituraMock(notificacaoId, true);
}

export async function marcarComoNaoLidaMock(notificacaoId) {
  return alterarEstadoLeituraMock(notificacaoId, false);
}