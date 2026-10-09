// src/components/pedidos/ModalDetalhesPedidoIapi.jsx
import { useState } from 'react';
import {
  X,
  Award,
  CheckCircle2,
  Clock,
  CreditCard,
  ChevronRight,
  Layers,
  User,
  Sparkles,
} from 'lucide-react';
import { obterInfoEstado } from '../../utilitarios/estadosPedido';
import { avancarFluxoIapi } from '../../services/pedidosService';
import CertificadoMarcaModal from './CertificadoMarcaModal';
import ModalRupe from '../pagamentos/ModalRupe';

const FLUXO_IAPI_PASSOS = [
  { estado: 'DEPOSITADO', titulo: '1. Depósito Electrónico', descricao: 'Entrada oficial do processo no sistema do IAPI' },
  { estado: 'PAGO', titulo: '2. Liquidação da RUPE', descricao: 'Confirmação do pagamento da taxa via CUTE' },
  { estado: 'EXAME_FORMAL', titulo: '3. Exame Formal', descricao: 'Verificação da documentação e legitimidade' },
  { estado: 'PUBLICADO', titulo: '4. Publicação no BPI', descricao: 'Divulgação oficial no Boletim da Propriedade Industrial' },
  { estado: 'EM_OPOSICAO', titulo: '5. Prazo de Oposição (90 Dias)', descricao: 'Abertura para oposição pública de terceiros (Art. 64.º da Lei 3/92)' },
  { estado: 'EXAME_SUBSTANTIVO', titulo: '6. Exame Substantivo', descricao: 'Análise de distintividade e anterioridade de marcas' },
  { estado: 'PARECER_FAVORAVEL', titulo: '7. Parecer Técnico', descricao: 'Relatório favorável emitido pelo examinador' },
  { estado: 'DEFERIDO', titulo: '8. Despacho de Concessão', descricao: 'Decisão do Director Geral e concessão do registo' },
  { estado: 'CONCEDIDO', titulo: '9. Certificado Emitido', descricao: 'Título de registo com protecção de 10 anos' },
];

export default function ModalDetalhesPedidoIapi({ pedidoInicial, onFechar, onAtualizar }) {
  const [pedido, setPedido] = useState(pedidoInicial);
  const [mostrarCertificado, setMostrarCertificado] = useState(false);
  const [mostrarRupe, setMostrarRupe] = useState(false);
  const [aAvancar, setAAvancar] = useState(false);

  if (!pedido) return null;

  const infoEstado = obterInfoEstado(pedido.estado);
  const detalhes = pedido.detalhesMarca || {};
  const titular = pedido.titular || {};
  const classesNice = pedido.classesNice || [];

  // Encontrar o índice no fluxo
  const indicePassoAtual = FLUXO_IAPI_PASSOS.findIndex((p) => p.estado === pedido.estado);

  // Próximo estado sugerido para simulação
  const proximoPasso =
    indicePassoAtual >= 0 && indicePassoAtual < FLUXO_IAPI_PASSOS.length - 1
      ? FLUXO_IAPI_PASSOS[indicePassoAtual + 1]
      : null;

  async function avancarEtapa(proximoEstado) {
    setAAvancar(true);
    try {
      const atualizado = await avancarFluxoIapi(pedido.id, proximoEstado, {
        pago: proximoEstado !== 'DEPOSITADO',
      });
      setPedido(atualizado);
      if (onAtualizar) onAtualizar(atualizado);
    } catch (err) {
      console.error('Erro ao avançar etapa:', err);
    } finally {
      setAAvancar(false);
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-detalhe-iapi"
      >
        <div className="bg-white max-w-4xl w-full my-6 shadow-2xl border border-gray-200 flex flex-col max-h-[92vh] overflow-hidden rounded-lg">
          {/* Topo do Dossier */}
          <div className="bg-primary-900 text-white p-5 sm:p-6 flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-xs uppercase tracking-widest text-secondary-400 font-semibold">
                  Dossier de Marca · IAPI
                </span>
                <span className={`px-2 py-0.5 text-xs font-semibold border ${infoEstado.cor}`}>
                  {infoEstado.rotulo}
                </span>
                {pedido.pago ? (
                  <span className="px-2 py-0.5 text-xs font-medium bg-emerald-900/60 text-emerald-300 border border-emerald-500/40">
                    RUPE Paga
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-xs font-medium bg-amber-900/60 text-amber-300 border border-amber-500/40">
                    Aguardando Pagamento
                  </span>
                )}
              </div>
              <h2 id="titulo-detalhe-iapi" className="text-xl sm:text-2xl font-bold font-serif">
                {pedido.titulo}
              </h2>
              <p className="text-xs text-primary-200 mt-1 font-mono">
                Processo N.º {pedido.numeroProcesso} · Submetido em{' '}
                {new Date(pedido.dataSubmissao).toLocaleDateString('pt-PT')}
              </p>
            </div>

            <button
              type="button"
              onClick={onFechar}
              className="text-primary-300 hover:text-white p-1 rounded-md transition"
              aria-label="Fechar"
            >
              <X size={22} />
            </button>
          </div>

          {/* Conteúdo com scroll */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-sm">
            {/* Bloco de Acções Rápidas do Fluxo IAPI */}
            <div className="bg-primary-50/70 border border-primary-200 p-4 rounded-md flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-primary-900 uppercase tracking-wide flex items-center gap-1.5">
                  <Sparkles size={14} className="text-secondary-600" />
                  Tramitação Oficial do IAPI
                </span>
                <p className="text-xs text-primary-700">
                  {pedido.estado === 'CONCEDIDO' || pedido.estado === 'DEFERIDO'
                    ? 'O registo foi concedido! O certificado oficial está emitido com validade de 10 anos.'
                    : `Processo actualmente na fase: ${infoEstado.rotulo}.`}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {!pedido.pago && (
                  <button
                    type="button"
                    onClick={() => setMostrarRupe(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary-500 hover:bg-secondary-400 text-primary-900 font-semibold text-xs rounded transition"
                  >
                    <CreditCard size={14} />
                    Ver / Pagar RUPE
                  </button>
                )}

                {(pedido.estado === 'DEFERIDO' || pedido.estado === 'CONCEDIDO') && (
                  <button
                    type="button"
                    onClick={() => setMostrarCertificado(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-700 hover:bg-primary-800 text-white font-semibold text-xs rounded transition"
                  >
                    <Award size={14} />
                    Ver Certificado Oficial IAPI
                  </button>
                )}

                {proximoPasso && (
                  <button
                    type="button"
                    disabled={aAvancar}
                    onClick={() => avancarEtapa(proximoPasso.estado)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-primary-300 hover:bg-primary-100 text-primary-800 text-xs font-medium rounded transition disabled:opacity-50"
                    title={`Avançar para: ${proximoPasso.titulo}`}
                  >
                    <span>Simular avanço: {proximoPasso.titulo}</span>
                    <ChevronRight size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* Linha do Tempo Visual do IAPI */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Linha do Tempo Oficial de Tramitação
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {FLUXO_IAPI_PASSOS.map((passo, idx) => {
                  const jaPassou = indicePassoAtual > idx;
                  const eAtual = indicePassoAtual === idx;

                  return (
                    <div
                      key={passo.estado}
                      className={`p-3 border text-xs transition ${
                        eAtual
                          ? 'border-primary-500 bg-primary-50/50 shadow-sm'
                          : jaPassou
                          ? 'border-green-200 bg-green-50/40 text-gray-700'
                          : 'border-gray-200 bg-gray-50 text-gray-400'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-semibold">
                        {jaPassou ? (
                          <CheckCircle2 size={14} className="text-green-600 shrink-0" />
                        ) : eAtual ? (
                          <Clock size={14} className="text-primary-600 shrink-0 animate-pulse" />
                        ) : (
                          <span className="w-3.5 h-3.5 rounded-full border border-gray-300 inline-block shrink-0" />
                        )}
                        <span className={eAtual ? 'text-primary-900 font-bold' : jaPassou ? 'text-green-900' : ''}>
                          {passo.titulo}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1 leading-tight">{passo.descricao}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ficha da Marca e Imagem */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {/* Logótipo / Imagem */}
              <div className="p-4 border border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                  Reprodução do Sinal
                </span>
                {detalhes.logotipoUrl ? (
                  <img
                    src={detalhes.logotipoUrl}
                    alt={pedido.titulo}
                    className="max-h-36 max-w-full object-contain bg-white p-2 border border-gray-200 shadow-sm"
                  />
                ) : (
                  <div className="w-full h-32 flex flex-col items-center justify-center bg-white border border-gray-200 text-center p-3">
                    <span className="text-lg font-serif font-bold text-primary-900">{pedido.titulo}</span>
                    <span className="text-[10px] text-gray-400 uppercase mt-1">Sinal Nominativo</span>
                  </div>
                )}
                <span className="text-xs text-gray-500 mt-3 font-semibold">
                  {detalhes.apresentacao || 'Mista'} · {detalhes.natureza || 'Marca de Produto'}
                </span>
              </div>

              {/* Informações da Marca */}
              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-gray-400 block uppercase">Denominação</span>
                    <strong className="text-base text-gray-900">{pedido.titulo}</strong>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block uppercase">Natureza</span>
                    <span className="text-gray-800">{detalhes.natureza || 'Marca de Produto'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block uppercase">Forma de Apresentação</span>
                    <span className="text-gray-800">{detalhes.apresentacao || 'Mista'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block uppercase">Cores Reivindicadas</span>
                    <span className="text-gray-800">
                      {detalhes.reivindicaCores ? detalhes.coresReivindicadas || 'Sim' : 'Não (Preto e branco)'}
                    </span>
                  </div>
                </div>

                {pedido.descricao && (
                  <div>
                    <span className="text-xs text-gray-400 block uppercase">Resumo / Memória Descritiva</span>
                    <p className="text-gray-700 bg-gray-50 p-2.5 border border-gray-200 text-xs leading-relaxed">
                      {pedido.descricao}
                    </p>
                  </div>
                )}

                {detalhes.elementosDesconsiderados && (
                  <div>
                    <span className="text-xs text-gray-400 block uppercase">Renúncia de Exclusividade (Disclaimer)</span>
                    <p className="text-gray-600 text-xs italic">
                      "{detalhes.elementosDesconsiderados}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Classes de Nice (NCL) */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Layers size={14} />
                Classificação Internacional de Nice (NCL)
              </h4>
              {classesNice.length > 0 ? (
                <div className="space-y-2">
                  {classesNice.map((cn) => (
                    <div
                      key={cn.classe}
                      className="p-3 bg-gray-50 border border-gray-200 rounded-sm text-xs space-y-1"
                    >
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-primary-100 text-primary-800 font-mono font-bold">
                          Classe {cn.classe}
                        </span>
                        <strong className="text-gray-800">{cn.titulo}</strong>
                      </div>
                      {cn.especificacao && (
                        <p className="text-gray-600 pl-1">
                          <span className="font-semibold text-gray-500">Produtos/Serviços protegidos: </span>
                          {cn.especificacao}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500">Classificação padrão (Classe 32 ou Classe seleccionada).</p>
              )}
            </div>

            {/* Dados do Requerente / Titular */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <User size={14} />
                Dados do Titular do Registo
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-gray-50 p-3 border border-gray-200">
                <div>
                  <span className="text-gray-400 block text-[11px]">Nome / Firma</span>
                  <strong className="text-gray-800">{titular.nomeOuFirma || pedido.requerenteNome}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">NIF</span>
                  <span className="font-mono text-gray-800">{titular.nif || '009150115UE044'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Nacionalidade</span>
                  <span className="text-gray-800">{titular.nacionalidade || 'Angolana'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Localização</span>
                  <span className="text-gray-800">
                    {titular.municipio ? `${titular.municipio}, ` : ''}{titular.provincia || 'Luanda'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Telefone</span>
                  <span className="text-gray-800">{titular.telefone || '+244 923 000 001'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">E-mail</span>
                  <span className="text-gray-800">{titular.email || 'titular@exemplo.ao'}</span>
                </div>
              </div>
            </div>

            {/* Histórico de Movimentos */}
            {pedido.historicoEstados && pedido.historicoEstados.length > 0 && (
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Clock size={14} />
                  Registo de Histórico e Despachos do IAPI
                </h4>
                <div className="space-y-1.5">
                  {pedido.historicoEstados.map((h, i) => (
                    <div
                      key={i}
                      className="text-xs p-2.5 bg-gray-50 border-l-2 border-primary-500 flex items-start justify-between gap-3"
                    >
                      <div>
                        <strong className="text-primary-900 block">{h.estado}</strong>
                        <span className="text-gray-600">{h.observacao}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 shrink-0 font-mono">
                        {new Date(h.data).toLocaleString('pt-PT')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Rodapé do Modal */}
          <div className="bg-gray-100 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              IAPI · Direcção de Marcas e Sinais Distintivos do Comércio
            </span>
            <button
              type="button"
              onClick={onFechar}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-medium rounded transition"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>

      {mostrarCertificado && (
        <CertificadoMarcaModal pedido={pedido} onFechar={() => setMostrarCertificado(false)} />
      )}

      {mostrarRupe && (
        <ModalRupe
          pedido={pedido}
          onFechar={() => {
            setMostrarRupe(false);
            // Sincronizar estado local se a RUPE foi paga
            if (pedido.referenciaRupe) {
              setPedido((prev) => ({ ...prev, pago: true, estado: prev.estado === 'DEPOSITADO' ? 'PAGO' : prev.estado }));
            }
          }}
        />
      )}
    </>
  );
}
