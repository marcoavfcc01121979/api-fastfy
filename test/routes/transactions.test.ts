import request from 'supertest';
import { app } from '../../src/app';
import { beforeAll, afterAll, test, expect, describe, it, beforeEach } from 'vitest';
import { execSync } from 'node:child_process';

describe('Transactions Route', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all');
    execSync('npm run knex migrate:latest');
  });

  test('o usuario consegue criar uma nova transação', async () => {
    const response = await request(app.server).post('/transactions').send({
      title: 'New Transaction',
      amount: 100,
      type: 'credit',
    });

    console.log(response.body);

    expect(response.statusCode).toBe(201);
  });

  it('o usuario consegue listar as transações', async () => {
    const createResponse = await request(app.server).post('/transactions').send({
      title: 'Another Transaction',
      amount: 50,
      type: 'debit',
    });

    expect(createResponse.statusCode).toBe(201);
    const cookies = createResponse.headers['set-cookie'];
    const listResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200);
    console.log(listResponse.body);

    expect(listResponse.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          title: 'Another Transaction',
          amount: -50,
        }),
      ]),
    );
  });

  it('o usuario obtenha uma transação especifica', async () => {
    const createResponse = await request(app.server).post('/transactions').send({
      title: 'Another Transaction',
      amount: 50,
      type: 'debit',
    });

    expect(createResponse.statusCode).toBe(201);

    const cookies = createResponse.headers['set-cookie'];

    const listResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200);

    console.log(listResponse.body);

    const transactionId = listResponse.body[0].id;

    const getTransactionResponse = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookies)
      .expect(200);

    expect(getTransactionResponse.body.transaction).toEqual(
      expect.objectContaining({
        title: 'Another Transaction',
        amount: -50,
      }),
    );
  });
});
