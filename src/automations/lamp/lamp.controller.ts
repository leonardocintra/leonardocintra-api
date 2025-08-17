import { Body, Controller, Get, Post } from '@nestjs/common';
import { LampService } from './lamp.service';

@Controller('lamp')
export class LampController {
  constructor(private readonly lampService: LampService) {}

  @Post('toggle')
  toggleLamp(@Body() body: { status: 'on' | 'off' }) {
    return this.lampService.toggleLamp(body.status);
  }

  @Get('status')
  getLampStatus() {
    return this.lampService.getLampStatus();
  }
}
