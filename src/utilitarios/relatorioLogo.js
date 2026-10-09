// src/utilitarios/relatorioLogo.js
// O jsPDF precisa do logótipo como data URL.
import logoGovUrl from '../assets/images/iapi_gov_logo.png';
import logoPadraoUrl from '../assets/images/logoiapi.PNG';

let cacheGov = null;
let cachePadrao = null;

/**
 * Carrega o logótipo oficial do IAPI (https://c2a.portais.gov.ao/uploads/iapi_df03906d75.png)
 * em formato data URL para embutir directamente no jsPDF.
 */
export async function carregarLogoIapiGovDataUrl() {
  if (cacheGov) return cacheGov;
  try {
    const resposta = await fetch(logoGovUrl);
    const blob = await resposta.blob();
    cacheGov = await new Promise((resolve, reject) => {
      const leitor = new FileReader();
      leitor.onload = () => resolve(leitor.result);
      leitor.onerror = reject;
      leitor.readAsDataURL(blob);
    });
    return cacheGov;
  } catch {
    return carregarLogoDataUrl();
  }
}

/** Devolve o logótipo geral como data URL, ou null se não conseguir carregar. */
export async function carregarLogoDataUrl() {
  if (cachePadrao) return cachePadrao;
  try {
    const resposta = await fetch(logoPadraoUrl);
    const blob = await resposta.blob();
    cachePadrao = await new Promise((resolve, reject) => {
      const leitor = new FileReader();
      leitor.onload = () => resolve(leitor.result);
      leitor.onerror = reject;
      leitor.readAsDataURL(blob);
    });
    return cachePadrao;
  } catch {
    return null;
  }
}
