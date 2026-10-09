// src/data/pedidosMock.js
import { gerarNumeroProcesso } from '../utilitarios/numeroProcesso';

const CHAVE_ARMAZENAMENTO = '@sipi/pedidos';

const PEDIDOS_SEMENTE = [
  {
    id: 1,
    numeroProcesso: gerarNumeroProcesso('MARCA', 2026, 1),               // M/2026/00001
    tipoPropriedade: 'MARCA',
    titulo: 'Cuanza Prepa',
    requerenteId: 1,
    requerenteNome: 'Requerente Teste',
    estado: 'EM_ANALISE',
    dataSubmissao: '2026-06-02T09:00:00.000Z',
    dataUltimaAtualizacao: '2026-06-10T14:30:00.000Z',
    tecnicoResponsavelId: 2,
    observacoes: null,
    exigencias: [],
    parecer: null,
  },
  {
    id: 2,
    numeroProcesso: gerarNumeroProcesso('PATENTE', 2026, 1),             // P/2026/00001
    tipoPropriedade: 'PATENTE',
    titulo: 'Sistema de irrigação por gotejamento solar',
    requerenteId: 1,
    requerenteNome: 'Requerente Teste',
    estado: 'EXIGENCIA_EMITIDA',
    dataSubmissao: '2026-05-20T11:15:00.000Z',
    dataUltimaAtualizacao: '2026-06-15T08:00:00.000Z',
    tecnicoResponsavelId: 2,
    observacoes: null,
    exigencias: [
      {
        id: 1,
        descricao: 'Falta memória descritiva assinada.',
        prazo: '2026-08-01',
        dataEmissao: '2026-06-15T08:00:00.000Z',
        tecnicoId: 2,
        respondida: false,
      },
    ],
    parecer: null,
  },
  {
    id: 3,
    numeroProcesso: gerarNumeroProcesso('DESENHO_INDUSTRIAL', 2026, 1),  // D/2026/00001
    tipoPropriedade: 'DESENHO_INDUSTRIAL',
    titulo: 'Embalagem garrafa Kissama',
    requerenteId: 1,
    requerenteNome: 'Requerente Teste',
    estado: 'DEFERIDO',
    dataSubmissao: '2026-04-10T10:00:00.000Z',
    dataUltimaAtualizacao: '2026-05-01T16:45:00.000Z',
    tecnicoResponsavelId: 2,
    observacoes: null,
    exigencias: [],
    parecer: {
      criterios: {
        titularidade: true,
        documentacao: true,
        classificacao: true,
        anterioridade: true,
        requisitos_formais: true,
      },
      decisao: 'FAVORAVEL',
      observacoes: 'Processo em conformidade com todos os requisitos formais.',
      tecnicoId: 2,
      dataEmissao: '2026-04-28T09:30:00.000Z',
    },
  },
  {
    id: 4,
    numeroProcesso: gerarNumeroProcesso('MARCA', 2026, 2),               // M/2026/00002
    tipoPropriedade: 'MARCA',
    titulo: 'Padaria Bom Dia Luanda',
    requerenteId: 1,
    requerenteNome: 'Requerente Teste',
    estado: 'SUBMETIDO',
    dataSubmissao: '2026-07-18T13:20:00.000Z',
    dataUltimaAtualizacao: '2026-07-18T13:20:00.000Z',
    tecnicoResponsavelId: null,
    observacoes: null,
    exigencias: [],
    parecer: null,
  },
];

export function obterPedidos() {
  const dadosGuardados = localStorage.getItem(CHAVE_ARMAZENAMENTO);
  if (!dadosGuardados) {
    localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(PEDIDOS_SEMENTE));
    return PEDIDOS_SEMENTE;
  }
  return JSON.parse(dadosGuardados);
}

export function guardarPedidos(pedidos) {
  localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(pedidos));
}