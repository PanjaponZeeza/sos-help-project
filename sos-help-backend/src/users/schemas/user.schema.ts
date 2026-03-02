import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;
export type UserRole = 'user' | 'admin'; // แยกสิทธิ์

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, select: false }) // ซ่อนรหัสผ่านเพื่อความปลอดภัย
  passwordHash: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: true, default: 'user' })
  role: UserRole;
}

export const UserSchema = SchemaFactory.createForClass(User);