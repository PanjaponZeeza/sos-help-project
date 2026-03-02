import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SosService } from './sos.service';
import { SosController } from './sos.controller';
import { Sos, SosSchema } from './schemas/sos.schema';
import { AuthModule } from '../auth/auth.module'; 
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Sos.name, schema: SosSchema }]),
    AuthModule, // เพิ่มบรรทัดนี้ เพื่อให้ใช้ Guard ได้
  ],
  providers: [SosService],
  controllers: [SosController],
})
export class SosModule {}