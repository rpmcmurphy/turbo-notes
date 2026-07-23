import { Injectable } from '@nestjs/common';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

@Injectable()
export class DrizzleService {
  private db: NodePgDatabase<typeof schema>;
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    this.db = drizzle(this.pool, { schema });
  }

  get query() {
    return this.db.query;
  }

  get client() {
    return this.db;
  }
}
