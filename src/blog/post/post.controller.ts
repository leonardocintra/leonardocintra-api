import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTokenGuard } from 'src/auth/guards/api-token.guard';
import { IsPublic } from 'src/decorators/public/public.decorator';
import { CreatePostDto } from '../dto/create-post.dto';
import { PostService } from './post.service';

@Controller('post')
@IsPublic()
@UseGuards(ApiTokenGuard)
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  findAll() {
    return this.postService.findAll();
  }

  @Post()
  create(@Body() createPostDto: CreatePostDto) {
    return this.postService.create(createPostDto);
  }
}
