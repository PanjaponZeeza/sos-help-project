import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';

// @Controller('users') คือการกำหนด Path หลักของไฟล์นี้ คือ http://localhost:3000/users
@Controller('users')
export class UsersController {
  // Dependency Injection: ดึงเอา UsersService มาใช้งานในเครื่องนี้
  constructor(private readonly usersService: UsersService) {}
}