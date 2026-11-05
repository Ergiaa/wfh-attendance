import { IsUUID } from 'class-validator';

export class EmployeeIdDto {
  @IsUUID('7')
  id: string;
}
