import { useState } from 'react';
import { User, Mail, ShieldCheck, KeyRound, Pencil, X, Check } from 'lucide-react';
import CabecalhoPainel from '../../components/privado/CabecalhoPainel';
import { useAutenticacao } from '../../contexto/AutenticacaoContexto';
import { alterarPassword } from '../../services/authService';

const ROTULOS_PERFIL = {
  REQUERENTE: 'Requerente',
  TECNICO_EXAMINADOR: 'Técnico Examinador',
  ADMINISTRADOR: 'Administrador',
};

const COR_BADGE_PERFIL = {
  REQUERENTE: 'bg-primary-50 text-primary-700 border-primary-200',
  TECNICO_EXAMINADOR: 'bg-amber-50 text-amber-700 border-amber-200',
  ADMINISTRADOR: 'bg-[#FBF3DD] text-[#8A6D14] border-[#E4C766]',
};

function obterIniciais(nome) {
  if (!nome) return '?';
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? '';
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return (primeira + ultima).toUpperCase();
}

function CampoTexto({ id, rotulo, tipo = 'text', valor, aoAlterar }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs text-gray-400 uppercase tracking-wide mb-1.5">
        {rotulo}
      </label>
      <input
        id={id}
        type={tipo}
        value={valor}
        onChange={(e) => aoAlterar(e.target.value)}
        className="w-full border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
        style={{ borderRadius: '10px' }}
        required
      />
    </div>
  );
}

export default function PerfilPage() {
  const { utilizador, atualizarPerfil } = useAutenticacao();

  // --- Edição de dados pessoais ---
  const [aEditar, setAEditar] = useState(false);
  const [nome, setNome] = useState(utilizador.nome);
  const [email, setEmail] = useState(utilizador.email);
  const [aGuardar, setAGuardar] = useState(false);
  const [erroPerfil, setErroPerfil] = useState(null);

  function iniciarEdicao() {
    setNome(utilizador.nome);
    setEmail(utilizador.email);
    setErroPerfil(null);
    setAEditar(true);
  }

  function cancelarEdicao() {
    setAEditar(false);
    setErroPerfil(null);
  }

  async function guardarEdicao(evento) {
    evento.preventDefault();
    setErroPerfil(null);

    if (!nome.trim() || !email.trim()) {
      setErroPerfil('Preencha o nome e o email.');
      return;
    }

    setAGuardar(true);
    try {
      await atualizarPerfil({ nome: nome.trim(), email: email.trim() });
      setAEditar(false);
    } catch (excecao) {
      setErroPerfil(excecao?.response?.data?.message ?? 'Não foi possível guardar as alterações.');
    } finally {
      setAGuardar(false);
    }
  }

  // --- Alteração de password ---
  const [modalPasswordAberto, setModalPasswordAberto] = useState(false);
  const [passwordAtual, setPasswordAtual] = useState('');
  const [novaPassword, setNovaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [aAlterarPassword, setAAlterarPassword] = useState(false);
  const [erroPassword, setErroPassword] = useState(null);

  function fecharModalPassword() {
    setModalPasswordAberto(false);
    setPasswordAtual('');
    setNovaPassword('');
    setConfirmarPassword('');
    setErroPassword(null);
  }

  async function aoSubmeterPassword(evento) {
    evento.preventDefault();
    setErroPassword(null);

    if (novaPassword.length < 6) {
      setErroPassword('A nova palavra-passe deve ter pelo menos 6 caracteres.');
      return;
    }
    if (novaPassword !== confirmarPassword) {
      setErroPassword('A confirmação não coincide com a nova palavra-passe.');
      return;
    }

    setAAlterarPassword(true);
    try {
      await alterarPassword(utilizador.id, passwordAtual, novaPassword);
      fecharModalPassword();
    } catch (excecao) {
      setErroPassword(excecao?.response?.data?.message ?? 'Não foi possível alterar a palavra-passe.');
    } finally {
      setAAlterarPassword(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <CabecalhoPainel titulo="O Meu Perfil" />
      <main className="flex-grow max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Cabeçalho do perfil */}
        <div
          className="bg-white border border-gray-200 p-6 mb-6 flex items-center gap-5"
          style={{ borderRadius: '15px' }}
        >
          <div className="w-16 h-16 shrink-0 rounded-full bg-primary-500 flex items-center justify-center text-white text-xl font-bold">
            {obterIniciais(utilizador.nome)}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-primary-900 truncate">{utilizador.nome}</h2>
            <p className="text-sm text-gray-500 truncate">{utilizador.email}</p>
            <span
              className={`inline-block mt-2 rounded-full border px-2.5 py-1 text-xs font-medium ${COR_BADGE_PERFIL[utilizador.perfil] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}
            >
              {ROTULOS_PERFIL[utilizador.perfil]}
            </span>
          </div>
        </div>

        {/* Informação pessoal — editável */}
        <div
          className="bg-white border border-gray-200 overflow-hidden mb-6"
          style={{ borderRadius: '15px' }}
        >
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-primary-900">Informação Pessoal</h3>
            {!aEditar && (
              <button
                type="button"
                onClick={iniciarEdicao}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-500 hover:text-primary-600"
              >
                <Pencil size={14} aria-hidden="true" />
                Editar
              </button>
            )}
          </div>

          {aEditar ? (
            <form onSubmit={guardarEdicao} className="px-6 py-5 space-y-4">
              {erroPerfil && (
                <div
                  className="bg-red-50 border border-red-300 text-red-700 text-sm px-4 py-2.5"
                  style={{ borderRadius: '10px' }}
                >
                  {erroPerfil}
                </div>
              )}
              <CampoTexto id="nome" rotulo="Nome" valor={nome} aoAlterar={setNome} />
              <CampoTexto id="email" rotulo="Email" tipo="email" valor={email} aoAlterar={setEmail} />

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={aGuardar}
                  className="inline-flex items-center gap-1.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 transition"
                  style={{ borderRadius: '10px' }}
                >
                  <Check size={15} aria-hidden="true" />
                  {aGuardar ? 'A guardar…' : 'Guardar'}
                </button>
                <button
                  type="button"
                  onClick={cancelarEdicao}
                  disabled={aGuardar}
                  className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm font-medium px-4 py-2"
                >
                  <X size={15} aria-hidden="true" />
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <div className="divide-y divide-gray-100">
              <div className="flex items-center gap-4 px-6 py-4">
                <div className="w-9 h-9 shrink-0 rounded-full bg-primary-50 flex items-center justify-center text-primary-500">
                  <User size={16} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Nome</p>
                  <p className="text-sm text-gray-800 mt-0.5">{utilizador.nome}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 px-6 py-4">
                <div className="w-9 h-9 shrink-0 rounded-full bg-primary-50 flex items-center justify-center text-primary-500">
                  <Mail size={16} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Email</p>
                  <p className="text-sm text-gray-800 mt-0.5">{utilizador.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 px-6 py-4">
                <div className="w-9 h-9 shrink-0 rounded-full bg-primary-50 flex items-center justify-center text-primary-500">
                  <ShieldCheck size={16} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Perfil</p>
                  <p className="text-sm text-gray-800 mt-0.5">{ROTULOS_PERFIL[utilizador.perfil]}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Segurança */}
        <div
          className="bg-white border border-gray-200 overflow-hidden"
          style={{ borderRadius: '15px' }}
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-primary-900">Segurança</h3>
          </div>
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 shrink-0 rounded-full bg-primary-50 flex items-center justify-center text-primary-500">
                <KeyRound size={16} aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm text-gray-800">Palavra-passe</p>
                <p className="text-xs text-gray-400 mt-0.5">Última alteração desconhecida</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setModalPasswordAberto(true)}
              className="text-sm font-medium text-primary-500 hover:text-primary-600 px-4 py-2 border border-gray-200 hover:border-primary-300 transition"
              style={{ borderRadius: '15px' }}
            >
              Alterar
            </button>
          </div>
        </div>
      </main>

      {/* Modal de alteração de password */}
      {modalPasswordAberto && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50"
          onClick={fecharModalPassword}
        >
          <div
            className="bg-white w-full max-w-sm p-6"
            style={{ borderRadius: '15px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-primary-900">Alterar Palavra-passe</h3>
              <button type="button" onClick={fecharModalPassword} className="text-gray-400 hover:text-gray-600">
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={aoSubmeterPassword} className="space-y-4">
              {erroPassword && (
                <div
                  className="bg-red-50 border border-red-300 text-red-700 text-sm px-4 py-2.5"
                  style={{ borderRadius: '10px' }}
                >
                  {erroPassword}
                </div>
              )}
              <CampoTexto
                id="passwordAtual"
                rotulo="Palavra-passe atual"
                tipo="password"
                valor={passwordAtual}
                aoAlterar={setPasswordAtual}
              />
              <CampoTexto
                id="novaPassword"
                rotulo="Nova palavra-passe"
                tipo="password"
                valor={novaPassword}
                aoAlterar={setNovaPassword}
              />
              <CampoTexto
                id="confirmarPassword"
                rotulo="Confirmar nova palavra-passe"
                tipo="password"
                valor={confirmarPassword}
                aoAlterar={setConfirmarPassword}
              />

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={aAlterarPassword}
                  className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white text-sm font-medium px-4 py-2.5 transition"
                  style={{ borderRadius: '10px' }}
                >
                  {aAlterarPassword ? 'A alterar…' : 'Confirmar Alteração'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}