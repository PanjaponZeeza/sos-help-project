# 🚩 ระบบฐานข้อมูลและระบุพิกัดช่วยเหลือผู้ประสบภัย (SOS Help System)

โปรเจกต์นี้เป็นส่วนหนึ่งของวิชาโครงงานนักศึกษา (Senior Project) คณะวิทยาศาสตร์ สาขาคอมพิวเตอร์มหาลัยแม่โจ้ โดยเป็นการพัฒนาระบบ Full-stack Web Application เพื่อจัดการเหตุฉุกเฉินและระบุพิกัดผู้ประสบภัยในพื้นที่รอบมหาลัยแม่โจ้

## ✨ ฟีเจอร์หลัก (Key Features)
* **🔐 Admin Dashboard:** ระบบจัดการสถานะเหตุการณ์ (Pending/Completed) สำหรับเจ้าหน้าที่
* **🛡️ Security:** ระบบยืนยันตัวตนด้วย JWT และการ Hash รหัสผ่านด้วย Argon2
* **📊 Database:** จัดการข้อมูลแบบ Real-time ผ่าน MongoDB Atlas Cloud

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)
* **Frontend:** Next.js, Tailwind CSS, Vercel
* **Backend:** NestJS, Mongoose, MongoDB Atlas
* **Language:** TypeScript

## 🚀 การติดตั้งและใช้งาน (Installation)
1. **Backend:** ไปที่โฟลเดอร์ `sos-help-backend` แล้วรัน `npm install` ตามด้วย `npm run start:dev`
2. **Frontend:** ไปที่โฟลเดอร์ `sos-help-frontend` แล้วรัน `npm install` ตามด้วย `npm run dev`
*หมายเหตุ: จำเป็นต้องตั้งค่าไฟล์ .env สำหรับ MONGO_URI และ JWT_SECRET ก่อนใช้งาน*

## 👨‍💻 พัฒนาโดย
* **Panjapon Puakinsang** - นักศึกษาคณะวิทยาศาสตร์ มหาวิทยาลัยแม่โจ้