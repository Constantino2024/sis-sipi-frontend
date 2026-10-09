import { Suspense, lazy, Component } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RotaPrivada from './rotas/RotaPrivada';

// --- Páginas públicas ---
const HomePage = lazy(() => import('./paginas/publicas/HomePage'));
const LoginPage = lazy(() => import('./paginas/publicas/LoginPage'));
const RegistroPage = lazy(() => import('./paginas/publicas/RegistroPage'));
const ServicosPage = lazy(() => import('./paginas/publicas/ServicosPage'));
const ServicoDetalhePage = lazy(() => import('./paginas/publicas/ServicoDetalhePage'));
const ConsultaPublicaPage = lazy(() => import('./paginas/publicas/ConsultaPublicaPage'));
const NoticiasPage = lazy(() => import('./paginas/publicas/NoticiasPage'));
const FormulariosPage = lazy(() => import('./paginas/publicas/FormulariosPage'));

// --- Páginas privadas ---
const DashboardRequerentePage = lazy(() => import('./paginas/privadas/requerente/DashboardRequerentePage'));
const MeusPedidosPage = lazy(() => import('./paginas/privadas/requerente/MeusPedidosPage'));
const NovoPedidoPage = lazy(() => import('./paginas/privadas/requerente/NovoPedidoPage'));
const EditarPedidoPage = lazy(() => import('./paginas/privadas/requerente/EditarPedidoPage'));

const DashboardTecnicoPage = lazy(() => import('./paginas/privadas/tecnico/DashboardTecnicoPage'));
const TecnicoProcessosPage = lazy(() => import('./paginas/privadas/tecnico/TecnicoProcessosPage'));
const TecnicoExamePage = lazy(() => import('./paginas/privadas/tecnico/TecnicoExamePage'));
const TecnicoPareceresPage = lazy(() => import('./paginas/privadas/tecnico/TecnicoPareceresPage'));
const TecnicoExigenciasPage = lazy(() => import('./paginas/privadas/tecnico/TecnicoExigenciasPage'));

const PerfilPage = lazy(() => import('./paginas/privadas/PerfilPage')); // ver nota abaixo
const NotificacoesPage = lazy(() => import('./paginas/privadas/requerente/NotificacoesPage'));

const DashboardAdminPage = lazy(() => import('./paginas/privadas/admin/DashboardAdminPage'));
const PedidosAdminPage = lazy(() => import('./paginas/privadas/admin/PedidosAdminPage'));
const UtilizadoresAdminPage = lazy(() => import('./paginas/privadas/admin/UtilizadoresAdminPage'));
const RelatoriosAdminPage = lazy(() => import('./paginas/privadas/admin/RelatoriosAdminPage'));

// --- Páginas de erro ---
const NaoAutorizadoPage = lazy(() => import('./paginas/erros/NaoAutorizadoPage'));

function CarregamentoRota() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white" role="status" aria-live="polite">
      <span className="text-sm text-gray-400 tracking-wide uppercase">A carregar…</span>
    </div>
  );
}

class LimiteDeErro extends Component {
  constructor(propriedades) {
    super(propriedades);
    this.state = { comErro: false };
  }

  static getDerivedStateFromError() {
    return { comErro: true };
  }

  componentDidCatch(erro, informacaoDoErro) {
    console.error('Erro capturado pelo LimiteDeErro:', erro, informacaoDoErro);
  }

  render() {
    if (this.state.comErro) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 text-center">
          <h1 className="text-xl font-semibold text-gray-800 mb-2">Ocorreu um erro inesperado</h1>
          <p className="text-sm text-gray-500 mb-4">
            Tente recarregar a página. Se o problema persistir, contacte o suporte técnico.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="bg-primary-500 hover:bg-primary-600 text-white font-medium px-5 py-2 rounded-lg transition"
          >
            Recarregar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <BrowserRouter>
      <LimiteDeErro>
        <Suspense fallback={<CarregamentoRota />}>
          <Routes>
            {/* --- Rotas públicas --- */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegistroPage />} />
            <Route path="/servicos" element={<ServicosPage />} />
            <Route path="/servicos/:slug" element={<ServicoDetalhePage />} />
            <Route path="/consulta" element={<ConsultaPublicaPage />} />
            <Route path="/noticias" element={<NoticiasPage />} />
            <Route path="/formularios" element={<FormulariosPage />} />

            {/* --- Rota de erro (pública — precisa de ser acessível para o
                 redirect do RotaPrivada funcionar) --- */}
            <Route path="/nao-autorizado" element={<NaoAutorizadoPage />} />

            {/* --- Rotas privadas, cada uma protegida por perfil --- */}
            <Route
              path="/dashboard-requerente"
              element={
                <RotaPrivada perfisPermitidos={['REQUERENTE']}>
                  <DashboardRequerentePage />
                </RotaPrivada>
              }
            />

              {/* Antes de /meus-pedidos, para não conflituar com a rota geral */}
            <Route
              path="/meus-pedidos/:id/editar"
              element={
                <RotaPrivada perfisPermitidos={['REQUERENTE']}>
                  <EditarPedidoPage />
                </RotaPrivada>
              }
            />

            {/* /meus-pedidos/novo tem de vir ANTES de qualquer rota dinâmica
                tipo /meus-pedidos/:id, para não ser "engolida" por ela. */}
            <Route
              path="/meus-pedidos/novo"
              element={
                <RotaPrivada perfisPermitidos={['REQUERENTE']}>
                  <NovoPedidoPage />
                </RotaPrivada>
              }
            />
            <Route
              path="/meus-pedidos"
              element={
                <RotaPrivada perfisPermitidos={['REQUERENTE']}>
                  <MeusPedidosPage />
                </RotaPrivada>
              }
            />
            <Route
              path="/notificacoes"
              element={
                <RotaPrivada perfisPermitidos={['REQUERENTE']}>
                  <NotificacoesPage />
                </RotaPrivada>
              }
            />

            <Route
              path="/dashboard-tecnico"
              element={
                <RotaPrivada perfisPermitidos={['TECNICO', 'TECNICO_EXAMINADOR']}>
                  <DashboardTecnicoPage />
                </RotaPrivada>
              }
            />
            <Route
              path="/tecnico/processos"
              element={
                <RotaPrivada perfisPermitidos={['TECNICO', 'TECNICO_EXAMINADOR']}>
                  <TecnicoProcessosPage />
                </RotaPrivada>
              }
            />
            <Route
              path="/tecnico/exame"
              element={
                <RotaPrivada perfisPermitidos={['TECNICO', 'TECNICO_EXAMINADOR']}>
                  <TecnicoExamePage />
                </RotaPrivada>
              }
            />
            <Route
              path="/tecnico/pareceres"
              element={
                <RotaPrivada perfisPermitidos={['TECNICO', 'TECNICO_EXAMINADOR']}>
                  <TecnicoPareceresPage />
                </RotaPrivada>
              }
            />
            <Route
              path="/tecnico/exigencias"
              element={
                <RotaPrivada perfisPermitidos={['TECNICO', 'TECNICO_EXAMINADOR']}>
                  <TecnicoExigenciasPage />
                </RotaPrivada>
              }
            />

            <Route
              path="/dashboard-admin"
              element={
                <RotaPrivada perfisPermitidos={['GESTOR', 'ADMINISTRADOR']}>
                  <DashboardAdminPage />
                </RotaPrivada>
              }
            />
            <Route
              path="/admin/pedidos"
              element={
                <RotaPrivada perfisPermitidos={['GESTOR', 'ADMINISTRADOR']}>
                  <PedidosAdminPage />
                </RotaPrivada>
              }
            />
            <Route
              path="/admin/utilizadores"
              element={
                <RotaPrivada perfisPermitidos={['GESTOR', 'ADMINISTRADOR']}>
                  <UtilizadoresAdminPage />
                </RotaPrivada>
              }
            />
            <Route
              path="/admin/relatorios"
              element={
                <RotaPrivada perfisPermitidos={['GESTOR', 'ADMINISTRADOR']}>
                  <RelatoriosAdminPage />
                </RotaPrivada>
              }
            />

            {/* /perfil não passa perfisPermitidos — qualquer perfil autenticado
                acede, só a autenticação em si é exigida. */}
            <Route
              path="/perfil"
              element={
                <RotaPrivada>
                  <PerfilPage />
                </RotaPrivada>
              }
            />
          </Routes>
        </Suspense>
      </LimiteDeErro>
    </BrowserRouter>
  );
}

export default App;