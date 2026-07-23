import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DrizzleService } from '../database/drizzle.service';
import { categories } from '../database/schema';

@Injectable()
export class CategoriesService {
  constructor(private drizzle: DrizzleService) {}

  async findAll() {
    return this.drizzle.query.categories.findMany();
  }

  async create(dto: { name: string }) {
    const [category] = await this.drizzle.client
      .insert(categories)
      .values(dto)
      .returning();
    return category;
  }

  async update(id: string, dto: { name: string }) {
    const [category] = await this.drizzle.client
      .update(categories)
      .set(dto)
      .where(eq(categories.id, id))
      .returning();
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async remove(id: string) {
    await this.drizzle.client.delete(categories).where(eq(categories.id, id));
  }
}
