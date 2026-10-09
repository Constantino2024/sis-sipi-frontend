// src/utilitarios/numeroProcesso.js

/**
 * Prefixo de cada tipo de Propriedade Industrial, usado na formação do
 * número de processo. Baseado no âmbito da FIRP 386ATDAP.IMA.27 (README §6).
 *
 * Nota: MODELO_UTILIDADE usa "MU" (2 letras) para não colidir com MARCA
 * ("M"), e INDICACAO_PROVENIENCIA usa "IP" para não colidir com INSIGNIA
 * ("I") — confirmar com o Manuel se os prefixos de Insígnia e Indicação
 * de Proveniência são estes ou se há uma convenção oficial do IAPI.
 */
const PREFIXOS_POR_TIPO = {
  MARCA: 'M',
  PATENTE: 'P',
  DESENHO_INDUSTRIAL: 'D',
  MODELO_UTILIDADE: 'MU',
  INSIGNIA: 'I',
  INDICACAO_PROVENIENCIA: 'IP',
};

export function obterPrefixoTipo(tipoPropriedade) {
  const prefixo = PREFIXOS_POR_TIPO[tipoPropriedade];
  if (!prefixo) {
    throw new Error(`Tipo de propriedade desconhecido: "${tipoPropriedade}".`);
  }
  return prefixo;
}

/**
 * Gera "PREFIXO/ANO/ID", com o ID sempre com 5 dígitos no mínimo
 * (padStart), e tudo em maiúsculas — mesmo que o prefixo já venha assim,
 * o toUpperCase() é uma rede de segurança contra erro de digitação futuro.
 *
 * Exemplos: gerarNumeroProcesso('DESENHO_INDUSTRIAL', 2026, 1) → "D/2026/00001"
 *           gerarNumeroProcesso('MARCA', 2026, 2)              → "M/2026/00002"
 */
export function gerarNumeroProcesso(tipoPropriedade, ano, sequencial) {
  const prefixo = obterPrefixoTipo(tipoPropriedade);
  const idFormatado = String(sequencial).padStart(5, '0');
  return `${prefixo}/${ano}/${idFormatado}`.toUpperCase();
}

/**
 * Calcula o próximo número sequencial para um tipo+ano, contando quantos
 * processos desse mesmo tipo já existem nesse ano. Usado ao criar um
 * pedido novo (submissão do Requerente).
 */
export function calcularProximoSequencial(pedidosExistentes, tipoPropriedade, ano) {
  const prefixo = obterPrefixoTipo(tipoPropriedade);
  const doMesmoTipoEAno = pedidosExistentes.filter((p) => {
    const [prefixoDoProcesso, anoDoProcesso] = p.numeroProcesso.split('/');
    return prefixoDoProcesso === prefixo && anoDoProcesso === String(ano);
  });
  return doMesmoTipoEAno.length + 1;
}