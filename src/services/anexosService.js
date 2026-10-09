// src/services/anexosService.js
import api from './api';

export async function uploadAnexo(pedidoId, ficheiro, tipoDocumento) {
  const formData = new FormData();
  formData.append('pedido', pedidoId);
  formData.append('url', ficheiro);
  formData.append('tipo_documento', tipoDocumento);

  const resposta = await api.post('/anexos/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return resposta.data;
}

export async function listarAnexos(pedidoId) {
  const resposta = await api.get('/anexos/', {
    params: { pedido: pedidoId },
  });
  return resposta.data.results;
}

export async function deletarAnexo(anexoId) {
  await api.delete(`/anexos/${anexoId}/`);
  return { sucesso: true };
}

export async function obterAnexo(anexoId) {
  const resposta = await api.get(`/anexos/${anexoId}/`);
  return resposta.data;
}