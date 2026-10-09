// src/services/mocks/pedidosMock.js

import { obterPedidos, guardarPedidos } from '../../data/pedidosMock';
import { gerarNumeroProcesso, calcularProximoSequencial } from '../../utilitarios/numeroProcesso';
import { podeEditarOuEliminar } from '../../utilitarios/estadosPedido';

function atrasoDeRede(dados, duracaoMs = 300) {
  return new Promise((resolve) => setTimeout(() => resolve(dados), duracaoMs));
}

/** Usado pela dashboard do Requerente: só os pedidos dele. */
export async function listarPorRequerenteMock(requerenteId) {
  const pedidos = obterPedidos().filter((p) => p.requerenteId === requerenteId);
  return atrasoDeRede(pedidos);
}

/** Usado pela dashboard do Técnico: fila de trabalho (não decididos ainda). */
export async function listarPendentesAnaliseMock() {
  const pendentes = obterPedidos().filter(
    (p) => p.estado === 'SUBMETIDO' || p.estado === 'EM_ANALISE' || p.estado === 'EXIGENCIA_EMITIDA'
  );
  return atrasoDeRede(pendentes);
}

/** Usado por "Meus Processos", "Exigências" e "Pareceres" do Técnico:
 *  todos os pedidos atribuídos a esse técnico, independentemente do estado. */
export async function listarPorTecnicoMock(tecnicoId) {
  const pedidos = obterPedidos().filter((p) => p.tecnicoResponsavelId === tecnicoId);
  return atrasoDeRede(pedidos);
}

/** Usado pela dashboard do Administrador: visão total do sistema. */
export async function listarTodosMock() {
  return atrasoDeRede(obterPedidos());
}

/** Atualização genérica de estado (usada por transições simples, ex: atribuir técnico). */
export async function atualizarEstadoMock(pedidoId, novoEstado, tecnicoId, observacoes) {
  const pedidos = obterPedidos();
  const indice = pedidos.findIndex((p) => p.id === pedidoId);
  if (indice === -1) throw new Error('Pedido não encontrado.');

  pedidos[indice] = {
    ...pedidos[indice],
    estado: novoEstado,
    tecnicoResponsavelId: tecnicoId,
    observacoes: observacoes ?? pedidos[indice].observacoes,
    dataUltimaAtualizacao: new Date().toISOString(),
  };
  guardarPedidos(pedidos);
  return atrasoDeRede(pedidos[indice]);
}

/** Técnico emite uma exigência: acrescenta ao histórico e move o estado. */
export async function registarExigenciaMock(pedidoId, { descricao, prazo }, tecnicoId) {
  const pedidos = obterPedidos();
  const indice = pedidos.findIndex((p) => p.id === pedidoId);
  if (indice === -1) throw new Error('Pedido não encontrado.');

  const exigenciasAtuais = pedidos[indice].exigencias ?? [];
  const novoId = exigenciasAtuais.length > 0
    ? Math.max(...exigenciasAtuais.map((e) => e.id)) + 1
    : 1;

  const novaExigencia = {
    id: novoId,
    descricao,
    prazo,
    dataEmissao: new Date().toISOString(),
    tecnicoId,
    respondida: false,
  };

  pedidos[indice] = {
    ...pedidos[indice],
    estado: 'EXIGENCIA_EMITIDA',
    exigencias: [...exigenciasAtuais, novaExigencia],
    dataUltimaAtualizacao: new Date().toISOString(),
  };
  guardarPedidos(pedidos);
  return atrasoDeRede(pedidos[indice]);
}

/** Técnico emite parecer (favorável/desfavorável) depois do exame. */
export async function registarParecerMock(pedidoId, { criterios, decisao, observacoes }, tecnicoId) {
  const pedidos = obterPedidos();
  const indice = pedidos.findIndex((p) => p.id === pedidoId);
  if (indice === -1) throw new Error('Pedido não encontrado.');

  const novoEstado = decisao === 'FAVORAVEL' ? 'PARECER_FAVORAVEL' : 'PARECER_DESFAVORAVEL';

  pedidos[indice] = {
    ...pedidos[indice],
    estado: novoEstado,
    parecer: {
      criterios,
      decisao,
      observacoes: observacoes ?? null,
      tecnicoId,
      dataEmissao: new Date().toISOString(),
    },
    dataUltimaAtualizacao: new Date().toISOString(),
  };
  guardarPedidos(pedidos);
  return atrasoDeRede(pedidos[indice]);
}

/** Técnico confirma a decisão final, depois de já existir parecer.
 *  Transição manual e explícita — não acontece automaticamente ao
 *  emitir o parecer. */
export async function deferirPedidoMock(pedidoId) {
  const pedidos = obterPedidos();
  const indice = pedidos.findIndex((p) => p.id === pedidoId);
  if (indice === -1) throw new Error('Pedido não encontrado.');

  const estadoAtual = pedidos[indice].estado;
  if (estadoAtual !== 'PARECER_FAVORAVEL' && estadoAtual !== 'PARECER_DESFAVORAVEL') {
    throw new Error('Só é possível decidir um pedido que já tenha parecer emitido.');
  }

  const novoEstado = estadoAtual === 'PARECER_FAVORAVEL' ? 'DEFERIDO' : 'INDEFERIDO';

  pedidos[indice] = {
    ...pedidos[indice],
    estado: novoEstado,
    dataUltimaAtualizacao: new Date().toISOString(),
  };
  guardarPedidos(pedidos);
  return atrasoDeRede(pedidos[indice]);
}

/** Requerente submete um novo pedido. Gera número de processo e ID automaticamente. */
export async function criarPedidoMock(dadosPedido) {
  const pedidos = obterPedidos();
  const ano = new Date().getFullYear();
  const sequencial = calcularProximoSequencial(pedidos, dadosPedido.tipoPropriedade, ano);
  const numeroProcesso = gerarNumeroProcesso(dadosPedido.tipoPropriedade, ano, sequencial);
  const novoId = pedidos.length > 0 ? Math.max(...pedidos.map((p) => p.id)) + 1 : 1;
  const agora = new Date().toISOString();

  const novoPedido = {
    id: novoId,
    numeroProcesso,
    tipoPropriedade: dadosPedido.tipoPropriedade,
    titulo: dadosPedido.titulo,
    descricao: dadosPedido.descricao ?? null,
    documentos: dadosPedido.documentos ?? [],
    requerenteId: dadosPedido.requerenteId,
    requerenteNome: dadosPedido.requerenteNome,
    estado: 'SUBMETIDO',
    dataSubmissao: agora,
    dataUltimaAtualizacao: agora,
    tecnicoResponsavelId: null,
    observacoes: null,
    exigencias: [],
    parecer: null,
  };

  guardarPedidos([...pedidos, novoPedido]);
  return atrasoDeRede(novoPedido);
}

export async function obterPedidoPorIdMock(pedidoId) {
  const pedido = obterPedidos().find((p) => p.id === pedidoId);
  if (!pedido) throw new Error('Pedido não encontrado.');
  return atrasoDeRede(pedido);
}

export async function removerPedidoMock(pedidoId) {
  const pedidos = obterPedidos();
  const pedido = pedidos.find((p) => p.id === pedidoId);
  if (!pedido) throw new Error('Pedido não encontrado.');
  if (!podeEditarOuEliminar(pedido.estado)) {
    throw new Error('Este pedido já não pode ser eliminado devido ao seu estado atual.');
  }
  guardarPedidos(pedidos.filter((p) => p.id !== pedidoId));
  return atrasoDeRede({ sucesso: true });
}

export async function atualizarPedidoMock(pedidoId, dadosNovos) {
  const pedidos = obterPedidos();
  const indice = pedidos.findIndex((p) => p.id === pedidoId);
  if (indice === -1) throw new Error('Pedido não encontrado.');
  if (!podeEditarOuEliminar(pedidos[indice].estado)) {
    throw new Error('Este pedido já não pode ser editado devido ao seu estado atual.');
  }

  pedidos[indice] = {
    ...pedidos[indice],
    ...dadosNovos,
    dataUltimaAtualizacao: new Date().toISOString(),
  };
  guardarPedidos(pedidos);
  return atrasoDeRede(pedidos[indice]);
}