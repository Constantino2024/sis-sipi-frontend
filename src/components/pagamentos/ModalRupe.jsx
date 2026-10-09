// src/components/pagamentos/ModalRupe.jsx
import { useEffect, useRef, useState } from 'react';
import { X, Copy, Check, RefreshCw, Loader2, CircleCheck, TriangleAlert, FileDown } from 'lucide-react';
import { gerarRupe, sincronizarRupe, mensagemDeErro } from '../../services/pagamentosService';
import { gerarNotaCobrancaRupePdf } from '../../utilitarios/geradorNotaCobrancaRupePdf';

function formatarValor(valor) {
  return `${Number(valor).toLocaleString('pt-PT', { minimumFractionDigits: 2 })} Kz`;
}

function formatarData(iso) {
  return iso ? new Date(iso).toLocaleDateString('pt-PT') : '—';
}

// 00010100000000000016 → 0001 0100 0000 0000 0016 (só visual; copia-se sem espaços)
function agruparReferencia(ref) {
  return ref.replace(/(.{4})/g, '$1 ').trim();
}

/**
 * Modal com a RUPE do pedido. Ao abrir, pede ao backend para gerar a RUPE
 * (se já existir uma em aberto, o backend devolve-a em vez de criar outra).
 *
 * Props:
 *  - pedido: { id, numeroProcesso }
 *  - onFechar: () => void
 *  - onPago?: (rupe) => void   chamado quando o pagamento é confirmado
 *  - autoBaixarPdf?: boolean   descarrega automaticamente o PDF da nota quando a RUPE estiver pronta
 */
export default function ModalRupe({ pedido, onFechar, onPago, autoBaixarPdf = false }) {
  const [rupe, setRupe] = useState(null);
  const [aCarregar, setACarregar] = useState(true);
  const [aVerificar, setAVerificar] = useState(false);
  const [aGerarPdf, setAGerarPdf] = useState(false);
  const [pdfDescarregado, setPdfDescarregado] = useState(false);
  const [erro, setErro] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [copiado, setCopiado] = useState(false);
  const botaoFecharRef = useRef(null);

  // Mudar `tentativa` volta a pedir a RUPE (botão «Tentar novamente»).
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let cancelado = false;
    gerarRupe(pedido.id)
      .then((resultado) => {
        if (!cancelado) setRupe(resultado);
      })
      .catch((excecao) => {
        if (!cancelado) setErro(mensagemDeErro(excecao));
      })
      .finally(() => {
        if (!cancelado) setACarregar(false);
      });
    return () => {
      cancelado = true;
    };
  }, [pedido.id, tentativa]);

  function tentarNovamente() {
    setErro(null);
    setACarregar(true);
    setTentativa((t) => t + 1);
  }

  // Escape fecha; foco inicial no botão de fechar.
  useEffect(() => {
    botaoFecharRef.current?.focus();
    function aoTeclar(e) {
      if (e.key === 'Escape') onFechar();
    }
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [onFechar]);

  async function copiarReferencia() {
    try {
      await navigator.clipboard.writeText(rupe.referencia);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setAviso('Não foi possível copiar automaticamente. Selecione e copie a referência manualmente.');
    }
  }

  async function verificarPagamento() {
    setAVerificar(true);
    setAviso(null);
    try {
      const atualizada = await sincronizarRupe(rupe.id);
      setRupe(atualizada);
      if (atualizada.estado === 'PAGO') {
        onPago?.(atualizada);
      } else {
        setAviso('Ainda não recebemos a confirmação do pagamento.');
      }
    } catch (excecao) {
      setAviso(mensagemDeErro(excecao));
    } finally {
      setAVerificar(false);
    }
  }

  async function descarregarNotaCobrancaPdf() {
    if (!rupe) return;
    setAGerarPdf(true);
    setAviso(null);
    try {
      await gerarNotaCobrancaRupePdf({ pedido, rupe });
      setPdfDescarregado(true);
    } catch (e) {
      console.error('Erro ao gerar Nota de Cobrança em PDF:', e);
      setAviso('Ocorreu um erro ao gerar o documento PDF. Tente novamente.');
    } finally {
      setAGerarPdf(false);
    }
  }

  const jaAutoBaixouRef = useRef(false);

  // Descarregamento automático opcional (ex: ao finalizar o pedido)
  useEffect(() => {
    if (autoBaixarPdf && rupe && !jaAutoBaixouRef.current) {
      jaAutoBaixouRef.current = true;
      const timeoutId = setTimeout(() => {
        gerarNotaCobrancaRupePdf({ pedido, rupe })
          .then(() => setPdfDescarregado(true))
          .catch((e) => console.error('Erro ao gerar Nota de Cobrança:', e));
      }, 400);
      return () => clearTimeout(timeoutId);
    }
  }, [autoBaixarPdf, rupe, pedido]);

  const paga = rupe?.estado === 'PAGO';

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50"
      onClick={onFechar}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal-rupe"
        className="bg-white w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
        style={{ borderRadius: '15px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-1">
          <h3 id="titulo-modal-rupe" className="text-base font-semibold text-primary-900">
            {paga ? 'Pagamento confirmado' : 'Pagamento da taxa (RUPE)'}
          </h3>
          <button
            ref={botaoFecharRef}
            type="button"
            onClick={onFechar}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Fechar"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-5">
          Pedido <span className="font-medium text-gray-700">{pedido.numeroProcesso}</span>
        </p>

        {aCarregar && (
          <div className="flex flex-col items-center gap-3 py-10" role="status">
            <Loader2 size={28} className="animate-spin text-primary-500" aria-hidden="true" />
            <p className="text-sm text-gray-600">A gerar a referência de pagamento…</p>
            <p className="text-xs text-gray-400 text-center">
              Pode demorar alguns segundos na primeira vez.
            </p>
          </div>
        )}

        {!aCarregar && erro && (
          <div role="alert">
            <div
              className="flex items-start gap-2 bg-red-50 border border-red-300 text-red-700 text-sm px-4 py-3 mb-4"
              style={{ borderRadius: '10px' }}
            >
              <TriangleAlert size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              <span>{erro}</span>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              O seu pedido foi registado. Pode tentar gerar a RUPE novamente agora ou mais tarde,
              a partir de «Meus Pedidos».
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={tentarNovamente}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium px-4 py-2.5 transition"
                style={{ borderRadius: '10px' }}
              >
                <RefreshCw size={15} aria-hidden="true" />
                Tentar novamente
              </button>
              <button
                type="button"
                onClick={onFechar}
                className="flex-1 text-gray-600 hover:text-gray-800 text-sm font-medium px-4 py-2.5 border border-gray-200"
                style={{ borderRadius: '10px' }}
              >
                Fechar
              </button>
            </div>
          </div>
        )}

        {!aCarregar && !erro && rupe && (
          <>
            {paga ? (
              <div
                className="flex items-start gap-2 bg-green-50 border border-green-300 text-green-700 text-sm px-4 py-3 mb-4"
                style={{ borderRadius: '10px' }}
              >
                <CircleCheck size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                <span>
                  Pagamento recebido em {formatarData(rupe.dataPagamento)}
                  {rupe.numeroRecibo ? ` — recibo ${rupe.numeroRecibo}` : ''}.
                </span>
              </div>
            ) : rupe.expirada ? (
              <div
                className="flex items-start gap-2 bg-amber-50 border border-amber-300 text-amber-700 text-sm px-4 py-3 mb-4"
                style={{ borderRadius: '10px' }}
              >
                <TriangleAlert size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                <span>Esta referência expirou. Feche e abra novamente para gerar uma nova.</span>
              </div>
            ) : (
              <p className="text-sm text-gray-600 mb-4">
                Use a referência abaixo para pagar a taxa num Multicaixa, banco ou serviço
                de pagamento que aceite RUPE.
              </p>
            )}

            <div
              className="bg-primary-50 border border-primary-200 px-4 py-4 text-center mb-4"
              style={{ borderRadius: '10px' }}
            >
              <p className="text-xs uppercase tracking-wide text-primary-700 mb-1">Referência RUPE</p>
              <p
                className="text-xl font-bold text-primary-900 tracking-wider font-mono break-all"
                aria-label={`Referência ${rupe.referencia.split('').join(' ')}`}
              >
                {agruparReferencia(rupe.referencia)}
              </p>
              {!paga && (
                <button
                  type="button"
                  onClick={copiarReferencia}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary-500 hover:text-primary-700"
                >
                  {copiado ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
                  {copiado ? 'Copiada!' : 'Copiar referência'}
                </button>
              )}
            </div>

            <dl className="text-sm space-y-2 mb-5">
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Serviço</dt>
                <dd className="text-gray-800 text-right">{rupe.descricaoServico || rupe.codigoServico}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Valor a pagar</dt>
                <dd className="text-gray-900 font-semibold">{formatarValor(rupe.valor)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Contribuinte</dt>
                <dd className="text-gray-800 text-right">{rupe.nomeContribuinte}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">NIF</dt>
                <dd className="text-gray-800">{rupe.nif}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Válida até</dt>
                <dd className="text-gray-800">{formatarData(rupe.dataExpiracao)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Estado</dt>
                <dd className={paga ? 'text-green-700 font-medium' : 'text-yellow-700 font-medium'}>
                  {paga ? 'Pago' : 'Aguarda pagamento'}
                </dd>
              </div>
            </dl>

            {aviso && (
              <p role="status" className="text-xs text-gray-600 bg-gray-50 border border-gray-200 px-3 py-2 mb-4" style={{ borderRadius: '10px' }}>
                {aviso}
              </p>
            )}

            {/* Botão Oficial: Descarregar Nota de Cobrança RUPE em PDF */}
            <div className="mb-4">
              <button
                type="button"
                onClick={descarregarNotaCobrancaPdf}
                disabled={aGerarPdf}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#C9A227] hover:bg-[#b08e20] disabled:opacity-60 text-primary-950 font-bold text-sm px-4 py-2.5 shadow-sm transition"
                style={{ borderRadius: '10px' }}
              >
                {aGerarPdf ? (
                  <Loader2 size={16} className="animate-spin text-primary-950" aria-hidden="true" />
                ) : (
                  <FileDown size={16} className="text-primary-950" aria-hidden="true" />
                )}
                <span>{aGerarPdf ? 'A Gerar Nota de Cobrança…' : 'Descarregar Nota de Cobrança (PDF)'}</span>
              </button>
              {pdfDescarregado && (
                <p className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 py-1.5 px-3 mt-1.5 text-center font-medium" style={{ borderRadius: '6px' }}>
                  Nota de Cobrança oficial gerada e descarregada com sucesso!
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!paga && (
                <button
                  type="button"
                  onClick={verificarPagamento}
                  disabled={aVerificar}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2.5 transition"
                  style={{ borderRadius: '10px' }}
                >
                  {aVerificar ? (
                    <Loader2 size={15} className="animate-spin" aria-hidden="true" />
                  ) : (
                    <RefreshCw size={15} aria-hidden="true" />
                  )}
                  {aVerificar ? 'A verificar…' : 'Já paguei — verificar'}
                </button>
              )}
              <button
                type="button"
                onClick={onFechar}
                className="flex-1 text-gray-600 hover:text-gray-800 text-sm font-medium px-4 py-2.5 border border-gray-200"
                style={{ borderRadius: '10px' }}
              >
                {paga ? 'Fechar' : 'Pagar mais tarde'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
