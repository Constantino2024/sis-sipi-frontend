// src/utilitarios/estadosPedido.js

/**
 * Rótulo em português e classes Tailwind por estado do pedido.
 * Nota de design: badges são retângulos com borda (não "pills"
 * arredondadas), coerente com a decisão de zero border-radius do
 * sistema (README §4.1) — a cor comunica o estado, não a forma.
 *
 * Os valores abaixo correspondem exatamente ao enum `EstadoPedido`
 * do backend (core/enums.py) — têm de ser mantidos em sincronia.
 *
 *   (criação) → EM_AVALIACAO → DEPOSITADO → PAGO → EXAME_FORMAL ⇄ AGUARDA_CORRECAO
 *                                        ↓
 *                                   PUBLICADO → EM_OPOSICAO
 *                                        ↓
 *                               EXAME_SUBSTANTIVO
 *                                        ↓
 *                      PARECER_FAVORAVEL / PARECER_DESFAVORAVEL
 *                                   ↙         ↘
 *                            DEFERIDO      INDEFERIDO
 *                                ↓
 *                            CONCEDIDO
 *
 * O Técnico emite uma exigência passando o pedido a AGUARDA_CORRECAO e um
 * parecer passando-o a PARECER_*; a decisão final (DEFERIDO/INDEFERIDO) é
 * confirmada depois, num passo separado.
 *
 * ARQUIVADO pode ser aplicado a partir de vários pontos do fluxo.
 * DEFERIDO/INDEFERIDO são decisões administrativas (aceitar/rejeitar)
 * tomadas pelo Gestor — ver `PedidoViewSet.aceitar/rejeitar` no backend.
 */
const ESTADOS_PEDIDO = {
  RASCUNHO: { rotulo: 'Rascunho', cor: 'bg-gray-100 text-gray-700 border-gray-300' },
  EM_AVALIACAO: { rotulo: 'Em Avaliação', cor: 'bg-yellow-50 text-yellow-700 border-yellow-300' },
  DEPOSITADO: { rotulo: 'Depositado', cor: 'bg-blue-50 text-blue-700 border-blue-300' },
  PAGO: { rotulo: 'Pago', cor: 'bg-indigo-50 text-indigo-700 border-indigo-300' },
  EXAME_FORMAL: { rotulo: 'Exame Formal', cor: 'bg-blue-50 text-blue-700 border-blue-300' },
  AGUARDA_CORRECAO: { rotulo: 'Aguarda Correção', cor: 'bg-amber-50 text-amber-700 border-amber-300' },
  PUBLICADO: { rotulo: 'Publicado', cor: 'bg-cyan-50 text-cyan-700 border-cyan-300' },
  EM_OPOSICAO: { rotulo: 'Em Oposição', cor: 'bg-orange-50 text-orange-700 border-orange-300' },
  EXAME_SUBSTANTIVO: { rotulo: 'Exame Substantivo', cor: 'bg-purple-50 text-purple-700 border-purple-300' },
  PARECER_FAVORAVEL: { rotulo: 'Parecer Favorável', cor: 'bg-teal-50 text-teal-700 border-teal-300' },
  PARECER_DESFAVORAVEL: { rotulo: 'Parecer Desfavorável', cor: 'bg-rose-50 text-rose-700 border-rose-300' },
  DEFERIDO: { rotulo: 'Deferido', cor: 'bg-green-50 text-green-700 border-green-300' },
  INDEFERIDO: { rotulo: 'Indeferido', cor: 'bg-red-50 text-red-700 border-red-300' },
  CONCEDIDO: { rotulo: 'Concedido', cor: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
  ARQUIVADO: { rotulo: 'Arquivado', cor: 'bg-gray-100 text-gray-500 border-gray-300' },
};

export function obterInfoEstado(estado) {
  return ESTADOS_PEDIDO[estado] ?? { rotulo: estado, cor: 'bg-gray-100 text-gray-700 border-gray-300' };
}

export function listarEstados() {
  return ESTADOS_PEDIDO;
}

const ESTADOS_EDITAVEIS = ['RASCUNHO', 'EM_AVALIACAO', 'DEPOSITADO', 'AGUARDA_CORRECAO'];

/** Um pedido só pode ser editado/eliminado pelo Requerente enquanto
 *  ainda não entrou em análise técnica nem foi decidido. */
export function podeEditarOuEliminar(estado) {
  return ESTADOS_EDITAVEIS.includes(estado);
}

/** Estados finais — já não há decisão pendente sobre o pedido. */
const ESTADOS_FINAIS = ['DEFERIDO', 'INDEFERIDO', 'CONCEDIDO', 'ARQUIVADO'];

export function estaEmCurso(estado) {
  return !ESTADOS_FINAIS.includes(estado) && estado !== 'RASCUNHO';
}

/** Estados em que o Gestor ainda pode aceitar (deferir) ou rejeitar
 *  (indeferir) o pedido — ou seja, ainda não chegou a uma decisão final. */
export function podeAceitarOuRejeitar(estado) {
  return !ESTADOS_FINAIS.includes(estado) && estado !== 'RASCUNHO';
}


/** A taxa só se paga enquanto o pedido está em curso (não em rascunho
 *  nem já decidido/arquivado). */
export function podePagar(estado) {
  return estaEmCurso(estado);
}


/** O processo já tem decisão final — não admite novas exigências nem pareceres. */
export function estaDecidido(estado) {
  return ESTADOS_FINAIS.includes(estado);
}

/** Estados em que o Técnico ainda pode pedir correções ao requerente. */
const ESTADOS_PARA_EXIGENCIA = [
  'EM_AVALIACAO', 'DEPOSITADO', 'PAGO', 'EXAME_FORMAL', 'EXAME_SUBSTANTIVO',
];

export function podeEmitirExigencia(estado) {
  return ESTADOS_PARA_EXIGENCIA.includes(estado);
}
