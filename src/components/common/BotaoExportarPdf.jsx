// src/components/common/BotaoExportarPdf.jsx
import { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';

/**
 * Botão que corre `aoGerar` (async) e mostra o estado de progresso.
 * Se falhar, mostra a mensagem junto ao botão em vez de falhar em silêncio.
 */
export default function BotaoExportarPdf({ aoGerar, desativado = false, rotulo = 'Exportar PDF' }) {
  const [aGerar, setAGerar] = useState(false);
  const [erro, setErro] = useState(null);

  async function aoClicar() {
    setAGerar(true);
    setErro(null);
    try {
      await aoGerar();
    } catch (excecao) {
      console.error('Erro ao gerar PDF:', excecao);
      setErro('Não foi possível gerar o PDF. Tente novamente.');
    } finally {
      setAGerar(false);
    }
  }

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={aoClicar}
        disabled={desativado || aGerar}
        className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2.5 transition"
        style={{ borderRadius: '15px' }}
      >
        {aGerar ? (
          <Loader2 size={16} className="animate-spin" aria-hidden="true" />
        ) : (
          <FileDown size={16} aria-hidden="true" />
        )}
        {aGerar ? 'A gerar…' : rotulo}
      </button>
      {erro && (
        <span role="alert" className="text-xs text-red-600">
          {erro}
        </span>
      )}
    </div>
  );
}
