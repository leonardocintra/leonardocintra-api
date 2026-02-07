import slugify from 'slugify';
import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/commons/BaseService';
import { CreatePostDto } from '../dto/create-post.dto';

@Injectable()
export class PostService extends BaseService {
  async findAll() {
    return await this.prismaService.posts.findMany({
      orderBy: { createdAt: 'desc' },
      include: { postContents: true },
    });
  }

  async create(dto: CreatePostDto) {
    const baseSlug = slugify(dto.title, { lower: true, strict: true });
    const slug = await this.ensureUniqueSlug(baseSlug);

    this.logger.log(`Creating a post with slug: ${slug}`);

    const post = await this.prismaService.posts.create({
      data: {
        slug,
        title: dto.title,
      },
    });

    try {
      await this.prismaService.postContents.create({
        data: {
          contentMarkdown: dto.content,
          postId: post.id,
        },
      });

      return {
        ...post,
        content: dto.content,
      };
    } catch (error) {
      this.logger.error(
        'Failed to create post content, rolling back post creation',
        error,
      );
      await this.prismaService.posts.delete({ where: { id: post.id } });
      throw error;
    }
  }

  private async ensureUniqueSlug(baseSlug: string) {
    let slug = baseSlug;
    let counter = 1;

    while (
      await this.prismaService.posts.findUnique({
        where: { slug },
      })
    ) {
      slug = `${baseSlug}-${counter++}`;
    }

    return slug;
  }
}
