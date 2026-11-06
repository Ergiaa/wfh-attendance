import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

import { IsDateOnly } from '../common/is-date-only';
import { PaginationDto } from '../common/pagination.dto';
import { Trim } from '../common/transforms';

export class ListMyAttendanceDto extends PaginationDto {
  @ApiPropertyOptional({
    format: 'date',
    description: 'Inclusive work date',
    example: '2026-11-01',
  })
  @IsOptional()
  @IsDateOnly()
  dateFrom?: string;

  @ApiPropertyOptional({
    format: 'date',
    description: 'Inclusive work date',
    example: '2026-11-30',
  })
  @IsOptional()
  @IsDateOnly()
  dateTo?: string;
}

export class ListMyAttendancePayload extends ListMyAttendanceDto {
  @IsUUID('7')
  employeeId: string;
}

export class ListAttendanceDto extends ListMyAttendanceDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('7')
  employeeId?: string;

  @ApiPropertyOptional({ maxLength: 100, description: 'Matches employee name or code' })
  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(100)
  search?: string;
}
