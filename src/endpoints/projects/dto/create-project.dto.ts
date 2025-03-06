import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsBoolean, MinLength } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({
    description: 'Project name',
    example: 'My Project',
  })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  // @ApiPropertyOptional({
  //   description: 'Project description',
  //   example: 'A description of my project',
  // })
  // @IsString({ message: 'Description must be a string' })
  // @IsOptional()
  // description?: string;

  @ApiProperty({
    description: 'Project owner ID',
    example: 'user123',
  })
  @IsString({ message: 'User ID must be a string' })
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({
    description: 'SQL Server view models',
  })
  @IsOptional()
  sqlServers?: any[];
}
