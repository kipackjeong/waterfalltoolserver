import { Injectable } from '@nestjs/common';
import { config, ConnectionPool } from 'mssql';

@Injectable()
export class MssqlService {

  private async connect(config: config): Promise<ConnectionPool | null> {
    const dbConfig = config;
    const pool = new ConnectionPool(dbConfig);
    await pool.connect();
    return pool;
  }

  private async close(pool: ConnectionPool): Promise<void> {
    if (pool) {
      await pool.close();
    }
  }

  async query<T>(config: config, query: string): Promise<T[]> {
    try {
      const pool = await this.connect(config);
      if (!pool) {
        throw new Error(`Failed to connect to database: ${config}`);
      }

      const request = pool.request();
      const result = await request.query(query);

      await this.close(pool);

      return result.recordset as T[];
    } catch (error) {
      throw error;
    }
  }
}