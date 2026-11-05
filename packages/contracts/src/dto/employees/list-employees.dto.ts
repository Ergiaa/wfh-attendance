import { IsOptional, IsString, MaxLength } from 'class-validator';

import { PaginationDto } from '../common/pagination.dto';
import { Trim } from '../common/transforms';

export class ListEmployeesDto extends PaginationDto {
  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(100)
  search?: string;
}
