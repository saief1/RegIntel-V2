import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class MfaConfirmEnrollDto {
  @ApiProperty({ example: '123456' })
  @IsString()
  @Matches(/^\d{6}$/)
  code!: string;
}

export class MfaDisableDto {
  @ApiPropertyOptional({ example: '123456' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{6}$/)
  code?: string;

  @ApiPropertyOptional({ example: 'ABCD-EFGH-IJKL' })
  @IsOptional()
  @IsString()
  @Length(8, 64)
  recoveryCode?: string;
}

export class MfaVerifyLoginDto {
  @ApiProperty({ description: 'Short-lived MFA challenge JWT from login' })
  @IsString()
  @IsNotEmpty()
  mfaChallengeToken!: string;

  @ApiPropertyOptional({ example: '123456' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{6}$/)
  code?: string;

  @ApiPropertyOptional({ example: 'ABCD-EFGH-IJKL' })
  @IsOptional()
  @IsString()
  @Length(8, 64)
  recoveryCode?: string;

  @ApiPropertyOptional({
    description: 'When true, trust this browser for MFA skip (remember device)',
  })
  @IsOptional()
  @IsBoolean()
  rememberBrowser?: boolean;

  @ApiPropertyOptional({ example: 'MacBook Pro · Chrome' })
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

export class MfaRegenerateRecoveryDto {
  @ApiProperty({ example: '123456' })
  @IsString()
  @Matches(/^\d{6}$/)
  code!: string;
}
