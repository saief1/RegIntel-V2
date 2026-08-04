import { ApiProperty } from '@nestjs/swagger';
import { AppRole } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class AssignRoleDto {
  @ApiProperty({
    enum: [
      'ORG_ADMIN',
      'COMPLIANCE_OFFICER',
      'MANAGER',
      'ANALYST',
      'VIEWER',
      'REVIEWER',
      'EMPLOYEE',
      'GUEST',
    ],
    description:
      'AppRole key. Aliases Owner/Administrator→ORG_ADMIN are accepted via resolveRoleAlias server-side when using string role APIs.',
  })
  @IsEnum(AppRole)
  appRole!: AppRole;
}
