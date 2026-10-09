// src/data/utilizadoresMock.js

const CHAVE_ARMAZENAMENTO = '@sipi/utilizadores';

const UTILIZADORES_SEMENTE = [
  { id: 1, nome: 'Requerente Teste', email: 'requerente@sipi.ao', password: '123456', perfil: 'REQUERENTE' },
  { id: 2, nome: 'Técnico Examinador Teste', email: 'tecnico@sipi.ao', password: '123456', perfil: 'TECNICO_EXAMINADOR' },
  { id: 3, nome: 'Administrador Teste', email: 'admin@sipi.ao', password: '123456', perfil: 'ADMINISTRADOR' },
];

export function obterUtilizadores() {
  const dadosGuardados = localStorage.getItem(CHAVE_ARMAZENAMENTO);
  if (!dadosGuardados) {
    localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(UTILIZADORES_SEMENTE));
    return UTILIZADORES_SEMENTE;
  }
  return JSON.parse(dadosGuardados);
}

export function guardarNovoUtilizador(utilizador) {
  const utilizadores = obterUtilizadores();
  const novoUtilizador = { ...utilizador, id: Date.now() };
  utilizadores.push(novoUtilizador);
  localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(utilizadores));
  return novoUtilizador;
}

export function guardarUtilizadores(utilizadores) {
  localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(utilizadores));
}