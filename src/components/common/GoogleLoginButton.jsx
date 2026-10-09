// src/components/common/GoogleLoginButton.jsx
// Botão oficial "Sign in with Google" (Google Identity Services).
// Não precisa de dependências extra: carrega o script da Google sob demanda.
import { useEffect, useRef, useState } from 'react';

const GSI_SRC = 'https://accounts.google.com/gsi/client';
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

let scriptPromise = null;

function carregarGsi() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = GSI_SRC;
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = () => {
        scriptPromise = null;
        reject(new Error('Não foi possível carregar o Google.'));
      };
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

/**
 * @param {(credential: string) => void} onCredential  chamado com o ID token
 * @param {'signin_with'|'signup_with'|'continue_with'} [text]
 */
export default function GoogleLoginButton({ onCredential, text = 'signin_with' }) {
  const contentorRef = useRef(null);
  const callbackRef = useRef(onCredential);
  const [erro, setErro] = useState(!GOOGLE_CLIENT_ID ? 'Login com Google não configurado (VITE_GOOGLE_CLIENT_ID em falta).' : '');

  // Mantém sempre a versão mais recente do callback sem reinicializar o botão
  useEffect(() => {
    callbackRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      return;
    }

    let cancelado = false;
    carregarGsi()
      .then(() => {
        if (cancelado || !contentorRef.current) return;

        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (resposta) => callbackRef.current?.(resposta.credential),
        });

        contentorRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(contentorRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text,
          shape: 'rectangular',
          locale: 'pt-PT',
          width: Math.min(400, contentorRef.current.offsetWidth || 320),
        });
      })
      .catch((e) => !cancelado && setErro(e.message));

    return () => {
      cancelado = true;
    };
  }, [text]);

  if (erro) {
    return <p role="alert" className="text-sm text-danger text-center">{erro}</p>;
  }

  return <div ref={contentorRef} className="w-full flex justify-center min-h-[44px]" />;
}
