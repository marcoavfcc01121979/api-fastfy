import { knex as setupKnex, Knex } from 'knex';
import { env } from './env';

export const config: Knex.Config = {
  client: env.DATABASE_CLIENT,
  connection:
    env.DATABASE_CLIENT === 'better-sqlite3'
      ? {
          filename: env.DATABASE_URL || './database/app.db',
        }
      : env.DATABASE_CLIENT,
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './database/migrations',
  },
};

export const knex = setupKnex(config);
