import { Module } from '@nestjs/common';
import { PortaoService } from './portao.service';
import { PortaoController } from './portao.controller';
import { LeadsModule } from 'src/leads/leads.module';
import { MqttModule } from 'src/mqtt/mqtt.module';

@Module({
  controllers: [PortaoController],
  providers: [PortaoService],
  imports: [LeadsModule, MqttModule],
})
export class PortaoModule {}
