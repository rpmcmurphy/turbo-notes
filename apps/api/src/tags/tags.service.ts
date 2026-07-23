import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DrizzleService } from '../database/drizzle.service';
import { tags } from '../database/schema';

@Injectable()
export class TagsService {
  constructor(private drizzle: DrizzleService) {}

  async findAll() {
    return this.drizzle.query.tags.findMany();
  }

  async create(dto: { name: string }) {
    const [tag] = await this.drizzle.client
      .insert(tags)
      .values(dto)
      .returning();
    return tag;
  }

  async update(id: string, dto: { name: string }) {
    const [tag] = await this.drizzle.client
      .update(tags)
      .set(dto)
      .where(eq(tags.id, id))
      .returning();
    if (!tag) throw new NotFoundException('Tag not found');
    return tag;
  }

  async remove(id: string) {
    await this.drizzle.client.delete(tags).where(eq(tags.id, id));
  }
}
