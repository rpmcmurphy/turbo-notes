import { Module } from '@nestjs/common';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { AttachmentsModule } from '../attachments/attachments.module';
import { DatabaseModule } from '../database/database.module';
import { GeminiModule } from '../gemini/gemini.module';

@Module({
  imports: [AttachmentsModule, DatabaseModule, GeminiModule],
  controllers: [NotesController],
  providers: [NotesService],
})
export class NotesModule {}
