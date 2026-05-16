import { Module } from '@nestjs/common';
import { LeadsModule } from 'src/leads/leads.module';
import { MqttModule } from 'src/mqtt/mqtt.module';
import { PortaoController } from './portao.controller';
import { PortaoService } from './portao.service';

@Module({
  controllers: [PortaoController],
  providers: [PortaoService],
  imports: [LeadsModule, MqttModule],
})
export class PortaoModule {}
