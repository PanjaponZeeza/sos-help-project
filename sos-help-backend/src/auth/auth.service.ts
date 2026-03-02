import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import * as argon2 from 'argon2';

/**
 * AuthService - บริการจัดการการตรวจสอบสิทธิ์และการอนุญาต
 * 
 * บริการนี้มีความรับผิดชอบสำหรับ:
 * - การลงทะเบียนผู้ใช้ใหม่ (Signup)
 * - การเข้าสู่ระบบ (Login)
 * - การสร้างและตรวจสอบ JWT tokens
 */
@Injectable()
export class AuthService {
  /**
   * Constructor - ฉีด UsersService และ JwtService เข้าสู่ AuthService
   * 
   * @param usersService - บริการสำหรับจัดการข้อมูลผู้ใช้
   * @param jwtService - บริการสำหรับสร้างและตรวจสอบ JWT tokens
   */
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * signup - ฟังก์ชันลงทะเบียนผู้ใช้ใหม่
   * 
   * ขั้นตอน:
   * 1. ตรวจสอบว่าอีเมลมีการลงทะเบียนแล้วหรือไม่
   * 2. ถ้ามีแล้ว ให้โยน ConflictException
   * 3. ถ้ายังไม่มี ให้สร้างผู้ใช้ใหม่ผ่าน UsersService
   * 
   * @param dto - ข้อมูลสำหรับสร้างผู้ใช้ใหม่ (อีเมล, รหัสผ่าน, ชื่อ)
   * @returns ข้อมูลผู้ใช้ที่สร้างขึ้น
   * @throws ConflictException - หากอีเมลนี้ถูกใช้งานแล้ว
   */
  async signup(dto: CreateUserDto) {
    // ตรวจสอบว่าผู้ใช้มีอีเมลนี้อยู่หรือไม่
    const userExists = await this.usersService.findByEmail(dto.email);
    if (userExists) {
      throw new ConflictException('อีเมลนี้ถูกใช้งานแล้ว');
    }
    // ส่งต่อไปยัง UsersService เพื่อสร้าง User ใหม่
    return this.usersService.create(dto);
  }

  /**
   * login - ฟังก์ชันเข้าสู่ระบบ
   * 
   * ขั้นตอน:
   * 1. ค้นหาผู้ใช้จากอีเมล
   * 2. ตรวจสอบว่าผู้ใช้มีอยู่ในระบบ
   * 3. ตรวจสอบความถูกต้องของรหัสผ่านโดยใช้ argon2
   * 4. สร้าง JWT token พร้อมข้อมูล payload (user ID, อีเมล, บทบาท)
   * 5. ส่ง access_token กลับไป
   * 
   * @param dto - ข้อมูลสำหรับเข้าสู่ระบบ (อีเมลและรหัสผ่าน)
   * @returns object ที่มี access_token สำหรับการตรวจสอบสิทธิ์ในอนาคต
   * @throws UnauthorizedException - หากอีเมลหรือรหัสผ่านไม่ถูกต้อง
   * @throws InternalServerErrorException - หากเกิดข้อผิดพลาดภายในระบบ
   */
  async login(dto: LoginDto) {
    try {
      // ดึงข้อมูล User จากอีเมล
      const user: any = await this.usersService.findByEmail(dto.email);
      
      // 1. ตรวจสอบว่าพบ User หรือไม่
      if (!user) {
        throw new UnauthorizedException('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      }

      // 2. ตรวจสอบรหัสผ่าน - รับรอบ passwordHash ตามที่ปรากฏในฐานข้อมูล
      // ตรวจสอบว่ามีฟิลด์รหัสผ่านใน DB หรือไม่ เพื่อป้องกัน 500 Error
      // สนับสนุนทั้ง passwordHash และ password field names
      const storedPassword = user.passwordHash || user.password; 
      
      if (!storedPassword) {
        throw new InternalServerErrorException('โครงสร้างข้อมูลรหัสผ่านในระบบไม่ถูกต้อง');
      }

      // 3. เปรียบเทียบรหัสผ่านด้วย argon2 (ตรวจสอบว่ารหัสผ่านที่ป้อนตรงกับรหัสผ่าน hash)
      const isPasswordValid = await argon2.verify(storedPassword, dto.password);
      
      if (!isPasswordValid) {
        throw new UnauthorizedException('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      }

      // 4. รหัสผ่านถูกต้อง - สร้าง JWT Payload
      // Payload ประกอบด้วย:
      // - sub: user ID (ตามมาตรฐาน JWT)
      // - email: อีเมลของผู้ใช้
      // - role: บทบาทของผู้ใช้ (เช่น admin, user)
      const payload = { sub: user._id, email: user.email, role: user.role };
      
      // 5. สร้าง JWT token และส่ง access_token กลับไป
      return {
        access_token: await this.jwtService.signAsync(payload),
      };
      
    } catch (error) {
      // พ่น Error จริงออกมาที่ Console ของ Backend เพื่อให้เราวิเคราะห์ได้
      console.error("Login Error Detail:", error);
      
      // ถ้าเป็น Error ที่เราตั้งใจโยน (Unauthorized หรือ InternalServerError) ให้ส่งออกไปเลย
      if (error instanceof UnauthorizedException || error instanceof InternalServerErrorException) {
        throw error;
      }
      
      // ถ้าเป็น Error อื่นๆ ให้แจ้งเป็น 500 พร้อมข้อความทั่วไป
      throw new InternalServerErrorException('เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์ระหว่างเข้าสู่ระบบ');
    }
  }
}