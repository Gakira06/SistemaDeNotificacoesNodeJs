const swaggerJSDoc = require("swagger-jsdoc");

const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Sistema de Notificacoes API",
      version: "1.0.0",
      description:
        "API para enfileiramento e envio assincrono de notificacoes via Discord, email, WhatsApp, SMS e ligacao telefonica.",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "api-key",
        },
      },
      schemas: {
        MessageCreateInput: {
          type: "object",
          required: ["title", "text", "type"],
          properties: {
            title: { type: "string", example: "Servidor em alerta" },
            text: { type: "string", example: "Uso de CPU acima de 90%" },
            type: {
              type: "string",
              enum: ["discord", "email", "whatsapp", "sms", "phoneCall"],
            },
            phone: { type: "string", example: "+5511999999999" },
            email: { type: "string", format: "email", example: "ops@example.com" },
            discordWebhook: {
              type: "string",
              format: "uri",
              example: "https://discord.com/api/webhooks/123/token",
            },
          },
        },
        MessageResponse: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            status: { type: "string", example: "pending" },
            message: { type: "string" },
          },
        },
        ApiKeyCreateInput: {
          type: "object",
          required: ["name", "limit"],
          properties: {
            name: { type: "string", example: "cliente-producao" },
            limit: { type: "integer", example: 30 },
          },
        },
        ApiKeyCreateResponse: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "cliente-producao" },
            limit: { type: "integer", example: 30 },
            key: { type: "string", format: "uuid" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            error: { type: "string" },
          },
        },
      },
    },
  },
  apis: ["./src/docs/swagger.js"],
});

module.exports = swaggerSpec;
