import { ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationStatus, InternshipTrack } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export type SortField = 'createdAt' | 'lastName' | 'firstName' | 'status' | 'updatedAt';
export type SortOrder = 'asc' | 'desc';

export class QueryApplicantsDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number (1-indexed)', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, description: 'Number of items per page (max 100)', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ example: 'jane', description: 'Search by first name, last name, or email' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ApplicationStatus, description: 'Filter by application status' })
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @ApiPropertyOptional({ enum: InternshipTrack, description: 'Filter by internship track' })
  @IsOptional()
  @IsEnum(InternshipTrack)
  track?: InternshipTrack;

  @ApiPropertyOptional({
    example: 'createdAt',
    description: 'Field to sort by',
    enum: ['createdAt', 'updatedAt', 'lastName', 'firstName', 'status'],
  })
  @IsOptional()
  @IsString()
  sortBy?: SortField = 'createdAt';

  @ApiPropertyOptional({ example: 'desc', description: 'Sort direction', enum: ['asc', 'desc'] })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.toLowerCase() : value,
  )
  @IsEnum(['asc', 'desc'])
  sortOrder?: SortOrder = 'desc';
}
