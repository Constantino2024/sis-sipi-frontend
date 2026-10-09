import { Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { servicos } from '../../data/iapiData';

export default function ServicosPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <Header />
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="max-w-2xl mb-12">
          <h1 className="text-3xl font-bold text-primary-500">Serviços do IAPI</h1>
          <p className="mt-3 text-gray-600">
            O SIPI cobre o depósito, registo e gestão de todas as modalidades de propriedade
            industrial previstas na legislação angolana, conforme a Ficha de Identificação e
            Registo de Projecto 386ATDAP.IMA.27.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {servicos.map((servico) => (
            <Link
              to={servico.link}
              key={servico.id}
              className="group bg-white border border-gray-200 hover:border-primary-500 transition-colors overflow-hidden"
            >
              <img
                src={servico.imagem}
                alt={servico.titulo}
                className="w-full h-44 object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-primary-500">{servico.titulo}</h2>
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
      </main>
      <Footer />
    </div>
  );
}
