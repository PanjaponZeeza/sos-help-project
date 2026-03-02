"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { X, MapPin, Users, Send, Navigation, Info } from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast"; // นำเข้า Modern Toast

// 1. โหลด React-Leaflet แบบ Dynamic และปิด SSR (ห้ามลบ)
const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });

export default function RequestModal({ isOpen, onClose, onSuccess, editData = null }: any) {
  const [formData, setFormData] = useState({ latitude: 18.892, longitude: 99.012, detail: "", numberOfPeople: 1 });
  const [map, setMap] = useState<any>(null);
  const [customIcon, setCustomIcon] = useState<any>(null);

  // 2. แก้ปัญหา Window is not defined โดยโหลด Leaflet ภายใน useEffect
  useEffect(() => {
    if (typeof window !== "undefined") {
      const L = require("leaflet");
      // @ts-ignore
      import("leaflet/dist/leaflet.css");
      
      const icon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });
      setCustomIcon(icon);
    }
  }, []);

  // 3. เมื่อมีข้อมูลส่งมาแก้ไข ให้โหลดข้อมูลนั้นลงฟอร์ม
  useEffect(() => {
    if (editData && isOpen) {
      setFormData({
        latitude: editData.latitude,
        longitude: editData.longitude,
        detail: editData.detail,
        numberOfPeople: editData.numberOfPeople
      });
      // เลื่อนแผนที่ไปยังพิกัดที่จะแก้ไข
      if (map) map.flyTo([editData.latitude, editData.longitude], 16);
    } else if (isOpen) {
      // ถ้าไม่มีข้อมูลแก้ไข ให้รีเซ็ตเป็นค่าว่างสำหรับปักใหม่
      setFormData({ latitude: 18.892, longitude: 99.012, detail: "", numberOfPeople: 1 });
    }
  }, [editData, isOpen, map]);

  if (!isOpen) return null;

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        setFormData(prev => ({ ...prev, latitude, longitude }));
        if (map) map.flyTo([latitude, longitude], 16);
        toast.success("ระบุพิกัดปัจจุบันสำเร็จ");
      });
    }
  };

  // ตรวจสอบ Method PATCH สำหรับการส่งข้อมูลแก้ไข
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading(editData ? "กำลังบันทึกการแก้ไข..." : "กำลังส่งข้อมูลขอความช่วยเหลือ...");
    
    try {
      if (editData) {
        // กรณีแก้ไข: ใช้ Method PATCH ไปที่ ID ของหมุดที่เลือก
        await api.patch(`/sos/${editData._id}`, formData);
        toast.success("แก้ไขข้อมูลสำเร็จ!", { id: loadingToast }); //
      } else {
        // กรณีสร้างใหม่: ใช้ POST
        await api.post("/sos", formData);
        toast.success("ส่งข้อมูลขอความช่วยเหลือสำเร็จ!", { id: loadingToast }); //
      }
      onSuccess();
      onClose();
    } catch (error: any) { 
      // หากเกิดปัญหาการเชื่อมต่อหรือสิทธิ์การแก้ไข (Role) จะแสดง Alert นี้
      const msg = error.response?.data?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่";
      toast.error(msg, { id: loadingToast }); //
    }
  };

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300 font-sans">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh]">
        <div className="flex-1 h-full relative bg-slate-100">
          {/* ส่วนแสดงแผนที่และระบบลากหมุด (Draggable Marker) */}
          {typeof window !== "undefined" && customIcon && (
            <MapContainer center={[formData.latitude, formData.longitude]} zoom={15} className="h-full w-full" ref={setMap}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker 
                position={[formData.latitude, formData.longitude]} 
                draggable={true} 
                icon={customIcon}
                eventHandlers={{
                  dragend: (e) => {
                    const { lat, lng } = e.target.getLatLng();
                    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
                  }
                }}
              />
            </MapContainer>
          )}
          <button 
            type="button"
            onClick={getLocation} 
            className="absolute bottom-6 right-6 z-[1001] bg-white p-3 rounded-full shadow-xl text-primary hover:bg-slate-50 transition active:scale-90"
          >
            <Navigation className="w-6 h-6" />
          </button>
        </div>
        
        <div className="w-full md:w-[400px] p-8 bg-slate-50 flex flex-col justify-between border-l border-slate-200">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                <MapPin className="text-red-500" /> 
                {editData ? "แก้ไขข้อมูลการช่วยเหลือ" : "ปักหมุดขอความช่วยเหลือ"}
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-medium italic">
                {editData ? "* ปรับปรุงพิกัดโดยการลากหมุดบนแผนที่" : "* ลากหมุดในแผนที่เพื่อระบุตำแหน่งที่แน่นอน"}
              </p>
            </div>
            <button type="button" onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition"><X /></button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Latitude</span>
                <p className="text-sm font-mono font-bold text-primary">{formData.latitude.toFixed(6)}</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Longitude</span>
                <p className="text-sm font-mono font-bold text-primary">{formData.longitude.toFixed(6)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 flex items-center gap-2 px-1">
                <Users className="w-4 h-4 text-primary" /> จำนวนผู้ประสบภัย (คน)
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  min="1" 
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary font-bold text-slate-700" 
                  value={formData.numberOfPeople} 
                  onChange={e => setFormData({...formData, numberOfPeople: parseInt(e.target.value)})} 
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 flex items-center gap-2 px-1">
                <Info className="w-4 h-4 text-primary" /> รายละเอียดความต้องการ
              </label>
              <textarea 
                rows={4} 
                className="w-full p-4 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary resize-none text-sm font-medium" 
                placeholder="ระบุความต้องการ เช่น ต้องการอาหาร น้ำดื่ม หรือมีผู้ป่วย..." 
                value={formData.detail} 
                onChange={e => setFormData({...formData, detail: e.target.value})} 
                required
              />
            </div>

            <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white font-black py-4 rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-all active:scale-95 shadow-primary/20">
              <Send className="w-5 h-5" /> 
              {editData ? "ยืนยันการแก้ไขข้อมูล" : "ยืนยันพิกัดและส่งคำขอ"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}