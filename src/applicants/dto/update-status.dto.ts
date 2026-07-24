import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApplicationStatus } from '@prisma/client';

export class UpdateStatusDto {
  @ApiProperty({
    enum: ApplicationStatus,
    example: ApplicationStatus.Shortlisted,
    description: 'New application status. Note: Cannot transition directly from Rejected to Accepted.',
  })
  @IsEnum(ApplicationStatus, {
    message: `Status must be one of: ${Object.values(ApplicationStatus).join(', ')}`,
  })
  @IsNotEmpty()
  status: ApplicationStatus;
}
