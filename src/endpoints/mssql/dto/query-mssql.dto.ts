import { ApiProperty } from '@nestjs/swagger';
import { IsJSON, IsNotEmpty, IsObject, IsString } from 'class-validator';
import { config } from 'mssql';

export class QueryMssqlDto {
  @ApiProperty({
    description: 'SQL query',
    example: 'SELECT * FROM users',
  })
  @IsString({ message: 'Query must be a string' })
  @IsNotEmpty({ message: 'Query is required' })
  query: string;

  @ApiProperty({
    description: 'Database configuration',
    example: {
      user: 'sa',
      password: 'your_password',
      server: 'localhost',
      port: 1433,
      database: 'nestdb',
      options: {
        encrypt: true,
        trustServerCertificate: true
      }
    }
  })
  @IsObject()
  config: config;
}
