import Joi from 'joi';

export interface Env {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  CORS_ORIGIN: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN_SECONDS: number;
  UPLOAD_DIR: string;
  EMPLOYEES_SERVICE_HOST: string;
  EMPLOYEES_SERVICE_PORT: number;
  ATTENDANCE_SERVICE_HOST: string;
  ATTENDANCE_SERVICE_PORT: number;
}

export const envSchema = Joi.object<Env, true>({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().port().default(3000),
  CORS_ORIGIN: Joi.string().uri().default('http://localhost:5173'),
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN_SECONDS: Joi.number()
    .integer()
    .positive()
    .default(8 * 60 * 60),
  UPLOAD_DIR: Joi.string().default('uploads'),
  EMPLOYEES_SERVICE_HOST: Joi.string().hostname().default('localhost'),
  EMPLOYEES_SERVICE_PORT: Joi.number().port().default(4001),
  ATTENDANCE_SERVICE_HOST: Joi.string().hostname().default('localhost'),
  ATTENDANCE_SERVICE_PORT: Joi.number().port().default(4002),
});
