export const dynamic = 'force-dynamic';
"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import api from "../../services/api";
import RequestCard from "../../components/RequestCard";
import RequestModal from "../../components/RequestModal";
import { 
  MapPin, Info, Loader2, ClipboardList, LogOut, 
  PlusCircle, Phone, Waves, BookOpen, ShieldCheck,
  Activity, Bell, Settings, Database, Home, Filter, LayoutDashboard,
  LifeBuoy, HeartPulse
} from "lucide-react";
import { jwtDecode } from "jwt-decode";
import toast, { Toaster } from "react-hot-toast"; // นำเข้า Modern Toast

const Map = dynamic(() => import("../../components/Map"), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[1050px] bg-slate-50 italic text-slate-400 font-medium border-2 border-dashed border-slate-200 rounded-[3rem]">
      <Loader2 className="animate-spin mr-3 w-6 h-6 text-primary" /> ระบบกำลังเชื่อมโยงพิกัดแผนที่ Real-time...
    </div>
  )
});

export default function DashboardPage() {
  const [sosList, setSosList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('guest');
  const [userName, setUserName] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedEditData, setSelectedEditData] = useState(null);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return (window.location.href = "/");
      const decoded: any = jwtDecode(token);
      setUserRole(decoded.role);
      setUserName(decoded.email);

      const endpoint = decoded.role === 'admin' ? "/sos" : "/sos/my-requests";
      const res = await api.get(endpoint);
      setSosList(res.data);
      setFilteredList(res.data);
    } catch (error) {
      toast.error("ดึงข้อมูลไม่สำเร็จ กรุณารีเฟรชหน้าเว็บ"); // แจ้งเตือนข้อผิดพลาด
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredList(sosList);
    } else {
      setFilteredList(sosList.filter((item: any) => item.status === statusFilter));
    }
  }, [statusFilter, sosList]);

  const handleEditClick = (item: any) => {
    setSelectedEditData(item);
    setIsRequestModalOpen(true);
  };

  const handleNewRequest = () => {
    setSelectedEditData(null);
    setIsRequestModalOpen(true);
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    const loadingToast = toast.loading("กำลังบันทึกสถานะ..."); // แจ้งเตือนสถานะกำลังโหลด
    try {
      await api.patch(`/sos/${id}/status`, { status });
      toast.success("อัปเดตข้อมูลกู้ภัยเรียบร้อย", { id: loadingToast }); // แจ้งเตือนสำเร็จ
      fetchData();
    } catch (error) { 
      toast.error("ไม่สามารถเปลี่ยนสถานะได้", { id: loadingToast }); 
    }
  };

  const handleDelete = async (id: string) => {
    // เปลี่ยน confirm() แบบเก่าเป็น Logic พื้นฐานแต่เตรียมการสำหรับ Modal ในอนาคต
    if (window.confirm("คุณต้องการยกเลิกคำขอนี้ใช่หรือไม่?")) {
      const loadingToast = toast.loading("กำลังลบรายการ...");
      try {
        await api.delete(`/sos/${id}`);
        toast.success("ลบข้อมูลออกจากระบบแล้ว", { id: loadingToast }); // แจ้งเตือนสำเร็จ
        fetchData();
      } catch (error) { 
        toast.error("ไม่สามารถลบข้อมูลได้", { id: loadingToast }); 
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      {/* Container สำหรับ Toast ไม่ให้บังส่วนสำคัญ */}
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

      {/* 1. Dashboard Navigation - กำหนดค่า z-index สูงสุดเพื่อไม่ให้แผนที่ทับ */}
      <nav className="bg-slate-900 text-white p-4 sticky top-0 z-[2000] shadow-2xl">
        <div className="container mx-auto flex justify-between items-center px-4">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-black flex items-center gap-3 tracking-tighter uppercase">
              <div className="bg-primary p-2 rounded-xl shadow-lg">
                <MapPin className="w-6 h-6 text-white animate-pulse" />
              </div>
              {userRole === 'admin' ? "ศูนย์ควบคุม" : "ระบบดูแล"} <span className="text-primary-light italic">{userRole === 'admin' ? "ปฏิบัติการ" : "ประชาชน"}</span>
            </h1>
            <div className="hidden lg:flex items-center gap-4 border-l border-white/10 pl-6">
              <button onClick={() => window.location.href = "/"} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition">
                <Home className="w-4 h-4 text-primary" /> กลับหน้าหลัก
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-5">
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-[9px] uppercase tracking-[0.3em] text-slate-500 font-black mb-0.5 font-sans">สถานะเข้าใช้งาน</span>
              <span className="text-xs font-bold text-slate-200 flex items-center gap-2 font-sans">
                <ShieldCheck className="w-4 h-4 text-primary" /> {userName} <span className="text-slate-500">|</span> <span className="text-primary-light uppercase">{userRole === 'admin' ? 'เจ้าหน้าที่' : 'ผู้ประสบภัย'}</span>
              </span>
            </div>
            <button 
              onClick={() => { 
                localStorage.clear(); 
                toast.success("ออกจากระบบสำเร็จ");
                setTimeout(() => window.location.href = "/", 800);
              }} 
              className="bg-white/5 hover:bg-red-500/20 p-3 rounded-2xl transition-all border border-white/10 group"
              title="ออกจากระบบ"
            >
              <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-400" />
            </button>
          </div>
        </div>
      </nav>

      {/* 2. Main Workstation Area */}
      <div className="container mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 h-auto relative z-10">
        
        <div className="lg:col-span-4 space-y-6">
          {userRole === 'user' && (
            <button 
              onClick={handleNewRequest}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-black py-6 rounded-[2.5rem] shadow-xl shadow-red-200 transition-all flex items-center justify-center gap-3 text-xl animate-pulse font-sans"
            >
              <LifeBuoy className="w-8 h-8" /> แจ้งขอความช่วยเหลือด่วน
            </button>
          )}

          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden font-sans">
            <div className="bg-slate-50 p-6 border-b border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-black text-slate-800 flex items-center gap-3 uppercase tracking-tight">
                  <ClipboardList className="w-6 h-6 text-primary" /> 
                  {userRole === 'admin' ? "ศูนย์จัดการคิวงานกู้ภัย" : "ติดตามสถานะเคสของฉัน"}
                </h2>
                <span className="bg-primary/10 px-3 py-1.5 rounded-full text-[10px] font-black text-primary border border-primary/20">
                  {filteredList.length} รายการ
                </span>
              </div>

              <div className="relative group">
                <Filter className="absolute left-4 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-xs text-slate-600 appearance-none cursor-pointer"
                >
                  <option value="all">แสดงรายการทั้งหมด</option>
                  <option value="pending">เฉพาะ: รอรับความช่วยเหลือ</option>
                  <option value="completed">เฉพาะ: ช่วยเหลือสำเร็จ</option>
                </select>
              </div>
            </div>
            
            <div className="p-4 overflow-y-auto h-[740px] space-y-4 custom-scrollbar bg-white font-sans">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full p-20 text-slate-400 font-sans">
                  <Loader2 className="animate-spin w-10 h-10 mb-4 text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">ซิงค์ข้อมูล...</span>
                </div>
              ) : filteredList.length > 0 ? (
                filteredList.map((item: any) => (
                  <RequestCard key={item._id} item={item} role={userRole} onUpdateStatus={handleUpdateStatus} onDelete={handleDelete} onEdit={() => handleEditClick(item)} />
                ))
              ) : (
                <div className="text-center py-32 px-10">
                  <Bell className="w-10 h-10 mx-auto mb-6 text-slate-200" />
                  <p className="text-sm text-slate-400 font-bold italic text-center font-sans uppercase tracking-widest">ยังไม่มีข้อมูลในระบบ</p>
                </div>
              )}
            </div>
          </div>

          {/* Insights Panel */}
          {userRole === 'admin' ? (
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden font-sans">
               <Activity className="absolute -right-4 -bottom-4 w-32 h-32 opacity-5 rotate-12" />
               <h3 className="text-[10px] font-black text-primary-light uppercase tracking-[0.3em] mb-6">ความคืบหน้าภาพรวม</h3>
               <div className="space-y-4">
                  <div className="flex justify-between text-xs font-bold font-sans">
                     <span className="text-slate-400">อัตราการช่วยเหลือสำเร็จ</span>
                     <span className="text-primary-light">
                      {sosList.length > 0 ? ((sosList.filter((i:any)=>i.status==='completed').length / sosList.length) * 100).toFixed(0) : 0}%
                     </span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                     <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${sosList.length > 0 ? (sosList.filter((i:any)=>i.status==='completed').length / sosList.length) * 100 : 0}%` }}></div>
                  </div>
               </div>
            </div>
          ) : (
            <div className="bg-green-600 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden font-sans">
               <HeartPulse className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10" />
               <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-4">แจ้งให้ทราบ</h3>
               <p className="text-sm font-bold leading-relaxed">
                 ทีมกู้ภัยกำลังเฝ้าระวังพิกัดของคุณตลอด 24 ชม. หากมีการเปลี่ยนแปลงพิกัด โปรดอัปเดตหมุดแจ้งเหตุทันที
               </p>
            </div>
          )}
        </div>

        {/* 4. Full-Scale Map Area */}
        <div className="lg:col-span-8 bg-white rounded-[3.5rem] shadow-2xl p-2 h-[1050px] border border-slate-200 overflow-hidden relative group z-10">
          <Map sosList={filteredList} />
        </div>
      </div>

      {/* 5. Educational Hub - Footer Section */}
      <div className="container mx-auto p-6 mt-16 pb-24 font-sans">
        <div className="flex items-center gap-6 mb-12">
          <div className="h-px bg-slate-200 flex-1"></div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-3">
            <BookOpen className="text-primary w-7 h-7" /> {userRole === 'admin' ? "คลังข้อมูลกู้ภัย" : "คู่มือเอาตัวรอดสำหรับผู้ประสบภัย"}
          </h2>
          <div className="h-px bg-slate-200 flex-1"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 hover:border-primary transition duration-500 group relative overflow-hidden">
            <div className="bg-primary/5 absolute top-0 left-0 w-24 h-24 rounded-br-[4rem] -ml-6 -mt-6"></div>
            <div className="bg-primary/10 w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-all duration-500">
              <Phone className="w-8 h-8" />
            </div>
            <h3 className="font-black text-2xl text-slate-800 mb-6 tracking-tight">สายด่วนช่วยเหลือ</h3>
            <ul className="text-sm font-bold text-slate-500 space-y-4">
              <li className="flex justify-between items-center border-b border-slate-50 pb-3 hover:text-primary transition-colors"><span>เหตุด่วนเหตุร้าย</span> <strong className="text-slate-800 text-lg">191</strong></li>
              <li className="flex justify-between items-center border-b border-slate-50 pb-3 hover:text-primary transition-colors"><span>กู้ชีพเจ็บป่วย</span> <strong className="text-primary text-lg font-black">1669</strong></li>
              <li className="flex justify-between items-center hover:text-primary transition-colors font-sans"><span>กรมป้องกันภัย</span> <strong className="text-slate-800 text-lg">1784</strong></li>
            </ul>
          </div>

          <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 hover:border-primary transition duration-500 group font-sans">
            <div className="bg-primary/10 w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
              <Waves className="w-8 h-8" />
            </div>
            <h3 className="font-black text-2xl text-slate-800 mb-6 tracking-tight">{userRole === 'admin' ? "มาตรการรับมือน้ำท่วม" : "วิธีขอความช่วยเหลือด่วน"}</h3>
            <div className="bg-slate-50 p-6 rounded-[2rem] border-l-8 border-primary italic text-slate-600 leading-relaxed font-bold shadow-inner">
              {userRole === 'admin' 
                ? "เน้นย้ายสิ่งของขึ้นที่สูง ตัดไฟสวิตช์หลัก และสวมรองเท้าบูททุกครั้ง" 
                : "สะสมน้ำดื่มสะอาด, ทำสัญลักษณ์ SOS บนหลังคา, และประหยัดแบตเตอรี่มือถือ"}
            </div>
          </div>

          <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 hover:border-primary transition duration-500 group font-sans">
            <div className="bg-primary/10 w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
              <LayoutDashboard className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-black text-2xl text-slate-800 mb-6 tracking-tight">เกี่ยวกับระบบ</h3>
            <p className="text-sm font-bold text-slate-400 leading-relaxed italic border-l-2 border-slate-100 pl-4 uppercase tracking-tighter font-sans">
              SOS Help System พัฒนาโดย Maejo University เพื่อการกู้ภัยที่มีประสิทธิภาพสูงสุด 100%
            </p>
          </div>
        </div>
      </div>

      <RequestModal isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)} onSuccess={fetchData} editData={selectedEditData} />
      
      <footer className="bg-white py-12 text-center text-[10px] text-slate-400 font-black uppercase tracking-[0.5em] border-t border-slate-100 font-sans">
        © 2026 SOS HELP SYSTEM COMMAND CENTER | SYSTEM STATUS: SECURED & OPERATIONAL
      </footer>
    </div>
  );
}