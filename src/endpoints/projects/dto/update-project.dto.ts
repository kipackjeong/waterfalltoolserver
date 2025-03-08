import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateProjectDto {
  @ApiPropertyOptional({
    description: 'Project name',
    example: 'My Project',
  })
  @IsString({ message: 'Name must be a string' })
  @IsOptional()
  name?: string;

  @IsString({ message: 'User ID must be a string' })
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({
    description: 'SQL Server view models',
  })

  @IsOptional()
  sqlServers?: any[];
  @ApiProperty({
    description: 'Project owner ID',
    example: 'user123',
  })

  @ApiPropertyOptional({
    description: 'Whether the project is active',
    example: true,
  })
  @IsBoolean({ message: 'IsActive must be a boolean' })
  @IsOptional()
  isActive?: boolean;
}
