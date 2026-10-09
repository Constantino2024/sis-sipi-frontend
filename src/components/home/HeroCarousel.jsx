import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const AUTOPLAY_MS = 6000;

/**
 * Carrossel principal da homepage.
 * - Overlay em linear-gradient da direita (transparente) para a esquerda
 *   (navy sólido), para que o texto à esquerda permaneça sempre legível
 *   independentemente da imagem de fundo.
 * - Crossfade simples entre slides (sem libraries externas).
 * - Pausa no hover e respeita prefers-reduced-motion.
 */
export default function HeroCarousel({ slides }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  const goTo = useCallback(
    (index) => setActive((index + slides.length) % slides.length),
    [slides.length]
  );

  useEffect(() => {
    if (paused) return undefined;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return undefined;

    timerRef.current = window.setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, AUTOPLAY_MS);

    return () => window.clearInterval(timerRef.current);
  }, [paused, slides.length]);

  const slide = slides[active];

  return (
    <section
      className="relative h-[560px] md:h-[640px] w-full overflow-hidden bg-slate-100 text-gray-900"
      aria-roledescription="carrossel"
      aria-label="Destaques do SIPI"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Camadas de imagem em crossfade */}
      {slides.map((s, i) => (
        <img
          key={s.id}
          src={s.imagem}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms] ease-in-out ${
            i === active ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}

      {/* Overlay: gradiente suave em tons claros da direita para a esquerda */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to right, rgba(255,255,255,0.97) 0%, rgba(255,255,255,0.88) 50%, rgba(255,255,255,0.35) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Conteúdo textual, sempre à esquerda com alto contraste em modo claro */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="max-w-xl" key={slide.id}>
          <span className="block text-xs font-bold tracking-[0.2em] uppercase text-secondary-600 mb-4 animate-fadeSlide">
            Instituto Angolano da Propriedade Industrial
          </span>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight text-gray-900 animate-fadeSlide">
            {slide.titulo}
          </h1>
          <p className="mt-5 text-base md:text-lg text-gray-700 max-w-md animate-fadeSlide">
            {slide.descricao}
          </p>
          <div className="mt-8 flex flex-wrap gap-4 animate-fadeSlide">
            <Link
              to={slide.id === 'marca' ? '/meus-pedidos/novo?tipo=MARCA' : '/registro'}
              className="bg-secondary-500 hover:bg-secondary-400 text-primary-950 px-6 py-3 font-bold text-sm tracking-wide transition shadow"
            >
              {slide.id === 'marca' ? 'Registar Marca no IAPI' : 'Iniciar Pedido'}
            </Link>
            <Link
              to="/consulta"
              className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 px-6 py-3 font-semibold text-sm transition shadow-sm"
            >
              Consultar Base (BPI)
            </Link>
          </div>
        </div>
      </div>

      {/* Indicadores */}
      <div className="absolute bottom-6 left-4 sm:left-6 lg:left-8 z-10 flex gap-2">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => goTo(i)}
            aria-label={`Ir para o destaque: ${s.titulo}`}
            aria-current={i === active}
            className={`h-1.5 transition-all duration-300 ${
              i === active ? 'w-10 bg-primary-600' : 'w-5 bg-gray-400 hover:bg-gray-600'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
