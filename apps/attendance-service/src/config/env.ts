import { serviceEnvKeys, type ServiceEnv } from '@wfh/nest-common/microservice';
import Joi from 'joi';

export interface Env extends ServiceEnv {
  WORK_TIMEZONE: string;
}

export const envSchema = Joi.object<Env, true>({
  ...serviceEnvKeys({ port: 4002 }),
  WORK_TIMEZONE: Joi.string()
    .default('Asia/Jakarta')
    .custom((value: string) => {
      new Intl.DateTimeFormat('en', { timeZone: value });
      return value;
    }, 'IANA time zone'),
});
