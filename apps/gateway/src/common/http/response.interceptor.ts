import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  StreamableFile,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { ApiResponse } from '@wfh/contracts';
import type { Response } from 'express';
import { map, Observable } from 'rxjs';

import { RESPONSE_MESSAGE } from './response-message.decorator';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T> | StreamableFile> {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T> | StreamableFile> {
    const message =
      this.reflector.get<string | undefined>(RESPONSE_MESSAGE, context.getHandler()) ?? 'Success';
    const response = context.switchToHttp().getResponse<Response>();

    return next
      .handle()
      .pipe(
        map((data) =>
          data instanceof StreamableFile
            ? data
            : { statusCode: response.statusCode, message, data },
        ),
      );
  }
}
