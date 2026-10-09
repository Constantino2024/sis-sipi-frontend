// src/utilitarios/geradorNotaCobrancaRupePdf.js
import { carregarLogoIapiGovDataUrl } from './relatorioLogo';

const COR_PRIMARIA = [10, 42, 68];       // #0A2A44 - Azul IAPI Oficial
const COR_DOURADA = [201, 162, 39];     // #C9A227 - Dourado Oficial da República
const COR_CINZA_FUNDO = [248, 249, 250]; // #F8F9FA
const COR_TEXTO_ESCURO = [33, 37, 41];
const COR_TEXTO_MUTED = [108, 117, 125];
const COR_BORDA = [222, 226, 230];

const CARACTERES_SUPORTADOS = /[\u0020-\u007e\u00a1-\u00ff\u2013\u2014\u2018\u2019\u201c\u201d\u2022\u20ac]/;

// Normaliza caracteres para a codificação de fontes do jsPDF
function sanitizarTexto(str) {
  if (!str) return '—';
  return Array.from(String(str).replace(/[\u202f\u00a0]/g, ' '))
    .map((c) => (c === '\n' || CARACTERES_SUPORTADOS.test(c) ? c : '?'))
    .join('');
}

function formatarKz(valor) {
  const num = Number(valor || 0);
  return `${num.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kz`;
}

function formatarDataIso(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  } catch {
    return '—';
  }
}

function formatarDataHora(data = new Date()) {
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = data.getFullYear();
  const hora = String(data.getHours()).padStart(2, '0');
  const min = String(data.getMinutes()).padStart(2, '0');
  return `${dia}/${mes}/${ano} às ${hora}:${min}`;
}

function agruparReferencia(ref) {
  if (!ref) return '0000 0000 0000 0000';
  const limpa = String(ref).replace(/\s+/g, '');
  return limpa.replace(/(.{4})/g, '$1 ').trim();
}

/**
 * Converte valor numérico em Kwanzas para texto por extenso (até milhões).
 */
export function valorPorExtenso(valor) {
  const numero = Math.round(Number(valor || 0));
  if (numero === 0) return 'Zero Kwanzas';

  const unidades = ['', 'Um', 'Dois', 'Três', 'Quatro', 'Cinco', 'Seis', 'Sete', 'Oito', 'Nove'];
  const dezenasEspeciais = [
    'Dez', 'Onze', 'Doze', 'Treze', 'Catorze', 'Quinze', 'Dezasseis', 'Dezessete', 'Dezoito', 'Dezanove'
  ];
  const dezenas = ['', '', 'Vinte', 'Trinta', 'Quarenta', 'Cinquenta', 'Sessenta', 'Setenta', 'Oitenta', 'Noventa'];
  const centenas = [
    '', 'Cento', 'Duzentos', 'Trezentos', 'Quatrocentos', 'Quinhentos', 'Seiscentos', 'Setecentos', 'Oitocentos', 'Novecentos'
  ];

  function converterCentena(n) {
    if (n === 100) return 'Cem';
    let res = '';
    const c = Math.floor(n / 100);
    const restoC = n % 100;
    const d = Math.floor(restoC / 10);
    const u = restoC % 10;

    if (c > 0) res += centenas[c];

    if (restoC >= 10 && restoC < 20) {
      if (res) res += ' e ';
      res += dezenasEspeciais[restoC - 10];
    } else {
      if (d > 0) {
        if (res) res += ' e ';
        res += dezenas[d];
      }
      if (u > 0) {
        if (res) res += ' e ';
        res += unidades[u];
      }
    }
    return res;
  }

  const milhoes = Math.floor(numero / 1000000);
  const restoMilhoes = numero % 1000000;
  const milhares = Math.floor(restoMilhoes / 1000);
  const restoMilhares = restoMilhoes % 1000;

  let extenso = '';
  if (milhoes > 0) {
    extenso += (milhoes === 1 ? 'Um Milhão' : `${converterCentena(milhoes)} Milhões`);
  }
  if (milhares > 0) {
    if (extenso) extenso += ' e ';
    extenso += (milhares === 1 ? 'Mil' : `${converterCentena(milhares)} Mil`);
  }
  if (restoMilhares > 0) {
    if (extenso) extenso += ' e ';
    extenso += converterCentena(restoMilhares);
  }

  return `${extenso} Kwanzas`;
}

/**
 * Gera e transfere a Nota de Cobrança com a RUPE em formato PDF oficial.
 *
 * @param {object} dados
 * @param {object} dados.pedido   Dados do pedido (numeroProcesso, titulo, tipoPropriedade, titular, etc.)
 * @param {object} dados.rupe     Dados da RUPE (referencia, valor, codigoServico, descricaoServico, etc.)
 * @param {string} [dados.nomeFicheiro] Nome opcional do ficheiro transferido
 */
export async function gerarNotaCobrancaRupePdf({ pedido, rupe, nomeFicheiro }) {
  const [{ jsPDF }, { autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const largura = doc.internal.pageSize.getWidth();   // 210mm
  const margem = 14;                                   // 14mm
  const larguraUtil = largura - margem * 2;            // 182mm
  let y = 14;

  // 1. CARREGAR LOGÓTIPO OFICIAL
  const logoDataUrl = await carregarLogoIapiGovDataUrl();

  // 2. CABEÇALHO GOVERNAMENTAL OFICIAL
  if (logoDataUrl) {
    try {
      // Proporção do logótipo IAPI
      doc.addImage(logoDataUrl, 'PNG', margem, y, 32, 13);
    } catch {
      /* fallback sem imagem */
    }
  }

  const xTextoCabecalho = logoDataUrl ? margem + 36 : margem;
  doc.setFont('helvetica', 'bold').setFontSize(9).setTextColor(...COR_PRIMARIA);
  doc.text('REPÚBLICA DE ANGOLA', xTextoCabecalho, y + 3);
  doc.setFont('helvetica', 'bold').setFontSize(8).setTextColor(...COR_TEXTO_MUTED);
  doc.text('MINISTÉRIO DA INDÚSTRIA E COMÉRCIO', xTextoCabecalho, y + 7);
  doc.setFont('helvetica', 'bold').setFontSize(10).setTextColor(...COR_PRIMARIA);
  doc.text('INSTITUTO ANGOLANO DA PROPRIEDADE INDUSTRIAL — IAPI', xTextoCabecalho, y + 11.5);
  doc.setFont('helvetica', 'normal').setFontSize(7.5).setTextColor(...COR_TEXTO_MUTED);
  doc.text('Sistema de Informação da Propriedade Intelectual (SIPI) · Departamento de Arrecadação', xTextoCabecalho, y + 15);

  y += 20;

  // Linhas ornamentais oficiais da República (Dourado e Azul-Escuro)
  doc.setDrawColor(...COR_DOURADA).setLineWidth(1.2).line(margem, y, largura - margem, y);
  y += 1.4;
  doc.setDrawColor(...COR_PRIMARIA).setLineWidth(0.4).line(margem, y, largura - margem, y);
  y += 5;

  // 3. BARRA DE IDENTIFICAÇÃO DO DOCUMENTO
  doc.setFillColor(...COR_CINZA_FUNDO);
  doc.setDrawColor(...COR_BORDA);
  doc.setLineWidth(0.3);
  doc.roundedRect(margem, y, larguraUtil, 15, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold').setFontSize(12).setTextColor(...COR_PRIMARIA);
  doc.text('NOTA DE COBRANÇA · GUIA DE PAGAMENTO RUPE', margem + 5, y + 6);
  doc.setFont('helvetica', 'normal').setFontSize(7.5).setTextColor(...COR_TEXTO_MUTED);
  doc.text('Documento Oficial de Liquidação de Emolumentos ao abrigo da Lei n.º 3/92 da Propriedade Industrial', margem + 5, y + 11);

  // Informações laterais da Nota
  const numProcesso = pedido?.numeroProcesso || rupe?.numeroProcesso || `P/${new Date().getFullYear()}/${pedido?.id || '01'}`;
  const numNota = `NC-RUPE/${new Date().getFullYear()}/${String(rupe?.id || pedido?.id || '001').slice(-6)}`;
  
  doc.setFont('helvetica', 'bold').setFontSize(8.5).setTextColor(...COR_PRIMARIA);
  doc.text(sanitizarTexto(numNota), largura - margem - 5, y + 6, { align: 'right' });
  doc.setFont('helvetica', 'normal').setFontSize(7.5).setTextColor(...COR_TEXTO_MUTED);
  doc.text(`Emitido em: ${formatarDataHora()}`, largura - margem - 5, y + 11, { align: 'right' });

  y += 19;

  // 4. QUADROS DE INFORMAÇÃO: CONTRIBUINTE & PROCESSO (Lado a lado)
  const larguraMetade = (larguraUtil - 4) / 2;
  const alturaQuadro = 33;

  // --- Quadro A: Sujeito Passivo (Contribuinte) ---
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...COR_BORDA);
  doc.roundedRect(margem, y, larguraMetade, alturaQuadro, 1, 1, 'FD');
  
  // Cabeçalho do Quadro A
  doc.setFillColor(...COR_PRIMARIA);
  doc.rect(margem, y, larguraMetade, 5.5, 'F');
  doc.setFont('helvetica', 'bold').setFontSize(7.5).setTextColor(255, 255, 255);
  doc.text('1. IDENTIFICAÇÃO DO SUJEITO PASSIVO (CONTRIBUINTE)', margem + 3, y + 4);

  const titularNome = rupe?.nomeContribuinte || pedido?.titular?.nomeOuFirma || pedido?.requerenteNome || 'Requerente Registado';
  const titularNif = rupe?.nif || pedido?.titular?.nif || '999999999';
  const titularEmail = pedido?.titular?.email || '—';
  const titularTelefone = pedido?.titular?.telefone || '—';
  const titularLocalidade = pedido?.titular?.provincia ? `${pedido.titular.municipio || ''}, ${pedido.titular.provincia}` : 'Luanda, Angola';

  let yQ1 = y + 9.5;
  doc.setFont('helvetica', 'bold').setFontSize(7).setTextColor(...COR_TEXTO_MUTED);
  doc.text('Nome / Firma:', margem + 3, yQ1);
  doc.setFont('helvetica', 'bold').setFontSize(7.5).setTextColor(...COR_TEXTO_ESCURO);
  doc.text(sanitizarTexto(titularNome).slice(0, 42), margem + 23, yQ1);

  yQ1 += 5;
  doc.setFont('helvetica', 'bold').setFontSize(7).setTextColor(...COR_TEXTO_MUTED);
  doc.text('NIF Tributário:', margem + 3, yQ1);
  doc.setFont('helvetica', 'bold').setFontSize(8).setTextColor(...COR_PRIMARIA);
  doc.text(sanitizarTexto(titularNif), margem + 23, yQ1);

  yQ1 += 5;
  doc.setFont('helvetica', 'bold').setFontSize(7).setTextColor(...COR_TEXTO_MUTED);
  doc.text('Localidade:', margem + 3, yQ1);
  doc.setFont('helvetica', 'normal').setFontSize(7.5).setTextColor(...COR_TEXTO_ESCURO);
  doc.text(sanitizarTexto(titularLocalidade), margem + 23, yQ1);

  yQ1 += 5;
  doc.setFont('helvetica', 'bold').setFontSize(7).setTextColor(...COR_TEXTO_MUTED);
  doc.text('Contacto / Email:', margem + 3, yQ1);
  doc.setFont('helvetica', 'normal').setFontSize(7).setTextColor(...COR_TEXTO_ESCURO);
  doc.text(`${sanitizarTexto(titularTelefone)} · ${sanitizarTexto(titularEmail).slice(0, 24)}`, margem + 23, yQ1);

  // --- Quadro B: Dados do Processo no SIPI ---
  const xQ2 = margem + larguraMetade + 4;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(xQ2, y, larguraMetade, alturaQuadro, 1, 1, 'FD');

  doc.setFillColor(...COR_PRIMARIA);
  doc.rect(xQ2, y, larguraMetade, 5.5, 'F');
  doc.setFont('helvetica', 'bold').setFontSize(7.5).setTextColor(255, 255, 255);
  doc.text('2. DADOS DO PROCESSO DA PROPRIEDADE INDUSTRIAL', xQ2 + 3, y + 4);

  const tipoLabel = sanitizarTexto(pedido?.tipoPropriedade || 'MARCA').replaceAll('_', ' ');
  const tituloProcesso = pedido?.titulo || pedido?.detalhesMarca?.denominacao || 'Pedido de Registo Oficial';
  const dataSubmissao = formatarDataIso(pedido?.dataSubmissao || new Date().toISOString());
  const dataValidadeRupe = formatarDataIso(rupe?.dataExpiracao || new Date(Date.now() + 30 * 86400000).toISOString());

  let yQ2 = y + 9.5;
  doc.setFont('helvetica', 'bold').setFontSize(7).setTextColor(...COR_TEXTO_MUTED);
  doc.text('N.º Processo:', xQ2 + 3, yQ2);
  doc.setFont('helvetica', 'bold').setFontSize(8.5).setTextColor(...COR_PRIMARIA);
  doc.text(sanitizarTexto(numProcesso), xQ2 + 25, yQ2);

  yQ2 += 5;
  doc.setFont('helvetica', 'bold').setFontSize(7).setTextColor(...COR_TEXTO_MUTED);
  doc.text('Modalidade:', xQ2 + 3, yQ2);
  doc.setFont('helvetica', 'bold').setFontSize(7.5).setTextColor(...COR_TEXTO_ESCURO);
  doc.text(tipoLabel, xQ2 + 25, yQ2);

  yQ2 += 5;
  doc.setFont('helvetica', 'bold').setFontSize(7).setTextColor(...COR_TEXTO_MUTED);
  doc.text('Denominação:', xQ2 + 3, yQ2);
  doc.setFont('helvetica', 'normal').setFontSize(7.5).setTextColor(...COR_TEXTO_ESCURO);
  doc.text(sanitizarTexto(tituloProcesso).slice(0, 36), xQ2 + 25, yQ2);

  yQ2 += 5;
  doc.setFont('helvetica', 'bold').setFontSize(7).setTextColor(...COR_TEXTO_MUTED);
  doc.text('Depósito / Venc.:', xQ2 + 3, yQ2);
  doc.setFont('helvetica', 'normal').setFontSize(7).setTextColor(...COR_TEXTO_ESCURO);
  doc.text(`${dataSubmissao}  ·  `, xQ2 + 25, yQ2);
  doc.setFont('helvetica', 'bold').setFontSize(7.5).setTextColor(180, 40, 40);
  doc.text(`${dataValidadeRupe} (30 dias)`, xQ2 + 42, yQ2);

  y += alturaQuadro + 4;

  // 5. TABELA DE DISCRIMINAÇÃO DOS EMOLUMENTOS OFICIAIS (jspdf-autotable)
  const valorTotal = Number(rupe?.valor || pedido?.taxas?.total || 25000);
  const descricaoServico = rupe?.descricaoServico || `Taxa Oficial de Registo / Depósito de ${tipoLabel}`;
  const codigoServico = rupe?.codigoServico || 'SRV-IAPI-01';

  const linhasTabela = [
    [
      '01',
      codigoServico,
      sanitizarTexto(descricaoServico),
      'Depósito inicial Modelo M-1 (Lei n.º 3/92)',
      formatarKz(valorTotal),
    ],
  ];

  // Se houver classes adicionais
  if (pedido?.classesNice && pedido.classesNice.length > 1) {
    linhasTabela.push([
      '02',
      'SRV-IAPI-CLS',
      `Classes Adicionais de Nice (${pedido.classesNice.length - 1} classe(s) suplementar(es))`,
      'Taxa por classe adicional estipulada',
      'Incluído',
    ]);
  }

  autoTable(doc, {
    startY: y,
    margin: { left: margem, right: margem },
    theme: 'grid',
    head: [['Item', 'Código', 'Discriminação do Emolumento Oficial', 'Incidência / Enquadramento', 'Valor']],
    body: linhasTabela,
    foot: [
      [
        { content: 'TOTAL LÍQUIDO A LIQUIDAR (Kz):', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold', fontSize: 9 } },
        { content: formatarKz(valorTotal), styles: { halign: 'right', fontStyle: 'bold', fontSize: 10, textColor: COR_PRIMARIA } },
      ],
    ],
    headStyles: {
      fillColor: COR_PRIMARIA,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'left',
      cellPadding: 2.2,
    },
    bodyStyles: {
      textColor: COR_TEXTO_ESCURO,
      fontSize: 7.5,
      cellPadding: 2.5,
    },
    footStyles: {
      fillColor: COR_CINZA_FUNDO,
      textColor: COR_TEXTO_ESCURO,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 26 },
      2: { cellWidth: 70 },
      3: { cellWidth: 46 },
      4: { cellWidth: 30, halign: 'right' },
    },
  });

  y = doc.lastAutoTable.finalY + 3;

  // Valor por Extenso
  doc.setFont('helvetica', 'bold').setFontSize(7.5).setTextColor(...COR_TEXTO_MUTED);
  doc.text('VALOR POR EXTENSO:', margem + 2, y + 2);
  doc.setFont('helvetica', 'bolditalic').setFontSize(8).setTextColor(...COR_PRIMARIA);
  doc.text(sanitizarTexto(valorPorExtenso(valorTotal)), margem + 38, y + 2);

  y += 7;

  // 6. BLOCO DESTACADO: INSTRUÇÕES DE PAGAMENTO RUPE (DNT / MINFIN / EMIS)
  const alturaBlocoRupe = 44;
  doc.setFillColor(254, 252, 243); // Amarelo/Dourado muito suave institucional
  doc.setDrawColor(...COR_DOURADA);
  doc.setLineWidth(0.8);
  doc.roundedRect(margem, y, larguraUtil, alturaBlocoRupe, 1.5, 1.5, 'FD');

  // Cabeçalho da caixa RUPE
  doc.setFillColor(...COR_DOURADA);
  doc.rect(margem, y, larguraUtil, 6, 'F');
  doc.setFont('helvetica', 'bold').setFontSize(8).setTextColor(...COR_PRIMARIA);
  doc.text('DADOS OFICIAIS PARA LIQUIDAÇÃO BANCÁRIA · RUPE (CONTA ÚNICA DO TESOURO)', margem + 4, y + 4.2);

  const refFormatada = agruparReferencia(rupe?.referencia || '0001010000000016');

  // Sub-bloco com 3 cartões de destaque
  const yDadosRupe = y + 10;
  const colWidth = (larguraUtil - 8) / 3;

  // Cartão 1: Entidade
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...COR_BORDA);
  doc.setLineWidth(0.2);
  doc.roundedRect(margem + 2, yDadosRupe, colWidth, 14, 1, 1, 'FD');
  doc.setFont('helvetica', 'bold').setFontSize(6.5).setTextColor(...COR_TEXTO_MUTED);
  doc.text('ÓRGÃO / ENTIDADE', margem + 5, yDadosRupe + 4);
  doc.setFont('helvetica', 'bold').setFontSize(8.5).setTextColor(...COR_PRIMARIA);
  doc.text('IAPI - MINFIN', margem + 5, yDadosRupe + 9);
  doc.setFont('helvetica', 'normal').setFontSize(6.5).setTextColor(...COR_TEXTO_MUTED);
  doc.text('Cód. Ministério: 00042', margem + 5, yDadosRupe + 12.5);

  // Cartão 2: REFERÊNCIA RUPE (Destaque Principal)
  const xCol2 = margem + 2 + colWidth + 2;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...COR_DOURADA);
  doc.setLineWidth(0.5);
  doc.roundedRect(xCol2, yDadosRupe, colWidth, 14, 1, 1, 'FD');
  doc.setFont('helvetica', 'bold').setFontSize(6.5).setTextColor(...COR_DOURADA);
  doc.text('REFERÊNCIA RUPE (ÚNICA)', xCol2 + 4, yDadosRupe + 4);
  doc.setFont('helvetica', 'bold').setFontSize(10.5).setTextColor(...COR_PRIMARIA);
  doc.text(refFormatada, xCol2 + 4, yDadosRupe + 9.5);
  doc.setFont('helvetica', 'normal').setFontSize(6.5).setTextColor(...COR_TEXTO_MUTED);
  doc.text('Digitar sem espaços no terminal', xCol2 + 4, yDadosRupe + 12.5);

  // Cartão 3: Montante a Pagar
  const xCol3 = xCol2 + colWidth + 2;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...COR_BORDA);
  doc.setLineWidth(0.2);
  doc.roundedRect(xCol3, yDadosRupe, colWidth, 14, 1, 1, 'FD');
  doc.setFont('helvetica', 'bold').setFontSize(6.5).setTextColor(...COR_TEXTO_MUTED);
  doc.text('MONTANTE EXACTO', xCol3 + 4, yDadosRupe + 4);
  doc.setFont('helvetica', 'bold').setFontSize(10).setTextColor(...COR_PRIMARIA);
  doc.text(formatarKz(valorTotal), xCol3 + 4, yDadosRupe + 9.5);
  doc.setFont('helvetica', 'normal').setFontSize(6.5).setTextColor(180, 40, 40);
  doc.text(`Válida até: ${dataValidadeRupe}`, xCol3 + 4, yDadosRupe + 12.5);

  // Instruções de Pagamento no Rodapé da Caixa RUPE
  const yInstrucoes = yDadosRupe + 17;
  doc.setFont('helvetica', 'bold').setFontSize(7).setTextColor(...COR_PRIMARIA);
  doc.text('COMO EFECTUAR O PAGAMENTO:', margem + 4, yInstrucoes);

  doc.setFont('helvetica', 'normal').setFontSize(6.5).setTextColor(...COR_TEXTO_ESCURO);
  doc.text(
    '1. MULTICAIXA (ATM): Seleccionar «Pagamentos» > «Pagamentos ao Estado» > Introduzir a Referência RUPE > Confirmar montante e guardar recibo.',
    margem + 4,
    yInstrucoes + 3.8
  );
  doc.text(
    '2. MULTICAIXA EXPRESS / INTERNET BANKING: Seleccionar «Pagamentos ao Estado / RUPE» > Introduzir a Referência acima > Validar a operação.',
    margem + 4,
    yInstrucoes + 7.2
  );
  doc.setFont('helvetica', 'italic').setFontSize(6).setTextColor(...COR_TEXTO_MUTED);
  doc.text(
    '* A liquidação é comunicada electronicamente ao SIPI pela CUTE (MinFin). O processo avançará automaticamente para Exame Formal.',
    margem + 4,
    yInstrucoes + 10.6
  );

  y += alturaBlocoRupe + 5;

  // 7. CÓDIGO DE BARRAS ESTILIZADO E RECONCILIAÇÃO DIGITAL
  const alturaCodigoBarras = 10;
  doc.setFillColor(...COR_CINZA_FUNDO);
  doc.rect(margem, y, larguraUtil, alturaCodigoBarras + 8, 'F');
  doc.setDrawColor(...COR_BORDA);
  doc.rect(margem, y, larguraUtil, alturaCodigoBarras + 8, 'S');

  // Desenhar barras de código de barras simuladas (vetoriais de alta precisão)
  const xBarrasInicio = margem + 6;
  const yBarrasInicio = y + 2.5;
  const padraoBarras = [
    2, 1, 3, 1, 1, 2, 4, 1, 2, 2, 1, 3, 2, 1, 1, 4, 2, 1, 3, 1, 2, 2, 1, 1, 3, 2, 1, 4,
    1, 2, 2, 1, 3, 1, 1, 2, 4, 1, 2, 2, 1, 3, 2, 1, 1, 4, 2, 1, 3, 1, 2, 2, 1, 1, 3, 2
  ];

  doc.setFillColor(0, 0, 0);
  let xOffset = xBarrasInicio;
  padraoBarras.forEach((larguraBarra, idx) => {
    if (idx % 2 === 0) {
      doc.rect(xOffset, yBarrasInicio, larguraBarra * 0.75, alturaCodigoBarras, 'F');
    }
    xOffset += larguraBarra * 0.95;
  });

  // Linha digitável e chave de autenticação
  const chaveVerificacao = `SIPI-${new Date().getFullYear()}-${String(refFormatada).replace(/\s/g, '').slice(-8)}-OK`;
  doc.setFont('courier', 'bold').setFontSize(7).setTextColor(...COR_TEXTO_ESCURO);
  doc.text(`LINHA DIGITÁVEL: 00042.${refFormatada.slice(0, 9)} ${refFormatada.slice(10)} ${valorTotal}`, xBarrasInicio, y + 15.5);
  
  doc.setFont('helvetica', 'normal').setFontSize(6.5).setTextColor(...COR_TEXTO_MUTED);
  doc.text(`Chave Digital SIPI: ${chaveVerificacao}`, largura - margem - 6, y + 15.5, { align: 'right' });

  y += alturaCodigoBarras + 12;

  // 8. NOTAS LEGAIS E TERMO DE RESPONSABILIDADE
  doc.setFont('helvetica', 'bold').setFontSize(6.5).setTextColor(...COR_PRIMARIA);
  doc.text('AVISOS LEGAIS IMPORTANTES:', margem, y);
  doc.setFont('helvetica', 'normal').setFontSize(6).setTextColor(...COR_TEXTO_MUTED);
  doc.text(
    'a) O presente documento constitui título de cobrança pública e deve ser liquidado impreterivelmente até à data de vencimento indicada.',
    margem,
    y + 3.2
  );
  doc.text(
    'b) Nos termos da Lei n.º 3/92 de 28 de Fevereiro, o não pagamento da taxa de depósito no prazo de 30 dias acarreta o arquivamento do processo.',
    margem,
    y + 6.2
  );
  doc.text(
    'c) Conserve o comprovativo de pagamento emitido pelo canal bancário até à publicação da concessão do registo no Boletim da Propriedade Industrial (BPI).',
    margem,
    y + 9.2
  );

  y += 14;

  // 9. ÁREA DE ASSINATURA / CARIMBO ELECTRÓNICO
  const xAssinatura = largura - margem - 65;
  doc.setDrawColor(...COR_PRIMARIA).setLineWidth(0.4);
  doc.line(xAssinatura, y + 8, largura - margem - 5, y + 8);
  doc.setFont('helvetica', 'bold').setFontSize(7).setTextColor(...COR_PRIMARIA);
  doc.text('SERVIÇOS DE ARRECADAÇÃO E FINANÇAS', xAssinatura + 30, y + 11.5, { align: 'center' });
  doc.setFont('helvetica', 'normal').setFontSize(6).setTextColor(...COR_TEXTO_MUTED);
  doc.text('Instituto Angolano da Propriedade Industrial (IAPI)', xAssinatura + 30, y + 14.5, { align: 'center' });

  // Selo Digital à Esquerda
  doc.setDrawColor(...COR_DOURADA).setLineWidth(0.4);
  doc.roundedRect(margem, y + 1, 55, 14, 1, 1, 'S');
  doc.setFont('helvetica', 'bold').setFontSize(6.5).setTextColor(...COR_DOURADA);
  doc.text('AUTENTICAÇÃO ELECTRÓNICA', margem + 3, y + 5);
  doc.setFont('helvetica', 'normal').setFontSize(6).setTextColor(...COR_TEXTO_MUTED);
  doc.text('Emitido via SIPI - Sistema de Informação', margem + 3, y + 8.5);
  doc.text('Validação disponível no portal oficial: sipi.ao', margem + 3, y + 12);

  // 10. RODAPÉ INSTITUCIONAL
  const yRodape = doc.internal.pageSize.getHeight() - 10;
  doc.setDrawColor(...COR_BORDA).setLineWidth(0.3).line(margem, yRodape - 2, largura - margem, yRodape - 2);
  doc.setFont('helvetica', 'normal').setFontSize(6).setTextColor(...COR_TEXTO_MUTED);
  doc.text(
    'Instituto Angolano da Propriedade Industrial · Largo 17 de Setembro, Luanda, Angola · Email: apoio@iapi.gov.ao · Portal: https://sipi.ao',
    largura / 2,
    yRodape + 1.5,
    { align: 'center' }
  );

  // NOME DO FICHEIRO E DOWNLOAD
  const nomeFinal = nomeFicheiro || `Nota_Cobranca_RUPE_${String(refFormatada).replace(/\s/g, '')}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(nomeFinal);
}
