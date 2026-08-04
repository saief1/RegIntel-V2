import { ApiProperty } from '@nestjs/swagger';
import { AppRole } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class AssignRoleDto {
  @ApiProperty({
    enum: ['ORG_ADMIN', 'COMPLIANCE_OFFICER', 'MANAGER', 'ANALYST', 'VIEWER'],
  })
  @IsEnum(AppRole)
  appRole!: AppRole;
}
