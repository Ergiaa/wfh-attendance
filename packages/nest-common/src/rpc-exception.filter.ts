import { ArgumentsHost, Catch, HttpException, HttpStatus } from '@nestjs/common';
import { BaseRpcExceptionFilter, RpcException } from '@nestjs/microservices';
import { QueryFailedError } from 'typeorm';

const MYSQL_DUPLICATE_ENTRY = 'ER_DUP_ENTRY';

@Catch()
export class RpcExceptionFilter extends BaseRpcExceptionFilter {
  override catch(exception: unknown, host: ArgumentsHost) {
    return super.catch(toRpcException(exception), host);
  }
}

function toRpcException(exception: unknown): unknown {
  if (exception instanceof HttpException) {
    const response = exception.getResponse();
    return new RpcException(
      typeof response === 'string'
        ? { statusCode: exception.getStatus(), message: response }
        : response,
    );
  }

  if (
    exception instanceof QueryFailedError &&
    (exception.driverError as { code?: string }).code === MYSQL_DUPLICATE_ENTRY
  ) {
    return new RpcException({
      statusCode: HttpStatus.CONFLICT,
      error: 'Conflict',
      message: 'Resource already exists',
    });
  }

  return exception;
}
