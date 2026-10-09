// src/services/consultaPublicaService.js
import api, { isNetworkError } from './api';
import { obterPedidos } from '../data/pedidosMock';

const LABELS_TIPO = {
  MARCA: 'Marca',
  PATENTE: 'Patente de Invenção',
  DESENHO_INDUSTRIAL: 'Desenho Industrial',
  MODELO_UTILIDADE: 'Modelo de Utilidade',
};

const LABELS_ESTADO = {
  SUBMETIDO: 'Submetido',
  EM_AVALIACAO: 'Em Avaliação',
  EM_ANALISE: 'Em Exame',
  AGUARDA_CORRECAO: 'Aguarda Correção',
  EXIGENCIA_EMITIDA: 'Exigência Emitida',
  PARECER_FAVORAVEL: 'Parecer Favorável',
  PARECER_DESFAVORAVEL: 'Parecer Desfavorável',
  DEFERIDO: 'Concedido',
  INDEFERIDO: 'Indeferido',
};

/**
 * Pesquisa pública de processos (publicados, em oposição ou concedidos).
 * GET /api/publico/pesquisa/?termo=&tipo= — sem autenticação, máximo 100
 * resultados, só dados públicos (RB05/RB06).
 */
export async function pesquisarRegistosPublicos({ termo = '', tipo = '' } = {}) {
  const params = {};
  if (termo.trim()) params.termo = termo.trim();
  if (tipo) params.tipo = tipo;

  try {
    const resposta = await api.get('/publico/pesquisa/', { params });
    const { total, limite, results } = resposta.data;

    return {
      total,
      limite,
      resultados: results.map((r) => ({
        numero: r.numero,
        designacao: r.designacao,
        titular: r.titular,
        tipo: r.tipo,
        tipoDisplay: r.tipo_display,
        classe: r.classe,
        estado: r.estado,
        estadoDisplay: r.estado_display,
      })),
    };
  } catch (error) {
    if (isNetworkError(error)) {
      const todos = obterPedidos();
      const termoNormalizado = termo.trim().toLowerCase();
      const filtrados = todos.filter((p) => {
        const correspondeTipo = !tipo || p.tipoPropriedade === tipo;
        const correspondeTermo =
          !termoNormalizado ||
          p.numeroProcesso?.toLowerCase().includes(termoNormalizado) ||
          p.titulo?.toLowerCase().includes(termoNormalizado) ||
          p.requerenteNome?.toLowerCase().includes(termoNormalizado);
        return correspondeTipo && correspondeTermo;
      });

      return {
        total: filtrados.length,
        limite: 100,
        resultados: filtrados.map((r, index) => ({
          numero: r.numeroProcesso,
          designacao: r.titulo,
          titular: r.requerenteNome,
          tipo: r.tipoPropriedade,
          tipoDisplay: LABELS_TIPO[r.tipoPropriedade] || r.tipoPropriedade,
          classe: `Classe ${30 + (index % 10)}`,
          estado: r.estado,
          estadoDisplay: LABELS_ESTADO[r.estado] || r.estado,
        })),
      };
    }
    throw error;
  }
}
