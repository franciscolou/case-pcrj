# Painel da Infância

Painel para técnicos de campo da Prefeitura do Rio de Janeiro acompanharem crianças em situação de vulnerabilidade social, cruzando dados de saúde, educação e assistência social.

---

## Como rodar

### Pré-requisitos
- Docker e Docker Compose instalados

### Subir tudo com Docker

```bash
git clone <url-do-repositório>
cd case-pcrj
docker compose up
```

Acesse em: **http://localhost:3000**

As imagens já estão publicadas no Docker Hub e são baixadas automaticamente. Não é necessário compilar nada.

> Na primeira execução, o banco de dados é criado e populado automaticamente com os 25 registros do `seed.json`.

> Use `docker compose up --build` apenas se quiser rodar a partir do código-fonte local, após alterar o backend ou o frontend.

### Rodar localmente (sem Docker)

**Backend:**
```bash
cd backend
npm install
npm run dev   # porta 3001
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev   # porta 3000
```

---

## Testes

### Unitários (backend + frontend)

```bash
# Backend
cd backend && npm install && npm test

# Frontend
cd frontend && npm install && npm test
```

### E2E com Playwright

O Playwright e o Chromium são intencionalmente excluídos das imagens Docker de produção. Incluí-los aumentaria o tamanho da imagem em cerca de 300 MB sem nenhum benefício em produção, então optei por mantê-los como dependência de desenvolvimento instalada separadamente no host.

O `npm install` do frontend já baixa o binário do Chromium automaticamente via `postinstall`. O backend é iniciado automaticamente pelo próprio Playwright durante a execução dos testes.

**macOS / Windows:**
```bash
cd frontend
npm install
npm run test:e2e
```

**Linux / WSL2** (uma vez, para instalar as libs do SO necessárias para o Chromium headless):
```bash
cd frontend
npm install
npm run setup:e2e   # requer sudo
npm run test:e2e
```

#### Observação
`docker compose up` não instala as dependências necessárias para rodar o testes E2E porque isso adicionaria um peso desnecessário à aplicação, em algo que não tem influência alguma no ambiente de produção.

---

## Credenciais de teste

| Campo | Valor |
|-------|-------|
| E-mail | `tecnico@prefeitura.rio` |
| Senha | `painel@2024` |

---

## Arquitetura e decisões

### Backend: Node.js + Fastify

**Por que Node.js (e não Go)?**
O enunciado oferecia Go com Gin ou Node.js. Escolhi **Node.js com Fastify** pelos seguintes motivos:

- **Ecossistema JSON nativo**: os dados do seed são JSON, e o Fastify processa JSON sem overhead de serialização/deserialização manual
- **TypeScript compartilhado**: com a mesma linguagem no backend e no frontend, os tipos de domínio (`Child`, `Summary`, etc.) são definidos uma única vez e referenciados diretamente nos contratos de API
- **Fastify como escolha pragmática**: as regras de negócio do sistema não são complexas nem demandam uma API altamente estruturada. O Fastify permite construir endpoints de forma rápida e direta, sem a cerimônia de um framework mais opinativo. A estrutura de endpoints sugerida no enunciado foi plenamente suficiente para cobrir todos os requisitos
- **Fastify vs. Express**: escolhido sobre o Express por ter schema validation embutida via JSON Schema e melhor performance em benchmarks

**Trade-offs assumidos**

Para maximizar o volume de funcionalidades entregues dentro do tempo disponível, abri mão de alguns padrões que adotaria em um projeto de maior escala:

- **Centralização de strings e mensagens**: mensagens de erro, labels e textos da UI não foram extraídos para um arquivo de configuração único. Estão distribuídos ao longo do código, o que em produção dificultaria manutenção e internacionalização
- **Padrões de design**: a arquitetura segue uma estrutura simples e funcional, sem camadas formais de serviço/repositório separadas dos handlers de rota
- **NestJS vs. Fastify**: NestJS era uma opção considerada para o backend por oferecer injeção de dependência, módulos e convenções que escalam bem. Foi descartado porque a complexidade que ele introduz seria desnecessária para as regras de negócio deste projeto. O Fastify entregou o mesmo resultado com muito menos overhead

**Por que SQLite (e não Postgres)?**

SQLite resolve bem os requisitos deste projeto:
- Sem necessidade de container separado: o banco roda embutido no processo Node, simplificando o `docker compose`
- Dados persistidos em volume Docker, sobrevivendo a reinicializações
- Para 25 registros (e mesmo para milhares), a performance é mais que suficiente
- A leitura/escrita acontece em memória com flush para disco, ideal para cargas de trabalho como esta

O trade-off é que o SQLite não suporta múltiplas escritas concorrentes. Em produção, com vários técnicos operando simultaneamente, migraria para PostgreSQL.

**Armazenamento dos dados**

O `seed.json` é copiado para dentro da imagem Docker durante o build. Na inicialização, o servidor verifica se a tabela `children` está vazia e, se estiver, insere todos os registros em uma transação. Os campos `saude`, `educacao` e `assistencia_social` são armazenados como JSON serializado (TEXT) no SQLite, porque:
- Evita joins e tabelas intermediárias desnecessárias
- A estrutura dos dados é suficientemente estável
- A performance de leitura é aceitável dado o volume

### Frontend: Next.js 14 + App Router

**TanStack Query** para gerenciamento de estado servidor: stale-while-revalidate automático, cache invalidation ao revisar um caso, loading/error states declarativos.

**Axios** com interceptors: adiciona o JWT em todas as requisições e redireciona para `/login` automaticamente em respostas 401.

**Filtros via URL Search Params**: os filtros da lista de crianças são persistidos na URL, portanto sobrevivem a refresh da página e podem ser copiados/compartilhados.

**Proteção de rotas**: o layout do dashboard verifica o token JWT no `localStorage` no mount. Sem token, redireciona para `/login`.

### Deploy

O backend está hospedado no **Render** e o frontend na **Vercel**.

O Railway seria a escolha natural para o backend, mas já havia um projeto anterior vinculado à conta. O plano gratuito do Railway permite apenas um projeto ativo antes de exigir upgrade pago, então não era uma opção viável.

O Render foi escolhido como alternativa por oferecer um plano gratuito sem cartão de crédito e com suporte completo a Docker. O principal trade-off é que o serviço entra em modo de hibernação após 15 minutos sem receber requisições. Isso significa que a primeira requisição após um período de inatividade pode levar até 50 segundos para obter resposta, o que é um comportamento esperado e documentado pelo Render no plano gratuito. As requisições subsequentes voltam ao tempo normal.

### Casos-limite do seed

O painel foi desenhado para lidar graciosamente com os casos-limite intencionais:

| Caso | Criança(s) | Tratamento |
|------|-----------|------------|
| Nenhuma área com dados | Amanda Xavier Torres (c015) | Badge "Nenhuma área com dados" no detalhe |
| Saúde null | Gabriel Rocha (c004), Isabela Moura (c005) | Card "Sem dados de saúde" com contexto explicativo |
| Educação null | Sofia Lima (c003), Beatriz Nascimento (c009), etc. | Card "Sem dados educacionais" |
| Assistência Social null | Rafael Cardoso (c012), Natália Freitas (c021) | Card "Sem dados sociais" |
| Escola null + matrícula pendente | Camila Ramos (c011), Mariana Cunha (c017) | "Sem escola cadastrada" + alerta de matrícula |
| Frequência null | Mesmo que acima | "Não matriculada" em vez de exibir null |
| Alertas em todas as áreas | Mateus Oliveira (c006), Vinícius Martins (c014), Valentina Cruz (c025) | Todos os badges exibidos, contagem total no header |

---

## Estrutura do projeto

```
case-pcrj/
├── backend/                 # API Node.js + Fastify
│   ├── src/
│   │   ├── types/           # Tipos TypeScript compartilhados
│   │   ├── db/              # SQLite + seed
│   │   ├── routes/          # auth, children, summary
│   │   ├── plugins/         # JWT authenticate decorator
│   │   └── server.ts        # Entrypoint
│   ├── seed.json            # 25 crianças fictícias
│   └── Dockerfile
├── frontend/                # Next.js 14 App Router
│   ├── src/
│   │   ├── app/             # Páginas (App Router)
│   │   │   ├── login/
│   │   │   └── dashboard/
│   │   │       └── criancas/[id]/
│   │   ├── components/      # Componentes reutilizáveis
│   │   ├── hooks/           # useChildren, useSummary, useReview, useChild
│   │   ├── lib/             # api.ts (axios), auth.ts, utils.ts
│   │   └── tipos/           # Tipos de domínio
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## Endpoints da API

| Método | Path | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/auth/token` | - | Autentica e retorna JWT |
| GET | `/children` | - | Lista com filtros e paginação |
| GET | `/children/:id` | - | Detalhe completo |
| GET | `/summary` | - | Dados agregados para o dashboard |
| PATCH | `/children/:id/review` | JWT | Marca caso como revisado |
| GET | `/health` | - | Health check |

### Filtros disponíveis em `GET /children`

| Parâmetro | Tipo | Exemplo |
|-----------|------|---------|
| `bairro` | string | `?bairro=Rocinha` |
| `alertas` | `true` / `false` | `?alertas=true` |
| `revisado` | `true` / `false` | `?revisado=false` |
| `page` | number | `?page=2` |
| `limit` | number | `?limit=10` |

---

## O que faria com mais tempo

1. **Autenticação real + A2F**: fluxo de login com senha hasheada (bcrypt), refresh token com rotação, segundo fator via TOTP (Google Authenticator) e rate-limit no endpoint de auth

2. **NestJS no backend**: adotaria NestJS para obter injeção de dependência, módulos isolados e convenções que escalam melhor com a equipe, sem precisar impor estrutura manualmente

3. **Legibilidade de lógicas**: algumas funções acumularam responsabilidades durante o desenvolvimento acelerado. Com mais tempo, as extrairia e tornaria mais legíveis e testáveis individualmente

4. **Centralização de strings**: mover mensagens de erro, labels e textos da UI para um arquivo de configuração único, facilitando manutenção e futura internacionalização

5. **PostgreSQL em produção**: migrar do SQLite para Postgres para suportar múltiplas instâncias do backend e escritas concorrentes

6. **Histórico de revisões**: tabela `reviews` para registrar todas as revisões com carimbo de tempo e notas do técnico, não apenas o estado atual

7. **Busca por nome**: campo de busca textual em `GET /children` com índice no banco, espelhado no frontend

---

## Stack escolhida

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| Backend | Node.js + Fastify + TypeScript | JSON nativo, tipagem compartilhada, performance, validação por schema |
| Banco de dados | SQLite (better-sqlite3) | Zero dependência externa, embutido, suficiente para o volume |
| Auth | JWT via @fastify/jwt | Stateless, padrão de mercado, fácil de validar no frontend |
| Frontend | Next.js 14 App Router | SSR quando necessário, routing file-based, suporte total ao React 18 |
| Estilização | Tailwind CSS | Produtividade, consistência, responsividade sem CSS customizado |
| Data fetching | TanStack Query v5 | Cache, loading states, invalidation, sem boilerplate Redux |
| Ícones | Lucide React | Consistente, tree-shakeable, acessível |
