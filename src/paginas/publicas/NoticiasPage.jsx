import { Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { noticias } from '../../data/iapiData';

export default function NoticiasPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <Header />
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <h1 className="text-3xl font-bold text-primary-500 mb-12">Actualidade do IAPI</h1>

        <div className="grid md:grid-cols-3 gap-8">
          {noticias.map((noticia) => (
            <Link
              key={noticia.id}
              to={noticia.link}
              className="group bg-white border border-gray-200 hover:border-primary-500 transition-colors overflow-hidden"
            >
              <img
                src={noticia.imagem}
                alt={noticia.titulo}
                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="p-6">
                <time dateTime={noticia.data} className="text-xs text-gray-400">{noticia.data}</time>
                <h2 className="font-semibold text-gray-800 mt-2 line-clamp-2">{noticia.titulo}</h2>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{noticia.resumo}</p>
                <span className="inline-flex items-center mt-4 text-primary-500 font-medium text-sm group-hover:text-secondary-600 transition">
                  Ler mais →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
