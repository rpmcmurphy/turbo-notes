import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({ example: 'nestjs' })
  @IsString()
  name!: string;
}
