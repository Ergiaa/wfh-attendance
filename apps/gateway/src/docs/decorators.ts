import { applyDecorators, HttpStatus, type Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { STATUS_CODES } from 'node:http';

import { ApiErrorModel } from './models';

interface EnvelopeOptions {
  status?: HttpStatus;
  paginated?: boolean;
}

/** Documents a success response wrapped by ResponseInterceptor as `{ statusCode, message, data }`. */
export function ApiEnvelope(
  model: Type<unknown>,
  { status = HttpStatus.OK, paginated = false }: EnvelopeOptions = {},
) {
  const item = { $ref: getSchemaPath(model) };
  const data = paginated
    ? {
        type: 'object',
        required: ['items', 'total', 'page', 'limit'],
        properties: {
          items: { type: 'array', items: item },
          total: { type: 'integer', example: 42 },
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 10 },
        },
      }
    : item;

  return applyDecorators(
    ApiExtraModels(model),
    ApiResponse({
      status,
      description: STATUS_CODES[status],
      schema: {
        type: 'object',
        required: ['statusCode', 'message', 'data'],
        properties: {
          statusCode: { type: 'integer', example: status },
          message: { type: 'string', example: 'Success' },
          data,
        },
      },
    }),
  );
}

/** Documents error responses, all shaped by HttpExceptionFilter. */
export function ApiErrors(...statuses: HttpStatus[]) {
  return applyDecorators(
    ...statuses.map((status) =>
      ApiResponse({ status, description: STATUS_CODES[status], type: ApiErrorModel }),
    ),
  );
}
