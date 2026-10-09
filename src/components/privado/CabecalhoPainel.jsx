// src/components/privado/CabecalhoPainel.jsx

import { useState } from 'react';
import { LogOut, X } from 'lucide-react';
import { useAutenticacao } from '../../contexto/AutenticacaoContexto';

const ROTULOS_PERFIL = {
  REQUERENTE: 'Requerente',
  TECNICO: 'Técnico',
  GESTOR: 'Administrador',
};

export default function CabecalhoPainel({ titulo }) {
  const { utilizador, sair } = useAutenticacao();
  const [modalAberto, setModalAberto] = useState(false);

  function confirmarSaida() {
    setModalAberto(false);
    sair();
  }

  return (
    <>
      <header className="bg-white text-primary-900 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-[#C9A227] font-semibold">
              {ROTULOS_PERFIL[utilizador?.perfil]}
            </p>
            <h1 className="text-xl font-bold text-primary-900">{titulo}</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:inline">{utilizador?.nome}</span>
            <button
              type="button"
              onClick={() => setModalAberto(true)}
              className="flex items-center gap-2 border border-gray-300 hover:border-primary-500 hover:text-primary-500 text-gray-600 px-4 py-2 text-sm transition"
            >
              <LogOut size={16} aria-hidden="true" />
              Sair
            </button>
          </div>
        </div>
      </header>

      {modalAberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="titulo-modal-sair"
          onClick={() => setModalAberto(false)}
        >
          <div
            className="bg-white w-full max-w-sm p-6 relative"
            style={{ borderRadius: '15px' }}
            onClick={(evento) => evento.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setModalAberto(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              aria-label="Fechar"
            >
              <X size={18} />
            </button>

            <h2 id="titulo-modal-sair" className="text-lg font-bold text-primary-900 mb-2">
              Terminar sessão
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Tem a certeza que deseja terminar a sessão actual?
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalAberto(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 hover:border-gray-400 transition"
                style={{ borderRadius: '15px' }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarSaida}
                className="px-4 py-2 text-sm font-medium bg-primary-500 hover:bg-primary-600 text-white transition"
                style={{ borderRadius: '15px' }}
              >
                Sim, terminar sessão
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}