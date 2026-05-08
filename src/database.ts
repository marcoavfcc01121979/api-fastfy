import { knex as setupKnex, Knex } from 'knex';
import { env } from './env';

export const config: Knex.Config = {
  client: 'better-sqlite3',
  connection: {
    filename: env.DATABASE_URL || './database/app.db',
  },
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './database/migrations',
  },
};

export const knex = setupKnex(config);
