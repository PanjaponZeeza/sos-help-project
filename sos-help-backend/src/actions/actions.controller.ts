import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ActionsService } from './actions.service';
import { CreateActionDto } from './dto/create-action.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('actions')
export class ActionsController {
  constructor(private readonly actionsService: ActionsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateActionDto, @Req() req: any) {
    // บันทึกการช่วยเหลือ โดยส่ง ID ของเจ้าหน้าที่จาก Token
    return this.actionsService.create(dto, req.user.userId);
  }

  @Get()
  findAll() {
    return this.actionsService.findAll();
  }
}