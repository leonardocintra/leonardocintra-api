import { Module } from '@nestjs/common';
import { ApiTokenGuard } from 'src/auth/guards/api-token.guard';
import { PadreRamonController } from './padre-ramon.controller';
import { PadreRamonService } from './padre-ramon.service';

@Module({
  controllers: [PadreRamonController],
  providers: [PadreRamonService, ApiTokenGuard],
})
export class PadreRamonModule { }
