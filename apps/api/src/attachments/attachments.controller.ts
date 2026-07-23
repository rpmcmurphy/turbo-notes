import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import * as path from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AttachmentsService } from './attachments.service';

@ApiTags('Attachments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('attachments')
export class AttachmentsController {
  constructor(private service: AttachmentsService) {}

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const tempDir = process.env.TEMP_STORAGE || './temp';
          cb(null, tempDir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + path.extname(file.originalname));
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowed = [
          'image/',
          'application/pdf',
          'application/zip',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (allowed.some((type) => file.mimetype.startsWith(type))) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Unsupported file type'), false);
        }
      },
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    // Conventional NestJS typing for Multer
    if (!file) throw new BadRequestException('File is required');
    return this.service.saveTempFile(file);
  }
}
