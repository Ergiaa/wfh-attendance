import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { validationPipeOptions } from '@wfh/nest-common';

import { AppModule } from './app.module';
import type { Env } from './config/env';
import { setupSwagger } from './docs/setup-swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get<ConfigService<Env, true>>(ConfigService);

  app.setGlobalPrefix('api');
  app.enableCors({ origin: config.get('CORS_ORIGIN', { infer: true }) });
  app.useGlobalPipes(new ValidationPipe(validationPipeOptions));
  app.enableShutdownHooks();

  if (config.get('NODE_ENV', { infer: true }) !== 'production') {
    setupSwagger(app);
  }

  await app.listen(config.get('PORT', { infer: true }));
}
void bootstrap();
