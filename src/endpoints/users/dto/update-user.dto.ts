import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'User first name',
    example: 'John',
  })
  @IsString({ message: 'First name must be a string' })
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({
    description: 'User last name',
    example: 'Doe',
  })
  @IsString({ message: 'Last name must be a string' })
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({
    description: 'User display name',
    example: 'John Doe',
  })
  @IsString({ message: 'Display name must be a string' })
  @IsOptional()
  displayName?: string;

  @ApiPropertyOptional({
    description: 'User photo URL',
    example: 'https://example.com/photo.jpg',
  })
  @IsString({ message: 'Photo URL must be a string' })
  @IsOptional()
  photoURL?: string;

  @ApiPropertyOptional({
    description: 'User phone number',
    example: '+1234567890',
  })
  @IsString({ message: 'Phone number must be a string' })
  @IsOptional()
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Authentication provider',
    example: 'email',
  })
  @IsString({ message: 'Provider must be a string' })
  @IsOptional()
  provider?: string;

  @ApiPropertyOptional({
    description: 'User role',
    example: 'user',
  })
  @IsString({ message: 'Role must be a string' })
  @IsOptional()
  role?: string;

  @ApiPropertyOptional({
    description: 'Whether the user is active',
    example: true,
  })
  @IsBoolean({ message: 'IsActive must be a boolean' })
  @IsOptional()
  isActive?: boolean;
}
