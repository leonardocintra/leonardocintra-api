import { Controller, Get } from '@nestjs/common';
import type { LeadsService } from './leads.service';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  getAllLeads() {
    return this.leadsService.findAll();
  }
}
