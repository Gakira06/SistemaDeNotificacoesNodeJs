# Sistema de Notificacoes

Backend em Node.js para enfileirar e enviar notificacoes por Discord, email, WhatsApp, SMS e ligacao telefonica usando PostgreSQL, Prisma e Swagger.

## Recursos

- Autenticacao por `api-key` no header.
- Cadastro e remocao de chaves protegidos por `IS_MANAGER_ON`.
- Armazenamento seguro da chave com valor criptografado e hash de lookup.
- Fila assincrona com job recorrente a cada 2 minutos.
- Strategies separadas por canal de envio.
- Swagger em `/docs`.
- Dashboard simples em `/dashboard`.
- Logs estruturados com `pino`.

## Como executar

1. Instale dependencias:

```bash
npm install
```

2. Configure o ambiente:

```bash
cp .env.example .env
```

3. Gere o client do Prisma e aplique o schema:

```bash
npx prisma generate
npx prisma db push
```

4. Inicie o projeto:

```bash
npm run dev
```

## Variaveis principais

- `DATABASE_URL`: conexao PostgreSQL.
- `APP_SECRET`: segredo usado para criptografia e hash da `api-key`.
- `IS_MANAGER_ON`: habilita ou bloqueia `POST /keys` e `DELETE /keys/:id`.
- `JOB_INTERVAL_MS`: intervalo do processador. O padrao e `120000`.
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`: integracoes de WhatsApp, SMS e ligacoes.
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL`: integracao de email.

## Fluxo resumido

1. Crie uma chave em `POST /keys`.
2. Use a chave retornada no header `api-key`.
3. Envie notificacoes com `POST /message`.
4. O job busca mensagens `pending` e `failure` no intervalo configurado.
5. Consulte o status com `GET /message` ou acompanhe pelo dashboard.
