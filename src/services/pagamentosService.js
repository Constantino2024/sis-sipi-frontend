// src/services/pagamentosService.js
import api, { isNetworkError } from './api';
import { obterPedidos, guardarPedidos } from '../data/pedidosMock';

const CHAVE_RUPES = '@sipi/rupes';

function obterRupesGuardadas() {
  const dados = localStorage.getItem(CHAVE_RUPES);
  return dados ? JSON.parse(dados) : {};
}

function guardarRupeMock(rupe) {
  const rupes = obterRupesGuardadas();
  rupes[rupe.id] = rupe;
  if (rupe.pedidoId) {
    rupes[`pedido_${rupe.pedidoId}`] = rupe;
  }
  localStorage.setItem(CHAVE_RUPES, JSON.stringify(rupes));
}

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
    dataPagamento: rupe.data_pagamento || rupe.dataPagamento,
  };
}

export async function obterServicoDoTipo(tipo) {
  try {
    const resposta = await api.get('/pagamentos/rupes/servico/', { params: { tipo } });
    const dados = resposta.data;
    return {
      tipo: dados.tipo,
      codigo: dados.codigo,
      nome: dados.nome,
      valor: Number(dados.valor),
      emolumentos: (dados.emolumentos ?? []).map((e) => ({ nome: e.nome, valor: Number(e.valor) })),
    };
  } catch (error) {
    if (isNetworkError(error)) {
      const valor = tipo === 'PATENTE' ? 50000 : tipo === 'DESENHO_INDUSTRIAL' ? 30000 : 25000;
      return {
        tipo,
        codigo: `SRV-${tipo}`,
        nome: `Taxa Oficial de Registo de ${tipo}`,
        valor,
        emolumentos: [{ nome: 'Emolumentos Gerais', valor }],
      };
    }
    throw error;
  }
}

export async function gerarRupe(pedidoId) {
  try {
    const resposta = await api.post('/pagamentos/rupes/', { pedido: pedidoId });
    return mapearRupe(resposta.data);
  } catch (error) {
    if (isNetworkError(error)) {
      const rupes = obterRupesGuardadas();
      const existente = rupes[`pedido_${pedidoId}`];
      if (existente) {
        return mapearRupe(existente);
      }

      const pedidos = obterPedidos();
      const pedido = pedidos.find((p) => p.id === Number(pedidoId));
      const valor = pedido?.tipoPropriedade === 'PATENTE' ? 50000 : 25000;

      const novaRupe = {
        id: Date.now(),
        pedidoId: Number(pedidoId),
        numeroProcesso: pedido?.numeroProcesso || `P/${new Date().getFullYear()}/${pedidoId}`,
        referencia: `${Math.floor(100000000 + Math.random() * 900000000)}`,
        nif: '009150115UE044',
        nomeContribuinte: pedido?.requerenteNome || 'Requerente Teste',
        codigoServico: 'SRV-IAPI-01',
        descricaoServico: `Pagamento de Taxa de ${pedido?.tipoPropriedade || 'Processo'}`,
        valor,
        dataEmissao: new Date().toISOString(),
        dataExpiracao: new Date(Date.now() + 30 * 86400000).toISOString(),
        estado: 'PENDENTE',
        expirada: false,
        numeroRecibo: null,
        dataPagamento: null,
      };

      guardarRupeMock(novaRupe);
      return mapearRupe(novaRupe);
    }
    throw error;
  }
}

export async function sincronizarRupe(rupeId) {
  try {
    const resposta = await api.post(`/pagamentos/rupes/${rupeId}/sincronizar/`);
    return mapearRupe(resposta.data);
  } catch (error) {
    if (isNetworkError(error)) {
      const rupes = obterRupesGuardadas();
      const rupe = rupes[rupeId] || Object.values(rupes).find((r) => r.id === Number(rupeId));

      const atualizada = {
        ...(rupe || {}),
        id: Number(rupeId),
        estado: 'PAGO',
        dataPagamento: new Date().toISOString(),
        numeroRecibo: `REC-${Date.now()}`,
      };

      guardarRupeMock(atualizada);

      // Atualizar estado de pagamento no pedido mock
      if (atualizada.pedidoId) {
        const pedidos = obterPedidos();
        const indice = pedidos.findIndex((p) => p.id === atualizada.pedidoId);
        if (indice !== -1) {
          const novoEstado = pedidos[indice].estado === 'DEPOSITADO' ? 'PAGO' : pedidos[indice].estado;
          const historico = pedidos[indice].historicoEstados || [];
          pedidos[indice] = {
            ...pedidos[indice],
            pago: true,
            estado: novoEstado,
            referenciaRupe: atualizada.referencia,
            dataPagamento: atualizada.dataPagamento,
            historicoEstados: [
              ...historico,
              {
                estado: 'PAGO',
                data: atualizada.dataPagamento,
                observacao: `Pagamento da RUPE N.º ${atualizada.referencia} confirmado via CUTE / Ministério das Finanças.`,
                autor: 'Sistema CUTE / MinFin',
              },
            ],
          };
          guardarPedidos(pedidos);
        }
      }

      return mapearRupe(atualizada);
    }
    throw error;
  }
}

export function mensagemDeErro(excecao) {
  const dados = excecao.response?.data;
  if (dados?.error) return dados.error;
  if (dados?.pedido?.[0]) return dados.pedido[0];
  if (dados?.detail) return dados.detail;
  return 'Não foi possível comunicar com o serviço de pagamento. Tente novamente.';
}
