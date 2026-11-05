import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import type { EmployeeView, Paginated } from '@wfh/contracts';
import type {
  CreateEmployeeDto,
  ListEmployeesDto,
  UpdateEmployeePayload,
  ValidateCredentialsDto,
} from '@wfh/contracts/dto';

import { escapeLike } from '@wfh/nest-common/microservice';
import { compare, hash } from 'bcrypt';
import { FindOptionsWhere, Like, Not, Repository } from 'typeorm';

import { Employee } from './employee.entity';
import { toEmployeeView } from './employee.mapper';

const BCRYPT_ROUNDS = 12;

// Compared against when the email is unknown so that a miss costs the same as a wrong
// password; otherwise response timing reveals which emails are registered.
const DUMMY_HASH = '$2b$12$g4hMNmxe/AhynWwuDrlrTOmp2cOz1uUZy5QTcjWYY/.BRGdWGJGVi';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly employees: Repository<Employee>,
  ) {}

  async create(dto: CreateEmployeeDto): Promise<EmployeeView> {
    await this.assertCodeAvailable(dto.employeeCode);
    await this.assertEmailAvailable(dto.email);

    const employee = this.employees.create({
      employeeCode: dto.employeeCode,
      name: dto.name,
      email: dto.email,
      role: dto.role,
      passwordHash: await hash(dto.password, BCRYPT_ROUNDS),
    });

    return toEmployeeView(await this.employees.save(employee));
  }

  async findAll({ page, limit, search }: ListEmployeesDto): Promise<Paginated<EmployeeView>> {
    const [employees, total] = await this.employees.findAndCount({
      where: search ? searchConditions(search) : undefined,
      // UUIDv7 ids are time-ordered, so this is newest-first and stable across pages.
      order: { id: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items: employees.map(toEmployeeView), total, page, limit };
  }

  async findOne(id: string): Promise<EmployeeView> {
    return toEmployeeView(await this.findOrFail(id));
  }

  async update({ id, password, ...changes }: UpdateEmployeePayload): Promise<EmployeeView> {
    const employee = await this.findOrFail(id);

    if (changes.email && changes.email !== employee.email) {
      await this.assertEmailAvailable(changes.email, id);
    }

    Object.assign(employee, omitUndefined(changes));
    if (password) {
      employee.passwordHash = await hash(password, BCRYPT_ROUNDS);
    }

    return toEmployeeView(await this.employees.save(employee));
  }

  async remove(id: string): Promise<EmployeeView> {
    const employee = await this.findOrFail(id);
    return toEmployeeView(await this.employees.softRemove(employee));
  }

  async validate({ email, password }: ValidateCredentialsDto): Promise<EmployeeView> {
    const employee = await this.employees
      .createQueryBuilder('employee')
      .addSelect('employee.passwordHash')
      .where('employee.email = :email', { email })
      .getOne();

    const passwordMatches = await compare(password, employee?.passwordHash ?? DUMMY_HASH);
    if (!employee || !passwordMatches || !employee.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return toEmployeeView(employee);
  }

  private async findOrFail(id: string): Promise<Employee> {
    const employee = await this.employees.findOneBy({ id });
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }
    return employee;
  }

  // Deleted rows still hold their code and email in the unique indexes, so they count as taken.
  private async assertCodeAvailable(employeeCode: string): Promise<void> {
    if (await this.employees.exists({ where: { employeeCode }, withDeleted: true })) {
      throw new ConflictException('Employee code is already in use');
    }
  }

  private async assertEmailAvailable(email: string, exceptId?: string): Promise<void> {
    const where: FindOptionsWhere<Employee> = exceptId ? { email, id: Not(exceptId) } : { email };
    if (await this.employees.exists({ where, withDeleted: true })) {
      throw new ConflictException('Email is already in use');
    }
  }
}

function searchConditions(search: string): FindOptionsWhere<Employee>[] {
  const pattern = Like(`%${escapeLike(search)}%`);
  return [{ name: pattern }, { email: pattern }, { employeeCode: pattern }];
}

function omitUndefined<T extends object>(value: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, field]) => field !== undefined),
  ) as Partial<T>;
}
