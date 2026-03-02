"use client";
import { useState, useEffect } from "react";
import { X, ShieldAlert, UserPlus, LogIn, Mail, Lock, Phone, ArrowRight } from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast"; // นำเข้า Modern Toast

export default function AuthModal({ isOpen, onClose, onSuccess, initialMode = "login" }: any) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: "", password: "", phoneNumber: "" });
  const [loading, setLoading] = useState(false);

  // อัปเดตโหมดเมื่อมีการเปิด Modal
  useEffect(() => {
    setIsLogin(initialMode === "login");
  }, [initialMode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const loadingToast = toast.loading(isLogin ? "กำลังตรวจสอบข้อมูล..." : "กำลังสร้างบัญชีผู้ใช้...");

    try {
      if (isLogin) {
        // ขั้นตอน Login: รักษารูปแบบฟอร์มเพื่อระบบ Autofill (จำรหัสผ่าน)
        const res = await api.post("/auth/login", { 
          email: formData.email, 
          password: formData.password 
        });
        localStorage.setItem("access_token", res.data.access_token);
        
        // แจ้งเตือนความสำเร็จด้วย Toast
        toast.success("ยินดีต้อนรับ! เข้าสู่ระบบสำเร็จ", { id: loadingToast });
        
        onSuccess();
        onClose();
      } else {
        // ขั้นตอน Signup
        await api.post("/auth/signup", { ...formData, role: "user" });
        
        toast.success("ลงทะเบียนสำเร็จ! กรุณาเข้าสู่ระบบ", { id: loadingToast });
        
        setIsLogin(true);
        setLoading(false);
        return;
      }
    } catch (error: any) {
      // แจ้งเตือนข้อผิดพลาดด้วย Toast แทน alert()
      const errorMessage = error.response?.data?.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ";
      toast.error(errorMessage, { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-md p-4 transition-all duration-300 ${isOpen ? 'bg-slate-900/60 opacity-100 pointer-events-auto' : 'bg-slate-900/0 opacity-0 pointer-events-none'}`}>
      <div className="bg-white w-full max-w-[440px] rounded-[2.5rem] shadow-2xl relative overflow-visible border border-slate-100 font-sans">
        
        <div className="h-2 bg-gradient-to-r from-primary to-blue-400 w-full rounded-t-[2.5rem]" />

        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-10">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="bg-primary/10 p-4 rounded-3xl mb-4 shadow-inner">
              <ShieldAlert className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">
              {isLogin ? "เข้าสู่ระบบ" : "สร้างบัญชีใหม่"}
            </h2>
            <p className="text-slate-400 text-sm mt-2 font-medium">
              {isLogin ? "กรุณากรอกข้อมูลเพื่อเข้าใช้งานระบบ" : "ร่วมเป็นส่วนหนึ่งของเครือข่ายกู้ภัยดิจิทัล"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Input Email: ใช้ name="username" และ autoComplete="username" เพื่อให้ password manager จำอีเมลพร้อมรหัสผ่าน */}
            <div className="space-y-2">
              <label htmlFor="auth-email" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">อีเมลผู้ใช้งาน</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                <input 
                  id="auth-email"
                  name="username"
                  type="email" 
                  autoComplete="username"
                  required 
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium font-sans"
                  placeholder="name@example.com"
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  autoFocus={isLogin}
                />
              </div>
            </div>

            {/* Input Phone Number (แสดงเฉพาะ Signup) */}
            {!isLogin && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">เบอร์โทรศัพท์ติดต่อ</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-3.5 w-5 h-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                  <input 
                    name="phoneNumber"
                    type="tel" 
                    autoComplete="tel"
                    required 
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium font-sans"
                    placeholder="08X-XXX-XXXX"
                    value={formData.phoneNumber} 
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  />
                </div>
              </div>
            )}

            {/* Input Password: ใช้ autoComplete="current-password" เพื่อให้ password manager แสดง dropdown บัญชีที่บันทึกไว้ */}
            <div className="space-y-2">
              <label htmlFor="auth-password" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">รหัสผ่าน</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                <input 
                  id="auth-password"
                  name="password"
                  type="password" 
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  required 
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium font-sans"
                  placeholder="••••••••"
                  value={formData.password} 
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] disabled:opacity-70 font-sans"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                  {isLogin ? "ยืนยันการเข้าใช้งาน" : "ลงทะเบียนบัญชีใหม่"}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500 font-medium font-sans">
              {isLogin ? "หากคุณยังไม่มีบัญชีในระบบ?" : "หากคุณมีบัญชีอยู่แล้ว?"} 
              <button 
                type="button"
                onClick={() => setIsLogin(!isLogin)} 
                className="text-primary font-black ml-2 hover:underline decoration-2 underline-offset-4 font-sans"
              >
                {isLogin ? "สร้างบัญชีใหม่ที่นี่" : "เข้าสู่ระบบตรงนี้"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}