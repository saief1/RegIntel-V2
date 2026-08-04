import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class TrustDeviceDto {
  @ApiPropertyOptional({
    description: 'Friendly device label',
    example: 'MacBook Pro · Chrome',
  })
  @IsOptional()
  @IsString()
  @Length(1, 120)
  name?: string;

  @ApiPropertyOptional({
    description: 'Optional client fingerprint string (hashed server-side)',
  })
  @IsOptional()
  @IsString()
  @Length(8, 256)
  fingerprint?: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'CurrentPassword123!' })
  @IsString()
  @Length(8, 128)
  currentPassword!: string;

  @ApiProperty({ example: 'NewPassword456!' })
  @IsString()
  @Length(8, 128)
  newPassword!: string;
}

export class MfaVerifyLoginWithTrustDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  rememberBrowser?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 120)
  deviceName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(8, 256)
  fingerprint?: string;
}
