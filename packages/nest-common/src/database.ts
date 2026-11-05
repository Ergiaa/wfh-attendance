import { ConfigService } from '@nestjs/config';
import type { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { existsSync } from 'node:fs';
import { DataSource, type DataSourceOptions } from 'typeorm';

import { serviceEnvSchema, type ServiceEnv } from './env';

type DatabaseEnv = Pick<ServiceEnv, 'DB_HOST' | 'DB_PORT' | 'DB_USER' | 'DB_PASS' | 'DB_NAME'>;
type Migrations = NonNullable<DataSourceOptions['migrations']>;

function mysqlOptions(env: DatabaseEnv, migrations: Migrations) {
  return {
    type: 'mysql',
    host: env.DB_HOST,
    port: env.DB_PORT,
    username: env.DB_USER,
    password: env.DB_PASS,
    database: env.DB_NAME,
    timezone: 'Z',
    migrations,
  } as const satisfies DataSourceOptions;
}

export function typeOrmAsyncOptions(migrations: Migrations): TypeOrmModuleAsyncOptions {
  return {
    inject: [ConfigService],
    useFactory: (config: ConfigService<ServiceEnv, true>) => ({
      ...mysqlOptions(
        {
          DB_HOST: config.get('DB_HOST', { infer: true }),
          DB_PORT: config.get('DB_PORT', { infer: true }),
          DB_USER: config.get('DB_USER', { infer: true }),
          DB_PASS: config.get('DB_PASS', { infer: true }),
          DB_NAME: config.get('DB_NAME', { infer: true }),
        },
        migrations,
      ),
      autoLoadEntities: true,
      migrationsRun: true,
    }),
  };
}

// For the TypeORM CLI, which runs outside Nest and so has no ConfigModule to read .env for it.
export function createCliDataSource(
  options: Required<Pick<DataSourceOptions, 'entities' | 'migrations'>>,
): DataSource {
  if (existsSync('.env')) {
    process.loadEnvFile('.env');
  }

  const { value: env, error } = serviceEnvSchema({ port: 0 }).unknown(true).validate(process.env);
  if (error) {
    throw error;
  }

  return new DataSource({ ...mysqlOptions(env, options.migrations), entities: options.entities });
}
