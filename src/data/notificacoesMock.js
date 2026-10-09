// src/data/notificacoesMock.js

const CHAVE_ARMAZENAMENTO = '@sipi/notificacoes';

const NOTIFICACOES_SEMENTE = [
  {
    id: 1,
    requerenteId: 1,
    tipo: 'ATUALIZACAO',
    titulo: 'O seu pedido PI-2024-0031 mudou de estado',
    descricao: 'O processo passou para "Em Análise Técnica".',
    data: '2026-08-28T09:15:00.000Z',
    lida: false,
  },
  {
    id: 2,
    requerenteId: 1,
    tipo: 'EXIGENCIA',
    titulo: 'Exigência emitida no processo PI-2024-0031',
    descricao: 'É necessário submeter documentação adicional no prazo de 15 dias.',
    data: '2026-08-27T14:30:00.000Z',
    lida: false,
  },
  {
    id: 3,
    requerenteId: 1,
    tipo: 'RESPOSTA_TECNICO',
    titulo: 'O Técnico Examinador respondeu à sua questão',
    descricao: 'Consulte a resposta no processo PI-2024-0019.',
    data: '2026-08-25T11:00:00.000Z',
    lida: true,
  },
  {
    id: 4,
    requerenteId: 1,
    tipo: 'PRAZO',
    titulo: 'Prazo a terminar em 3 dias',
    descricao: 'Tem até 31/08/2026 para responder à exigência do processo PI-2024-0031.',
    data: '2026-08-24T08:00:00.000Z',
    lida: true,
  },
];

export function obterNotificacoes() {
  const dadosGuardados = localStorage.getItem(CHAVE_ARMAZENAMENTO);
  if (!dadosGuardados) {
    localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(NOTIFICACOES_SEMENTE));
    return NOTIFICACOES_SEMENTE;
  }
  return JSON.parse(dadosGuardados);
}

export function guardarNotificacoes(notificacoes) {
  localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(notificacoes));
}