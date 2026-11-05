import { createCliDataSource } from '@wfh/nest-common/microservice';

import { Employee } from '../employees/employee.entity';
import { migrations } from './migrations';

// Entry point for the TypeORM CLI only; the running service connects through AppModule.
export default createCliDataSource({ entities: [Employee], migrations });
