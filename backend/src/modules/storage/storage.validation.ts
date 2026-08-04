import { BadRequestException } from '@nestjs/common';

const MAX_BYTES = 25 * 1024 * 1024;

const ALLOWED_MIME = new Set([
  'application/pdf',
  'application/json',
  'text/plain',
  'text/markdown',
  'text/csv',
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/octet-stream',
]);

export function validateUploadFile(file?: {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}): asserts file is {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
} {
  if (!file) {
    throw new BadRequestException({
      code: 'FILE_REQUIRED',
      message: 'A file upload is required.',
    });
  }
  if (file.size <= 0 || file.size > MAX_BYTES) {
    throw new BadRequestException({
      code: 'FILE_SIZE_INVALID',
      message: `File must be between 1 byte and ${MAX_BYTES} bytes.`,
    });
  }
  if (!ALLOWED_MIME.has(file.mimetype)) {
    throw new BadRequestException({
      code: 'FILE_TYPE_INVALID',
      message: `Content type ${file.mimetype} is not allowed.`,
    });
  }
  if (!file.originalname || file.originalname.includes('..')) {
    throw new BadRequestException({
      code: 'FILE_NAME_INVALID',
      message: 'Filename is invalid.',
    });
  }
}
