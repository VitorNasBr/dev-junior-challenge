# Entrega — Vitor Medina

Sistema de check-in de pacientes: o paciente informa o CPF, a API busca o nome no
serviço de cadastro (`mock-service`), registra o check-in no banco e a recepção
acompanha a fila do dia.

```
web (React)  ──►  api (NestJS)  ──►  mock-service (cadastro de pacientes)
                       │
                       └──►  db (PostgreSQL)
```

| Pasta           | O que é                                                         |
|-----------------|-----------------------------------------------------------------|
| `api/`          | API REST em NestJS + TypeScript + Prisma                        |
| `web/`          | Tela de check-in e fila em React + Vite + TypeScript + Tailwind |
| `mock-service/` | Serviço externo fornecido (não foi alterado)                    |

## Como rodar

### Opção 1 — Docker (recomendado)

Pré-requisito: Docker Desktop (ou Docker + Docker Compose).

```bash
docker compose up --build
```

Esse comando sobe os quatro serviços e cria a tabela no banco automaticamente.

| Serviço       | Endereço                  |
|---------------|---------------------------|
| Tela (web)    | http://localhost:5173     |
| API           | http://localhost:3000     |
| Mock-service  | http://localhost:4000     |
| PostgreSQL    | localhost:5432            |

Abra http://localhost:5173 e faça um check-in com um dos CPFs de teste:

| CPF           | Paciente          |
|---------------|-------------------|
| 11111111111   | Ana Souza         |
| 22222222222   | Bruno Carvalho    |
| 33333333333   | Carla Menezes     |
| 44444444444   | Diego Fernandes   |
| 55555555555   | Elaine Rodrigues  |

Qualquer outro CPF (ex.: `99999999999`) mostra a mensagem de paciente não encontrado.

Para parar: `Ctrl + C` e depois `docker compose down` (use `docker compose down -v`
se quiser apagar também os dados do banco).

### Opção 2 — Sem Docker para a API e a tela

Pré-requisitos: Node.js 22 ou superior. O banco e o mock-service continuam subindo
pelo Docker, por praticidade.

**1. Banco e mock-service**

```bash
docker compose up -d db mock-service
```

**2. API** (em um terminal)

```bash
cd api
npm install
cp .env.example .env
npm run db:setup
npm run start:dev
```

`npm run db:setup` gera o client do Prisma e cria a tabela no banco.
(No Prompt de Comando do Windows, use `copy .env.example .env` no lugar do `cp`.)

**3. Tela** (em outro terminal)

```bash
cd web
npm install
npm run dev
```

Depois é só abrir http://localhost:5173.

### Testes

```bash
cd api
npm install
npm test
npm run test:e2e
```

Os testes não precisam de banco nem do mock-service rodando.

## O que foi feito

**Escopo mínimo**

- [x] API REST em Node.js + TypeScript com NestJS
- [x] Endpoint para criar check-in (recebe o CPF, consulta o cadastro e registra na fila)
- [x] Endpoint para listar a fila de check-ins do dia
- [x] Consumo do `mock-service` para obter o nome do paciente
- [x] Resposta de erro clara quando o CPF não existe no cadastro
- [x] Tela em React para digitar o CPF e fazer o check-in
- [x] Lista mostrando a fila
- [x] Este `ENTREGA.md`

**Desejáveis**

- [x] Projeto inteiro sobe com `docker compose up`
- [x] Testes no back-end (13 testes: regra de check-in, cliente do cadastro e validação HTTP)
- [x] Erros tratados na tela (CPF não encontrado, cadastro fora do ar, API fora do ar)
- [x] Banco de dados relacional (PostgreSQL)

### Endpoints da API

| Método | Rota        | O que faz                         | Respostas                    |
|--------|-------------|-----------------------------------|------------------------------|
| POST   | `/checkins` | Registra o check-in de um CPF     | `201`, `400`, `404`, `503`   |
| GET    | `/checkins` | Lista a fila do dia               | `200`                        |
| GET    | `/health`   | Indica que a API está no ar       | `200`                        |

**POST /checkins**

```bash
curl -X POST http://localhost:3000/checkins \
  -H "Content-Type: application/json" \
  -d '{"cpf": "111.111.111-11"}'
```

```json
{ "id": 1, "cpf": "***.111.111-**", "name": "Ana Souza", "arrivedAt": "2026-10-13T03:13:07.754Z" }
```

| Situação                                  | Status | Mensagem                                                        |
|-------------------------------------------|--------|-----------------------------------------------------------------|
| CPF sem 11 dígitos                        | 400    | CPF inválido. Informe os 11 dígitos.                            |
| CPF não existe no cadastro                | 404    | Paciente não encontrado no cadastro.                            |
| Mock-service fora do ar ou sem resposta   | 503    | Serviço de cadastro indisponível. Tente novamente em instantes. |

**GET /checkins** devolve a lista do dia, do mais antigo para o mais recente, no mesmo
formato acima.

### Como o código está organizado

```
api/src
├── main.ts                    inicialização, validação global e CORS
├── app.module.ts              junta os módulos
├── checkins/                  regra de negócio do check-in
│   ├── checkins.controller.ts   rotas HTTP (só recebe e delega)
│   ├── checkins.service.ts      consulta o cadastro, grava e lista a fila
│   ├── dto/                     validação do corpo da requisição
│   └── utils/mask-cpf.ts        máscara do CPF nas respostas
├── patient-registry/          cliente do serviço externo (mock-service)
└── prisma/                    conexão com o banco

web/src
├── App.tsx                    guarda a fila e junta os componentes
├── api/checkins.ts            chamadas HTTP para a API
├── components/CheckinForm.tsx formulário de CPF
├── components/QueueList.tsx   tabela da fila
├── styles.ts                  classes do Tailwind usadas em mais de um componente
└── utils/cpf.ts               máscara de digitação do CPF
```

## Onde guardei os dados

Usei **banco de dados: PostgreSQL com Prisma**.

- O `docker-compose.yml` já trazia o PostgreSQL configurado, então aproveitei.
- Em memória a fila se perderia a cada reinício da API, o que não combina com uma
  recepção de hospital. Com o banco, a fila continua lá depois de reiniciar.
- Escolhi o Prisma porque o `schema.prisma` é fácil de ler e as migrations ficam
  versionadas no repositório (`api/prisma/migrations`). Ao subir com Docker, a API
  aplica as migrations sozinha antes de iniciar.

A tabela é uma só, `checkins`: `id`, `cpf`, `name` e `arrived_at` (horário de chegada,
preenchido pelo banco). Há um índice em `arrived_at`, que é a coluna usada para
filtrar e ordenar a fila.

## Decisões e dificuldades

**Decisões**

- **Código em inglês, tela em português.** Nomes de arquivos, variáveis, campos do JSON
  e tabelas estão em inglês, para que qualquer pessoa consiga dar manutenção. Os textos
  que o paciente e a recepção leem estão em português. O `mock-service` responde em
  português (`nome`), e essa tradução acontece em um único lugar: o
  `PatientRegistryService`.
- **Cliente do cadastro isolado.** Só o `PatientRegistryService` conhece a URL e o
  formato do serviço externo. Se o cadastro mudar, só esse arquivo muda. Ele tem
  timeout de 3 segundos e transforma os problemas em erros claros: `404` quando o
  paciente não existe e `503` quando o serviço está fora do ar.
- **Não validei os dígitos verificadores do CPF.** Os CPFs de teste (`11111111111`
  etc.) são inválidos pelo cálculo oficial, então a validação quebraria o desafio.
  A API só confere se há 11 dígitos, aceitando com ou sem pontuação.
- **Fila "do dia".** O enunciado fala em fila de check-ins do dia, então a listagem
  traz apenas os check-ins feitos a partir da meia-noite (fuso de São Paulo no Docker).
  Os dias anteriores continuam no banco, só não aparecem.
- **CPF mascarado.** A API devolve o CPF como `***.111.111-**`. A recepção consegue
  conferir o paciente sem que o CPF completo fique exposto na tela.
- **O mesmo CPF pode fazer mais de um check-in no dia.** O enunciado não restringe e um
  paciente pode ter dois atendimentos no mesmo dia, então preferi não bloquear.
- **`fetch` nativo em vez de axios.** O Node já traz `fetch`, então não precisei de mais
  uma dependência para fazer uma única chamada HTTP.
- **Ordem de subida no Docker.** Adicionei um `healthcheck` no banco e a API só inicia
  depois que ele aceita conexões, para as migrations não falharem na primeira subida.
- **Tela simples.** Uma página só, com `useState` e sem biblioteca de componentes ou de
  estado. A fila se atualiza sozinha a cada 10 segundos, pensando na tela da recepção
  que fica aberta o dia todo.
- **Tailwind CSS para o estilo.** As classes ficam direto no componente, então dá para
  ver a aparência e a estrutura no mesmo arquivo. As combinações que se repetem (cartão,
  mensagens de sucesso e erro) ficam em `web/src/styles.ts`.

**Dificuldades**

- A versão mais recente do `@nestjs/config` (v12) é distribuída apenas como ES Module e
  o Jest não conseguia carregá-la nos testes. Resolvi fixando a v4, que é a compatível
  com o NestJS 11 (commit `fix(api): pin @nestjs/config to v4...`).

## O que faria com mais tempo

- **Status do atendimento:** permitir que a recepção chame o paciente e marque como
  atendido, tirando-o da fila.
- **Evitar check-in duplicado:** avisar quando o mesmo CPF já está aguardando na fila.
- **Atualização em tempo real:** trocar a atualização a cada 10 segundos por WebSocket
  ou Server-Sent Events.
- **Separar as telas:** uma rota para o totem (paciente) e outra, com login, para a
  recepção.
- **Testes:** testes de integração com um banco real e testes dos componentes React.
- **CI:** rodar lint e testes automaticamente a cada push (GitHub Actions).
- **Paginação** na listagem, para dias com muitos check-ins.
