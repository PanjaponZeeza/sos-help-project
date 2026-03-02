import axios from 'axios';

// ประกาศตัวแปร API_URL ให้ระบบรู้จัก
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_URL, // เรียกใช้ตัวแปรที่ประกาศไว้ด้านบน
});

// ดึง Token จากเครื่องผู้ใช้ส่งไปพร้อมกับ Request ทุกครั้ง
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;