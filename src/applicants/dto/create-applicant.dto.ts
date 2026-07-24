import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApplicationStatus, InternshipTrack } from '@prisma/client';

export class CreateApplicantDto {
  @ApiProperty({ example: 'Jane', description: 'First name of the applicant' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name of the applicant' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  lastName: string;

  @ApiProperty({ example: 'jane.doe@example.com', description: 'Unique email address' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ example: '+1-555-0199', description: 'Phone number' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiProperty({
    enum: InternshipTrack,
    example: InternshipTrack.Frontend_Development,
    description: 'Internship track applied for',
  })
  @IsEnum(InternshipTrack, {
    message: `Track must be one of: ${Object.values(InternshipTrack).join(', ')}`,
  })
  track: InternshipTrack;

  @ApiPropertyOptional({
    enum: ApplicationStatus,
    example: ApplicationStatus.Pending,
    description: 'Initial application status (defaults to Pending)',
    default: ApplicationStatus.Pending,
  })
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @ApiPropertyOptional({ example: 'https://drive.google.com/...', description: 'URL to resume/CV' })
  @IsOptional()
  @IsUrl({}, { message: 'resumeUrl must be a valid URL' })
  resumeUrl?: string;

  @ApiPropertyOptional({ example: 'I am excited to apply because...', description: 'Cover letter text' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  coverLetter?: string;

  @ApiPropertyOptional({ example: 'Strong candidate, fast learner', description: 'Internal admin notes (max 1000 chars)' })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Notes must not exceed 1000 characters' })
  notes?: string;
}
