import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import * as argon2 from 'argon2'; // ใช้เข้ารหัสลับรหัสผ่าน

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  // ฟังก์ชันหาผู้ใช้ด้วย Email (ใช้ตอน Login)
  async findByEmail(email: string) {
    return this.userModel.findOne({ email }).select('+passwordHash').exec();
  }

  // ฟังก์ชันสร้างผู้ใช้ใหม่
  async create(dto: CreateUserDto) {
    const passwordHash = await argon2.hash(dto.password);
    const newUser = new this.userModel({
      ...dto,
      passwordHash,
    });
    return newUser.save();
  }

  // ฟังก์ชันหาข้อมูลผู้ใช้จาก ID
  async findById(id: string) {
    return this.userModel.findById(id).exec();
  }
}