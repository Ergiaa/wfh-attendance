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
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import { Role, type AttendanceView, type Paginated } from '@wfh/contracts';
import { AttendanceIdDto, ListAttendanceDto, ListMyAttendanceDto } from '@wfh/contracts/dto';
import { createReadStream } from 'node:fs';

import type { AuthUser } from '../auth/auth-user';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { ResponseMessage } from '../common/http/response-message.decorator';
import { ApiEnvelope, ApiErrors } from '../docs/decorators';
import { AttendanceModel } from '../docs/models';
import { ImageFileValidator } from '../photos/image-file.validator';
import { AttendanceService } from './attendance.service';

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

@ApiTags('Attendance')
@ApiBearerAuth()
@ApiErrors(401)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendance: AttendanceService) {}

  @Post('check-in')
  @ResponseMessage('Checked in')
  @ApiOperation({
    summary: 'Check in for today',
    description:
      'The server records the time. One check-in per employee per work day (in WORK_TIMEZONE).',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['photo'],
      properties: {
        photo: { type: 'string', format: 'binary', description: 'JPEG, PNG or WebP, at most 5 MB' },
      },
    },
  })
  @ApiEnvelope(AttendanceModel, { status: 201 })
  @ApiErrors(400, 409, 413)
  @UseInterceptors(FileInterceptor('photo', { limits: { fileSize: MAX_PHOTO_BYTES, files: 1 } }))
  checkIn(
    @CurrentUser() user: AuthUser,
    @UploadedFile(new ParseFilePipe({ validators: [new ImageFileValidator()] }))
    photo: Express.Multer.File,
  ): Promise<AttendanceView> {
    return this.attendance.checkIn(user, photo.buffer);
  }

  @Get('me')
  @ApiOperation({ summary: 'My attendance history' })
  @ApiEnvelope(AttendanceModel, { paginated: true })
  @ApiErrors(400)
  findMine(
    @CurrentUser() user: AuthUser,
    @Query() query: ListMyAttendanceDto,
  ): Promise<Paginated<AttendanceView>> {
    return this.attendance.findMine(user, query);
  }

  @Get()
  @Roles(Role.HRD_ADMIN)
  @ApiOperation({ summary: 'All attendance (HRD)', description: 'View only.' })
  @ApiEnvelope(AttendanceModel, { paginated: true })
  @ApiErrors(400, 403)
  findAll(@Query() query: ListAttendanceDto): Promise<Paginated<AttendanceView>> {
    return this.attendance.findAll(query);
  }

  @Get(':id/photo')
  @Header('Cache-Control', 'private, max-age=3600')
  @ApiOperation({ summary: 'Check-in photo', description: 'HRD, or the employee who owns it.' })
  @ApiProduces('image/jpeg', 'image/png', 'image/webp')
  @ApiOkResponse({ schema: { type: 'string', format: 'binary' } })
  @ApiErrors(400, 404)
  async photo(
    @CurrentUser() user: AuthUser,
    @Param() { id }: AttendanceIdDto,
  ): Promise<StreamableFile> {
    const { path, mimeType } = await this.attendance.photo(user, id);
    return new StreamableFile(createReadStream(path), { type: mimeType, disposition: 'inline' });
  }
}
