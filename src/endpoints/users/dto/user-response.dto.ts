import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: 'abc123',
  })
  id: string;

  @ApiProperty({
    description: 'User email',
    example: 'user@example.com',
  })
  email: string;

  @ApiPropertyOptional({
    description: 'User first name',
    example: 'John',
  })
  firstName?: string | null;

  @ApiPropertyOptional({
    description: 'User last name',
    example: 'Doe',
  })
  lastName?: string | null;

  @ApiPropertyOptional({
    description: 'User display name',
    example: 'John Doe',
  })
  displayName?: string;

  @ApiPropertyOptional({
    description: 'User photo URL',
    example: 'https://example.com/photo.jpg',
  })
  photoURL?: string | null;

  @ApiPropertyOptional({
    description: 'User phone number',
    example: '+1234567890',
  })
  phoneNumber?: string | null;

  @ApiPropertyOptional({
    description: 'Authentication provider',
    example: 'email',
  })
  provider?: string;

  @ApiPropertyOptional({
    description: 'User role',
    example: 'user',
  })
  role?: string;

  @ApiPropertyOptional({
    description: 'Whether the user is active',
    example: true,
  })
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'User creation timestamp',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt?: Date;

  @ApiPropertyOptional({
    description: 'User last update timestamp',
    example: '2023-01-02T00:00:00.000Z',
  })
  updatedAt?: Date;

  @ApiPropertyOptional({
    description: 'User last login timestamp',
    example: '2023-01-03T00:00:00.000Z',
  })
  lastLoginAt?: Date;
}
