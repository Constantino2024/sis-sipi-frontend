import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faDownload, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { formularios } from '../../data/iapiData';

export default function FormulariosPage() {
  const depositos = formularios.filter((f) => f.tipo === 'Depósito');
  const servicos = formularios.filter((f) => f.tipo === 'Serviço');

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <Header />
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
          {/* Cabeçalho da página */}
          <div className="flex items-center gap-4 mb-6">
            <Link
              to="/"
              className="text-primary-500 hover:text-secondary-500 transition flex items-center gap-2 text-sm font-medium"
            >
              <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" /> Voltar
            </Link>
            <h1 className="text-3xl font-bold text-primary-500">Formulários Oficiais do IAPI</h1>
          </div>
          <p className="text-gray-600 mb-8">
            Aceda aos formulários oficiais para depósito e serviços de propriedade industrial em Angola.
            Estes formulários podem ser preenchidos offline e enviados ao IAPI.
          </p>

          {/* Formulários de Depósito */}
          <h2 className="text-2xl font-semibold text-primary-500 mt-8 mb-4 border-b border-gray-200 pb-2 flex items-center gap-2">
            <FontAwesomeIcon icon={faFilePdf} className="text-danger" aria-hidden="true" />
            Depósito
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {depositos.map((form) => (
              <div
                key={form.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition hover:border-secondary-500 flex items-center justify-between"
              >
                <div>
                  <h3 className="font-semibold text-gray-800">{form.titulo}</h3>
                  <p className="text-sm text-gray-500">{form.descricao}</p>
                </div>
                <a
                  href={form.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-danger text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-700 transition"
                  aria-label={`Descarregar ${form.titulo}`}
                >
                  <FontAwesomeIcon icon={faDownload} aria-hidden="true" /> PDF
                </a>
              </div>
            ))}
          </div>

          {/* Formulários de Serviço */}
          <h2 className="text-2xl font-semibold text-primary-500 mt-8 mb-4 border-b border-gray-200 pb-2 flex items-center gap-2">
            <FontAwesomeIcon icon={faFilePdf} className="text-secondary-500" aria-hidden="true" />
            Serviços
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {servicos.map((form) => (
              <div
                key={form.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition hover:border-secondary-500 flex items-center justify-between"
              >
                <div>
                  <h3 className="font-semibold text-gray-800">{form.titulo}</h3>
                  <p className="text-sm text-gray-500">{form.descricao}</p>
                </div>
                <a
                  href={form.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-secondary-500 text-primary-500 px-3 py-1.5 rounded-lg text-sm hover:bg-secondary-400 transition"
                  aria-label={`Descarregar ${form.titulo}`}
                >
                  <FontAwesomeIcon icon={faDownload} aria-hidden="true" /> PDF
                </a>
              </div>
            ))}
          </div>

          {/* Nota informativa */}
          <div className="mt-8 p-4 bg-primary-50 rounded-lg border border-primary-200">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Nota:</span> Todos os formulários estão disponíveis em formato PDF.
              Para utilizar o SIPI digitalmente, pode preencher os pedidos online sem necessidade de download.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}