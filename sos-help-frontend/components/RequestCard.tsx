"use client";
import { Users, MapPin, CheckCircle, Edit, Trash2, Navigation } from "lucide-react";

export default function RequestCard({ item, role, onUpdateStatus, onDelete, onEdit }: any) {
  
  // ฟังก์ชันสำหรับการเปิด Google Maps เพื่อนำทาง (แก้ไข Link ให้ถูกต้อง)
  const handleNavigate = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}`;
    window.open(url, "_blank");
  };

  return (
    <div className={`group p-5 rounded-[2rem] border-l-[6px] shadow-sm bg-white hover:shadow-xl transition-all duration-300 border-y border-r border-slate-100 ${item.status === 'pending' ? 'border-l-red-500' : 'border-l-green-500'}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-col gap-1">
          {/* ปรับสถานะเป็นภาษาไทยมาตรฐาน */}
          <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest inline-block w-fit ${item.status === 'pending' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
            {item.status === 'pending' ? 'รอรับความช่วยเหลือ' : 'ช่วยเหลือสำเร็จ'}
          </span>
          <span className="text-[8px] text-slate-300 font-mono font-bold uppercase ml-0.5">อ้างอิง: {item._id.slice(-6).toUpperCase()}</span>
        </div>

        <div className="flex gap-1.5 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 shadow-inner">
          {/* ปุ่มนำทาง: ใช้งานได้จริงผ่าน Google Maps API */}
          <button 
            onClick={handleNavigate}
            title="นำทางผ่าน Google Maps"
            className="text-slate-400 hover:text-primary p-1.5 hover:bg-white hover:shadow-sm rounded-xl transition-all"
          >
            <Navigation className="w-4 h-4 fill-current" />
          </button>

          {/* ส่วนของเจ้าหน้าที่ (Admin): เพิ่มสิทธิ์ให้ ลบ และ แก้ไข ได้ด้วย */}
          {role === 'admin' && (
            <>
              {item.status === 'pending' && (
                <button 
                  onClick={() => onUpdateStatus(item._id, 'completed')} 
                  title="ยืนยันการช่วยเหลือสำเร็จ"
                  className="text-green-500 hover:text-white p-1.5 hover:bg-green-500 rounded-xl transition-all"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
              )}
              {/* แอดมินสามารถแก้ไขข้อมูลได้ทุกสถานะ */}
              <button 
                onClick={onEdit} 
                title="แก้ไขข้อมูล (แอดมิน)"
                className="text-blue-500 hover:bg-blue-500 hover:text-white p-1.5 rounded-xl transition-all"
              >
                <Edit className="w-4 h-4" />
              </button>
              {/* แอดมินสามารถลบข้อมูลได้ทุกสถานะ */}
              <button 
                onClick={() => onDelete(item._id)} 
                title="ลบข้อมูล (แอดมิน)"
                className="text-red-400 hover:bg-red-500 hover:text-white p-1.5 rounded-xl transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}

          {/* ส่วนของ User: แก้ไข/ยกเลิก (เฉพาะเคสตัวเองที่ยังรอดำเนินการ) */}
          {role === 'user' && item.status === 'pending' && (
            <>
              <button 
                onClick={onEdit} 
                title="แก้ไขรายละเอียด"
                className="text-blue-500 hover:bg-blue-500 hover:text-white p-1.5 rounded-xl transition-all"
              >
                <Edit className="w-4 h-4" />
              </button>
              
              <button 
                onClick={() => onDelete(item._id)} 
                title="ยกเลิกการขอความช่วยเหลือ"
                className="text-red-400 hover:bg-red-500 hover:text-white p-1.5 rounded-xl transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
      
      <p className="text-sm text-slate-800 font-black leading-snug mb-4 group-hover:text-primary transition-colors">"{item.detail}"</p>
      
      <div className="flex items-center justify-between text-[10px] font-bold">
        <div className="flex items-center gap-1.5 text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
          <Users className="w-3.5 h-3.5 text-primary" /> 
          <span>{item.numberOfPeople} ผู้ประสบภัย</span>
        </div>
        <div className="flex items-center gap-1 text-slate-400 font-mono italic">
          <MapPin className="w-3 h-3" />
          <span>{item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}</span>
        </div>
      </div>
      
      {/* ส่วนข้อมูลติดต่อเจ้าหน้าที่ (Admin View) */}
      {role === 'admin' && item.requesterId && (
        <div className="mt-4 pt-3 border-t border-dashed border-slate-200">
          <div className="flex flex-col gap-1 text-[9px] font-black uppercase tracking-wider text-slate-400">
            <div className="flex justify-between">
              <span>อีเมลติดต่อ:</span>
              <span className="text-slate-600 italic font-mono lowercase">{item.requesterId.email}</span>
            </div>
            <div className="flex justify-between">
              <span>เบอร์โทรศัพท์:</span>
              <span className="text-primary text-[11px] decoration-primary/30 underline font-bold">{item.requesterId.phoneNumber || 'ไม่ได้ระบุ'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}