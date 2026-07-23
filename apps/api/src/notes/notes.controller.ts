import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';

@ApiTags('Notes')
@Controller('notes')
export class NotesController {
  constructor(private service: NotesService) {}

  @Get()
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({
    name: 'categoryIds',
    required: false,
    description: 'Comma separated IDs',
  })
  @ApiQuery({
    name: 'tagIds',
    required: false,
    description: 'Comma separated IDs',
  })
  @ApiQuery({ name: 'authorId', required: false })
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  create(@Body() dto: CreateNoteDto, @CurrentUser() user: any) {
    return this.service.create(dto, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateNoteDto>,
    @CurrentUser() user: any,
  ) {
    return this.service.update(id, dto, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
