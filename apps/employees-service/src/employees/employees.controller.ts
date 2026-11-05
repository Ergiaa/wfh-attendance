import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EMPLOYEES, type EmployeeView, type Paginated } from '@wfh/contracts';
import {
  CreateEmployeeDto,
  EmployeeIdDto,
  ListEmployeesDto,
  UpdateEmployeePayload,
  ValidateCredentialsDto,
} from '@wfh/contracts/dto';

import { EmployeesService } from './employees.service';

@Controller()
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @MessagePattern(EMPLOYEES.create)
  create(@Payload() dto: CreateEmployeeDto): Promise<EmployeeView> {
    return this.employeesService.create(dto);
  }

  @MessagePattern(EMPLOYEES.findAll)
  findAll(@Payload() dto: ListEmployeesDto): Promise<Paginated<EmployeeView>> {
    return this.employeesService.findAll(dto);
  }

  @MessagePattern(EMPLOYEES.findOne)
  findOne(@Payload() { id }: EmployeeIdDto): Promise<EmployeeView> {
    return this.employeesService.findOne(id);
  }

  @MessagePattern(EMPLOYEES.update)
  update(@Payload() payload: UpdateEmployeePayload): Promise<EmployeeView> {
    return this.employeesService.update(payload);
  }

  @MessagePattern(EMPLOYEES.remove)
  remove(@Payload() { id }: EmployeeIdDto): Promise<EmployeeView> {
    return this.employeesService.remove(id);
  }

  @MessagePattern(EMPLOYEES.validate)
  validate(@Payload() dto: ValidateCredentialsDto): Promise<EmployeeView> {
    return this.employeesService.validate(dto);
  }
}
