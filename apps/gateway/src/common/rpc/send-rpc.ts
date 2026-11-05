import {
  GatewayTimeoutException,
  HttpException,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout, TimeoutError } from 'rxjs';

const RPC_TIMEOUT_MS = 5_000;

interface RpcErrorPayload {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export async function sendRpc<TResult>(
  client: ClientProxy,
  pattern: object,
  payload: unknown,
): Promise<TResult> {
  try {
    return await firstValueFrom(
      client.send<TResult>(pattern, payload).pipe(timeout(RPC_TIMEOUT_MS)),
    );
  } catch (error) {
    throw toHttpException(error);
  }
}

function toHttpException(error: unknown): HttpException {
  if (isRpcErrorPayload(error)) {
    return new HttpException(error, error.statusCode);
  }
  if (error instanceof TimeoutError) {
    return new GatewayTimeoutException('Upstream service timed out');
  }
  if (isConnectionError(error)) {
    return new ServiceUnavailableException('Upstream service unavailable');
  }
  return new InternalServerErrorException();
}

function isRpcErrorPayload(error: unknown): error is RpcErrorPayload {
  return (
    typeof error === 'object' &&
    error !== null &&
    typeof (error as RpcErrorPayload).statusCode === 'number'
  );
}

function isConnectionError(error: unknown): boolean {
  const code = (error as { code?: unknown } | null)?.code;
  return code === 'ECONNREFUSED' || code === 'ECONNRESET' || code === 'EPIPE';
}
