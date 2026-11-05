import { bootstrapTcpService } from '@wfh/nest-common/microservice';

import { AppModule } from './app.module';

void bootstrapTcpService(AppModule);
