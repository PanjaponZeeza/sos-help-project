import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // สร้าง Instance ของ NestJS
  const app = await NestFactory.create(AppModule);
  
  // 🛠️ แก้ไขส่วนนี้: เปิดใช้งาน CORS แบบละเอียดเพื่อรองรับ Vercel
  app.enableCors({
    origin: true, // อนุญาตทุกแหล่งที่มา (เหมาะสำหรับการนำเสนอโปรเจกต์)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', // อนุญาตทุกคำสั่ง HTTP
    credentials: true, // อนุญาตการส่ง Cookie หรือ Header พิเศษ
  });

  // ตั้งค่าการตรวจสอบข้อมูล (Validation) ตาม DTO
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // ตัดฟิลด์ที่ไม่ได้นิยามใน DTO ออก
    forbidNonWhitelisted: true, // แจ้งเตือนถ้าส่งฟิลด์แปลกปลอมมา
    transform: true, // แปลงประเภทข้อมูลอัตโนมัติ
  }));

  // 🚀 สำคัญ: ใช้พอร์ตที่ Railway กำหนดให้ หรือใช้ 3000 เป็นค่าเริ่มต้น
  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`Application is running on port: ${port}`);
}
bootstrap();