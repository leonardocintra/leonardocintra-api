import { Module } from '@nestjs/common';
import { ApiTokenGuard } from 'src/auth/guards/api-token.guard';
import { PadreRamonService } from './padre-ramon.service';

@Module({
  controllers: [],
  providers: [PadreRamonService, ApiTokenGuard],
})
export class PadreRamonModule { }
