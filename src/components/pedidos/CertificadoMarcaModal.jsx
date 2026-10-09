// src/components/pedidos/CertificadoMarcaModal.jsx
import { useRef } from 'react';
import { X, Printer, Award } from 'lucide-react';
import emblemAngola from '../../assets/images/Emblem_of_Angola.svg';

function obterDataValidade(pedido) {
  if (pedido?.certificado?.dataValidade) {
    return new Date(pedido.certificado.dataValidade).toLocaleDateString('pt-PT');
  }
  const base = pedido?.dataSubmissao ? new Date(pedido.dataSubmissao) : new Date('2026-01-01');
  const d = new Date(base);
  d.setFullYear(d.getFullYear() + 10);
  return d.toLocaleDateString('pt-PT');
}

export default function CertificadoMarcaModal({ pedido, onFechar }) {
  const certificadoRef = useRef(null);

  if (!pedido) return null;

  const detalhes = pedido.detalhesMarca || {};
  const numeroProcesso = pedido.numeroProcesso || `M/2026/${pedido.id}`;
  const numeroRegisto = pedido.certificado?.numeroCertificado || `REG-IAPI-2026-${String(pedido.id).padStart(5, '0')}`;
  const titularNome = pedido.titular?.nomeOuFirma || pedido.requerenteNome || 'Titular Registado';
  const titularNif = pedido.titular?.nif || '009150115UE044';
  const titularEndereco = pedido.titular?.endereco || `${pedido.titular?.municipio || 'Luanda'}, ${pedido.titular?.provincia || 'Luanda'}, Angola`;
  const denominacao = detalhes.denominacao || pedido.titulo;
  const natureza = detalhes.natureza || 'Marca de Produto';
  const apresentacao = detalhes.apresentacao || 'Mista';
  const logotipo = detalhes.logotipoUrl || null;
  const classesNice = pedido.classesNice || [];

  const dataDeposito = pedido.dataSubmissao
    ? new Date(pedido.dataSubmissao).toLocaleDateString('pt-PT')
    : new Date().toLocaleDateString('pt-PT');
  
  const dataConcessao = pedido.certificado?.dataConcessao
    ? new Date(pedido.certificado.dataConcessao).toLocaleDateString('pt-PT')
    : dataDeposito;

  const dataValidade = obterDataValidade(pedido);

  function imprimir() {
    window.print();
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-certificado"
    >
      <div className="bg-white max-w-3xl w-full my-8 shadow-2xl border border-gray-300 relative flex flex-col">
        {/* Barra superior de acções */}
        <div className="flex items-center justify-between px-6 py-3 bg-gray-100 border-b border-gray-200 print:hidden">
          <div className="flex items-center gap-2 text-primary-700 font-semibold text-sm">
            <Award size={18} className="text-secondary-600" />
            Certificado Oficial de Registo de Marca — IAPI
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={imprimir}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium rounded transition"
            >
              <Printer size={14} />
              Imprimir / Guardar PDF
            </button>
            <button
              type="button"
              onClick={onFechar}
              className="text-gray-400 hover:text-gray-600 p-1 rounded"
              aria-label="Fechar"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Corpo do Certificado Oficial (estilizado como diploma oficial de Estado) */}
        <div
          ref={certificadoRef}
          className="p-8 sm:p-12 bg-amber-50/20 text-gray-900 border-8 border-double border-amber-900/30 m-4 relative select-text"
        >
          {/* Marca de água de fundo */}
          <div
            className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none"
            aria-hidden="true"
          >
            <img src={emblemAngola} alt="" className="w-96 h-96 object-contain" />
          </div>

          {/* Cabeçalho de Estado */}
          <div className="text-center space-y-2 border-b-2 border-amber-900/20 pb-6">
            <img
              src={emblemAngola}
              alt="República de Angola"
              className="h-20 mx-auto object-contain mb-2"
            />
            <h2 className="text-sm tracking-[0.25em] font-bold text-gray-800 uppercase">
              República de Angola
            </h2>
            <h3 className="text-xs tracking-[0.15em] font-semibold text-gray-600 uppercase">
              Ministério da Indústria e Comércio
            </h3>
            <h1 id="titulo-certificado" className="text-lg sm:text-xl font-serif font-bold text-primary-900 uppercase tracking-wide pt-1">
              Instituto Angolano da Propriedade Industrial — IAPI
            </h1>
            <p className="text-xs uppercase tracking-widest text-amber-900 font-semibold pt-1">
              Certificado de Registo de Marca
            </p>
          </div>

          {/* Identificadores Oficiais */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-6 text-xs bg-amber-100/40 p-4 border border-amber-900/10">
            <div>
              <span className="text-gray-500 block uppercase text-[10px] tracking-wider">Registo N.º</span>
              <strong className="text-primary-900 text-sm font-mono">{numeroRegisto}</strong>
            </div>
            <div>
              <span className="text-gray-500 block uppercase text-[10px] tracking-wider">Processo IAPI N.º</span>
              <strong className="text-primary-900 text-sm font-mono">{numeroProcesso}</strong>
            </div>
            <div>
              <span className="text-gray-500 block uppercase text-[10px] tracking-wider">Validade (10 Anos)</span>
              <strong className="text-primary-900 text-sm">{dataValidade}</strong>
            </div>
          </div>

          {/* Texto de Concessão Oficial */}
          <div className="text-xs sm:text-sm text-gray-700 leading-relaxed text-justify space-y-3 font-serif">
            <p>
              O <strong>Director Geral do Instituto Angolano da Propriedade Industrial (IAPI)</strong>,
              no uso das competências que lhe são conferidas pela Lei da Propriedade Industrial de Angola
              (Lei n.º 3/92), certifica que foi concedido o direito exclusivo de propriedade e exploração
              da marca abaixo caracterizada em todo o território nacional da República de Angola:
            </p>
          </div>

          {/* Quadro da Marca */}
          <div className="my-6 border border-amber-900/20 bg-white p-5 rounded-sm shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
            <div className="sm:col-span-2 space-y-2 text-xs">
              <div>
                <span className="text-gray-500 block uppercase text-[10px]">Denominação da Marca:</span>
                <span className="text-lg font-bold text-primary-900 font-sans tracking-wide">
                  {denominacao}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-gray-500 block uppercase text-[10px]">Natureza:</span>
                  <span className="font-semibold text-gray-800">{natureza}</span>
                </div>
                <div>
                  <span className="text-gray-500 block uppercase text-[10px]">Apresentação:</span>
                  <span className="font-semibold text-gray-800">{apresentacao}</span>
                </div>
              </div>
              {detalhes.reivindicaCores && detalhes.coresReivindicadas && (
                <div className="pt-1">
                  <span className="text-gray-500 block uppercase text-[10px]">Cores Reivindicadas:</span>
                  <span className="text-gray-700 italic">{detalhes.coresReivindicadas}</span>
                </div>
              )}
              {classesNice.length > 0 && (
                <div className="pt-1">
                  <span className="text-gray-500 block uppercase text-[10px]">Classes de Nice (NCL):</span>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {classesNice.map((cn) => (
                      <span key={cn.classe} className="px-1.5 py-0.5 bg-primary-100 text-primary-800 font-mono font-semibold text-[11px] rounded-sm">
                        Classe {cn.classe}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Espaço do Logótipo / Reprodução do Sinal */}
            <div className="flex flex-col items-center justify-center p-3 bg-gray-50 border border-gray-200 min-h-[140px] text-center">
              {logotipo ? (
                <img
                  src={logotipo}
                  alt={denominacao}
                  className="max-h-28 max-w-full object-contain"
                />
              ) : (
                <div className="text-center p-2">
                  <span className="text-xl font-bold font-serif text-primary-900 block">{denominacao}</span>
                  <span className="text-[10px] text-gray-400 uppercase mt-1 block">Sinal Nominativo</span>
                </div>
              )}
            </div>
          </div>

          {/* Dados do Titular Registado */}
          <div className="border-t border-amber-900/10 pt-4 text-xs space-y-1.5 font-serif text-gray-700">
            <p>
              <strong>Titular:</strong> {titularNome}
            </p>
            <p>
              <strong>NIF:</strong> {titularNif} &nbsp;|&nbsp; <strong>Domicílio / Sede:</strong> {titularEndereco}
            </p>
            <p>
              <strong>Data de Depósito:</strong> {dataDeposito} &nbsp;|&nbsp; <strong>Data de Concessão:</strong> {dataConcessao}
            </p>
          </div>

          {/* Assinatura e Chancelaria Oficial */}
          <div className="mt-10 pt-6 border-t-2 border-amber-900/20 grid grid-cols-2 gap-8 text-center items-end">
            <div className="space-y-1">
              <div className="w-24 h-24 mx-auto border-2 border-dashed border-amber-900/30 rounded-full flex items-center justify-center text-[10px] text-amber-900/60 uppercase font-bold text-center leading-tight">
                Selo Branco<br />Oficial IAPI
              </div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Chancela da República</p>
            </div>
            <div className="space-y-1">
              <div className="border-b border-gray-800 pb-1 max-w-[200px] mx-auto italic font-serif text-sm text-gray-800">
                Pascoal Comprido
              </div>
              <p className="text-xs font-bold text-gray-800 uppercase">O Director Geral do IAPI</p>
              <p className="text-[10px] text-gray-500">Instituto Angolano da Propriedade Industrial</p>
            </div>
          </div>

          {/* Rodapé legal */}
          <div className="mt-8 pt-3 border-t border-gray-200 text-center text-[10px] text-gray-400">
            Registo conferido nos termos da Lei n.º 3/92 de 28 de Fevereiro (Lei da Propriedade Industrial de Angola).
            Válido por 10 anos a contar da data de depósito, indefinidamente renovável por iguais períodos.
          </div>
        </div>
      </div>
    </div>
  );
}
