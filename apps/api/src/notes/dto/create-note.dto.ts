import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUrlDto {
  @ApiProperty({ example: 'NestJS Docs', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'https://docs.nestjs.com' })
  @IsString()
  url!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateNoteDto {
  @ApiProperty({ example: 'My First Note' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 'my-first-note', required: false })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiProperty({ example: 'Markdown content here...' })
  @IsString()
  content!: string;

  @ApiProperty({ enum: ['draft', 'published', 'archived'], default: 'draft' })
  @IsEnum(['draft', 'published', 'archived'])
  status!: string;

  @ApiProperty({
    type: [String],
    required: false,
    description: 'Array of Category IDs',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryIds?: string[];

  @ApiProperty({
    type: [String],
    required: false,
    description: 'Array of Tag IDs',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagIds?: string[];

  @ApiProperty({ type: [CreateUrlDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateUrlDto)
  urls?: CreateUrlDto[];

  @ApiProperty({
    type: 'array',
    items: { type: 'object' },
    required: false,
    description: 'Temp file metadata from /attachments/upload',
  })
  @IsOptional()
  @IsArray()
  attachments?: any[];
}
