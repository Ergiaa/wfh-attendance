import { ConfigService } from '@nestjs/config';
import type { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';

import type { ServiceEnv } from './env';

export const typeOrmAsyncOptions: TypeOrmModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: (config: ConfigService<ServiceEnv, true>) => ({
    type: 'mysql',
    host: config.get('DB_HOST', { infer: true }),
    port: config.get('DB_PORT', { infer: true }),
    username: config.get('DB_USER', { infer: true }),
    password: config.get('DB_PASS', { infer: true }),
    database: config.get('DB_NAME', { infer: true }),
    timezone: 'Z',
    autoLoadEntities: true,
    // TODO: replace with migrations before attendance-service depends on this schema
    synchronize: config.get('NODE_ENV', { infer: true }) === 'development',
  }),
};
