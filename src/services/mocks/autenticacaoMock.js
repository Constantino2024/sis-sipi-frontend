// src/services/mocks/autenticacaoMock.js

import { obterUtilizadores, guardarNovoUtilizador, guardarUtilizadores } from '../../data/utilizadoresMock';

function atrasoDeRede(dados, duracaoMs = 300) {
  return new Promise((resolve) => setTimeout(() => resolve(dados), duracaoMs));
}

function erroDeApiSimulado(mensagem) {
  const erro = new Error(mensagem);
  erro.response = { data: { message: mensagem } };
  return erro;
}

export async function registarMock(dadosUtilizador) {
  const utilizadores = obterUtilizadores();
  const jaExiste = utilizadores.some((u) => u.email === dadosUtilizador.email);
  if (jaExiste) {
    throw erroDeApiSimulado('Este email já está registado.');
  }
  const novoUtilizador = guardarNovoUtilizador({ ...dadosUtilizador, perfil: 'REQUERENTE' });
  return atrasoDeRede({ user: novoUtilizador });
}

export async function entrarMock(email, palavraPasse) {
  const utilizadores = obterUtilizadores();
  const utilizador = utilizadores.find((u) => u.email === email && u.password === palavraPasse);
  if (!utilizador) {
    throw erroDeApiSimulado('Credenciais inválidas.');
  }
  const tokenFalso = `mock-token.${utilizador.id}.${Date.now()}`;
  return atrasoDeRede({ user: utilizador, token: tokenFalso });
}

export async function atualizarPerfilMock(utilizadorId, dadosNovos) {
  const utilizadores = obterUtilizadores();
  const indice = utilizadores.findIndex((u) => u.id === utilizadorId);
  if (indice === -1) throw erroDeApiSimulado('Utilizador não encontrado.');

  if (dadosNovos.email && dadosNovos.email !== utilizadores[indice].email) {
    const emailEmUso = utilizadores.some((u, i) => i !== indice && u.email === dadosNovos.email);
    if (emailEmUso) throw erroDeApiSimulado('Este email já está a ser utilizado por outra conta.');
  }

  utilizadores[indice] = { ...utilizadores[indice], ...dadosNovos };
  guardarUtilizadores(utilizadores);
  return atrasoDeRede(utilizadores[indice]);
}

export async function alterarPasswordMock(utilizadorId, passwordAtual, novaPassword) {
  const utilizadores = obterUtilizadores();
  const indice = utilizadores.findIndex((u) => u.id === utilizadorId);
  if (indice === -1) throw erroDeApiSimulado('Utilizador não encontrado.');
  if (utilizadores[indice].password !== passwordAtual) {
    throw erroDeApiSimulado('A palavra-passe atual está incorreta.');
  }
  utilizadores[indice] = { ...utilizadores[indice], password: novaPassword };
  guardarUtilizadores(utilizadores);
  return atrasoDeRede({ sucesso: true });
}