import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sos, SosDocument } from './schemas/sos.schema';
import { CreateSosDto } from './dto/create-sos.dto';

@Injectable()
export class SosService {
  constructor(@InjectModel(Sos.name) private sosModel: Model<SosDocument>) {}

  // 1. สร้างหมุดขอความช่วยเหลือใหม่
  async create(dto: CreateSosDto, userId: string) {
    const newSos = new this.sosModel({
      ...dto,
      requesterId: userId,
    });
    return await newSos.save();
  }

  // 2. ดึงข้อมูลทั้งหมด (สำหรับ Admin) เรียงตามความเร่งด่วน
  async findAll() {
    return await this.sosModel.find()
      .populate('requesterId', 'email phoneNumber')
      .sort({ status: 1, numberOfPeople: -1, createdAt: -1 }) 
      .exec();
  }

  // 3. ดึงเฉพาะข้อมูลของตัวเอง (สำหรับ User)
  async findMyRequests(userId: string) {
    return await this.sosModel.find({ requesterId: userId }).exec();
  }

  // 4. อัปเดตสถานะ (เช่น เปลี่ยนจาก pending เป็น completed)
  async updateStatus(id: string, status: string) {
    const updated = await this.sosModel.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated) throw new NotFoundException('ไม่พบข้อมูลหมุดที่ระบุ');
    return updated;
  }

  // 5. แก้ไขข้อมูลการช่วยเหลือ (รองรับการตรวจสอบ Role และความเป็นเจ้าของ)
  async update(id: string, updateData: any, userId: string, role: string) {
    // ค้นหาข้อมูลเดิมก่อนเพื่อเช็คสิทธิ์
    const sos = await this.sosModel.findById(id);
    if (!sos) throw new NotFoundException('ไม่พบข้อมูล');

    // ตรวจสอบสิทธิ์: ถ้าไม่ใช่ Admin และไม่ใช่เจ้าของหมุด (requesterId) จะไม่มีสิทธิ์แก้ไข
    if (role !== 'admin' && sos.requesterId.toString() !== userId) {
      throw new ForbiddenException('คุณไม่มีสิทธิ์แก้ไขข้อมูลเคสนี้');
    }

    // ทำการอัปเดตข้อมูลใหม่ลงฐานข้อมูล
    return await this.sosModel.findByIdAndUpdate(id, updateData, { new: true });
  } 

  // 6. ลบหรือยกเลิกหมุดขอความช่วยเหลือ
  async remove(id: string) {
    const result = await this.sosModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('ไม่พบหมุดที่ระบุ');
    return { success: true };
  }
}