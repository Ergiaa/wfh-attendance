import { ArgumentsHost, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { QueryFailedError } from 'typeorm';
import { describe, expect, it } from 'vitest';

import { RpcExceptionFilter } from './rpc-exception.filter';

const filter = new RpcExceptionFilter();
const host = {} as ArgumentsHost;

const errorFor = (exception: unknown) =>
  firstValueFrom(filter.catch(exception, host)).then(
    () => expect.fail('expected the observable to error'),
    (error: unknown) => error,
  );

describe('RpcExceptionFilter', () => {
  it('forwards the body of an HttpException', async () => {
    await expect(errorFor(new NotFoundException('Employee not found'))).resolves.toEqual({
      statusCode: 404,
      error: 'Not Found',
      message: 'Employee not found',
    });
  });

  it('wraps a string HttpException response with its status', async () => {
    await expect(errorFor(new HttpException('Teapot', HttpStatus.I_AM_A_TEAPOT))).resolves.toEqual({
      statusCode: 418,
      message: 'Teapot',
    });
  });

  it('passes RpcException payloads through untouched', async () => {
    await expect(errorFor(new RpcException({ statusCode: 401, message: 'nope' }))).resolves.toEqual(
      {
        statusCode: 401,
        message: 'nope',
      },
    );
  });

  it('maps MySQL duplicate-entry errors to 409', async () => {
    const duplicate = new QueryFailedError(
      'INSERT',
      [],
      Object.assign(new Error(), { code: 'ER_DUP_ENTRY' }),
    );
    await expect(errorFor(duplicate)).resolves.toMatchObject({ statusCode: 409 });
  });

  it('hides unknown errors behind a generic message', async () => {
    await expect(errorFor(new Error('connection string leaked'))).resolves.toEqual({
      status: 'error',
      message: 'Internal server error',
    });
  });
});
