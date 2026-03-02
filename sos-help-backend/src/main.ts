import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // เปิดใช้งาน CORS เพื่อให้ Frontend เรียกใช้ได้ในอนาคต
  app.enableCors();

  // ตั้งค่าการตรวจสอบข้อมูล (Validation) ตาม DTO
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // ตัดฟิลด์ที่ไม่ได้นิยามใน DTO ออก
    forbidNonWhitelisted: true, // แจ้งเตือนถ้าส่งฟิลด์แปลกปลอมมา
    transform: true, // แปลงประเภทข้อมูลอัตโนมัติ
  }));

  await app.listen(3000);
  console.log('Application is running on: http://localhost:3000');
}
bootstrap();