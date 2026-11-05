import { ConflictException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Role } from '@wfh/contracts';
import { CreateEmployeeDto } from '@wfh/contracts/dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { AppModule } from '../app.module';
import { EmployeesService } from '../employees/employees.service';

const logger = new Logger('SeedAdmin');

async function seedAdmin(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'warn', 'error'],
  });

  try {
    const config = app.get(ConfigService);
    const admin = plainToInstance(CreateEmployeeDto, {
      employeeCode: config.get<string>('SEED_ADMIN_CODE', 'HRD001'),
      name: config.get<string>('SEED_ADMIN_NAME', 'HRD Admin'),
      email: config.getOrThrow<string>('SEED_ADMIN_EMAIL'),
      password: config.getOrThrow<string>('SEED_ADMIN_PASSWORD'),
      role: Role.HRD_ADMIN,
    });

    const errors = await validate(admin);
    if (errors.length > 0) {
      const reasons = errors.flatMap((error) => Object.values(error.constraints ?? {}));
      throw new Error(`Invalid seed admin: ${reasons.join('; ')}`);
    }

    const created = await app.get(EmployeesService).create(admin);
    logger.log(`Created HRD admin ${created.email} (${created.employeeCode})`);
  } catch (error) {
    if (!(error instanceof ConflictException)) {
      throw error;
    }
    logger.warn(`Skipped: ${error.message}`);
  } finally {
    await app.close();
  }
}

seedAdmin().catch((error: unknown) => {
  logger.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
