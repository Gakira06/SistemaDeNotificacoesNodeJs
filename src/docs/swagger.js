/**
 * @swagger
 * /health:
 *   get:
 *     summary: Verifica a saude da aplicacao
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Aplicacao ativa
 */

/**
 * @swagger
 * /message:
 *   post:
 *     summary: Enfileira uma notificacao para envio assincrono
 *     tags: [Messages]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MessageCreateInput'
 *     responses:
 *       202:
 *         description: Mensagem adicionada a fila
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         description: Payload invalido
 *       401:
 *         description: API key invalida
 *       429:
 *         description: Limite por minuto excedido
 *   get:
 *     summary: Lista mensagens da api-key autenticada
 *     tags: [Messages]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, sent, failure]
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [discord, email, whatsapp, sms, phoneCall]
 *       - in: query
 *         name: sendDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Lista retornada com sucesso
 *       401:
 *         description: API key invalida
 *
 * /message/{id}:
 *   delete:
 *     summary: Cancela uma mensagem pendente
 *     tags: [Messages]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Mensagem cancelada
 *       400:
 *         description: Mensagem nao esta pendente
 *       403:
 *         description: Mensagem pertence a outra api-key
 *       404:
 *         description: Mensagem nao encontrada
 *
 * /keys:
 *   post:
 *     summary: Cria uma nova API key
 *     tags: [Keys]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApiKeyCreateInput'
 *     responses:
 *       201:
 *         description: Chave criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiKeyCreateResponse'
 *       401:
 *         description: Gerenciamento desabilitado
 *
 * /keys/{id}:
 *   delete:
 *     summary: Remove uma API key
 *     tags: [Keys]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Chave removida
 *       401:
 *         description: Gerenciamento desabilitado
 *       404:
 *         description: Chave nao encontrada
 */
