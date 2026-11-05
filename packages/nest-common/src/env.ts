import Joi from 'joi';

export interface ServiceEnv {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASS: string;
  DB_NAME: string;
}

export function serviceEnvSchema(defaults: { port: number }): Joi.ObjectSchema<ServiceEnv> {
  return Joi.object<ServiceEnv, true>({
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
    PORT: Joi.number().port().default(defaults.port),
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().port().default(3306),
    DB_USER: Joi.string().required(),
    DB_PASS: Joi.string().required(),
    DB_NAME: Joi.string().required(),
  });
}
