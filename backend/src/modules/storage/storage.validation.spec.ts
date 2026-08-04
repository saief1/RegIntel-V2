import { BadRequestException } from '@nestjs/common';
import { validateUploadFile } from './storage.validation';

describe('validateUploadFile', () => {
  it('accepts a valid PDF upload', () => {
    expect(() =>
      validateUploadFile({
        originalname: 'policy.pdf',
        mimetype: 'application/pdf',
        size: 128,
        buffer: Buffer.from('%PDF'),
      }),
    ).not.toThrow();
  });

  it('rejects missing files', () => {
    expect(() => validateUploadFile(undefined)).toThrow(BadRequestException);
  });

  it('rejects disallowed mime types', () => {
    expect(() =>
      validateUploadFile({
        originalname: 'evil.exe',
        mimetype: 'application/x-msdownload',
        size: 10,
        buffer: Buffer.from('MZ'),
      }),
    ).toThrow(BadRequestException);
  });
});
