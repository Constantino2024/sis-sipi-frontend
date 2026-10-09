// src/paginas/privadas/requerente/NotificacoesPage.jsx

import { useEffect, useMemo, useState } from 'react';
import { Bell, FileText, AlertTriangle, MessageSquare, Clock } from 'lucide-react';
import CabecalhoPainel from "../../../components/privado/CabecalhoPainel";
import { useAutenticacao } from "../../../contexto/AutenticacaoContexto";
import {
  listarNotificacoesDoRequerente,
  marcarNotificacaoComoLida,
  marcarNotificacaoComoNaoLida,
} from "../../../services/notificacoesService";

const CATEGORIAS = [
  { chave: 'TODAS', rotulo: 'Todas' },
  { chave: 'ATUALIZACAO', rotulo: 'Actualizações dos Pedidos' },
  { chave: 'EXIGENCIA', rotulo: 'Exigências' },
  { chave: 'RESPOSTA_TECNICO', rotulo: 'Respostas do Técnico' },
  { chave: 'PRAZO', rotulo: 'Avisos de Prazos' },
];

const ICONE_POR_TIPO = {
  ATUALIZACAO: FileText,
  EXIGENCIA: AlertTriangle,
  RESPOSTA_TECNICO: MessageSquare,
  PRAZO: Clock,
};

const COR_POR_TIPO = {
  ATUALIZACAO: 'text-primary-500 bg-primary-50',
  EXIGENCIA: 'text-amber-600 bg-amber-50',
  RESPOSTA_TECNICO: 'text-primary-500 bg-primary-50',
  PRAZO: 'text-red-600 bg-red-50',
};

export default function NotificacoesPage() {
  const { utilizador } = useAutenticacao();
  const [categoriaActiva, setCategoriaActiva] = useState('TODAS');
  const [notificacoes, setNotificacoes] = useState([]);
  const [aCarregar, setACarregar] = useState(true);
  const [idsEmAtualizacao, setIdsEmAtualizacao] = useState([]);

  useEffect(() => {
    if (!utilizador?.id) return;
    listarNotificacoesDoRequerente(utilizador.id).then((resultado) => {
      setNotificacoes(resultado);
      setACarregar(false);
    });
  }, [utilizador?.id]);

  const notificacoesFiltradas = useMemo(() => {
    if (categoriaActiva === 'TODAS') return notificacoes;
    return notificacoes.filter((n) => n.tipo === categoriaActiva);
  }, [notificacoes, categoriaActiva]);

  async function alternarEstadoLeitura(notificacao) {
    const { id, lida } = notificacao;
    setIdsEmAtualizacao((atual) => [...atual, id]);
    try {
      const acao = lida ? marcarNotificacaoComoNaoLida : marcarNotificacaoComoLida;
      const notificacaoAtualizada = await acao(id);
      setNotificacoes((atual) =>
        atual.map((n) => (n.id === id ? notificacaoAtualizada : n))
      );
    } catch (excecao) {
      console.error('Não foi possível atualizar a notificação:', excecao);
    } finally {
      setIdsEmAtualizacao((atual) => atual.filter((idAtual) => idAtual !== id));
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <CabecalhoPainel titulo="Notificações" />
      <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Filtros por categoria */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIAS.map((cat) => (
            <button
              key={cat.chave}
              type="button"
              onClick={() => setCategoriaActiva(cat.chave)}
              className={`px-4 py-2 text-sm font-medium transition ${
                categoriaActiva === cat.chave
                  ? 'bg-primary-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300'
              }`}
              style={{ borderRadius: '15px' }}
            >
              {cat.rotulo}
            </button>
          ))}
        </div>

        {/* Lista de notificações */}
        {aCarregar ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-24 bg-white border border-gray-200 animate-pulse"
                style={{ borderRadius: '15px' }}
              />
            ))}
          </div>
        ) : notificacoesFiltradas.length === 0 ? (
          <div
            className="bg-white border border-gray-200 px-5 py-14 text-center"
            style={{ borderRadius: '15px' }}
          >
            <Bell size={28} className="text-gray-300 mx-auto mb-3" aria-hidden="true" />
            <p className="text-sm text-gray-400">Não há notificações nesta categoria.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {notificacoesFiltradas.map((n) => {
              const Icone = ICONE_POR_TIPO[n.tipo] ?? Bell;
              const aAtualizar = idsEmAtualizacao.includes(n.id);
              return (
                <li
                  key={n.id}
                  className={`flex items-start gap-4 bg-white border p-5 transition-colors ${
                    n.lida ? 'border-gray-200' : 'border-primary-200'
                  }`}
                  style={{ borderRadius: '15px' }}
                >
                  <div className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-full ${COR_POR_TIPO[n.tipo]}`}>
                    <Icone size={18} aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-primary-900">{n.titulo}</p>
                      {!n.lida && <span className="w-2 h-2 rounded-full bg-primary-500 shrink-0" />}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{n.descricao}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(n.data).toLocaleString('pt-PT', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => alternarEstadoLeitura(n)}
                    disabled={aAtualizar}
                    className="text-xs font-medium text-primary-500 hover:text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    {aAtualizar ? '...' : n.lida ? 'Marcar como não lida' : 'Marcar como lida'}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}