import { IsUUID } from 'class-validator';

export class AttendanceIdDto {
  @IsUUID('7')
  id: string;
}
