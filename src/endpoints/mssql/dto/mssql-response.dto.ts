import { ApiPropertyOptional } from '@nestjs/swagger';

export class MssqlResponseDto {
  @ApiPropertyOptional({
    description: 'Mssql tags',
    example: ['tag1', 'tag2'],
  })
  result?: string[];
}
