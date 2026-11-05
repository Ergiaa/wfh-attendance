import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { serviceEnvSchema, typeOrmAsyncOptions } from '@wfh/nest-common/microservice';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validationSchema: serviceEnvSchema({ port: 4002 }) }),
    TypeOrmModule.forRootAsync(typeOrmAsyncOptions),
  ],
})
export class AppModule {}
