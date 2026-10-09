import { Link, useParams, Navigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { servicos } from '../../data/iapiData';

export default function ServicoDetalhePage() {
  const { slug } = useParams();
  const servico = servicos.find((s) => s.id === slug);

  if (!servico) return <Navigate to="/servicos" replace />;

  const isMarca = slug === 'marca';

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <Header />
      <main className="flex-grow w-full">
        {/* Banner Hero do Serviço */}
        <div className="relative h-72 md:h-96 overflow-hidden bg-primary-900">
          <img
            src={servico.imagem}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover opacity-30"
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, rgba(10,42,68,0.95), rgba(10,42,68,0.6))' }}
            aria-hidden="true"
          />
          <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-10">
            <span className="text-xs font-semibold tracking-[0.25em] uppercase text-secondary-400 mb-2 font-mono">
              Instituto Angolano da Propriedade Industrial · {servico.prazo}
            </span>
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-white tracking-wide">
              {servico.titulo}
            </h1>
            {isMarca && (
              <p className="text-sm text-primary-200 mt-2 max-w-2xl leading-relaxed">
                Protecção jurídica exclusiva em todo o território nacional angolano nos termos da Lei n.º 3/92 de 28 de Fevereiro (Lei da Propriedade Industrial).
              </p>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid md:grid-cols-3 gap-10">
          {/* Conteúdo Principal */}
          <div className="md:col-span-2 space-y-10">
            <div>
              <h2 className="text-xl font-bold font-serif text-primary-900 mb-3">
                O que é a Protecção de Marca no IAPI?
              </h2>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                {servico.descricaoLonga}
              </p>
            </div>

            {/* Secção detalhada específica para MARCAS no IAPI */}
            {isMarca && (
              <>
                {/* Categorias e Modalidades */}
                <div className="border-t border-gray-200 pt-8 space-y-4">
                  <h3 className="text-lg font-bold font-serif text-primary-900">
                    Categorias e Formas de Apresentação Aceites pelo IAPI
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded">
                      <strong className="text-primary-900 font-bold block mb-1">Marcas de Produto</strong>
                      <p className="text-gray-600">
                        Distinguem produtos materiais de fabrico ou comércio (alimentos, vestuário, bebidas, medicamentos, materiais industriais).
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded">
                      <strong className="text-primary-900 font-bold block mb-1">Marcas de Serviço</strong>
                      <p className="text-gray-600">
                        Distinguem actividades económicas ou prestações de serviços (bancos, telecomunicações, hotelaria, transportes, consultoria).
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded">
                      <strong className="text-primary-900 font-bold block mb-1">Marcas Colectivas</strong>
                      <p className="text-gray-600">
                        Pertencentes a cooperativas ou associações para distinguir produtos e serviços oriundos dos seus associados.
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded">
                      <strong className="text-primary-900 font-bold block mb-1">Marcas de Certificação</strong>
                      <p className="text-gray-600">
                        Atestam a conformidade técnica, qualidade, origem geográfica ou normas específicas de produção.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-primary-50/70 border border-primary-200 rounded text-xs space-y-1 mt-3">
                    <strong className="text-primary-900 font-semibold block">Formas de Apresentação:</strong>
                    <p className="text-gray-700">
                      <strong>Nominativa:</strong> Composta apenas por palavras ou caracteres tipográficos padronizados.
                    </p>
                    <p className="text-gray-700">
                      <strong>Figurativa:</strong> Apenas elementos gráficos, ícones ou figuras sem letras.
                    </p>
                    <p className="text-gray-700">
                      <strong>Mista:</strong> Combinação de elemento verbal e logotipo (formato mais frequente e recomendado).
                    </p>
                    <p className="text-gray-700">
                      <strong>Tridimensional & Sonora:</strong> Forma plástica de embalagens ou assinaturas auditivas/jingles distintivos.
                    </p>
                  </div>
                </div>

                {/* Tabela de Emolumentos Oficiais (RUPE) */}
                <div className="border-t border-gray-200 pt-8 space-y-4">
                  <h3 className="text-lg font-bold font-serif text-primary-900">
                    Tabela de Emolumentos Oficiais do IAPI (Liquidação por RUPE)
                  </h3>
                  <div className="border border-gray-200 rounded overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-primary-900 text-white text-left font-semibold">
                        <tr>
                          <th className="p-3">Acto Oficial / Emolumento</th>
                          <th className="p-3 text-right">Valor em Kwanzas (Kz)</th>
                          <th className="p-3">Observações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr className="hover:bg-gray-50">
                          <td className="p-3 font-medium text-gray-900">Taxa de Depósito de Marca (1.ª Classe de Nice)</td>
                          <td className="p-3 text-right font-mono font-bold text-primary-900">25.000,00 Kz</td>
                          <td className="p-3 text-gray-500">Inclui primeira classe e exame formal</td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="p-3 font-medium text-gray-900">Por Cada Classe Suplementar</td>
                          <td className="p-3 text-right font-mono font-bold text-primary-900">10.000,00 Kz</td>
                          <td className="p-3 text-gray-500">Para pedidos multiclasse</td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="p-3 font-medium text-gray-900">Reivindicação de Prioridade Internacional (CUP)</td>
                          <td className="p-3 text-right font-mono font-bold text-primary-900">15.000,00 Kz</td>
                          <td className="p-3 text-gray-500">Se decorrente de depósito prévio estrangeiro</td>
                        </tr>
                        <tr className="hover:bg-gray-50 bg-gray-50/50">
                          <td className="p-3 font-medium text-gray-900">Renovação Decenal da Marca</td>
                          <td className="p-3 text-right font-mono font-bold text-primary-900">20.000,00 Kz</td>
                          <td className="p-3 text-gray-500">Após 10 anos de vigência</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Fluxo Oficial Passo a Passo */}
                <div className="border-t border-gray-200 pt-8 space-y-4">
                  <h3 className="text-lg font-bold font-serif text-primary-900">
                    Fluxo de Tramitação Legal no IAPI
                  </h3>
                  <div className="space-y-3">
                    {[
                      {
                        num: 1,
                        titulo: 'Depósito Electrónico & Emissão de RUPE',
                        desc: 'O requerente submete o Modelo M-1 no portal e obtém imediatamente a Referência Única de Pagamento ao Estado válida por 30 dias.',
                      },
                      {
                        num: 2,
                        titulo: 'Exame Formal pelo IAPI',
                        desc: 'A secretaria técnica verifica a regularidade do titular, NIF na AGT, documentos e poderes de representação (AOPI ou advogado).',
                      },
                      {
                        num: 3,
                        titulo: 'Publicação no Boletim da Propriedade Industrial (BPI)',
                        desc: 'O pedido é publicado no BPI da República de Angola para conhecimento público e garantia de transparência.',
                      },
                      {
                        num: 4,
                        titulo: 'Fase de Oposição de Terceiros (60 Dias)',
                        desc: 'Prazo legal em que titulares de marcas anteriores podem deduzir oposição nos termos dos Arts. 25.º a 34.º da Lei n.º 3/92.',
                      },
                      {
                        num: 5,
                        titulo: 'Exame Substantivo & Parecer Técnico',
                        desc: 'O examinador do IAPI averigua a capacidade distintiva e a ausência de colidência com marcas registadas.',
                      },
                      {
                        num: 6,
                        titulo: 'Despacho de Concessão & Certificado Oficial',
                        desc: 'O Director Geral do IAPI emite o despacho de concessão e o Título Oficial de Registo de Marca válido por 10 anos renováveis.',
                      },
                    ].map((step) => (
                      <div key={step.num} className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded">
                        <span className="w-6 h-6 rounded-full bg-primary-900 text-secondary-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {step.num}
                        </span>
                        <div>
                          <strong className="text-xs text-primary-900 font-bold block">{step.titulo}</strong>
                          <p className="text-xs text-gray-600 mt-0.5">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Requisitos Documentais Gerais */}
            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-lg font-bold font-serif text-primary-900 mb-4">
                Documentos e Requisitos Exigidos pelo IAPI
              </h2>
              <ul className="space-y-2.5">
                {servico.requisitos.map((req) => (
                  <li key={req} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-700">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Painel Lateral / CTA Box */}
          <aside className="space-y-6">
            <div className="bg-primary-900 text-white p-6 rounded-lg shadow-sm border border-primary-950">
              <span className="text-xs font-mono font-semibold text-secondary-400 uppercase tracking-widest block mb-1">
                Serviço Oficial IAPI
              </span>
              <h3 className="text-lg font-serif font-bold text-white mb-2">
                {isMarca ? 'Registar Marca Agora' : 'Iniciar Processo'}
              </h3>
              <p className="text-xs text-primary-200 mb-6 leading-relaxed">
                Submissão 100% electrónica pelo portal com geração automática de RUPE via CUTE (Ministério das Finanças).
              </p>

              <Link
                to={isMarca ? '/meus-pedidos/novo?tipo=MARCA' : '/registro'}
                className="block w-full text-center bg-secondary-500 hover:bg-secondary-400 text-primary-950 font-bold text-xs uppercase tracking-wider py-3.5 rounded shadow transition"
              >
                {isMarca ? 'Formulário de Registo de Marca' : 'Criar Conta e Submeter'}
              </Link>

              {isMarca && (
                <Link
                  to="/consulta"
                  className="block w-full text-center mt-3 bg-primary-800 hover:bg-primary-750 text-white font-semibold text-xs py-2.5 rounded border border-primary-700 transition"
                >
                  Pesquisa Prévia de Anterioridade
                </Link>
              )}
            </div>

            <div className="bg-gray-50 border border-gray-200 p-5 rounded-lg text-xs space-y-3">
              <h4 className="font-bold text-gray-800 uppercase tracking-wider">Apoio ao Requerente IAPI</h4>
              <p className="text-gray-600 leading-relaxed">
                Dúvidas sobre classes de Nice ou procurações de Agente Oficial (AOPI)? Consulte a nossa equipa de apoio técnico.
              </p>
              <div className="pt-2 border-t border-gray-200 text-gray-700 space-y-1">
                <p><strong>E-mail:</strong> apoio@iapi.gov.ao</p>
                <p><strong>Linha de Apoio:</strong> +244 923 000 001</p>
                <p><strong>Atendimento:</strong> 08h00 às 15h30 (Dias úteis)</p>
              </div>
            </div>

            <Link
              to="/servicos"
              className="block w-full text-center border border-gray-300 hover:border-primary-500 text-gray-700 font-medium text-xs py-3 rounded transition"
            >
              ← Voltar a Todos os Serviços
            </Link>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
