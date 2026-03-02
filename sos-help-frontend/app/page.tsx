"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import api from "../services/api";
import { 
  MapPin, Users, Info, Loader2, LogIn, UserPlus, 
  HeartHandshake, ShieldCheck, PhoneCall, LayoutDashboard,
  Waves, BookOpen, AlertTriangle, LogOut, ShieldAlert
} from "lucide-react";
import { jwtDecode } from "jwt-decode";

// นำเข้า Modal Components
import AuthModal from "../components/AuthModal";
import RequestModal from "../components/RequestModal";

// โหลด Map แบบ Dynamic
const Map = dynamic(() => import("../components/Map"), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[500px] lg:h-[1050px] bg-slate-100 italic text-slate-400 rounded-[2rem] lg:rounded-[3rem]">
      กำลังเชื่อมต่อฐานข้อมูลแผนที่...
    </div>
  )
});

export default function LandingPage() {
  const [sosList, setSosList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  const fetchSos = async () => {
    try {
      const res = await api.get("/sos");
      setSosList(res.data);
    } catch (error) {
      console.error("ดึงข้อมูลล้มเหลว", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSos();
    const token = localStorage.getItem("access_token");
    if (token) {
      setIsLoggedIn(true);
      try {
        const decoded: any = jwtDecode(token);
        setUserRole(decoded.role);
      } catch (e) {
        setIsLoggedIn(false);
      }
    }
  }, []);

  const handleAuthSuccess = () => {
    window.location.reload();
  };

  const openAuth = (mode: string) => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      {/* 1. Header & Navigation - Responsive Fix */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 p-3 lg:p-4 sticky top-0 z-[2000] shadow-sm">
        <div className="container mx-auto flex justify-between items-center px-2 lg:px-4">
          <h1 className="text-lg lg:text-2xl font-black flex items-center gap-2 cursor-pointer text-primary" onClick={() => window.location.reload()}>
            <div className="bg-primary p-1.5 rounded-lg shadow-lg">
              <MapPin className="text-white w-5 h-5 lg:w-6 lg:h-6 animate-pulse" />
            </div>
            <span className="tracking-tighter">SOS HELP <span className="text-slate-400 font-light hidden sm:inline">SYSTEM</span></span>
          </h1>
          
          <div className="flex items-center gap-1.5 lg:gap-2 font-sans">
            {!isLoggedIn ? (
              <>
                <button onClick={() => openAuth("login")} className="flex items-center gap-1.5 px-3 lg:px-5 py-2 text-[11px] lg:text-sm font-bold text-slate-600 hover:text-primary transition">
                  <LogIn className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> <span className="hidden xs:inline">เข้าสู่ระบบ</span>
                </button>
                <button onClick={() => openAuth("signup")} className="flex items-center gap-1.5 px-4 lg:px-6 py-2 bg-primary text-white rounded-xl text-[11px] lg:text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 transition active:scale-95">
                  <UserPlus className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> <span className="hidden xs:inline">สมัครสมาชิก</span>
                  <span className="xs:hidden">สมัคร</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-1.5 lg:gap-2 font-sans">
                <button 
                  onClick={() => window.location.href = "/dashboard"}
                  className="flex items-center gap-1.5 px-3 lg:px-5 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition text-[11px] lg:text-sm"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> 
                  <span className="hidden md:inline">{userRole === 'admin' ? "ศูนย์ควบคุมปฏิบัติการ" : "รายการของฉัน"}</span>
                  <span className="md:hidden">Dashboard</span>
                </button>
                
                {userRole !== 'admin' && (
                  <button 
                    onClick={() => setIsRequestModalOpen(true)}
                    className="flex items-center gap-1.5 px-4 lg:px-6 py-2 bg-red-500 text-white font-black rounded-xl shadow-lg shadow-red-200 hover:bg-red-600 transition animate-bounce-short text-[11px] lg:text-sm"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> <span className="hidden sm:inline">ปักหมุดขอความช่วยเหลือ</span>
                    <span className="sm:hidden">แจ้งเหตุ</span>
                  </button>
                )}
                
                <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 transition">
                  <LogOut className="w-4 h-4 lg:w-5 lg:h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* 2. Hero Section - Responsive Typography */}
      <header className="bg-white py-12 lg:py-24 px-4 lg:px-6 relative overflow-hidden">
        <div className="container mx-auto text-center max-w-5xl relative z-10 font-sans">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] lg:text-xs font-black mb-6 lg:mb-8 border border-blue-100 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> ระบบประสานงานช่วยเหลือฉุกเฉิน (OFFICIAL)
          </div>
          <h2 className="text-3xl lg:text-7xl font-black text-slate-900 mb-6 lg:mb-8 tracking-tight leading-tight lg:leading-[1.1]">
            ส่งต่อความช่วยเหลือ <br className="hidden sm:block"/> <span className="text-primary italic">แม่นยำ ทุกพิกัด</span>
          </h2>
          <p className="text-slate-500 text-sm lg:text-2xl leading-relaxed max-w-3xl mx-auto font-medium px-4">
            ศูนย์รวมพิกัดแจ้งเหตุและสถานการณ์ Real-time เพื่อลดช่องว่างการสื่อสาร 
            ช่วยให้เจ้าหน้าที่เข้าถึงพื้นที่เกิดเหตุได้รวดเร็วที่สุด
          </p>
        </div>
      </header>

      {/* 3. Main Content - Mobile Order Fix */}
      <div className="container mx-auto px-4 lg:px-6 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        
        {/* สถานการณ์ปัจจุบัน (เลื่อนมาอยู่หลังแผนที่เมื่อเป็นมือถือ) */}
        <div className="order-2 lg:order-1 lg:col-span-4 space-y-8 lg:space-y-10">
          <section>
            <div className="flex items-center justify-between mb-6 lg:mb-8">
              <h3 className="text-xl lg:text-3xl font-black text-slate-800 flex items-center gap-2 lg:gap-3 tracking-tighter uppercase font-sans">
                <ActivityIcon /> สถานการณ์ปัจจุบัน
              </h3>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[9px] lg:text-[10px] font-black border border-green-100">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></div> LIVE
              </div>
            </div>
            
            <div className="bg-primary p-6 lg:p-8 rounded-2xl lg:rounded-[2.5rem] text-white shadow-2xl shadow-primary/30 relative overflow-hidden mb-8 lg:mb-10 font-sans">
              <p className="text-[10px] lg:text-sm opacity-80 font-bold mb-4 lg:mb-6 flex items-center gap-2 uppercase tracking-widest">📊 สถิติความช่วยเหลือ</p>
              <div className="grid grid-cols-2 gap-4 lg:gap-6 text-center">
                <div className="bg-white/10 backdrop-blur-xl p-4 lg:p-6 rounded-2xl lg:rounded-3xl border border-white/20">
                  <div className="text-3xl lg:text-5xl font-black text-white mb-1">{sosList.filter((i:any)=>i.status==='pending').length}</div>
                  <div className="text-[9px] lg:text-[11px] text-white/60 font-black uppercase tracking-widest">รอช่วยเหลือ</div>
                </div>
                <div className="bg-white/10 backdrop-blur-xl p-4 lg:p-6 rounded-2xl lg:rounded-3xl border border-white/20">
                  <div className="text-3xl lg:text-5xl font-black text-white mb-1">{sosList.filter((i:any)=>i.status==='completed').length}</div>
                  <div className="text-[9px] lg:text-[11px] text-white/60 font-black uppercase tracking-widest">ช่วยแล้ว</div>
                </div>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[400px] lg:max-h-[500px] space-y-4 lg:space-y-5 lg:pr-4 custom-scrollbar">
              {loading ? (
                  <div className="flex justify-center p-10"><Loader2 className="animate-spin text-primary w-10 h-10 lg:w-12 lg:h-12" /></div>
              ) : sosList.length > 0 ? (
                sosList.map((item: any) => (
                  <div key={item._id} className="p-5 lg:p-6 rounded-2xl lg:rounded-[2rem] border border-slate-200 bg-white hover:border-primary hover:shadow-lg transition-all duration-300 font-sans">
                    <div className="flex justify-between items-center mb-3 lg:mb-4">
                      <span className={`text-[9px] lg:text-[10px] font-black px-3 py-1 rounded-full uppercase border ${item.status === 'pending' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                        {item.status === 'pending' ? 'รอรับความช่วยเหลือ' : 'ช่วยเหลือสำเร็จ'}
                      </span>
                      <span className="text-[9px] lg:text-[10px] text-slate-300 font-mono font-bold">#{item._id.slice(-4).toUpperCase()}</span>
                    </div>
                    <p className="text-base lg:text-lg text-slate-800 font-bold leading-tight mb-3 lg:mb-4 italic">"{item.detail}"</p>
                    <div className="flex items-center justify-between text-[10px] lg:text-xs text-slate-400 font-bold">
                      <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-slate-300" /> {item.numberOfPeople} คน</span>
                      <span className="bg-slate-50 px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg lg:rounded-xl border border-slate-100 font-mono text-[9px] lg:text-[10px]">📍 {item.latitude.toFixed(2)}, {item.longitude.toFixed(2)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-10 text-slate-400 text-sm font-bold font-sans">ยังไม่มีรายงานเหตุการณ์ในพื้นที่</p>
              )}
            </div>
          </section>

          <section className="bg-white p-6 lg:p-8 rounded-2xl lg:rounded-[2.5rem] border border-slate-200 shadow-sm font-sans">
            <h3 className="text-lg lg:text-2xl font-black text-slate-800 flex items-center gap-2 lg:gap-3 mb-6 lg:mb-8 tracking-tighter uppercase">
              <ShieldAlert className="text-primary w-6 h-6 lg:w-7 lg:h-7" /> คลังความรู้กู้ภัย
            </h3>
            <div className="space-y-6">
              <div className="group cursor-pointer">
                <div className="flex items-center gap-3 lg:gap-4 mb-3 text-blue-600">
                  <div className="bg-blue-50 p-2.5 lg:p-3 rounded-xl lg:rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300"><PhoneCall className="w-5 h-5 lg:w-6 lg:h-6" /></div>
                  <h4 className="font-black text-slate-800 text-base lg:text-lg">เบอร์ติดต่อกรณีฉุกเฉิน</h4>
                </div>
                <div className="grid grid-cols-2 gap-3 text-[11px] lg:text-sm font-bold pl-1 lg:pl-2">
                  <p className="flex justify-between border-b pb-1"><span>เหตุด่วน</span> <strong className="text-primary">191</strong></p>
                  <p className="flex justify-between border-b pb-1"><span>กู้ชีพ</span> <strong className="text-primary font-black">1669</strong></p>
                  <p className="flex justify-between border-b pb-1"><span>ภัยพิบัติ</span> <strong className="text-primary">1784</strong></p>
                  <p className="flex justify-between border-b pb-1"><span>ทางหลวง</span> <strong className="text-primary">1193</strong></p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* 4. แผนที่ (เลื่อนมาอยู่ลำดับแรกเมื่อเป็นมือถือ) */}
        <div className="order-1 lg:order-2 lg:col-span-8 bg-white rounded-2xl lg:rounded-[3rem] shadow-2xl p-1.5 lg:p-2 h-[450px] lg:h-[1050px] border border-slate-200 overflow-hidden relative lg:sticky lg:top-24">
          <Map sosList={sosList} />
        </div>
      </div>

      <footer className="bg-slate-900 text-white py-12 lg:py-20 font-sans">
        <div className="container mx-auto px-4 lg:px-6 grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16 border-b border-white/10 pb-12 lg:pb-20 mb-8 lg:mb-12">
           <div className="space-y-4 lg:space-y-6">
             <h4 className="text-xl lg:text-3xl font-black tracking-tighter uppercase">SOS HELP <span className="text-primary italic">SYSTEM</span></h4>
             <p className="text-slate-400 text-sm lg:text-lg leading-relaxed font-medium">
               นวัตกรรมเพื่อการบริหารจัดการภัยพิบัติ พัฒนาโดยนักศึกษา Computer Science Maejo University
             </p>
           </div>
           <div className="space-y-4 lg:space-y-6">
             <h5 className="font-black uppercase tracking-[0.3em] text-slate-500 text-[10px] lg:text-xs">Official Partners</h5>
             <div className="grid grid-cols-2 gap-3 lg:gap-4">
                <div className="bg-white/5 p-3 lg:p-4 rounded-xl lg:rounded-2xl border border-white/10 flex items-center justify-center font-black text-[9px] lg:text-[10px] text-white/50 tracking-widest uppercase">MJU University</div>
                <div className="bg-white/5 p-3 lg:p-4 rounded-xl lg:rounded-2xl border border-white/10 flex items-center justify-center font-black text-[9px] lg:text-[10px] text-white/50 tracking-widest uppercase">CS Department</div>
             </div>
           </div>
           <div className="space-y-4 lg:space-y-6">
             <h5 className="font-black uppercase tracking-[0.3em] text-slate-500 text-[10px] lg:text-xs">Contact</h5>
             <p className="text-lg lg:text-xl font-black text-white underline underline-offset-8 decoration-primary truncate">sos.help@mju.ac.th</p>
           </div>
        </div>
        <div className="text-center text-[8px] lg:text-[10px] text-slate-600 font-black uppercase tracking-[0.4em] lg:tracking-[0.5em] px-4">
            © 2026 SYSTEM OPERATIONAL - CS MAEJO UNIVERSITY | ALL RIGHTS RESERVED
        </div>
      </footer>

      {/* Modal Components */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onSuccess={handleAuthSuccess} initialMode={authMode} />
      <RequestModal isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)} onSuccess={fetchSos} />
    </div>
  );
}

function ActivityIcon() {
  return (
    <div className="bg-primary/10 p-1.5 lg:p-2 rounded-lg lg:rounded-xl shadow-inner border border-primary/5">
      <div className="w-4 h-4 lg:w-5 lg:h-5 flex items-end gap-0.5 p-0.5">
        <div className="w-1 lg:w-1.5 bg-primary h-1/3 rounded-full animate-[bounce_1s_infinite]"></div>
        <div className="w-1 lg:w-1.5 bg-primary h-full rounded-full animate-[bounce_1.5s_infinite]"></div>
        <div className="w-1 lg:w-1.5 bg-primary h-2/3 rounded-full animate-[bounce_1.2s_infinite]"></div>
      </div>
    </div>
  )
}