import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';
import { DrizzleService } from '../database/drizzle.service';
import { attachments, notes } from '../database/schema';

@Injectable()
export class AttachmentsService {
  constructor(private drizzle: DrizzleService) {}

  async saveTempFile(file: Express.Multer.File) {
    // Just return metadata. Actual DB record is made when note is saved.
    return {
      originalName: file.originalname,
      filename: file.filename,
      mimetype: file.mimetype,
      path: file.path,
      size: file.size,
    };
  }

  async moveToStorage(noteId: string, fileMetadata: any) {
    const tempPath = fileMetadata.path;
    const storageDir = process.env.FILE_STORAGE || './storage';
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }

    const finalPath = path.join(storageDir, fileMetadata.filename);

    // Move file
    fs.renameSync(tempPath, finalPath);

    const [attachment] = await this.drizzle.client
      .insert(attachments)
      .values({
        noteId,
        filename: fileMetadata.filename,
        originalName: fileMetadata.originalName,
        mimetype: fileMetadata.mimetype,
        path: finalPath,
        size: fileMetadata.size,
      })
      .returning();

    return attachment;
  }

  async deleteTempFile(filePath: string) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  async remove(attachmentId: string) {
    const [attachment] = await this.drizzle.client
      .delete(attachments)
      .where(eq(attachments.id, attachmentId))
      .returning();

    if (!attachment) throw new NotFoundException('Attachment not found');

    if (fs.existsSync(attachment.path)) {
      fs.unlinkSync(attachment.path);
    }
    return { success: true };
  }
}
