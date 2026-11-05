import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { ApiErrorResponse } from '@wfh/contracts';
import type { Request, Response } from 'express';
import { STATUS_CODES } from 'node:http';

interface HttpExceptionBody {
  message?: string | string[];
  error?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<Request>();
    const body = this.toBody(exception);

    if (body.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(`${request.method} ${request.url}`, exception);
    }

    http.getResponse<Response>().status(body.statusCode).json(body);
  }

  private toBody(exception: unknown): ApiErrorResponse {
    if (!(exception instanceof HttpException)) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        error: 'Internal Server Error',
      };
    }

    const statusCode = exception.getStatus();
    const response = exception.getResponse();
    const { message, error }: HttpExceptionBody =
      typeof response === 'string' ? { message: response } : response;
    const fallbackError = STATUS_CODES[statusCode] ?? 'Error';

    if (Array.isArray(message)) {
      return {
        statusCode,
        message: 'Validation failed',
        error: error ?? fallbackError,
        errors: message,
      };
    }
    return { statusCode, message: message ?? exception.message, error: error ?? fallbackError };
  }
}
