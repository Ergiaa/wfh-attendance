import {
  Controller,
  Get,
  Header,
  Param,
  ParseFilePipe,
  Post,
  Query,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role, type AttendanceView, type Paginated } from '@wfh/contracts';
import { AttendanceIdDto, ListAttendanceDto, ListMyAttendanceDto } from '@wfh/contracts/dto';
import { createReadStream } from 'node:fs';

import type { AuthUser } from '../auth/auth-user';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { ResponseMessage } from '../common/http/response-message.decorator';
import { ImageFileValidator } from '../photos/image-file.validator';
import { AttendanceService } from './attendance.service';

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendance: AttendanceService) {}

  @Post('check-in')
  @ResponseMessage('Checked in')
  @UseInterceptors(FileInterceptor('photo', { limits: { fileSize: MAX_PHOTO_BYTES, files: 1 } }))
  checkIn(
    @CurrentUser() user: AuthUser,
    @UploadedFile(new ParseFilePipe({ validators: [new ImageFileValidator()] }))
    photo: Express.Multer.File,
  ): Promise<AttendanceView> {
    return this.attendance.checkIn(user, photo.buffer);
  }

  @Get('me')
  findMine(
    @CurrentUser() user: AuthUser,
    @Query() query: ListMyAttendanceDto,
  ): Promise<Paginated<AttendanceView>> {
    return this.attendance.findMine(user, query);
  }

  @Get()
  @Roles(Role.HRD_ADMIN)
  findAll(@Query() query: ListAttendanceDto): Promise<Paginated<AttendanceView>> {
    return this.attendance.findAll(query);
  }

  @Get(':id/photo')
  @Header('Cache-Control', 'private, max-age=3600')
  async photo(
    @CurrentUser() user: AuthUser,
    @Param() { id }: AttendanceIdDto,
  ): Promise<StreamableFile> {
    const { path, mimeType } = await this.attendance.photo(user, id);
    return new StreamableFile(createReadStream(path), { type: mimeType, disposition: 'inline' });
  }
}
