import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Search,
  CreditCard,
  ArrowRight,
} from 'lucide-react';

import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import HeroCarousel from "../../components/home/HeroCarousel";
import FaqAccordion from "../../components/home/FaqAccordion";
import NoticiasMarquee from "../../components/home/NoticiasMarquee";
import { sobreIAPI, servicos, noticias, formularios, heroSlides, faqs } from '../../data/iapiData';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <Header />

      <main className="flex-grow" role="main" aria-label="Conteúdo principal">
        {/* ============================================================ */}
        {/* 1. HERO — carrossel institucional */}
        {/* ============================================================ */}
        <HeroCarousel slides={heroSlides} />

        {/* ============================================================ */}
        {/* DESTAQUE PRINCIPAL: REGISTO DE MARCAS NO IAPI (LEI N.º 3/92) */}
        {/* ============================================================ */}
        <section className="py-16 bg-primary-900 text-white border-b-4 border-secondary-500" aria-labelledby="marcas-iapi-titulo">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-12">
              <span className="text-xs font-semibold tracking-[0.25em] uppercase text-secondary-400 block mb-2">
                Instituto Angolano da Propriedade Industrial · IAPI
              </span>
              <h2 id="marcas-iapi-titulo" className="text-3xl sm:text-4xl font-serif font-bold text-white leading-tight">
                Registo Oficial de Marcas em Angola
              </h2>
              <p className="mt-3 text-primary-200 text-sm sm:text-base leading-relaxed">
                Proteja a sua marca contra contrafacção e concorrência desleal. O registo no IAPI concede o uso
                exclusivo em todo o território nacional angolano por um período de <strong>10 anos renováveis</strong>,
                em total cumprimento da Lei n.º 3/92 da Propriedade Industrial.
              </p>
            </div>

            {/* Acesso Rápido em 3 Cartões de Ação */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
              <div className="bg-primary-800/80 border border-primary-700/60 p-6 rounded-lg flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded bg-secondary-500 text-primary-950 flex items-center justify-center font-bold mb-4 shadow">
                    <ShieldCheck size={22} />
                  </div>
                  <h3 className="text-lg font-bold text-white font-serif">1. Registar Marca Online</h3>
                  <p className="text-xs text-primary-200 mt-2 leading-relaxed">
                    Submeta o requerimento oficial (Modelo M-1) no portal com dados do titular, logótipo, cores e selecção das Classes Internacionais de Nice.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-primary-700/60">
                  <Link
                    to="/meus-pedidos/novo?tipo=MARCA"
                    className="inline-flex items-center gap-2 text-xs font-bold text-secondary-400 hover:text-secondary-300 transition"
                  >
                    Iniciar Pedido de Registo <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

              <div className="bg-primary-800/80 border border-primary-700/60 p-6 rounded-lg flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded bg-primary-700 text-secondary-400 flex items-center justify-center font-bold mb-4 border border-primary-600">
                    <Search size={22} />
                  </div>
                  <h3 className="text-lg font-bold text-white font-serif">2. Busca de Anterioridade</h3>
                  <p className="text-xs text-primary-200 mt-2 leading-relaxed">
                    Pesquise na base de dados pública do IAPI para verificar se já existem marcas semelhantes ou idênticas depositadas na mesma categoria.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-primary-700/60">
                  <Link
                    to="/consulta"
                    className="inline-flex items-center gap-2 text-xs font-bold text-secondary-400 hover:text-secondary-300 transition"
                  >
                    Consultar Marcas no IAPI <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

              <div className="bg-primary-800/80 border border-primary-700/60 p-6 rounded-lg flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded bg-primary-700 text-secondary-400 flex items-center justify-center font-bold mb-4 border border-primary-600">
                    <CreditCard size={22} />
                  </div>
                  <h3 className="text-lg font-bold text-white font-serif">3. Emolumentos & Guia RUPE</h3>
                  <p className="text-xs text-primary-200 mt-2 leading-relaxed">
                    Pagamento oficial da taxa de depósito emitido pelo Ministério das Finanças (CUTE/DNT) com liquidação instantânea por Multicaixa ou Internet Banking.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-primary-700/60">
                  <Link
                    to="/servicos/marca"
                    className="inline-flex items-center gap-2 text-xs font-bold text-secondary-400 hover:text-secondary-300 transition"
                  >
                    Ver Tabela Oficial de Taxas <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>

            {/* O FLUXO OFICIAL DO IAPI — LINHA DO TEMPO */}
            <div className="bg-primary-950/70 border border-primary-800 rounded-lg p-6 sm:p-8">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <span className="text-xs uppercase font-mono tracking-widest text-secondary-400 block mb-1">
                  Tramitação Processual Legal
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-serif text-white">
                  Como Funciona o Fluxo Oficial de Registo de Marca no IAPI
                </h3>
                <p className="text-xs text-primary-300 mt-2">
                  Acompanhamento 100% digital desde o depósito inicial até à emissão do Certificado Oficial de Registo de Marca.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  {
                    passo: '01',
                    titulo: 'Depósito & RUPE',
                    subtitulo: 'Entrada electrónica no IAPI e geração da guia RUPE válida por 30 dias para liquidação no sistema bancário.',
                  },
                  {
                    passo: '02',
                    titulo: 'Exame Formal',
                    subtitulo: 'Verificação da legitimidade, NIF na AGT, poderes de representação e completude dos documentos pelo IAPI.',
                  },
                  {
                    passo: '03',
                    titulo: 'Publicação no BPI',
                    subtitulo: 'Publicação oficial do extracto no Boletim da Propriedade Industrial da República de Angola.',
                  },
                  {
                    passo: '04',
                    titulo: 'Oposição (60 Dias)',
                    subtitulo: 'Período legal em que titulares de marcas anteriores podem deduzir oposição nos termos da Lei n.º 3/92.',
                  },
                  {
                    passo: '05',
                    titulo: 'Exame de Mérito & Título',
                    subtitulo: 'Exame substantivo pelo examinador, despacho do Director Geral e emissão do Certificado Oficial por 10 anos.',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="bg-primary-900/90 border border-primary-800 p-4 rounded text-left">
                    <span className="text-xs font-mono font-bold text-secondary-400 block mb-1.5">{item.passo}</span>
                    <strong className="text-sm font-bold text-white block mb-1.5">{item.titulo}</strong>
                    <p className="text-[11px] text-primary-200 leading-relaxed">{item.subtitulo}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center pt-6 border-t border-primary-900">
                <Link
                  to="/meus-pedidos/novo?tipo=MARCA"
                  className="inline-flex items-center gap-2 bg-secondary-500 hover:bg-secondary-400 text-primary-950 font-bold px-8 py-3 text-sm rounded shadow-lg transition"
                >
                  <ShieldCheck size={18} />
                  Iniciar Registo de Marca no IAPI Agora
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 2. MISSÃO, VISÃO, VALORES */}
        {/* ============================================================ */}
        <section className="py-16 bg-white border-b border-gray-100" aria-labelledby="sobre-titulo">
          <h2 id="sobre-titulo" className="sr-only">Sobre o IAPI</h2>
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-px bg-gray-200 border border-gray-200">
              <div className="p-8 bg-white">
                <span className="text-xs font-semibold tracking-[0.2em] uppercase text-secondary-600">01</span>
                <h3 className="mt-2 text-xl font-bold text-primary-500">Missão</h3>
                <p className="mt-3 text-gray-600 text-sm leading-relaxed">{sobreIAPI.missao}</p>
              </div>
              <div className="p-8 bg-white">
                <span className="text-xs font-semibold tracking-[0.2em] uppercase text-secondary-600">02</span>
                <h3 className="mt-2 text-xl font-bold text-primary-500">Visão</h3>
                <p className="mt-3 text-gray-600 text-sm leading-relaxed">{sobreIAPI.visao}</p>
              </div>
              <div className="p-8 bg-white">
                <span className="text-xs font-semibold tracking-[0.2em] uppercase text-secondary-600">03</span>
                <h3 className="mt-2 text-xl font-bold text-primary-500">Valores</h3>
                <ul className="mt-3 text-gray-600 text-sm space-y-1.5">
                  {sobreIAPI.valores.map((valor) => (
                    <li key={valor}>{valor}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 3. SERVIÇOS DO IAPI */}
        {/* ============================================================ */}
        <section className="py-16 bg-gray-50" aria-labelledby="servicos-titulo">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
              <div>
                <h2 id="servicos-titulo" className="text-3xl font-bold text-primary-500">Serviços do IAPI</h2>
                <p className="mt-2 text-gray-500 max-w-2xl">
                  Depósito e registo de todas as modalidades de propriedade industrial previstas na legislação angolana.
                </p>
              </div>
              <Link to="/servicos" className="text-sm font-medium text-primary-500 hover:text-secondary-600 transition">
                Ver todos os serviços →
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {servicos.slice(0, 3).map((servico) => (
                <Link
                  to={servico.link}
                  key={servico.id}
                  className="group bg-white border border-gray-200 hover:border-primary-500 transition-colors overflow-hidden"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={servico.imagem}
                      alt={servico.titulo}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-primary-500">{servico.titulo}</h3>
                      <span className="text-xs text-gray-400">{servico.prazo}</span>
                    </div>
                    <p className="text-gray-500 mt-2 text-sm">{servico.descricao}</p>
                    <span className="inline-flex items-center mt-4 text-primary-500 font-medium text-sm group-hover:text-secondary-600 transition">
                      Saiba mais →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 4. FORMULÁRIOS OFICIAIS */}
        {/* ============================================================ */}
        <section className="py-16 bg-white border-b border-gray-100" aria-labelledby="formularios-titulo">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 id="formularios-titulo" className="text-2xl font-bold text-primary-500">
                Formulários Oficiais
              </h2>
              <Link to="/formularios" className="text-primary-500 hover:text-secondary-600 text-sm font-medium transition">
                Ver todos →
              </Link>
            </div>

            <div className="grid md:grid-cols-4 gap-px bg-gray-200 border border-gray-200">
              {formularios.slice(0, 4).map((form) => (
                <div key={form.id} className="bg-white p-5 hover:bg-gray-50 transition">
                  <h3 className="font-semibold text-gray-800 text-sm">{form.titulo}</h3>
                  <p className="text-xs text-gray-500 mt-1">{form.descricao}</p>
                  <a
                    href={form.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-4 text-primary-500 hover:text-secondary-600 text-sm font-medium transition"
                  >
                    Descarregar PDF
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 5. NOTÍCIAS */}
        {/* ============================================================ */}
        <NoticiasMarquee noticias={noticias} />

        {/* ============================================================ */}
        {/* 6. DÚVIDAS FREQUENTES */}
        {/* ============================================================ */}
        <section className="bg-white py-16" aria-labelledby="faq-titulo">
          <div className="max-w-3xl mx-auto px-4">
            <h2 id="faq-titulo" className="text-xs font-semibold tracking-[0.2em] uppercase text-gray-600 mb-2 text-center">
              Dúvidas frequentes sobre o IAPI
            </h2>
            <h3 className="text-2xl font-bold text-primary-900 text-center mb-8 font-serif">
              Perguntas e Respostas sobre Registo de Marcas e Propriedade Industrial
            </h3>
            <FaqAccordion items={faqs} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
