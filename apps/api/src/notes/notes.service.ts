import { Injectable, NotFoundException } from '@nestjs/common';
import { and, eq, ilike } from 'drizzle-orm';
import { DrizzleService } from '../database/drizzle.service';
import { notes, noteCategories, noteTags, noteUrls } from '../database/schema';
import { AttachmentsService } from '../attachments/attachments.service';
import { CreateNoteDto } from './dto/create-note.dto';

@Injectable()
export class NotesService {
  constructor(
    private drizzle: DrizzleService,
    private attachmentsService: AttachmentsService,
  ) {}

  async create(dto: CreateNoteDto, userId: string) {
    const tempAttachments = dto.attachments || [];

    try {
      const [note] = await this.drizzle.client
        .insert(notes)
        .values({
          title: dto.title,
          slug: dto.slug,
          summary: dto.summary,
          content: dto.content,
          status: dto.status as any,
          userId,
          updatedBy: userId,
        })
        .returning();

      if (dto.categoryIds?.length) {
        await this.drizzle.client.insert(noteCategories).values(
          dto.categoryIds.map((categoryId) => ({
            noteId: note.id,
            categoryId,
          })),
        );
      }

      if (dto.tagIds?.length) {
        await this.drizzle.client
          .insert(noteTags)
          .values(dto.tagIds.map((tagId) => ({ noteId: note.id, tagId })));
      }

      if (dto.urls?.length) {
        await this.drizzle.client
          .insert(noteUrls)
          .values(dto.urls.map((url) => ({ noteId: note.id, ...url })));
      }

      for (const fileMeta of tempAttachments) {
        await this.attachmentsService.moveToStorage(note.id, fileMeta);
      }

      return this.findOne(note.id);
    } catch (error) {
      await Promise.all(
        tempAttachments.map((f) =>
          this.attachmentsService.deleteTempFile(f.path),
        ),
      );
      throw error;
    }
  }

  async findAll(params: {
    search?: string;
    categoryIds?: string;
    tagIds?: string;
    authorId?: string;
  }) {
    const conditions = [];

    if (params.search) {
      conditions.push(ilike(notes.title, `%${params.search}%`));
      conditions.push(ilike(notes.summary, `%${params.search}%`));
      conditions.push(ilike(notes.content, `%${params.search}%`));
    }
    if (params.authorId) {
      conditions.push(eq(notes.userId, params.authorId));
    }

    let noteRecords = await this.drizzle.query.notes.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        categories: { with: { category: true } },
        tags: { with: { tag: true } },
        urls: true, // <-- ADD THIS
        attachments: true, // <-- ADD THIS
        user: true,
      },
    });

    if (params.categoryIds) {
      const cIds = params.categoryIds.split(',');
      noteRecords = noteRecords.filter((n) =>
        n.categories.some((nc) => cIds.includes(nc.categoryId)),
      );
    }

    if (params.tagIds) {
      const tIds = params.tagIds.split(',');
      noteRecords = noteRecords.filter((n) =>
        n.tags.some((nt) => tIds.includes(nt.tagId)),
      );
    }

    return noteRecords;
  }

  async findOne(id: string) {
    const note = await this.drizzle.query.notes.findFirst({
      where: eq(notes.id, id),
      with: {
        categories: { with: { category: true } },
        tags: { with: { tag: true } },
        urls: true,
        attachments: true,
        user: true,
      },
    });
    if (!note) throw new NotFoundException('Note not found');
    return note;
  }

  async update(id: string, dto: Partial<CreateNoteDto>, userId: string) {
    await this.findOne(id);

    await this.drizzle.client
      .update(notes)
      .set({
        title: dto.title,
        slug: dto.slug,
        summary: dto.summary,
        content: dto.content,
        status: dto.status as any,
        updatedBy: userId,
        updatedAt: new Date(),
      })
      .where(eq(notes.id, id));

    if (dto.categoryIds) {
      await this.drizzle.client
        .delete(noteCategories)
        .where(eq(noteCategories.noteId, id));
      if (dto.categoryIds.length > 0) {
        await this.drizzle.client
          .insert(noteCategories)
          .values(
            dto.categoryIds.map((categoryId) => ({ noteId: id, categoryId })),
          );
      }
    }

    if (dto.tagIds) {
      await this.drizzle.client.delete(noteTags).where(eq(noteTags.noteId, id));
      if (dto.tagIds.length > 0) {
        await this.drizzle.client
          .insert(noteTags)
          .values(dto.tagIds.map((tagId) => ({ noteId: id, tagId })));
      }
    }

    // Handle URLs update
    if (dto.urls) {
      await this.drizzle.client.delete(noteUrls).where(eq(noteUrls.noteId, id));
      if (dto.urls.length > 0) {
        await this.drizzle.client
          .insert(noteUrls)
          .values(dto.urls.map((url) => ({ noteId: id, ...url })));
      }
    }

    // Handle Attachments (Move from temp to storage and save to DB)
    if (dto.attachments && dto.attachments.length > 0) {
      for (const fileMeta of dto.attachments) {
        await this.attachmentsService.moveToStorage(id, fileMeta);
      }
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    const note = await this.findOne(id);
    for (const att of note.attachments) {
      await this.attachmentsService.deleteTempFile(att.path);
    }
    await this.drizzle.client.delete(notes).where(eq(notes.id, id));
    return { success: true };
  }
}
