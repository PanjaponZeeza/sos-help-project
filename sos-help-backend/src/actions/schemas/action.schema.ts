import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ActionDocument = HydratedDocument<Action>;

@Schema({ timestamps: true })
export class Action {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  officerId: Types.ObjectId; // เจ้าหน้าที่ที่ลงพื้นที่

  @Prop({ type: Types.ObjectId, ref: 'Sos', required: true })
  sosId: Types.ObjectId; // อ้างอิงถึงหมุดที่ไปช่วย

  @Prop({ required: true })
  actionDetail: string; // รายละเอียดการช่วย (เช่น "ส่งถุงยังชีพแล้ว", "เคลื่อนย้ายผู้ป่วย")
}

export const ActionSchema = SchemaFactory.createForClass(Action);