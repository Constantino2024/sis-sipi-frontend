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
      className="relative h-[560px] md:h-[640px] w-full overflow-hidden bg-primary-500 text-white"
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

      {/* Overlay: gradiente leve da direita (transparente) para a esquerda (navy) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to left, rgba(10,42,68,0.15) 0%, rgba(10,42,68,0.72) 45%, rgba(10,42,68,0.94) 75%)',
        }}
        aria-hidden="true"
      />

      {/* Conteúdo textual, sempre à esquerda */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="max-w-xl" key={slide.id}>
          <span className="block text-xs font-semibold tracking-[0.2em] uppercase text-secondary-500 mb-4 animate-fadeSlide">
            Instituto Angolano da Propriedade Industrial
          </span>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight animate-fadeSlide">
            {slide.titulo}
          </h1>
          <p className="mt-5 text-base md:text-lg text-primary-100 max-w-md animate-fadeSlide">
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
              className="border border-white/40 hover:border-white text-white px-6 py-3 font-semibold text-sm transition"
            >
              Consultar Base (BPI)
            </Link>
          </div>
        </div>
      </div>

      {/* Indicadores — quadrados finos, sem border-radius, sem ícones */}
      <div className="absolute bottom-6 left-4 sm:left-6 lg:left-8 z-10 flex gap-2">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => goTo(i)}
            aria-label={`Ir para o destaque: ${s.titulo}`}
            aria-current={i === active}
            className={`h-1 transition-all duration-300 ${
              i === active ? 'w-10 bg-secondary-500' : 'w-5 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
