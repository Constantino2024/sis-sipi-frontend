// src/services/anexosService.js
import api, { isNetworkError } from './api';

export async function uploadAnexo(pedidoId, ficheiro, tipoDocumento) {
  try {
    const formData = new FormData();
    formData.append('pedido', pedidoId);
    formData.append('url', ficheiro);
    formData.append('tipo_documento', tipoDocumento);

    const resposta = await api.post('/anexos/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return resposta.data;
  } catch (error) {
    if (isNetworkError(error)) {
      return {
        id: Date.now(),
        pedido: pedidoId,
        url: ficheiro?.name ? URL.createObjectURL(ficheiro) : '#',
        tipo_documento: tipoDocumento,
        nome_ficheiro: ficheiro?.name || 'documento.pdf',
        data_upload: new Date().toISOString(),
      };
    }
    throw error;
  }
}

export async function listarAnexos(pedidoId) {
  try {
    const resposta = await api.get('/anexos/', {
      params: { pedido: pedidoId },
    });
    return resposta.data.results;
  } catch (error) {
    if (isNetworkError(error)) {
      return [
        {
          id: 1,
          pedido: pedidoId,
          url: '#',
          tipo_documento: 'MEMORIA_DESCRITIVA',
          nome_ficheiro: 'memoria_descritiva.pdf',
          data_upload: new Date().toISOString(),
        },
      ];
    }
    throw error;
  }
}

export async function deletarAnexo(anexoId) {
  try {
    await api.delete(`/anexos/${anexoId}/`);
    return { sucesso: true };
  } catch (error) {
    if (isNetworkError(error)) {
      return { sucesso: true };
    }
    throw error;
  }
}

export async function obterAnexo(anexoId) {
  try {
    const resposta = await api.get(`/anexos/${anexoId}/`);
    return resposta.data;
  } catch (error) {
    if (isNetworkError(error)) {
      return {
        id: anexoId,
        url: '#',
        tipo_documento: 'GERAL',
        nome_ficheiro: 'documento.pdf',
      };
    }
    throw error;
  }
}