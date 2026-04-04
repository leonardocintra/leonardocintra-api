import { Module } from '@nestjs/common';
import { CategoryService } from './category/category.service';
import { VideoService } from './video/video.service';
import { CategoryController } from './category/category.controller';

@Module({
  providers: [CategoryService, VideoService],
  controllers: [CategoryController],
})
export class GuardianTubeModule {}
