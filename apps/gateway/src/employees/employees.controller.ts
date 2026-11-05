import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Role, type EmployeeView, type Paginated } from '@wfh/contracts';
import {
  CreateEmployeeDto,
  EmployeeIdDto,
  ListEmployeesDto,
  UpdateEmployeeDto,
} from '@wfh/contracts/dto';

import type { AuthUser } from '../auth/auth-user';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { ResponseMessage } from '../common/http/response-message.decorator';
import { EmployeesClient } from './employees.client';

@Controller('employees')
@Roles(Role.HRD_ADMIN)
export class EmployeesController {
  constructor(private readonly employees: EmployeesClient) {}

  @Post()
  @ResponseMessage('Employee created')
  create(@Body() dto: CreateEmployeeDto): Promise<EmployeeView> {
    return this.employees.create(dto);
  }

  @Get()
  findAll(@Query() query: ListEmployeesDto): Promise<Paginated<EmployeeView>> {
    return this.employees.findAll(query);
  }

  @Get(':id')
  findOne(@Param() { id }: EmployeeIdDto): Promise<EmployeeView> {
    return this.employees.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Employee updated')
  update(
    @CurrentUser() user: AuthUser,
    @Param() { id }: EmployeeIdDto,
    @Body() dto: UpdateEmployeeDto,
  ): Promise<EmployeeView> {
    // Prevents the last HRD admin from locking everyone out of employee management.
    if (id === user.id && (dto.isActive === false || (dto.role && dto.role !== Role.HRD_ADMIN))) {
      throw new ForbiddenException('You cannot deactivate or demote your own account');
    }
    return this.employees.update(Object.assign(dto, { id }));
  }
}
