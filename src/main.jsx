import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AutenticacaoProvider } from './contexto/AutenticacaoContexto'
import './index.css'

// AutenticacaoProvider envolve toda a árvore, incluindo o próprio Router
// (dentro de App.jsx) — necessário porque tanto páginas dentro das rotas
// como o próprio RotaPrivada (fora e dentro do Router) precisam de ler
// useAutenticacao(). Não depende de contexto de routing, por isso a
// ordem em relação ao BrowserRouter é indiferente aqui.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AutenticacaoProvider>
      <App />
    </AutenticacaoProvider>
  </React.StrictMode>,
)