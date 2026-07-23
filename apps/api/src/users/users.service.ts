import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DrizzleService } from '../database/drizzle.service';
import { users } from '../database/schema';

@Injectable()
export class UsersService {
  constructor(private drizzle: DrizzleService) {}

  async findByEmail(email: string) {
    const result = await this.drizzle.query.users.findFirst({
      where: eq(users.email, email),
    });
    return result;
  }

  async findById(id: string) {
    const result = await this.drizzle.query.users.findFirst({
      where: eq(users.id, id),
    });
    return result;
  }

  async create(data: { username: string; email: string; password: string }) {
    const [user] = await this.drizzle.client
      .insert(users)
      .values(data)
      .returning();
    return user;
  }
}
