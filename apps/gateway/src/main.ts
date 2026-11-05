import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { validationPipeOptions } from '@wfh/nest-common';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe(validationPipeOptions));
  app.enableShutdownHooks();
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
