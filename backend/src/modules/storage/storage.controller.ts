import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiHeader,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AttachmentOwnerType } from '@prisma/client';
import { Request, Response } from 'express';
import { memoryStorage } from 'multer';
import { OrganizationGuard } from '../../common/guards/organization.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StorageService } from './storage.service';

type Uploaded = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

@ApiTags('storage')
@ApiBearerAuth()
@ApiHeader({ name: 'X-Organization-Id', required: true })
@UseGuards(JwtAuthGuard, OrganizationGuard)
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Get()
  @ApiOperation({ operationId: 'storageList', summary: 'List storage objects' })
  list(
    @Req() req: Request,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.storageService.list(
      req.organizationId!,
      page ? Number(page) : undefined,
      pageSize ? Number(pageSize) : undefined,
    );
  }

  @Get('attachments/:ownerType/:ownerId')
  @ApiOperation({
    operationId: 'storageListAttachments',
    summary: 'List attachments for an owner',
  })
  listAttachments(
    @Req() req: Request,
    @Param('ownerType') ownerType: AttachmentOwnerType,
    @Param('ownerId', ParseUUIDPipe) ownerId: string,
  ) {
    return this.storageService.listAttachments(
      req.organizationId!,
      ownerType,
      ownerId,
    );
  }

  @Post('upload')
  @ApiOperation({ operationId: 'storageUpload', summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        ownerType: {
          type: 'string',
          enum: Object.values(AttachmentOwnerType),
        },
        ownerId: { type: 'string', format: 'uuid' },
        label: { type: 'string' },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 25 * 1024 * 1024 },
    }),
  )
  upload(@Req() req: Request, @UploadedFile() file: Uploaded) {
    const ownerType = req.body?.ownerType as AttachmentOwnerType | undefined;
    const ownerId = req.body?.ownerId as string | undefined;
    const label = req.body?.label as string | undefined;
    return this.storageService.upload(
      req.organizationId!,
      req.user!.userId,
      file,
      { ownerType, ownerId, label },
    );
  }

  @Get(':id')
  @ApiOperation({ operationId: 'storageGet', summary: 'Get storage metadata' })
  get(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    return this.storageService.get(req.organizationId!, id);
  }

  @Get(':id/download')
  @ApiOperation({
    operationId: 'storageDownload',
    summary: 'Download file bytes',
  })
  async download(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const { object, buffer } = await this.storageService.download(
      req.organizationId!,
      id,
    );
    res.setHeader('Content-Type', object.contentType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${object.filename}"`,
    );
    res.send(buffer);
  }

  @Get(':id/signed-url')
  @ApiOperation({
    operationId: 'storageSignedUrl',
    summary: 'Create a short-lived signed URL',
  })
  signedUrl(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('expiresIn') expiresIn?: string,
  ) {
    return this.storageService.signedUrl(
      req.organizationId!,
      id,
      expiresIn ? Number(expiresIn) : 3600,
    );
  }

  @Delete(':id')
  @ApiOperation({
    operationId: 'storageDelete',
    summary: 'Delete storage object',
  })
  remove(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    return this.storageService.remove(
      req.organizationId!,
      req.user!.userId,
      id,
    );
  }
}
