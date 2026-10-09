// src/services/consultaPublicaService.js
import api from './api';

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
 * Pesquisa pública de processos diretamente no back-end.
 * GET /api/publico/pesquisa/?termo=&tipo=
 */
export async function pesquisarRegistosPublicos({ termo = '', tipo = '' } = {}) {
  const params = {};
  if (termo.trim()) params.termo = termo.trim();
  if (tipo) params.tipo = tipo;

  const resposta = await api.get('/publico/pesquisa/', { params });
  const dados = resposta.data;
  const lista = Array.isArray(dados?.results)
    ? dados.results
    : Array.isArray(dados)
    ? dados
    : [];

  return {
    total: dados?.total ?? lista.length,
    limite: dados?.limite ?? 100,
    resultados: lista.map((r) => ({
      numero: r.numero || r.numero_processo || r.numeroProcesso,
      designacao: r.designacao || r.titulo,
      titular: r.titular || r.requerente_nome || r.requerenteNome || '—',
      tipo: r.tipo || r.tipoPropriedade,
      tipoDisplay: r.tipo_display || LABELS_TIPO[r.tipo] || r.tipo,
      classe: r.classe || (r.classesNice?.[0]?.classe ? `Classe ${r.classesNice[0].classe}` : '—'),
      estado: r.estado,
      estadoDisplay: r.estado_display || LABELS_ESTADO[r.estado] || r.estado,
    })),
  };
}
