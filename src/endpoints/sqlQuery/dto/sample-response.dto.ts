import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SampleResponseDto {
  @ApiProperty({
    description: 'Sample ID',
    example: 'sample123',
  })
  id: string;

  @ApiProperty({
    description: 'Sample name',
    example: 'Sample Name',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Sample description',
    example: 'A description of my sample',
  })
  description?: string;

  @ApiProperty({
    description: 'Sample owner ID',
    example: 'user123',
  })
  userId: string;

  @ApiPropertyOptional({
    description: 'Sample tags',
    example: ['tag1', 'tag2'],
  })
  tags?: string[];

  @ApiProperty({
    description: 'Whether the sample is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-03-05T12:00:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-03-05T12:30:00.000Z',
  })
  updatedAt: string;
}
