import axios from 'axios';


// ของใหม่ที่จะดึงค่าจาก Vercel Settings มาใช้
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const res = await axios.get(`${API_URL}/sos`);

const api = axios.create({
  baseURL: API_URL,
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