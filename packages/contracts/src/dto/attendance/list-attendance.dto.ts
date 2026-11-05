import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

import { IsDateOnly } from '../common/is-date-only';
import { PaginationDto } from '../common/pagination.dto';
import { Trim } from '../common/transforms';

export class ListMyAttendanceDto extends PaginationDto {
  @IsOptional()
  @IsDateOnly()
  dateFrom?: string;

  @IsOptional()
  @IsDateOnly()
  dateTo?: string;
}

export class ListMyAttendancePayload extends ListMyAttendanceDto {
  @IsUUID('7')
  employeeId: string;
}

export class ListAttendanceDto extends ListMyAttendanceDto {
  @IsOptional()
  @IsUUID('7')
  employeeId?: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(100)
  search?: string;
}
