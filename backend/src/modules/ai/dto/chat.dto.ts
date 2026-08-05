import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ChatDto {
  @ApiProperty({ example: 'What changed in FINTRAC travel rule guidance?' })
  @IsString()
  @MinLength(1)
  @MaxLength(16000)
  message!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  conversationId?: string;

  @ApiPropertyOptional({ example: 'chat' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  mode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({
    description: 'Optional context variables for prompt injection',
  })
  @IsOptional()
  @IsObject()
  context?: Record<string, string>;
}

export class CreateConversationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(64)
  mode?: string;
}
