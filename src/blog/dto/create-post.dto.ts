import { IsString, MaxLength } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsString()
  content!: string;
}
