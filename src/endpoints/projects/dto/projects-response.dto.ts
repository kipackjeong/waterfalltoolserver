import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProjectResponseDto {
  @ApiProperty({
    description: 'Project ID',
    example: 'abc123',
  })
  id: string;

  @ApiProperty({
    description: 'Project name',
    example: 'My Project',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Project description',
    example: 'A description of my project',
  })
  description?: string | null;

  @ApiPropertyOptional({
    description: 'Project owner ID',
    example: 'user123',
  })
  ownerId?: string;

  @ApiPropertyOptional({
    description: 'Whether the project is active',
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
