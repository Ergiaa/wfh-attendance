import { Type, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AsyncMicroserviceOptions, Transport } from '@nestjs/microservices';

import type { ServiceEnv } from './env';
import { RpcExceptionFilter } from './rpc-exception.filter';
import { validationPipeOptions } from './validation';

export async function bootstrapTcpService(appModule: Type<unknown>): Promise<void> {
  const app = await NestFactory.createMicroservice<AsyncMicroserviceOptions>(appModule, {
    inject: [ConfigService],
    useFactory: (config: ConfigService<ServiceEnv, true>) => ({
      transport: Transport.TCP,
      options: { host: '0.0.0.0', port: config.get('PORT', { infer: true }) },
    }),
  });

  app.useGlobalPipes(new ValidationPipe(validationPipeOptions));
  app.useGlobalFilters(new RpcExceptionFilter());
  app.enableShutdownHooks();

  await app.listen();
}
