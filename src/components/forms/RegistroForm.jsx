// src/components/forms/RegistroForm.jsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faBuilding,
  faEnvelope,
  faLock,
  faPhone,
  faFileAlt,
  faUserCheck,
  faUserPlus,
  faSpinner,
  faCheckCircle,
  faTimesCircle,
  faMapMarkerAlt,
} from '@fortawesome/free-solid-svg-icons';
import { register as registerApi } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import GoogleAuthSection from './GoogleAuthSection';

export default function RegistroForm() {
  const [tipo, setTipo] = useState('PESSOA_FISICA');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (dados) => {
    setMensagem('');
    setErro('');
    setCarregando(true);
    try {
      // Adaptar dados do frontend para o backend
      const payload = {
        email: dados.email,
        password: dados.password,
        confirmar_password: dados.confirmPassword,
        nif: dados.nif,
        telefone: dados.telefone || '+244 921 752 855',
        tipo_utilizador: tipo,
        nome_completo: tipo === 'PESSOA_FISICA' ? dados.name : undefined,
        denominacao_social: tipo === 'PESSOA_JURIDICA' ? dados.socialDenomination : undefined,
        sede: tipo === 'PESSOA_JURIDICA' ? dados.sede : undefined,
        representante_legal: tipo === 'PESSOA_JURIDICA' ? dados.legalRepresentative : undefined,
      };
      
      await registerApi(payload);
      setMensagem('✅ Registo efectuado com sucesso! Redirecionando...');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (error) {
      setErro(error.response?.data?.email?.[0] || error.response?.data?.password?.[0] || '❌ Erro no registo. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      {/* Cabeçalho */}
      <div className="bg-primary-500 px-6 py-5">
        <h2 className="text-2xl font-bold text-white text-center">Criar Conta</h2>
        <p className="text-primary-200 text-sm text-center mt-1">
          Sistema de Informação da Propriedade Industrial
        </p>
      </div>

      {/* Registo rápido com Google (fora do <form> para não aninhar formulários) */}
      <div className="px-6 pt-6 space-y-4">
        <GoogleAuthSection texto="signup_with" />
        <div className="flex items-center gap-3" aria-hidden="true">
          <span className="flex-1 h-px bg-gray-200" />
          <span className="text-xs uppercase tracking-wide text-gray-400">ou preencha o formulário</span>
          <span className="flex-1 h-px bg-gray-200" />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4" noValidate>
        {/* Toggle PF / PJ */}
        <div className="flex gap-3" role="group" aria-label="Tipo de pessoa">
          <button
            type="button"
            onClick={() => setTipo('PESSOA_FISICA')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg transition ${
              tipo === 'PESSOA_FISICA'
                ? 'bg-primary-500 text-white shadow-md ring-2 ring-primary-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            aria-pressed={tipo === 'PESSOA_FISICA'}
          >
            <FontAwesomeIcon icon={faUser} aria-hidden="true" />
            Pessoa Física
          </button>
          <button
            type="button"
            onClick={() => setTipo('PESSOA_JURIDICA')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg transition ${
              tipo === 'PESSOA_JURIDICA'
                ? 'bg-primary-500 text-white shadow-md ring-2 ring-primary-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            aria-pressed={tipo === 'PESSOA_JURIDICA'}
          >
            <FontAwesomeIcon icon={faBuilding} aria-hidden="true" />
            Pessoa Jurídica
          </button>
        </div>

        {/* Campos do formulário */}
        <div className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              <FontAwesomeIcon icon={faEnvelope} className="mr-1 text-primary-400" aria-hidden="true" />
              Email <span className="text-danger">*</span>
            </label>
            <input
              id="email"
              type="email"
              placeholder="seu@email.com"
              className={`w-full border ${
                errors.email ? 'border-danger' : 'border-gray-300'
              } rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition`}
              aria-required="true"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              {...register('email', {
                required: 'Email obrigatório',
                pattern: { value: /^\S+@\S+$/i, message: 'Email inválido' },
              })}
            />
            {errors.email && (
              <p id="email-error" className="text-danger text-sm mt-1" role="alert">
                <FontAwesomeIcon icon={faTimesCircle} className="mr-1" aria-hidden="true" />
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Palavra-passe */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              <FontAwesomeIcon icon={faLock} className="mr-1 text-primary-400" aria-hidden="true" />
              Palavra-passe <span className="text-danger">*</span>
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className={`w-full border ${
                errors.password ? 'border-danger' : 'border-gray-300'
              } rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition`}
              aria-required="true"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              {...register('password', {
                required: 'Palavra-passe obrigatória',
                minLength: { value: 6, message: 'Mínimo 6 caracteres' },
              })}
            />
            {errors.password && (
              <p id="password-error" className="text-danger text-sm mt-1" role="alert">
                <FontAwesomeIcon icon={faTimesCircle} className="mr-1" aria-hidden="true" />
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirmar Palavra-passe */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              <FontAwesomeIcon icon={faLock} className="mr-1 text-primary-400" aria-hidden="true" />
              Confirmar Palavra-passe <span className="text-danger">*</span>
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              className={`w-full border ${
                errors.confirmPassword ? 'border-danger' : 'border-gray-300'
              } rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition`}
              aria-required="true"
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
              {...register('confirmPassword', {
                required: 'Confirmar palavra-passe obrigatória',
                minLength: { value: 6, message: 'Mínimo 6 caracteres' },
              })}
            />
            {errors.confirmPassword && (
              <p id="confirmPassword-error" className="text-danger text-sm mt-1" role="alert">
                <FontAwesomeIcon icon={faTimesCircle} className="mr-1" aria-hidden="true" />
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* NIF */}
          <div>
            <label htmlFor="nif" className="block text-sm font-medium text-gray-700 mb-1">
              <FontAwesomeIcon icon={faFileAlt} className="mr-1 text-primary-400" aria-hidden="true" />
              NIF <span className="text-danger">*</span>
            </label>
            <input
              id="nif"
              type="text"
              placeholder="009150115UE044"
              maxLength={14}
              className={`w-full border ${
                errors.nif ? 'border-danger' : 'border-gray-300'
              } rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition`}
              aria-required="true"
              aria-invalid={!!errors.nif}
              aria-describedby={errors.nif ? 'nif-error' : undefined}
              {...register('nif', { required: 'NIF obrigatório', minLength: { value: 14, message: 'NIF deve ter 14 caracteres' } })}
            />
            {errors.nif && (
              <p id="nif-error" className="text-danger text-sm mt-1" role="alert">
                <FontAwesomeIcon icon={faTimesCircle} className="mr-1" aria-hidden="true" />
                {errors.nif.message}
              </p>
            )}
          </div>

          {/* Telefone */}
          <div>
            <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-1">
              <FontAwesomeIcon icon={faPhone} className="mr-1 text-primary-400" aria-hidden="true" />
              Telefone
            </label>
            <input
              id="telefone"
              type="tel"
              placeholder="+244 921 752 855"
              maxLength={20}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              {...register('telefone')}
            />
          </div>

          {/* Campos específicos PF */}
          {tipo === 'PESSOA_FISICA' && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                <FontAwesomeIcon icon={faUserCheck} className="mr-1 text-primary-400" aria-hidden="true" />
                Nome completo <span className="text-danger">*</span>
              </label>
              <input
                id="name"
                type="text"
                placeholder="João Manuel da Silva"
                className={`w-full border ${
                  errors.name ? 'border-danger' : 'border-gray-300'
                } rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition`}
                aria-required="true"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'name-error' : undefined}
                {...register('name', { required: 'Nome completo obrigatório' })}
              />
              {errors.name && (
                <p id="name-error" className="text-danger text-sm mt-1" role="alert">
                  <FontAwesomeIcon icon={faTimesCircle} className="mr-1" aria-hidden="true" />
                  {errors.name.message}
                </p>
              )}
            </div>
          )}

          {/* Campos específicos PJ */}
          {tipo === 'PESSOA_JURIDICA' && (
            <>
              <div>
                <label htmlFor="socialDenomination" className="block text-sm font-medium text-gray-700 mb-1">
                  <FontAwesomeIcon icon={faBuilding} className="mr-1 text-primary-400" aria-hidden="true" />
                  Denominação Social <span className="text-danger">*</span>
                </label>
                <input
                  id="socialDenomination"
                  type="text"
                  placeholder="Empresa XYZ, S.A."
                  className={`w-full border ${
                    errors.socialDenomination ? 'border-danger' : 'border-gray-300'
                  } rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition`}
                  aria-required="true"
                  aria-invalid={!!errors.socialDenomination}
                  aria-describedby={errors.socialDenomination ? 'socialDenomination-error' : undefined}
                  {...register('socialDenomination', { required: 'Denominação social obrigatória' })}
                />
                {errors.socialDenomination && (
                  <p id="socialDenomination-error" className="text-danger text-sm mt-1" role="alert">
                    <FontAwesomeIcon icon={faTimesCircle} className="mr-1" aria-hidden="true" />
                    {errors.socialDenomination.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="sede" className="block text-sm font-medium text-gray-700 mb-1">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1 text-primary-400" aria-hidden="true" />
                  Sede <span className="text-danger">*</span>
                </label>
                <input
                  id="sede"
                  type="text"
                  placeholder="Rua X, Luanda"
                  className={`w-full border ${
                    errors.sede ? 'border-danger' : 'border-gray-300'
                  } rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition`}
                  aria-required="true"
                  aria-invalid={!!errors.sede}
                  aria-describedby={errors.sede ? 'sede-error' : undefined}
                  {...register('sede', { required: 'Sede obrigatória' })}
                />
                {errors.sede && (
                  <p id="sede-error" className="text-danger text-sm mt-1" role="alert">
                    <FontAwesomeIcon icon={faTimesCircle} className="mr-1" aria-hidden="true" />
                    {errors.sede.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="legalRepresentative" className="block text-sm font-medium text-gray-700 mb-1">
                  <FontAwesomeIcon icon={faUserCheck} className="mr-1 text-primary-400" aria-hidden="true" />
                  Representante Legal <span className="text-danger">*</span>
                </label>
                <input
                  id="legalRepresentative"
                  type="text"
                  placeholder="Nome do representante"
                  className={`w-full border ${
                    errors.legalRepresentative ? 'border-danger' : 'border-gray-300'
                  } rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition`}
                  aria-required="true"
                  aria-invalid={!!errors.legalRepresentative}
                  aria-describedby={errors.legalRepresentative ? 'legalRepresentative-error' : undefined}
                  {...register('legalRepresentative', { required: 'Representante legal obrigatório' })}
                />
                {errors.legalRepresentative && (
                  <p id="legalRepresentative-error" className="text-danger text-sm mt-1" role="alert">
                    <FontAwesomeIcon icon={faTimesCircle} className="mr-1" aria-hidden="true" />
                    {errors.legalRepresentative.message}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Botão de submissão */}
          <button
            type="submit"
            disabled={carregando}
            className={`w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-lg transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 mt-2 ${
              carregando ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            aria-busy={carregando}
          >
            {carregando ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin aria-hidden="true" /> A processar...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faUserPlus} aria-hidden="true" /> Registrar
              </>
            )}
          </button>
        </div>

        {/* Mensagem de sucesso */}
        {mensagem && (
          <div
            className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-start gap-2"
            role="status"
            aria-live="polite"
          >
            <FontAwesomeIcon icon={faCheckCircle} className="mt-0.5 text-green-500" aria-hidden="true" />
            <span>{mensagem}</span>
          </div>
        )}

        {/* Mensagem de erro */}
        {erro && (
          <div
            className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2"
            role="alert"
            aria-live="assertive"
          >
            <FontAwesomeIcon icon={faTimesCircle} className="mt-0.5 text-red-500" aria-hidden="true" />
            <span>{erro}</span>
          </div>
        )}

        <p className="mt-4 text-center text-sm text-gray-600">
          Já tem conta?{' '}
          <a href="/login" className="text-primary-500 hover:underline font-medium transition">
            Entrar
          </a>
        </p>
      </form>
    </div>
  );
}