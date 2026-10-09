// src/services/api.js
import axios from 'axios';

// URL base da API do back-end (configurável via variável de ambiente VITE_API_URL)
const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para refresh token automático quando a API retorna 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('Sessão expirada');
        }

        const response = await axios.post(`${API_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });

        const novoToken = response.data.access;
        localStorage.setItem('access_token', novoToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${novoToken}`;
        originalRequest.headers.Authorization = `Bearer ${novoToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('@sipi/sessao');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Extrai a mensagem de erro formatada retornada pelo back-end.
 */
export function extrairMensagemErro(error, mensagemPadrao = 'Ocorreu um erro na comunicação com o servidor.') {
  if (!error) return mensagemPadrao;
  const dados = error.response?.data;

  if (typeof dados === 'string') return dados;
  if (dados?.detail) return dados.detail;
  if (dados?.error) return dados.error;
  if (dados?.message) return dados.message;

  // Erros de validação em campos (ex: { email: ['Email inválido'] })
  if (dados && typeof dados === 'object') {
    const primeiroCampo = Object.keys(dados)[0];
    if (primeiroCampo && Array.isArray(dados[primeiroCampo])) {
      return `${primeiroCampo}: ${dados[primeiroCampo][0]}`;
    }
    if (primeiroCampo && typeof dados[primeiroCampo] === 'string') {
      return `${primeiroCampo}: ${dados[primeiroCampo]}`;
    }
  }

  if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
    return 'Não foi possível ligar ao servidor back-end. Verifique a sua ligação ou se o serviço está ativo.';
  }

  return error.message || mensagemPadrao;
}

export default api;