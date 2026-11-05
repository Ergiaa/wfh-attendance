import type { DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

import type { Env } from '../../config/env';

type HostKey = Extract<keyof Env, `${string}_HOST`>;
type PortKey = Extract<keyof Env, `${string}_PORT`>;

export function registerTcpClient(
  token: symbol,
  keys: { host: HostKey; port: PortKey },
): DynamicModule {
  return ClientsModule.registerAsync([
    {
      name: token,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        transport: Transport.TCP,
        options: {
          host: config.get(keys.host, { infer: true }),
          port: config.get(keys.port, { infer: true }),
        },
      }),
    },
  ]);
}
