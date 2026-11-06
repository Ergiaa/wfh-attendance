import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
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
import { ApiEnvelope, ApiErrors } from '../docs/decorators';
import { EmployeeModel } from '../docs/models';
import { EmployeesClient } from './employees.client';

@ApiTags('Employees (HRD)')
@ApiBearerAuth()
@ApiErrors(401, 403)
@Controller('employees')
@Roles(Role.HRD_ADMIN)
export class EmployeesController {
  constructor(private readonly employees: EmployeesClient) {}

  @Post()
  @ResponseMessage('Employee created')
  @ApiOperation({ summary: 'Create an employee' })
  @ApiEnvelope(EmployeeModel, { status: 201 })
  @ApiErrors(400, 409)
  create(@Body() dto: CreateEmployeeDto): Promise<EmployeeView> {
    return this.employees.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List employees' })
  @ApiEnvelope(EmployeeModel, { paginated: true })
  @ApiErrors(400)
  findAll(@Query() query: ListEmployeesDto): Promise<Paginated<EmployeeView>> {
    return this.employees.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an employee' })
  @ApiEnvelope(EmployeeModel)
  @ApiErrors(400, 404)
  findOne(@Param() { id }: EmployeeIdDto): Promise<EmployeeView> {
    return this.employees.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Employee updated')
  @ApiOperation({
    summary: 'Update an employee',
    description: 'Partial update. You cannot deactivate or demote your own account.',
  })
  @ApiEnvelope(EmployeeModel)
  @ApiErrors(400, 404, 409)
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

  @Delete(':id')
  @ResponseMessage('Employee deleted')
  @ApiOperation({
    summary: 'Delete an employee',
    description: 'Soft delete; frees the code and email for reuse. You cannot delete yourself.',
  })
  @ApiEnvelope(EmployeeModel)
  @ApiErrors(400, 404)
  remove(@CurrentUser() user: AuthUser, @Param() { id }: EmployeeIdDto): Promise<EmployeeView> {
    if (id === user.id) {
      throw new ForbiddenException('You cannot delete your own account');
    }
    return this.employees.remove(id);
  }
}
