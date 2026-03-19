<div align="center">

# 🔔 Notification Backend

**Sistema de notificações multi-canal com processamento assíncrono**

[![Node.js](https://img.shields.io/badge/Node.js-22+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![Swagger](https://img.shields.io/badge/Swagger-Docs-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](http://localhost:3000/docs)

</div>

---

## 📖 Visão Geral

Backend RESTful para envio de notificações multi-canal com fila de processamento assíncrono. O sistema recebe mensagens via API, as persiste no banco de dados e um **job agendado** se encarrega de processá-las e despachá-las para os canais configurados.

```
Cliente → POST /message → Banco (pending) → Job → Canal (WhatsApp / SMS / Email / Discord / Ligação)
```

---

## ✨ Funcionalidades

| Recurso                           | Descrição                                                     |
| --------------------------------- | ------------------------------------------------------------- |
| 📨 **Fila assíncrona**            | Mensagens são persistidas e processadas por job periódico     |
| 🔐 **Autenticação por API Key**   | Controle de acesso com rate-limit por chave                   |
| 📊 **Resumo diário**              | Job cron envia relatório diário via WhatsApp ao administrador |
| 🔁 **Reprocessamento automático** | Falhas são reprocessadas automaticamente nas próximas rodadas |
| 📜 **Documentação Swagger**       | Interface interativa disponível em `/docs`                    |
| 🛡️ **Gerenciamento de chaves**    | Rota protegida por flag para criar e revogar API keys         |

---

## 📡 Canais de Envio

<div align="center">

|      Canal      | Provedor | Identificador |
| :-------------: | :------: | :-----------: |
| 📱 **WhatsApp** |  Twilio  |  `whatsapp`   |
|   💬 **SMS**    |  Twilio  |     `sms`     |
| 📞 **Ligação**  |  Twilio  |  `phoneCall`  |
|  📧 **E-mail**  |  Resend  |    `email`    |
| 🎮 **Discord**  | Webhook  |   `discord`   |

</div>

---

## 🏗️ Arquitetura

```
src/
├── app.js                    # Configuração do Express + rotas + Swagger
├── server.js                 # Entry point — inicia servidor e jobs
├── swagger.js                # Setup da documentação OpenAPI
│
├── config/
│   ├── env.js                # Variáveis de ambiente centralizadas
│   └── prisma.js             # Instância global do Prisma Client
│
├── routes/
│   ├── messageRoutes.js      # POST /message · GET /message
│   └── managerRoutes.js      # POST /manager/key · DELETE /manager/key/:id
│
├── middleware/
│   ├── authApiKey.js         # Valida x-api-key e aplica rate-limit
│   └── managerFlag.js        # Bloqueia rotas se IS_MANAGER_ON=false
│
├── services/
│   ├── messageService.js     # CRUD de mensagens
│   ├── apiKeyService.js      # Criação e remoção de API keys
│   ├── senderFactory.js      # Seleciona o sender correto pelo tipo
│   └── senders/
│       ├── twilioSender.js   # WhatsApp, SMS e ligação via Twilio
│       ├── emailSender.js    # E-mail via Resend
│       └── discordSender.js  # Discord via webhook
│
├── jobs/
│   ├── processingJob.js      # Processa mensagens pending/failure
│   └── dailySummaryJob.js    # Resumo diário às 20h via WhatsApp
│
└── utils/
    ├── asyncHandler.js       # Wrapper para erros assíncronos
    ├── crypto.js             # Hash de API keys com bcrypt
    └── validators.js         # Validação de payload de mensagem
```

---

## 🗄️ Banco de Dados

### `Message`

| Campo            | Tipo                                               | Descrição                                   |
| ---------------- | -------------------------------------------------- | ------------------------------------------- |
| `id`             | `String (UUID)`                                    | Identificador único                         |
| `createdAt`      | `DateTime`                                         | Data de criação                             |
| `status`         | `pending \| sent \| failure`                       | Estado atual da mensagem                    |
| `sendDate`       | `DateTime?`                                        | Data em que foi enviada                     |
| `title`          | `String`                                           | Título da mensagem                          |
| `text`           | `String`                                           | Corpo da mensagem                           |
| `type`           | `discord \| email \| whatsapp \| sms \| phoneCall` | Canal de envio                              |
| `phone`          | `String?`                                          | Número de telefone (WhatsApp, SMS, ligação) |
| `email`          | `String?`                                          | Endereço de e-mail                          |
| `discordWebhook` | `String?`                                          | URL do webhook do Discord                   |

### `ApiKey`

| Campo            | Tipo        | Descrição                      |
| ---------------- | ----------- | ------------------------------ |
| `id`             | `Int`       | ID sequencial                  |
| `name`           | `String`    | Nome da integração/cliente     |
| `keyHash`        | `String`    | Hash bcrypt da chave           |
| `limitPerMinute` | `Int`       | Máximo de mensagens por minuto |
| `lastSend`       | `DateTime?` | Último envio registrado        |
| `totalMessages`  | `Int`       | Total de mensagens enviadas    |

---

## 🔌 Endpoints da API

### Mensagens

#### `POST /message`

Enfileira uma mensagem para processamento assíncrono.

> **Header:** `x-api-key: <sua-chave>`

**Corpo da requisição:**

```json
{
  "title": "Aviso",
  "text": "Mensagem de teste",
  "type": "whatsapp",
  "phone": "whatsapp:+5511999999999"
}
```

<details>
<summary>Campos por tipo de canal</summary>

| Canal       | Campos obrigatórios                 |
| ----------- | ----------------------------------- |
| `whatsapp`  | `phone` (formato `whatsapp:+55...`) |
| `sms`       | `phone` (formato `+55...`)          |
| `phoneCall` | `phone` (formato `+55...`)          |
| `email`     | `email`                             |
| `discord`   | `discordWebhook`                    |

</details>

**Resposta `202 Accepted`:**

```json
{
  "status": "Sucesso",
  "message": "Mensagem recebida e enviada para fila de processamento.",
  "id": "uuid-da-mensagem"
}
```

---

#### `GET /message?id=<id>`

Consulta o status de uma mensagem pelo ID.

> **Header:** `x-api-key: <sua-chave>`

**Resposta `200 OK`:**

```json
{
  "id": "uuid-da-mensagem",
  "status": "sent",
  "type": "whatsapp",
  "sendDate": "2026-03-18T20:00:00.000Z"
}
```

---

### Gerenciamento de API Keys

> ⚠️ Estas rotas só funcionam quando `IS_MANAGER_ON=true`.

#### `POST /manager/key`

Cria uma nova API key.

```json
{
  "name": "cliente-a",
  "limit": 10
}
```

**Resposta `201 Created`:**

```json
{
  "status": "Sucesso",
  "id": 1,
  "name": "cliente-a",
  "limitPerMinute": 10,
  "totalMessages": 0,
  "createdAt": "2026-03-18T12:00:00.000Z",
  "key": "chave-gerada-exibida-apenas-aqui"
}
```

> 💡 A chave é exibida **somente na criação**. Guarde-a em segurança — o sistema armazena apenas o hash.

---

#### `DELETE /manager/key/:id`

Remove uma API key pelo ID.

```
DELETE /manager/key/1
```

**Resposta `200 OK`:**

```json
{
  "status": "Sucesso",
  "message": "Chave removida."
}
```

---

### Health Check

#### `GET /health`

```json
{ "status": "ok" }
```

---

## ⚙️ Jobs Agendados

### 🔄 Job de Processamento

- Executa a cada `PROCESSING_INTERVAL_MINUTES` minutos (padrão: **2 minutos**).
- Busca todas as mensagens com status `pending` ou `failure`.
- Tenta enviar via o canal configurado.
- Atualiza o status para `sent` (sucesso) ou `failure` (erro).

### 📊 Job de Resumo Diário

- Executa conforme `CRON_DAILY_SUMMARY` (padrão: **todos os dias às 20h**).
- Fuso horário configurável via `JOB_TIMEZONE` (padrão: `America/Sao_Paulo`).
- Envia um resumo do dia anterior via WhatsApp ao número `ADMIN_WHATSAPP_TO`.

---

## 🚀 Setup

### Pré-requisitos

- Node.js 22+
- PostgreSQL
- Conta Twilio (para WhatsApp, SMS e ligações)
- Conta Resend (para e-mails)

### 1. Clonar e instalar dependências

```bash
git clone <url-do-repo>
cd notification-backend
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais:

```env
# Aplicação
NODE_ENV=development
PORT=3000
IS_MANAGER_ON=true

# Banco de dados
DATABASE_URL=postgresql://user:password@localhost:5432/notifications

# Jobs
PROCESSING_INTERVAL_MINUTES=2
CRON_DAILY_SUMMARY=0 20 * * *
JOB_TIMEZONE=America/Sao_Paulo

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
TWILIO_SMS_FROM=+15005550006
TWILIO_CALL_FROM=+15005550006

# Resend
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=noreply@seudominio.com

# Admin (resumo diário)
ADMIN_WHATSAPP_TO=whatsapp:+5511999999999
```

### 3. Configurar banco de dados

```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
```

### 4. Iniciar

```bash
# Desenvolvimento (hot-reload)
npm run dev

# Produção
npm start
```

### 5. Acessar a documentação

```
http://localhost:3000/docs
```

---

## 🧪 Exemplos de Uso

### Criar uma API Key

```bash
curl -X POST http://localhost:3000/manager/key \
  -H "Content-Type: application/json" \
  -d '{"name": "meu-servico", "limit": 10}'
```

### Enviar mensagem via WhatsApp

```bash
curl -X POST http://localhost:3000/message \
  -H "Content-Type: application/json" \
  -H "x-api-key: SUA_CHAVE" \
  -d '{
    "title": "Alerta",
    "text": "Seu pedido foi confirmado!",
    "type": "whatsapp",
    "phone": "whatsapp:+5511999999999"
  }'
```

### Enviar mensagem via E-mail

```bash
curl -X POST http://localhost:3000/message \
  -H "Content-Type: application/json" \
  -H "x-api-key: SUA_CHAVE" \
  -d '{
    "title": "Bem-vindo",
    "text": "Obrigado por se cadastrar!",
    "type": "email",
    "email": "usuario@exemplo.com"
  }'
```

### Enviar via Discord

```bash
curl -X POST http://localhost:3000/message \
  -H "Content-Type: application/json" \
  -H "x-api-key: SUA_CHAVE" \
  -d '{
    "title": "Deploy concluído",
    "text": "A versão 2.0 foi publicada com sucesso.",
    "type": "discord",
    "discordWebhook": "https://discord.com/api/webhooks/..."
  }'
```

### Consultar status de uma mensagem

```bash
curl "http://localhost:3000/message?id=uuid-da-mensagem" \
  -H "x-api-key: SUA_CHAVE"
```

---

## 📝 Observações Importantes

- **Processamento assíncrono:** o `POST /message` apenas grava no banco e retorna `202`. O envio real ocorre no job periódico.
- **Reprocessamento automático:** mensagens com status `failure` são retentadas automaticamente a cada rodada do job.
- **Rate limiting:** cada API key possui um limite de mensagens por minuto configurável. Exceder retorna `429 Too Many Requests`.
- **Segurança das chaves:** API keys são armazenadas como hash bcrypt — a chave plaintext é exibida **apenas no momento da criação**.
- **Modo Manager:** se `IS_MANAGER_ON=false`, as rotas `/manager/*` retornam `401 Unauthorized`.

---

<div align="center">

Feito com Node.js · Express · Prisma · PostgreSQL

</div>
