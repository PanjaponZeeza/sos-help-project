import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { SosService } from './sos.service';
import { CreateSosDto } from './dto/create-sos.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('sos')
export class SosController {
  constructor(private readonly sosService: SosService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateSosDto, @Req() req: any) {
    return this.sosService.create(dto, req.user.userId);
  }

  @Get()
  findAll() {
    return this.sosService.findAll();
  }

  // เพิ่มฟังก์ชัน update เพื่อรับ Method PATCH สำหรับการแก้ไขข้อมูลทั่วไป
  @UseGuards(JwtAuthGuard)
  @Patch(':id') 
  update(@Param('id') id: string, @Body() updateSosDto: any, @Req() req: any) {
    // ส่ง id, ข้อมูลใหม่, userId และ role ไปตรวจสอบสิทธิ์ใน Service
    return this.sosService.update(id, updateSosDto, req.user.userId, req.user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    // เรียกฟังก์ชัน updateStatus ใน Service
    return this.sosService.updateStatus(id, status);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sosService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-requests')
  findMyRequests(@Req() req: any) {
    return this.sosService.findMyRequests(req.user.userId);
  }
}