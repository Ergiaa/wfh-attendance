import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

import { PaginationDto } from '../common/pagination.dto';
import { Trim } from '../common/transforms';

export class ListEmployeesDto extends PaginationDto {
  @ApiPropertyOptional({ maxLength: 100, description: 'Matches name, email or employee code' })
  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(100)
  search?: string;
}
