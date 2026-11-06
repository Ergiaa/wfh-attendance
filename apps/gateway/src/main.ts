import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { validationPipeOptions } from '@wfh/nest-common';

import { AppModule } from './app.module';
import type { Env } from './config/env';
import { setupSwagger } from './docs/setup-swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get<ConfigService<Env, true>>(ConfigService);

  if (config.get('TRUST_PROXY', { infer: true })) {
    app.set('trust proxy', 1);
  }
  app.setGlobalPrefix('api');
  app.enableCors({ origin: config.get('CORS_ORIGIN', { infer: true }) });
  app.useGlobalPipes(new ValidationPipe(validationPipeOptions));
  app.enableShutdownHooks();

  const docsEnabled =
    config.get('API_DOCS_ENABLED', { infer: true }) ??
    config.get('NODE_ENV', { infer: true }) !== 'production';
  if (docsEnabled) {
    setupSwagger(app);
  }

  await app.listen(config.get('PORT', { infer: true }));
}
void bootstrap();
