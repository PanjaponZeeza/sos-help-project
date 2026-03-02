"use client";
import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import api from "../../services/api";
import { Send, MapPin, Users, ChevronLeft, Navigation } from "lucide-react";

// เรียกใช้ Map แบบ Dynamic เพื่อป้องกัน SSR Error
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });

export default function RequestPage() {
  const [formData, setFormData] = useState({
    latitude: 18.892, // พิกัดเริ่มต้น (ม.แม่โจ้)
    longitude: 99.012,
    detail: "",
    numberOfPeople: 1,
  });

  // ฟังก์ชันดึงพิกัดปัจจุบัน
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setFormData({
          ...formData,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      });
    }
  };

  // ส่วนของหมุดที่ลากได้ (Draggable)
  const DraggableMarker = () => {
    const eventHandlers = useMemo(
      () => ({
        dragend(e: any) {
          const marker = e.target;
          const position = marker.getLatLng();
          setFormData({ ...formData, latitude: position.lat, longitude: position.lng });
        },
      }),
      [],
    );

    return (
      <Marker
        draggable={true}
        eventHandlers={eventHandlers}
        position={[formData.latitude, formData.longitude]}
      />
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/sos", formData);
      alert("ส่งข้อมูลขอความช่วยเหลือเรียบร้อยแล้ว!");
      window.location.href = "/dashboard";
    } catch (error) {
      alert("กรุณาเข้าสู่ระบบก่อนส่งข้อมูล");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 font-sans">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* ฝั่งซ้าย: แผนที่สำหรับเลือกพิกัด */}
        <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <MapPin className="text-primary" /> ลากหมุดเพื่อระบุตำแหน่ง
            </h2>
            <button onClick={getLocation} className="p-2 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition">
              <Navigation className="w-5 h-5" />
            </button>
          </div>
          <div className="h-[400px] rounded-xl overflow-hidden border-2 border-slate-100">
            <MapContainer center={[formData.latitude, formData.longitude]} zoom={15} style={{ height: "100%", width: "100%" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <DraggableMarker />
            </MapContainer>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">* คุณสามารถลากหมุดสีน้ำเงินไปวางตรงจุดที่ต้องการความช่วยเหลือได้ทันที</p>
        </div>

        {/* ฝั่งขวา: ฟอร์มกรอกข้อมูล */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border-t-8 border-primary">
          <button onClick={() => window.location.href = "/"} className="flex items-center gap-1 text-slate-400 text-sm mb-4 hover:text-primary">
            <ChevronLeft className="w-4 h-4" /> กลับหน้าหลัก
          </button>
          <h1 className="text-2xl font-bold text-slate-800 mb-6">รายละเอียดความช่วยเหลือ</h1>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Latitude</label>
                <div className="text-sm font-mono text-slate-700">{formData.latitude.toFixed(6)}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Longitude</label>
                <div className="text-sm font-mono text-slate-700">{formData.longitude.toFixed(6)}</div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-600">จำนวนผู้ประสบภัย (คน)</label>
              <div className="relative">
                <Users className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input 
                  type="number" min="1" required
                  className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                  value={formData.numberOfPeople}
                  onChange={(e) => setFormData({...formData, numberOfPeople: parseInt(e.target.value)})}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-600">รายละเอียดเพิ่มเติม</label>
              <textarea 
                required rows={4}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="ระบุสิ่งที่ต้องการ เช่น อาหาร น้ำ หรือยารักษาโรค..."
                value={formData.detail}
                onChange={(e) => setFormData({...formData, detail: e.target.value})}
              ></textarea>
            </div>

            <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-2xl shadow-blue-200 shadow-lg flex items-center justify-center gap-2 transform active:scale-95 transition">
              <Send className="w-5 h-5" /> ยืนยันการส่งพิกัดด่วน
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}