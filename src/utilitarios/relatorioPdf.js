// src/utilitarios/relatorioPdf.js
//
// Geração de relatórios em PDF no browser (jsPDF + jspdf-autotable).
// As bibliotecas são carregadas com import() dinâmico: só descarregam quando
// o utilizador clica em «Exportar PDF», não pesam no bundle inicial.
import { obterInfoEstado } from './estadosPedido';

const COR_PRIMARIA = [10, 42, 68]; // primary-500
const COR_DESTAQUE = [255, 205, 0]; // secondary-500
const COR_TEXTO = [55, 65, 81];
const COR_TEXTO_SUAVE = [107, 114, 128];

// A fonte Helvetica embutida do jsPDF só cobre Latin-1/WinAnsi: acentos
// portugueses funcionam, mas emojis e outros alfabetos sairiam corrompidos.
// Também normaliza os espaços de milhares que o Intl usa em pt-PT (U+00A0/U+202F).
const CARACTERES_SUPORTADOS = /[\u0020-\u007e\u00a1-\u00ff\u2013\u2014\u2018\u2019\u201c\u201d\u2022\u20ac]/;

function texto(valor, vazio = '—') {
  if (valor === null || valor === undefined || valor === '') return vazio;
  return Array.from(String(valor).replace(/[\u202f\u00a0]/g, ' '))
    .map((c) => (c === '\n' || CARACTERES_SUPORTADOS.test(c) ? c : '?'))
    .join('');
}

const DIREITA = (conteudo) => ({ content: conteudo, styles: { halign: 'right' } });

function formatarData(iso) {
  return iso ? new Date(iso).toLocaleDateString('pt-PT') : '—';
}

function formatarDataHora(data) {
  return data.toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' });
}

function rotuloTipo(tipo) {
  return texto(String(tipo ?? '').replaceAll('_', ' '));
}

function contar(lista, obterChave) {
  const totais = new Map();
  lista.forEach((item) => {
    const chave = obterChave(item);
    totais.set(chave, (totais.get(chave) || 0) + 1);
  });
  return [...totais.entries()].sort((a, b) => b[1] - a[1]);
}

/**
 * Gera e descarrega o relatório de processos.
 *
 * @param {object}   opcoes
 * @param {Array}    opcoes.pedidos            pedidos já mapeados (pedidosService)
 * @param {string}   opcoes.titulo
 * @param {string}  [opcoes.filtros]           descrição dos filtros aplicados
 * @param {string}  [opcoes.geradoPor]         nome de quem gera o relatório
 * @param {boolean} [opcoes.incluirResumo=true]       totais por estado/modalidade
 * @param {boolean} [opcoes.incluirRequerente=true]   coluna «Requerente»
 * @param {string}  [opcoes.logoDataUrl]       logótipo (data URL PNG/JPEG)
 * @param {string}  [opcoes.nomeFicheiro]
 */
export async function gerarRelatorioPedidosPdf({
  pedidos,
  titulo,
  filtros,
  geradoPor,
  incluirResumo = true,
  incluirRequerente = true,
  logoDataUrl = null,
  nomeFicheiro,
}) {
  const [{ jsPDF }, { autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);

  const agora = new Date();
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const largura = doc.internal.pageSize.getWidth();
  const altura = doc.internal.pageSize.getHeight();
  const margem = 14;
  const topoContinuacao = 22; // espaço do cabeçalho corrente nas páginas 2+

  // ---------------------------------------------------------------- cabeçalho
  let y = 12;
  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, 'PNG', margem, y - 2, 24, 10); // proporção ~138×57
    } catch {
      /* sem logótipo */
    }
  }
  const xTitulo = logoDataUrl ? margem + 30 : margem;
  doc.setFont('helvetica', 'bold').setFontSize(10).setTextColor(...COR_TEXTO_SUAVE);
  doc.text('INSTITUTO ANGOLANO DE PROPRIEDADE INDUSTRIAL', xTitulo, y + 2);
  doc.setFontSize(16).setTextColor(...COR_PRIMARIA);
  doc.text(texto(titulo), xTitulo, y + 9);
  y += 14;
  doc.setDrawColor(...COR_DESTAQUE).setLineWidth(0.8).line(margem, y, largura - margem, y);
  y += 6;

  doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(...COR_TEXTO);
  const meta = [`Gerado em ${formatarDataHora(agora)}`];
  if (geradoPor) meta.push(`por ${texto(geradoPor)}`);
  doc.text(meta.join(' '), margem, y);
  y += 5;
  if (filtros) {
    const linhas = doc.splitTextToSize(`Filtros: ${texto(filtros)}`, largura - margem * 2);
    doc.text(linhas, margem, y);
    y += linhas.length * 4.5;
  }
  y += 3;

  // ------------------------------------------------------------------- resumo
  const total = pedidos.length;
  const pagos = pedidos.filter((p) => p.pago).length;

  if (incluirResumo && total > 0) {
    const caixas = [
      ['Total de processos', total],
      ['Taxa paga', pagos],
      ['Taxa por pagar', total - pagos],
    ];
    const larguraCaixa = (largura - margem * 2 - 8) / 3;
    caixas.forEach(([rotulo, valor], i) => {
      const x = margem + i * (larguraCaixa + 4);
      doc.setFillColor(230, 240, 250).rect(x, y, larguraCaixa, 16, 'F');
      doc.setFont('helvetica', 'bold').setFontSize(16).setTextColor(...COR_PRIMARIA);
      doc.text(String(valor), x + 4, y + 8);
      doc.setFont('helvetica', 'normal').setFontSize(8.5).setTextColor(...COR_TEXTO_SUAVE);
      doc.text(rotulo, x + 4, y + 13.5);
    });
    y += 22;

    const meiaLargura = (largura - margem * 2 - 8) / 2;
    const estilosResumo = {
      theme: 'grid',
      styles: { fontSize: 8.5, cellPadding: 1.8, textColor: COR_TEXTO, lineColor: [229, 231, 235] },
      headStyles: { fillColor: COR_PRIMARIA, textColor: 255 },
      columnStyles: { 1: { halign: 'right', cellWidth: 18 }, 2: { halign: 'right', cellWidth: 18 } },
    };
    const percentagem = (n) => `${Math.round((n / total) * 100)}%`;

    autoTable(doc, {
      ...estilosResumo,
      startY: y,
      margin: { left: margem, right: margem + meiaLargura + 8, top: topoContinuacao, bottom: 16 },
      tableWidth: meiaLargura,
      head: [['Estado', DIREITA('Total'), DIREITA('%')]],
      body: contar(pedidos, (p) => p.estado).map(([estado, n]) => [
        texto(obterInfoEstado(estado).rotulo), n, percentagem(n),
      ]),
    });
    const fimEstados = doc.lastAutoTable.finalY;

    autoTable(doc, {
      ...estilosResumo,
      startY: y,
      margin: { left: margem + meiaLargura + 8, right: margem, top: topoContinuacao, bottom: 16 },
      tableWidth: meiaLargura,
      head: [['Modalidade', DIREITA('Total'), DIREITA('%')]],
      body: contar(pedidos, (p) => p.tipoPropriedade).map(([tipo, n]) => [
        rotuloTipo(tipo), n, percentagem(n),
      ]),
    });
    y = Math.max(fimEstados, doc.lastAutoTable.finalY) + 10;
  }

  // ---------------------------------------------------------------- listagem
  doc.setFont('helvetica', 'bold').setFontSize(11).setTextColor(...COR_PRIMARIA);
  doc.text('Listagem de processos', margem, y);
  y += 3;

  const cabecalho = ['Processo', 'Título'];
  if (incluirRequerente) cabecalho.push('Requerente');
  cabecalho.push('Modalidade', 'Estado', 'Submissão', 'Taxa');

  const corpo = pedidos.map((p) => {
    const linha = [texto(p.numeroProcesso), texto(p.titulo)];
    if (incluirRequerente) linha.push(texto(p.requerenteNome));
    linha.push(
      rotuloTipo(p.tipoPropriedade),
      texto(obterInfoEstado(p.estado).rotulo),
      formatarData(p.dataSubmissao),
      p.pago ? 'Paga' : 'Por pagar',
    );
    return linha;
  });
  const colunaTaxa = cabecalho.length - 1;
  // Colunas curtas com largura fixa para não quebrarem ("Em Avaliação", "Por pagar");
  // o Título fica com o espaço restante.
  const indiceModalidade = incluirRequerente ? 3 : 2;
  const larguras = { 0: 30, [indiceModalidade]: 36, [indiceModalidade + 1]: 30, [indiceModalidade + 2]: 24, [colunaTaxa]: 22 };
  if (incluirRequerente) larguras[2] = 50;
  const columnStyles = Object.fromEntries(
    Object.entries(larguras).map(([i, cellWidth]) => [i, { cellWidth, ...(i === '0' ? { fontStyle: 'bold' } : {}) }]),
  );

  autoTable(doc, {
    startY: y,
    margin: { left: margem, right: margem, top: topoContinuacao, bottom: 16 },
    head: [cabecalho],
    body: corpo.length ? corpo : [[{ content: 'Sem processos para apresentar.', colSpan: cabecalho.length, styles: { halign: 'center', textColor: COR_TEXTO_SUAVE } }]],
    theme: 'striped',
    styles: { fontSize: 8.5, cellPadding: 2, textColor: COR_TEXTO, overflow: 'linebreak' },
    headStyles: { fillColor: COR_PRIMARIA, textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    columnStyles,
    showHead: 'everyPage',
    didParseCell(dados) {
      if (dados.section === 'body' && dados.column.index === colunaTaxa && corpo.length) {
        const paga = dados.cell.raw === 'Paga';
        dados.cell.styles.textColor = paga ? [21, 128, 61] : [180, 83, 9];
        dados.cell.styles.fontStyle = 'bold';
      }
    },
  });

  // ------------------------------------- rodapé e cabeçalho corrente (todas)
  const totalPaginas = doc.getNumberOfPages();
  for (let i = 1; i <= totalPaginas; i += 1) {
    doc.setPage(i);
    if (i > 1) {
      doc.setFont('helvetica', 'normal').setFontSize(8.5).setTextColor(...COR_TEXTO_SUAVE);
      doc.text(`IAPI - ${texto(titulo)}`, margem, 12);
      doc.setDrawColor(...COR_DESTAQUE).setLineWidth(0.5).line(margem, 15, largura - margem, 15);
    }
    doc.setDrawColor(229, 231, 235).setLineWidth(0.2).line(margem, altura - 12, largura - margem, altura - 12);
    doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(...COR_TEXTO_SUAVE);
    doc.text('SIPI - Sistema de Gestão de Propriedade Industrial', margem, altura - 7);
    doc.text(`Página ${i} de ${totalPaginas}`, largura - margem, altura - 7, { align: 'right' });
  }

  const sufixo = agora.toISOString().slice(0, 10);
  doc.save(nomeFicheiro || `relatorio-processos-${sufixo}.pdf`);
  return doc;
}
