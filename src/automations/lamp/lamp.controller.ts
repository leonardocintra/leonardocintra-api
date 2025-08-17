import { Controller, Get, Query } from '@nestjs/common';
import { LampService } from './lamp.service';

const ESP32_IP = 'http://192.168.15.50';

@Controller('lamp')
export class LampController {
  constructor(private readonly lampService: LampService) {}

  @Get('on')
  async turnOn() {
    await fetch(`${ESP32_IP}/on`);
    return { status: 'on' };
  }

  @Get('off')
  async turnOff() {
    await fetch(`${ESP32_IP}/off`);
    return { status: 'off' };
  }

  @Get('morse')
  async turnMorse(@Query('msg') msg: string) {
    await fetch(`${ESP32_IP}/morse?msg=${msg}`);
    return { status: 'morse', message: msg };
  }
}
