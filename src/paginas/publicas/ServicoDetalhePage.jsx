import { Link, useParams, Navigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { servicos } from '../../data/iapiData';

export default function ServicoDetalhePage() {
  const { slug } = useParams();
  const servico = servicos.find((s) => s.id === slug);

  if (!servico) return <Navigate to="/servicos" replace />;

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <Header />
      <main className="flex-grow w-full">
        <div className="relative h-72 md:h-96 overflow-hidden bg-primary-500">
          <img src={servico.imagem} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, rgba(10,42,68,0.95), rgba(10,42,68,0.35))' }}
            aria-hidden="true"
          />
          <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-10">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-secondary-500 mb-2">
              {servico.prazo}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-white">{servico.titulo}</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid md:grid-cols-3 gap-10">
          <div className="md:col-span-2">
            <p className="text-gray-700 leading-relaxed">{servico.descricaoLonga}</p>

            <h2 className="mt-10 text-lg font-semibold text-primary-500">Documentos e requisitos habituais</h2>
            <ul className="mt-4 space-y-2">
              {servico.requisitos.map((req) => (
                <li key={req} className="text-sm text-gray-600 border-l-2 border-secondary-500 pl-3 py-0.5">
                  {req}
                </li>
              ))}
            </ul>
          </div>

          <aside className="bg-gray-50 border border-gray-200 p-6 h-fit">
            <h3 className="text-sm font-semibold text-primary-500 uppercase tracking-wide mb-3">
              Iniciar processo
            </h3>
            <p className="text-sm text-gray-600 mb-5">
              A submissão é feita através da área autenticada do requerente, com geração automática
              da guia de pagamento (RUPE) via CUTE.
            </p>
            <Link
              to="/registro"
              className="block w-full text-center bg-secondary-500 hover:bg-secondary-400 text-primary-500 font-semibold py-3 transition"
            >
              Criar conta e submeter
            </Link>
            <Link
              to="/servicos"
              className="block w-full text-center mt-3 border border-gray-300 hover:border-primary-500 text-gray-700 font-medium py-3 transition"
            >
              Voltar aos serviços
            </Link>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
