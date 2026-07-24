import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateNotesDto {
  @ApiProperty({
    example: 'Strong technical skills. Schedule second interview.',
    description: 'Internal notes for this applicant. Maximum 1000 characters.',
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty({ message: 'Notes cannot be empty' })
  @MaxLength(1000, { message: 'Notes must not exceed 1000 characters' })
  notes: string;
}
