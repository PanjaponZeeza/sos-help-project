import axios from 'axios';



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