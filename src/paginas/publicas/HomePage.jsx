import { Link } from 'react-router-dom';

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
        {/* 3. SERVIÇOS */}
        {/* ============================================================ */}
        <section className="py-16 bg-gray-50" aria-labelledby="servicos-titulo">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
              <div>
                <h2 id="servicos-titulo" className="text-3xl font-bold text-primary-500">Serviços do IAPI</h2>
                <p className="mt-2 text-gray-500 max-w-2xl">
                  Depósito e registo de todas as modalidades de propriedade industrial previstas na lei angolana.
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
        {/* 4. FORMULÁRIOS */}
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
        {/* 5. NOTÍCIAS — faixa contínua, apenas imagem, overlay no hover */}
        {/* ============================================================ */}
        <NoticiasMarquee noticias={noticias} />

        {/* ============================================================ */}
        {/* 6. CTA FINAL + FAQ */}
        {/* ============================================================ */}
        <section className="bg-white" aria-labelledby="cta-titulo">
          <div className="max-w-4xl mx-auto px-4 text-center">
          
          </div>

          <div className="max-w-3xl mx-auto px-4 mt-16">
            <h1 className="text-xs font-semibold tracking-[0.2em] uppercase text-gray-600 mb-2 text-center">
              Dúvidas frequentes
            </h1>
            <FaqAccordion items={faqs} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
