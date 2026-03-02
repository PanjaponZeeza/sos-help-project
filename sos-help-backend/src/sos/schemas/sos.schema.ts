import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SosDocument = HydratedDocument<Sos>;

@Schema({ timestamps: true })
export class Sos {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  requesterId: Types.ObjectId; // เชื่อมโยงกับ User ที่ปักหมุด

  @Prop({ required: true })
  latitude: number; // พิกัดละติจูด

  @Prop({ required: true })
  longitude: number; // พิกัดลองจิจูด

  @Prop({ required: true })
  detail: string; // รายละเอียดความต้องการ (เช่น อาหาร, ยา)

  @Prop({ required: true })
  numberOfPeople: number; // จำนวนคนที่รอความช่วยเหลือ

  @Prop({ default: 'pending', enum: ['pending', 'completed'] })
  status: string; // สถานะหมุด
}

export const SosSchema = SchemaFactory.createForClass(Sos);