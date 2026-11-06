import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AttendanceIdDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('7')
  id: string;
}
