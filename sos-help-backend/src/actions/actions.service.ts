import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Action, ActionDocument } from './schemas/action.schema';
import { CreateActionDto } from './dto/create-action.dto';

@Injectable()
export class ActionsService {
  constructor(@InjectModel(Action.name) private actionModel: Model<ActionDocument>) {}

  async create(dto: CreateActionDto, officerId: string) {
    const newAction = new this.actionModel({
      ...dto,
      officerId,
    });
    return await newAction.save();
  }

  // ดึงประวัติการช่วยเหลือทั้งหมด พร้อมข้อมูลเจ้าหน้าที่และหมุด
  async findAll() {
    return await this.actionModel.find()
      .populate('officerId', 'email phoneNumber')
      .populate('sosId')
      .exec();
  }
}