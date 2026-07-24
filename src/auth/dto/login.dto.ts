import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@intern.dev', description: 'Administrator email address' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Admin@1234', description: 'Administrator password' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
