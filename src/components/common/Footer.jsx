import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-primary-500 text-primary-100 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <span className="text-xl font-bold text-white">SIPI</span>
            <p className="mt-2 text-sm text-primary-200">
              Sistema de Informação da Propriedade Industrial — Angola.
            </p>
            <p className="mt-4 text-xs text-primary-300">
              © {new Date().getFullYear()} IAPI. Todos os direitos reservados.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 text-sm tracking-wide uppercase">Navegação</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white transition">Início</Link></li>
              <li><Link to="/servicos" className="hover:text-white transition">Serviços</Link></li>
              <li><Link to="/consulta" className="hover:text-white transition">Consulta Pública</Link></li>
              <li><Link to="/login" className="hover:text-white transition">Entrar</Link></li>
              <li><Link to="/registro" className="hover:text-white transition">Registar</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 text-sm tracking-wide uppercase">
              Instituto Angolano da Propriedade Industrial
            </h4>
            <ul className="space-y-2 text-sm text-primary-200">
              <li>Rua X, Edifício IAPI, Luanda</li>
              <li>+244 222 XXX XXX</li>
              <li>geral@iapi.ao</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 text-sm tracking-wide uppercase">Parcerias</h4>
            <ul className="space-y-1.5 text-sm text-primary-200">
              <li>GOVERNO.AO 27 — Projecto 386ATDAP.IMA.27</li>
              <li>CUTE — Conta Única do Tesouro</li>
              <li>Ministério da Indústria e Comércio</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-primary-400 text-center text-xs text-primary-300">
          Desenvolvido no âmbito da disciplina Aplicações e Serviços na Web — Universidade Agostinho Neto
        </div>
      </div>
    </footer>
  );
}
