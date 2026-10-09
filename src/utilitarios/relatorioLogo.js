// src/utilitarios/relatorioLogo.js
// O jsPDF precisa do logótipo como data URL. Fica separado de relatorioPdf.js
// para que este continue independente de assets (e testável fora do Vite).
import logoUrl from '../assets/images/logoiapi.PNG';

let cache = null;

/** Devolve o logótipo do IAPI como data URL, ou null se não conseguir carregar
 *  (nesse caso o relatório é gerado na mesma, só sem logótipo). */
export async function carregarLogoDataUrl() {
  if (cache) return cache;
  try {
    const resposta = await fetch(logoUrl);
    const blob = await resposta.blob();
    cache = await new Promise((resolve, reject) => {
      const leitor = new FileReader();
      leitor.onload = () => resolve(leitor.result);
      leitor.onerror = reject;
      leitor.readAsDataURL(blob);
    });
    return cache;
  } catch {
    return null;
  }
}
