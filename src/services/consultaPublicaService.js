// src/services/consultaPublicaService.js
import api from './api';

/**
 * Pesquisa pública de processos (publicados, em oposição ou concedidos).
 * GET /api/publico/pesquisa/?termo=&tipo= — sem autenticação, máximo 100
 * resultados, só dados públicos (RB05/RB06).
 *
 * Devolve { total, limite, resultados } com cada resultado no formato
 * { numero, designacao, titular, tipo, tipoDisplay, classe, estado, estadoDisplay }.
 */
export async function pesquisarRegistosPublicos({ termo = '', tipo = '' } = {}) {
  const params = {};
  if (termo.trim()) params.termo = termo.trim();
  if (tipo) params.tipo = tipo;

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
}
