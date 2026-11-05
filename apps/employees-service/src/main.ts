import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';

import { EmployeesModule } from './employees.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    EmployeesModule,
    {
      transport: Transport.TCP,
      options: { host: '0.0.0.0', port: Number(process.env.PORT ?? 4001) },
    },
  );
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen();
}
void bootstrap();
