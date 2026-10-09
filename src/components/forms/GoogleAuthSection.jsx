// src/components/forms/GoogleAuthSection.jsx
// Botão "Continuar com Google" + formulário de complemento de registo
// (NIF, telefone, tipo) para quem entra pela 1.ª vez.
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import GoogleLoginButton from '../common/GoogleLoginButton';
import { useAutenticacao } from '../../contexto/AutenticacaoContexto';
import { ROTA_INICIAL_POR_PERFIL } from '../../utilitarios/rotasPorPerfil';

const REGEX_NIF = /^(\d{9}[A-Z]{2}\d{3}|\d{14})$/;
const REGEX_TELEFONE = /^(\+244|244)?\d{9}$/;

const inputCls = (erro) =>
  `w-full border ${erro ? 'border-danger' : 'border-gray-300'} px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500`;

function Campo({ id, label, erro, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} <span className="text-danger">*</span>
      </label>
      {children}
      {erro && (
        <p role="alert" className="text-danger text-sm mt-1">{erro.message}</p>
      )}
    </div>
  );
}

// Converte os erros DRF ({campo: ["msg"]}) numa mensagem legível
function mensagemDeErro(erro) {
  const d = erro.response?.data;
  if (!d) return 'Erro de ligação ao servidor. Tente novamente.';
  if (typeof d.detail === 'string') return d.detail;
  const primeiro = Object.values(d).flat().find((v) => typeof v === 'string');
  return primeiro || 'Não foi possível concluir a autenticação com Google.';
}

export default function GoogleAuthSection({ texto = 'signin_with' }) {
  const { entrarComGoogle } = useAutenticacao();
  const navegar = useNavigate();

  const [pendente, setPendente] = useState(null); // { credential, google }
  const [tipo, setTipo] = useState('PESSOA_FISICA');
  const [erro, setErro] = useState('');
  const [aProcessar, setAProcessar] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const concluir = (sessao) => {
    navegar(ROTA_INICIAL_POR_PERFIL[sessao.user.perfil] ?? '/', { replace: true });
  };

  const aoReceberCredential = async (credential) => {
    setErro('');
    setAProcessar(true);
    try {
      const resultado = await entrarComGoogle(credential);
      if (resultado.registroNecessario) {
        setPendente({ credential, google: resultado.google });
      } else {
        concluir(resultado);
      }
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setAProcessar(false);
    }
  };

  const onSubmit = async (dados) => {
    setErro('');
    setAProcessar(true);
    try {
      const extras = {
        nif: dados.nif.toUpperCase(),
        telefone: dados.telefone,
        tipo_utilizador: tipo,
      };
      if (tipo === 'PESSOA_FISICA') {
        extras.nome_completo = dados.nome_completo;
      } else {
        extras.denominacao_social = dados.denominacao_social;
        extras.sede = dados.sede;
        extras.representante_legal = dados.representante_legal;
      }
      const sessao = await entrarComGoogle(pendente.credential, extras);
      concluir(sessao);
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setAProcessar(false);
    }
  };

  // ---- 2.ª etapa: completar registo ----
  if (pendente) {
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="bg-primary-50 border border-primary-200 px-4 py-3 text-sm text-primary-600">
          <p className="font-semibold">Quase lá! Complete o seu registo</p>
          <p className="mt-0.5 break-all">Conta Google: {pendente.google.email}</p>
        </div>

        <div className="flex gap-2" role="group" aria-label="Tipo de pessoa">
          {[['PESSOA_FISICA', 'Pessoa Física'], ['PESSOA_JURIDICA', 'Pessoa Jurídica']].map(([valor, rotulo]) => (
            <button
              key={valor}
              type="button"
              aria-pressed={tipo === valor}
              onClick={() => setTipo(valor)}
              className={`flex-1 py-2 text-sm font-medium transition ${
                tipo === valor ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {rotulo}
            </button>
          ))}
        </div>

        <Campo id="g-nif" label="NIF" erro={errors.nif}>
          <input
            id="g-nif"
            maxLength={14}
            placeholder="009150115UE044"
            className={inputCls(errors.nif)}
            {...register('nif', {
              required: 'NIF obrigatório',
              setValueAs: (v) => (v || '').trim().toUpperCase(),
              validate: (v) => REGEX_NIF.test(v) || 'NIF inválido (ex.: 009150115UE044 ou 14 dígitos)',
            })}
          />
        </Campo>

        <Campo id="g-telefone" label="Telefone" erro={errors.telefone}>
          <input
            id="g-telefone"
            type="tel"
            placeholder="+244 921 752 855"
            className={inputCls(errors.telefone)}
            {...register('telefone', {
              required: 'Telefone obrigatório',
              validate: (v) => REGEX_TELEFONE.test((v || '').replace(/[\s\-()]/g, '')) || 'Telefone inválido',
            })}
          />
        </Campo>

        {tipo === 'PESSOA_FISICA' ? (
          <Campo id="g-nome" label="Nome completo" erro={errors.nome_completo}>
            <input
              id="g-nome"
              defaultValue={pendente.google.nome}
              className={inputCls(errors.nome_completo)}
              {...register('nome_completo', { required: 'Nome completo obrigatório' })}
            />
          </Campo>
        ) : (
          <>
            <Campo id="g-denominacao" label="Denominação Social" erro={errors.denominacao_social}>
              <input id="g-denominacao" className={inputCls(errors.denominacao_social)}
                {...register('denominacao_social', { required: 'Denominação social obrigatória' })} />
            </Campo>
            <Campo id="g-sede" label="Sede" erro={errors.sede}>
              <input id="g-sede" className={inputCls(errors.sede)}
                {...register('sede', { required: 'Sede obrigatória' })} />
            </Campo>
            <Campo id="g-rep" label="Representante Legal" erro={errors.representante_legal}>
              <input id="g-rep" className={inputCls(errors.representante_legal)}
                {...register('representante_legal', { required: 'Representante legal obrigatório' })} />
            </Campo>
          </>
        )}

        {erro && (
          <p role="alert" className="text-sm text-danger border-l-2 border-danger pl-3 py-1">{erro}</p>
        )}

        <button
          type="submit"
          disabled={aProcessar}
          className="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-semibold py-3 transition"
        >
          {aProcessar ? 'A criar conta…' : 'Concluir registo'}
        </button>
        <button
          type="button"
          onClick={() => { setPendente(null); setErro(''); }}
          className="w-full text-sm text-gray-500 hover:text-primary-500"
        >
          Usar outra conta Google
        </button>
      </form>
    );
  }

  // ---- 1.ª etapa: botão Google ----
  return (
    <div className="space-y-3">
      <div className={aProcessar ? 'opacity-60 pointer-events-none' : ''}>
        <GoogleLoginButton onCredential={aoReceberCredential} text={texto} />
      </div>
      {aProcessar && <p className="text-center text-sm text-gray-500">A validar com a Google…</p>}
      {erro && (
        <p role="alert" className="text-sm text-danger border-l-2 border-danger pl-3 py-1">{erro}</p>
      )}
    </div>
  );
}
