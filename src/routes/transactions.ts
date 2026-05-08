import { FastifyInstance } from 'fastify';
import { FastifyRequest, FastifyReply } from 'fastify';
import { knex } from '../database';
import z from 'zod';
import { checkSessionIdExists } from '../middlewares/check_session_id_exists';

export async function transactionsRoute(app: FastifyInstance) {
  // Modelo globais para todas as rotas
  /*app.addHook('preHandler', async (request, reply) => {
    await checkSessionIdExists(request, reply);
  }*/
  //app.addHook('preHandler', checkSessionIdExists);

  app.get('/', { preHandler: checkSessionIdExists }, async (request, reply) => {
    const { session_id: sessionId } = request.cookies;

    const transactions = await knex('transactions').where('session_id', sessionId).select('*');

    return reply.send(transactions);
  });

  app.get('/summary', { preHandler: checkSessionIdExists }, async (request, reply) => {
    const { session_id: sessionId } = request.cookies;

    const summary = await knex('transactions')
      .where('session_id', sessionId)
      .sum('amount', { as: 'amount' })
      .first();

    return reply.send(summary);
  });

  app.get(
    '/:id',
    { preHandler: checkSessionIdExists },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { session_id: sessionId } = request.cookies;
      const getTransactionParamsSchema = z.object({
        id: z.string().uuid(),
      });
      const { id } = getTransactionParamsSchema.parse(request.params);

      const transaction = await knex('transactions')
        .where({ id })
        .andWhere('session_id', sessionId)
        .first();

      if (!transaction) {
        return reply.status(404).send({ message: 'Transaction not found' });
      }

      return reply.send({ transaction });
    },
  );

  app.post('/', async (request, reply) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    });
    const { title, amount, type } = createTransactionBodySchema.parse(request.body);

    let session_id = request.cookies.session_id;
    if (!session_id) {
      session_id = crypto.randomUUID();
      reply.setCookie('session_id', session_id, { path: '/', maxAge: 60 * 60 * 24 * 7 }); // 7 days
    }

    await knex('transactions').insert({
      id: crypto.randomUUID(),
      title,
      amount: type === 'credit' ? amount : -amount,
      session_id,
    });

    return reply.status(201).send();
  });
}
