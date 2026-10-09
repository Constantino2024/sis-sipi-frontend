# SIPI — Frontend

Sistema de Informação da Propriedade Industrial. Frontend público e privado
para o Instituto Angolano da Propriedade Industrial (IAPI), desenvolvido no
âmbito da disciplina de Aplicações e Serviços na Web (Universidade Agostinho
Neto), alinhado com a Agenda GOVERNO.AO 27 (projecto 386ATDAP.IMA.27).

Este documento descreve, com detalhe técnico, as tecnologias e técnicas de
implementação usadas nesta camada de frontend.

---

## 1. Stack tecnológica

| Camada              | Tecnologia              | Versão   | Papel                                              |
|----------------------|--------------------------|----------|-----------------------------------------------------|
| Empacotador / Dev server | Vite                | 8.x      | Bundling de produção (Rollup) e servidor de desenvolvimento com HMR nativo sobre ES Modules |
| Biblioteca de UI    | React                    | 19.x     | Componentização, estado local e reconciliação da árvore de UI |
| Routing             | React Router DOM         | 7.x      | Routing declarativo do lado do cliente (SPA)         |
| Estilos              | Tailwind CSS             | 3.x      | Utility-first CSS, com tokens de design customizados |
| HTTP client         | Axios                    | 1.x      | Comunicação REST com o backend (interceptores para JWT) |
| Formulários         | React Hook Form          | 7.x      | Validação e estado de formulários não controlados (menos re-renderizações) |
| Ícones              | lucide-react + Font Awesome | —     | Ícones funcionais pontuais (ver secção 5)            |

Não há framework de SSR/SSG (Next.js, Remix, etc.) nesta fase — ver
justificação na secção 2.

---

## 2. Técnica de renderização: CSR (Client-Side Rendering)

O SIPI frontend é renderizado inteiramente no cliente:

1. O servidor (ou CDN estático) entrega um `index.html` praticamente vazio
   e o bundle JavaScript.
2. O browser executa o bundle, o React monta a árvore de componentes em
   `#root` e o React Router assume o controlo da navegação via History API
   — não há recarregamento de página entre rotas.

**Porquê CSR e não SSR/SSG neste projecto:**

- A maior parte do sistema (área do Requerente, Técnico Examinador e
  Administrador) está **atrás de autenticação** — não há benefício de SEO
  em pré-renderizar páginas que só um utilizador autenticado vê.
- O módulo público (consulta de marcas/patentes, serviços, notícias) é o
  único com potencial interesse de indexação. Se a indexação em motores de
  busca se tornar um requisito forte, o caminho natural é migrar apenas
  esse módulo para SSR (Next.js) ou pré-renderização estática (SSG),
  mantendo a área autenticada em CSR — não seria necessário reescrever o
  módulo privado.
- CSR simplifica o deployment: o `dist/` gerado pelo `vite build` é um
  conjunto de ficheiros estáticos, servível por qualquer CDN/hosting
  estático, sem necessidade de um runtime Node em produção.

### Code-splitting por rota (lazy loading)

Cada página é importada com `React.lazy(() => import('./pages/X'))` e
envolvida num único `<Suspense>` em `App.jsx`. Isto instrui o Rollup (usado
pelo Vite no build de produção) a gerar **um chunk JavaScript separado por
página**, carregado sob demanda apenas quando essa rota é visitada — em vez
de um único bundle monolítico com todo o código da aplicação.

Resultado real deste projecto após `npm run build` (chunks principais):

```
dist/assets/HomePage-*.js               ~11 kB
dist/assets/RegistroPage-*.js           ~81 kB  (inclui React Hook Form)
dist/assets/LoginPage-*.js               ~3 kB
dist/assets/ServicosPage-*.js            ~2 kB
dist/assets/ServicoDetalhePage-*.js      ~3 kB
dist/assets/ConsultaPublicaPage-*.js     ~4 kB
dist/assets/NoticiasPage-*.js            ~1 kB
dist/assets/FormulariosPage-*.js         ~4 kB
dist/assets/index-*.js (vendor/shell)  ~234 kB
```

Na prática, quem visita apenas a homepage nunca descarrega o código do
formulário de registo (que arrasta o React Hook Form), e vice-versa.

### Dev server vs. build de produção

- **Desenvolvimento (`vite dev`)**: Vite serve os módulos como ESM nativos
  directamente ao browser, sem bundling prévio — o browser faz o
  fetch/resolve de cada `import`. Isto é o que torna o HMR (Hot Module
  Replacement) quase instantâneo, mesmo em projectos grandes.
- **Produção (`vite build`)**: o Rollup entra em acção — faz tree-shaking
  (remove código não utilizado), minificação, hashing de nomes de ficheiro
  para cache busting, e o code-splitting acima descrito.

---

## 3. Arquitectura de pastas

```
src/
├── App.jsx                     # rotas + Suspense/lazy loading
├── main.jsx                    # ponto de entrada (createRoot)
├── index.css                   # Tailwind + acessibilidade de movimento
│
├── components/
│   ├── common/                 # Header, Footer — usados em todas as páginas
│   ├── forms/                  # RegistroForm (React Hook Form)
│   └── home/                   # HeroCarousel, FaqAccordion, NoticiasMarquee
│                                 (componentes exclusivos da homepage)
│
├── pages/                      # uma página por rota
│   ├── HomePage.jsx
│   ├── LoginPage.jsx
│   ├── RegistroPage.jsx
│   ├── ServicosPage.jsx        # listagem de todos os tipos de PI
│   ├── ServicoDetalhePage.jsx  # rota dinâmica /servicos/:slug
│   ├── ConsultaPublicaPage.jsx # pesquisa pública (mock de dados)
│   ├── NoticiasPage.jsx
│   └── FormulariosPage.jsx
│
├── data/
│   └── iapiData.js             # dados estáticos/mock (ver secção 6)
│
└── services/
    ├── api.js                  # instância Axios (baseURL)
    └── authService.js          # chamadas de autenticação
```

À medida que o backend Laravel for disponibilizando endpoints reais, os
ficheiros de `data/` são substituídos por chamadas em `services/`, sem
alterar a assinatura de dados consumida pelas páginas.

---

## 4. Sistema de design

### 4.1 Decisão: zero border-radius

O SIPI é um sistema institucional/governamental — a linguagem visual
adoptada é rectilínea e documental (arquivo, formulário, carimbo), não
"produto de consumo". Em vez de remover `rounded-*` componente a
componente, a decisão foi tomada ao nível do **token de design**, em
`tailwind.config.js`:

```js
corePlugins: { borderRadius: false },   // desactiva a geração de rounded-*
plugins: [
  function flattenRadius({ addBase }) {
    addBase({ '*': { borderRadius: '0 !important' } }); // rede de segurança
  },
],
```

Isto garante consistência mesmo em componentes de terceiros (ex.: inputs
de formulário) e em código antigo que ainda não foi revisitado.

### 4.2 Cores

| Token        | Hex       | Uso                                  |
|--------------|-----------|----------------------------------------|
| `primary-500`| `#0A2A44` | Navy institucional — fundo, texto de marca |
| `secondary-500` | `#FFCD00` | Dourado — CTAs, destaques, foco       |
| `danger`     | `#C8102E` | Erros, formulários oficiais em PDF    |

### 4.3 Ícones: uso deliberadamente reduzido

A versão anterior da homepage usava um ícone Font Awesome por cada item de
navegação, cartão de serviço, notícia e item de lista — ruído visual sem
função. Nesta revisão:

- A navegação principal (Header/Footer) passou a ser **apenas tipografia**
  — o estado activo é comunicado por cor e sublinhado, não por glifo.
- Os únicos ícones que restam (menu hamburger, "+", lupa de pesquisa) são
  **funcionais**: substituem uma acção ou indicam um estado (aberto/fechado),
  nunca decoram um texto que já se explica sozinho.
- `lucide-react` (mais leve e com melhor tree-shaking) foi introduzido para
  estes casos pontuais; o Font Awesome permanece apenas no formulário de
  registo já existente (fora do escopo desta revisão).

---

## 5. Componentes de destaque da homepage

### 5.1 Carrossel principal (`HeroCarousel.jsx`)

- Crossfade puro em CSS (`opacity` + `transition-opacity`), sem biblioteca
  externa de carrossel.
- **Overlay em `linear-gradient(to left, transparente → navy)`**: a
  imagem fica nítida do lado direito e escurece progressivamente para a
  esquerda, garantindo contraste para o texto — que está sempre
  posicionado à esquerda, como no layout original do projecto.
- Autoplay a cada 6s, com `setInterval`; pausa no `onMouseEnter` do
  contentor; e respeita `prefers-reduced-motion` (não faz autoplay se o
  sistema do utilizador pedir menos movimento).
- Indicadores como barras finas (sem ícones de seta), com
  `aria-current` para leitores de ecrã.

### 5.2 FAQ por acordeão (`FaqAccordion.jsx`)

- Substitui o texto estático da secção final ("Pronto para proteger a sua
  inovação?") por um acordeão de perguntas frequentes.
- Apenas uma pergunta aberta de cada vez (estado `openIndex` único).
- A expansão usa `grid-template-rows: 0fr → 1fr` em transição — evita o
  "salto" característico de animar `max-height` com conteúdo de altura
  variável, e não exige medir a altura do DOM em JavaScript.
- Semântica ARIA completa (`aria-expanded`, `aria-controls`,
  `role="region"`) para navegação por leitor de ecrã e teclado.

### 5.3 Faixa de notícias (`NoticiasMarquee.jsx`)

- Lista de imagens duplicada (`[...noticias, ...noticias]`) e animada com
  `translateX(0) → translateX(-50%)` em loop infinito (`animation:
  marquee 32s linear infinite`, definida em `tailwind.config.js`) — desloca-se
  continuamente da direita para a esquerda.
- Sem legenda visível por defeito — apenas fotografia.
- No hover (ou foco por teclado), um overlay sobe de baixo para cima
  (`translate-y-full → translate-y-0`), revelando um ícone "+" central
  (`lucide-react`) e um breve resumo da notícia.
- A animação do marquee pausa no hover (`hover:[animation-play-state:paused]`),
  para permitir ler o overlay sem a faixa continuar a deslizar.
- `mask-image` com gradiente nas bordas esquerda/direita da faixa, para que
  as imagens não apareçam com corte abrupto nas extremidades visíveis.

---

## 6. Dados e integração futura com o backend

`src/data/iapiData.js` centraliza todo o conteúdo estático/mock:
`heroSlides`, `servicos` (com o âmbito alargado de propriedade industrial:
marca, patente, desenho industrial, modelo de utilidade, insígnia/nome de
estabelecimento, indicação de proveniência — conforme a FIRP
386ATDAP.IMA.27), `noticias`, `formularios` e `faqs`.

Cada bloco tem o mesmo formato que o endpoint REST correspondente deverá
devolver (ex.: `servicos` espelha o que `GET /api/servicos` devolveria),
para que a troca de dados mock por chamadas Axios reais não obrigue a
alterar a interface das páginas — apenas o `services/*.js` de onde os dados
vêm.

---

## 7. Acessibilidade

- Foco de teclado sempre visível (`:focus-visible` customizado, nunca
  `outline: none` sem substituto).
- `prefers-reduced-motion: reduce` desactiva globalmente autoplay do
  carrossel, marquee de notícias e transições longas.
- Uso de elementos semânticos (`<nav>`, `<time>`, `<table>`, `<h1>`–`<h3>`
  em hierarquia correcta) e atributos ARIA nos componentes interactivos
  (acordeão, carrossel, menu mobile).
- Imagens puramente decorativas marcadas com `aria-hidden="true"` e `alt=""`;
  imagens informativas com `alt` descritivo.

---

## 8. Como correr o projecto

```bash
npm install
npm run dev       # servidor de desenvolvimento (Vite + HMR)
npm run build     # build de produção em dist/ (code-split por rota)
npm run preview   # pré-visualiza o build de produção localmente
npm run lint      # ESLint
```

Variáveis de ambiente em `.env` (ex.: URL base da API) — ver `services/api.js`.

---

## 9. Próximos passos (fora do escopo desta revisão)

- Ligação real do `LoginPage`/`RegistroForm` ao backend Laravel (JWT/Sanctum).
- `PrivateRoute` para proteger rotas do Requerente, Técnico Examinador e
  Administrador (estrutura já prevista em `arquitectura.md`).
- Dashboards por perfil (`MeusPedidosPage`, `DashboardTecnicoPage`, etc.).
