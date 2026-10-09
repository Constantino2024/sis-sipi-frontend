import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

/**
 * Faixa de notícias — apenas fotografia, sem legenda visível por defeito.
 * As imagens deslocam-se continuamente da direita para a esquerda (marquee
 * em CSS puro, via keyframes "marquee" definidos no tailwind.config.js).
 * No hover: overlay sobe de baixo para cima (translate-y), com um ícone "+"
 * ao centro e um breve dizer da actividade — e a animação pausa.
 */


export default function NoticiasMarquee({ noticias }) {
  // Duplicamos a lista para o loop infinito ficar contínuo (translateX -50%).
  const track = [...noticias, ...noticias];

  return (
    <section aria-labelledby="noticias-titulo" className="py-16 bg-gray-50 border-b border-gray-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between mb-8">
        <h2 id="noticias-titulo" className="text-2xl font-bold text-gray-900">
          Actualidade do IAPI
        </h2>
        <Link
          to="/noticias"
          className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition"
        >
          Ver todas as notícias →
        </Link>
      </div>

      <div className="relative w-full [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="flex w-max gap-3 animate-marquee hover:[animation-play-state:paused] py-1">
          {track.map((noticia, i) => (
            <Link
              key={`${noticia.id}-${i}`}
              to={noticia.link}
              className="group relative block h-64 w-56 md:h-72 md:w-64 shrink-0 overflow-hidden bg-white border border-gray-200 shadow-sm"
              aria-label={noticia.titulo}
            >
              <img
                src={noticia.imagem}
                alt={noticia.titulo}
                loading="lazy"
                className="h-full w-full object-cover"
              />
              {/* Overlay: sobe de baixo para cima no hover em modo claro */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/95 border border-primary-200 px-4 text-center
                           translate-y-full group-hover:translate-y-0 group-focus-visible:translate-y-0
                           transition-transform duration-300 ease-out shadow-sm"
              >
                <Plus className="h-8 w-8 text-primary-600" strokeWidth={1.5} aria-hidden="true" />
                <p className="text-sm text-gray-900 font-medium leading-snug line-clamp-3">{noticia.resumo}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
