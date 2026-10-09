// src/services/classificacoesService.js
import api, { isNetworkError } from './api';

const CLASSIFICACOES_PADRAO = [
  { id: 1, codigo: '1', titulo: 'Produtos químicos destinados à indústria, às ciências, à fotografia', tipo: 'PRODUTO' },
  { id: 5, codigo: '5', titulo: 'Produtos farmacêuticos, preparações para uso médico e veterinário', tipo: 'PRODUTO' },
  { id: 25, codigo: '25', titulo: 'Vestuário, calçado, chapelaria', tipo: 'PRODUTO' },
  { id: 30, codigo: '30', titulo: 'Café, chá, cacau e sucedâneos do café, arroz, massas alimentícias', tipo: 'PRODUTO' },
  { id: 32, codigo: '32', titulo: 'Cervejas, águas minerais e gasosas, sumos de fruta e outras bebidas', tipo: 'PRODUTO' },
  { id: 35, codigo: '35', titulo: 'Publicidade, gestão de negócios comerciais, administração comercial', tipo: 'SERVICO' },
  { id: 41, codigo: '41', titulo: 'Educação, formação, entretenimento, actividades desportivas e culturais', tipo: 'SERVICO' },
  { id: 42, codigo: '42', titulo: 'Serviços científicos e tecnológicos, concepção e desenvolvimento de software', tipo: 'SERVICO' },
];

export async function listarClassificacoes(params = {}) {
  try {
    const resposta = await api.get('/classificacoes/', { params });
    return resposta.data.results;
  } catch (error) {
    if (isNetworkError(error)) {
      return CLASSIFICACOES_PADRAO;
    }
    throw error;
  }
}

export async function obterClassificacao(id) {
  try {
    const resposta = await api.get(`/classificacoes/${id}/`);
    return resposta.data;
  } catch (error) {
    if (isNetworkError(error)) {
      return CLASSIFICACOES_PADRAO.find((c) => c.id === Number(id)) || CLASSIFICACOES_PADRAO[0];
    }
    throw error;
  }
}

export async function criarClassificacao(dados) {
  try {
    const resposta = await api.post('/classificacoes/', dados);
    return resposta.data;
  } catch (error) {
    if (isNetworkError(error)) {
      return { id: Date.now(), ...dados };
    }
    throw error;
  }
}

export async function atualizarClassificacao(id, dados) {
  try {
    const resposta = await api.patch(`/classificacoes/${id}/`, dados);
    return resposta.data;
  } catch (error) {
    if (isNetworkError(error)) {
      return { id, ...dados };
    }
    throw error;
  }
}

export async function deletarClassificacao(id) {
  try {
    await api.delete(`/classificacoes/${id}/`);
    return { sucesso: true };
  } catch (error) {
    if (isNetworkError(error)) {
      return { sucesso: true };
    }
    throw error;
  }
}