# Drivo

Web app para montar a garagem com os seus veículos. Dá para cadastrar os dados na mão ou importar o CRLV (PDF ou imagem) e deixar a API do Gemini preencher o formulário.

O que dá para fazer: criar conta, entrar e sair, listar e pesquisar veículos, criar, editar e excluir veículo, importar CRLV, alterar dados cadastrais e trocar a senha.

## Tecnologias

- Frontend: Next.js (App Router), React, TypeScript e Tailwind CSS
- Backend: NestJS e TypeScript, API REST em JSON, autenticação com JWT e documentação OpenAPI (Swagger)
- Banco: PostgreSQL, com Prisma
- IA: API do Gemini, para ler o CRLV
- Docker e Docker Compose

## Como instalar

Precisa do Docker Desktop. Para rodar sem Docker, também precisa do Node.js 22 ou superior.

```bash
git clone https://github.com/soariix/drivo-.git
cd drivo-
cp .env.example .env
```

Abra o `.env` da raiz e preencha:

| Variável | O que é |
|---|---|
| `JWT_SECRET` | Texto usado para assinar os tokens de login. Pode ser qualquer frase longa |
| `GEMINI_API_KEY` | Chave gratuita do Google AI Studio (aistudio.google.com) |
| `GEMINI_MODEL` | Modelo do Gemini. O padrão é `gemini-3.8-flash` |

A importação do CRLV só funciona com uma chave válida. Deixei 3 CRLVs fictícios (PDF, JPG e PNG) na pasta `exemplos/` para testar.

## Como executar

Com um único comando:

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- API: http://localhost:3001
- Documentação (Swagger): http://localhost:3001/docs

As migrações do banco rodam sozinhas quando o backend inicia. Para parar, `docker compose down`.

Para rodar em modo de desenvolvimento, sem Docker para o app:

```bash
docker compose up -d db        # sobe só o banco, na porta 5442

cd backend
cp .env.example .env           # confira se a DATABASE_URL aponta para a porta 5442
npm install
npx prisma migrate dev
npm run start:dev

cd ../frontend
cp .env.example .env
npm install
npm run dev
```

No `.env` do backend, preencha também `JWT_SECRET` e `GEMINI_API_KEY`.

Atenção: não rode o Docker completo (`docker compose up --build`) e o modo de desenvolvimento ao mesmo tempo, porque os dois usam as portas 3000 e 3001. Se for trocar de um para o outro, rode antes `docker compose down` (e depois `docker compose up -d db` para o modo de desenvolvimento).

## Como executar os testes

```bash
cd backend
npm install
npm test
```

São testes unitários do backend. Os de autenticação cobrem cadastro, e-mail repetido, login e senha errada. Os de veículos cobrem a listagem só do usuário logado, o erro 404, a placa repetida e a exclusão. Não escrevi testes automatizados para o frontend. Ele eu testei na mão.

## Rotas da API

| Método | Rota | Para que serve |
|---|---|---|
| POST | `/auth/register` | Criar conta |
| POST | `/auth/login` | Entrar |
| GET e PATCH | `/users/me` | Ver e editar os dados da conta |
| PATCH | `/users/me/password` | Trocar a senha |
| GET | `/veiculos?search=` | Listar veículos, com busca por placa, marca ou modelo |
| GET | `/veiculos/:id` | Ver um veículo |
| POST | `/veiculos` | Criar veículo |
| PATCH | `/veiculos/:id` | Editar veículo |
| DELETE | `/veiculos/:id` | Excluir veículo |
| POST | `/crlv/scan` | Enviar o CRLV e receber os dados lidos pelo Gemini |

Todas, menos as de `/auth`, precisam do header `Authorization: Bearer <token>`.

## Estrutura

```
drivo/
├── backend/    NestJS (auth, users, veiculos, crlv, prisma)
├── frontend/   Next.js (app, components, lib)
├── exemplos/   CRLVs fictícios (PDF, JPG e PNG) para testar a importação
├── docker-compose.yml
└── .env.example
```

## Decisões técnicas

- Deixei frontend e backend no mesmo repositório, como pediram, e usei um só `docker-compose` para subir tudo.
- Escolhi o NestJS por ser organizado em módulos, controllers e services, e porque a validação (DTOs com class-validator) e o Swagger já se encaixam bem.
- Usei Prisma com PostgreSQL por causa das migrações versionadas e dos tipos. Criei uma regra única de usuário + placa, para a mesma pessoa não cadastrar a mesma placa duas vezes.
- A senha é salva com hash (bcrypt) e o login devolve um JWT que expira em 7 dias. Toda busca de veículo filtra pelo usuário do token, então quem tenta abrir o veículo de outra pessoa recebe 404. A API nunca devolve a senha.
- No CRLV, o arquivo vai para `/crlv/scan`, o Gemini devolve os dados em JSON e o frontend só preenche o formulário. O veículo só é salvo quando a pessoa confere e clica em salvar, porque a IA pode errar.
- No frontend, todas as chamadas passam por `lib/api.ts`, que coloca o token, trata os erros e lida com sessão vencida. A sessão fica em um Context (`AuthProvider`) e as páginas privadas ficam dentro do layout `(app)`, que manda para o login quem não está logado.
- Montei componentes reaproveitáveis (`Button`, `Input`, `Select`, `Modal`, `Skeleton`, `ErrorState`) e usei um único `VehicleForm` para criar e para editar.
- Tratei os estados de carregamento, erro (com botão de tentar de novo), garagem vazia e busca sem resultado. Também mostro uma mensagem de sucesso ao criar, editar e excluir.
- A busca espera a pessoa parar de digitar (debounce) para não chamar a API a cada letra.
- O modelo do Gemini fica no `.env`, porque o Google troca e aposenta modelos com frequência. Durante o projeto o `gemini-2.5-flash` parou de funcionar e foi só trocar a variável.
- Na importação do CRLV, o backend tenta de novo (até 3 vezes) só quando o Gemini está sobrecarregado (erros 500 e 503). Quando o erro é de limite de cota (429), ele não repete, para não gastar a cota à toa.

## Limitações

- O token fica no `localStorage`. É simples, mas fica exposto a ataques XSS. Também não tem refresh token.
- A importação do CRLV depende do Gemini no plano gratuito, então tem limite de uso, depende do modelo estar disponível e pode errar a leitura. Por isso a pessoa sempre confere os dados.
- Se a importação der erro, pode ser o limite diário da cota gratuita do Gemini (ou o modelo estar sobrecarregado). Espere um pouco, troque o `GEMINI_MODEL` no `.env` ou use uma chave de outro projeto do Google AI Studio.
- O documento é enviado para uma API de terceiros. Em um sistema real seria preciso cuidar da privacidade (LGPD).
- O arquivo do CRLV pode ter no máximo 5 MB e ser PDF, JPG ou PNG.
- Os cards usam um ícone de carro no lugar de foto, porque o sistema não guarda imagens.
- Só tem testes unitários no backend. Não tem teste de frontend nem teste ponta a ponta.
- Não tem recuperação de senha, confirmação de e-mail nem limite de tentativas de login.
- Testei o layout principalmente no computador. Usei classes responsivas do Tailwind, mas não conferi em todos os tamanhos de tela.

## O que eu faria com mais tempo

- Um dashboard na tela inicial com o resumo da garagem: total de veículos, quantos de cada tipo e combustível, e os licenciamentos perto de vencer.
- Aviso de vencimento do licenciamento, com alerta no card do veículo.
- Foto do veículo e armazenamento do arquivo do CRLV em cada veículo.
- Filtros e ordenação na lista (marca, tipo, ano, combustível) e paginação.
- Uma tela de detalhes do veículo mais completa, com os documentos dele.
- Visual mais refinado: tema claro e escuro, animações suaves e ajustes para todos os tamanhos de tela, principalmente celular.
- Recuperação de senha e confirmação de e-mail.
- Mensagens de erro mais claras quando a IA falha, com opção de reenviar o arquivo.

## Uso de IA

Usei o Claude como guia durante o projeto: ele me ajudou a montar a estrutura, explicou como as partes se conectam e sugeriu trechos de código. Eu digitei o código nos arquivos e fui lendo o que cada parte faz para conseguir explicar o fluxo do sistema.

Usei o Gemini só para gerar CRLVs fictícios (PDF, JPG e PNG) para testar a importação. O sistema todo eu testei manualmente: cadastro, login, criar, editar e excluir veículo, importar CRLV, perfil e troca de senha.