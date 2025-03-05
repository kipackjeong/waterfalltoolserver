import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    description: 'Authentication token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Token type',
    example: 'Bearer',
  })
  tokenType: string;

  @ApiProperty({
    description: 'User ID',
    example: 'abc123',
  })
  userId: string;

  @ApiPropertyOptional({
    description: 'User email',
    example: 'user@example.com',
  })
  email?: string;

  @ApiPropertyOptional({
    description: 'User display name',
    example: 'John Doe',
  })
  displayName?: string;

  @ApiPropertyOptional({
    description: 'User photo URL',
    example: 'https://example.com/photo.jpg',
  })
  photoURL?: string;
}
