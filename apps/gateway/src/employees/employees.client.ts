import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { EMPLOYEES, type EmployeeView, type Paginated } from '@wfh/contracts';
import type {
  CreateEmployeeDto,
  ListEmployeesDto,
  UpdateEmployeePayload,
  ValidateCredentialsDto,
} from '@wfh/contracts/dto';

import { sendRpc } from '../common/rpc/send-rpc';

export const EMPLOYEES_SERVICE = Symbol('EMPLOYEES_SERVICE');

@Injectable()
export class EmployeesClient {
  constructor(@Inject(EMPLOYEES_SERVICE) private readonly client: ClientProxy) {}

  create(dto: CreateEmployeeDto): Promise<EmployeeView> {
    return sendRpc(this.client, EMPLOYEES.create, dto);
  }

  findAll(dto: ListEmployeesDto): Promise<Paginated<EmployeeView>> {
    return sendRpc(this.client, EMPLOYEES.findAll, dto);
  }

  findOne(id: string): Promise<EmployeeView> {
    return sendRpc(this.client, EMPLOYEES.findOne, { id });
  }

  update(payload: UpdateEmployeePayload): Promise<EmployeeView> {
    return sendRpc(this.client, EMPLOYEES.update, payload);
  }

  validate(dto: ValidateCredentialsDto): Promise<EmployeeView> {
    return sendRpc(this.client, EMPLOYEES.validate, dto);
  }
}
