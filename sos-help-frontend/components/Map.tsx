"use client";
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip, LayersControl, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Navigation, Map as MapIcon, Search, Target, Compass, Layers, ShieldCheck, User } from "lucide-react";
import { jwtDecode } from "jwt-decode";

// ตั้งค่าไอคอนแยกสีสถานะ
const redIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const greenIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

function SearchHandler({ searchCoords }: { searchCoords: [number, number] | null }) {
  const map = useMap();
  if (searchCoords) {
    map.flyTo(searchCoords, 17, { duration: 2 });
  }
  return null;
}

export default function Map({ sosList }: { sosList: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [targetCoords, setTargetCoords] = useState<[number, number] | null>(null);
  const [userRole, setUserRole] = useState('guest');

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setUserRole(decoded.role);
      } catch (e) {
        setUserRole('guest');
      }
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;

    const coordMatch = searchQuery.match(/^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/);
    if (coordMatch) {
      setTargetCoords([parseFloat(coordMatch[1]), parseFloat(coordMatch[3])]);
      return;
    }

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`);
      const data = await res.json();
      if (data && data.length > 0) {
        setTargetCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
      } else {
        alert("ไม่พบพิกัดหรือสถานที่นี้ กรุณาตรวจสอบอีกครั้ง");
      }
    } catch (err) {
      console.error("Search error", err);
    }
  };

  return (
    <div className="w-full h-full relative group font-sans">
      <style jsx global>{`
        .leaflet-container { 
          width: 100%; 
          height: 100% !important; 
          border-radius: inherit; 
          z-index: 10 !important; 
        }
        .custom-tooltip { background-color: rgba(15, 23, 42, 0.95); border: none; border-radius: 12px; color: white; padding: 10px 16px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); font-family: inherit; }
        .custom-tooltip:before { border-top-color: rgba(15, 23, 42, 0.95); }
        .leaflet-popup-content-wrapper { border-radius: 2rem; padding: 0; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
        .leaflet-popup-content { margin: 0; width: 280px !important; }
        .leaflet-control-layers { border-radius: 12px !important; border: none !important; box-shadow: 0 4px 6px rgba(0,0,0,0.1) !important; margin-top: 10px !important; }
        
        /* Responsive Zoom Control Position */
        @media (max-width: 1024px) {
          .leaflet-top.leaflet-left { margin-top: 220px !important; }
        }
        @media (min-width: 1025px) {
          .leaflet-top.leaflet-left { margin-top: 180px !important; }
        }
      `}</style>

      {/* 🛠️ ส่วนควบคุมหลัก: ปรับระยะห่างและขนาดตามขนาดหน้าจอ (Responsive) */}
      <div className="absolute top-4 lg:top-12 left-4 lg:left-10 z-[500] flex flex-col gap-3 lg:gap-4 w-[calc(100%-2rem)] lg:w-auto pointer-events-none">
        
        {/* 1. กล่องสถานะพิกัด (HUD) - ยืดหยุ่นตามหน้าจอ */}
        <div className="bg-slate-900/90 backdrop-blur-xl px-4 lg:px-6 py-3 lg:py-5 rounded-2xl lg:rounded-[2.5rem] border border-white/10 shadow-2xl ring-1 ring-white/20 w-full lg:w-[360px] pointer-events-auto transition-all">
          <div className="flex items-center gap-2.5 mb-2 lg:mb-4">
            <Compass className="text-primary w-3.5 h-3.5 lg:w-4 lg:h-4 animate-spin" style={{ animationDuration: '10s' }} />
            <p className="text-[8px] lg:text-[9px] font-black text-primary-light uppercase tracking-[0.4em] opacity-70">
              {userRole === 'admin' ? "สถานะพิกัดกู้ภัย v2.0" : "สัญลักษณ์สถานะการช่วยเหลือ"}
            </p>
          </div>
          <div className="flex items-center justify-between px-1 lg:px-2">
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.8)]"></div>
              <div className="flex flex-col">
                <span className="text-[9px] lg:text-[10px] font-black text-white uppercase tracking-wider">รอรับช่วยเหลือ</span>
                <span className="text-[7px] lg:text-[8px] text-red-400 font-bold uppercase">รอดำเนินการ</span>
              </div>
            </div>
            <div className="w-px h-6 lg:h-8 bg-white/10 mx-1 lg:mx-2"></div>
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.8)]"></div>
              <div className="flex flex-col">
                <span className="text-[9px] lg:text-[10px] font-black text-white uppercase tracking-wider">ช่วยเหลือสำเร็จ</span>
                <span className="text-[7px] lg:text-[8px] text-green-400 font-bold uppercase">เสร็จสิ้น</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. ช่องค้นหาพิกัด / สถานที่ - ขยายเต็มหน้าจอมือถือ */}
        <div className="w-full lg:w-[360px] pointer-events-auto">
          <form onSubmit={handleSearch} className="relative group shadow-2xl">
            <div className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 p-1.5 lg:p-2 bg-primary/10 rounded-lg text-primary group-focus-within:bg-primary group-focus-within:text-white transition-all">
              <Search className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
            </div>
            <input 
              type="text" 
              placeholder="ค้นหาพิกัด หรือชื่อสถานที่..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 lg:pl-14 pr-16 lg:pr-20 py-3 lg:py-4 bg-white/95 backdrop-blur-md border border-white rounded-xl lg:rounded-[1.8rem] outline-none focus:ring-4 focus:ring-primary/20 transition-all font-bold text-[10px] lg:text-xs text-slate-700 shadow-xl"
            />
            <button 
              type="submit"
              className="absolute right-1.5 lg:right-2 top-1/2 -translate-y-1/2 bg-slate-900 text-white px-3 lg:px-4 py-1.5 lg:py-2.5 rounded-lg lg:rounded-[1.2rem] text-[8px] lg:text-[9px] font-black uppercase tracking-widest hover:bg-primary transition-all active:scale-95"
            >
              ค้นหา
            </button>
          </form>
        </div>
      </div>

      <MapContainer 
        center={[18.892, 99.012]} 
        zoom={14} 
        className="h-full w-full outline-none"
      >
        <SearchHandler searchCoords={targetCoords} />
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="🗺️ แผนที่มาตรฐาน">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='© OpenStreetMap' />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="🛰️ ภาพถ่ายดาวเทียม">
            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution='© ESRI' />
          </LayersControl.BaseLayer>
        </LayersControl>
        
        {sosList.map((item) => (
          <Marker key={item._id} position={[item.latitude, item.longitude]} icon={item.status === 'pending' ? redIcon : greenIcon}>
            <Tooltip direction="top" offset={[0, -32]} opacity={1} className="custom-tooltip hidden sm:block">
              <div className="text-[12px] font-bold">
                <span className={item.status === 'pending' ? 'text-red-400' : 'text-green-400'}>● {item.status === 'pending' ? 'รอรับความช่วยเหลือ' : 'ช่วยเหลือสำเร็จ'}</span>
                <p className="mt-1 line-clamp-1 italic text-slate-200">"{item.detail}"</p>
              </div>
            </Tooltip>
            <Popup>
              <div className="font-sans overflow-hidden">
                <div className="p-4 lg:p-5 bg-slate-50 border-b border-slate-100 text-center">
                  <span className={`text-[9px] lg:text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-wider inline-block mb-2 shadow-sm ${item.status === 'pending' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                    {item.status === 'pending' ? 'รอรับความช่วยเหลือ' : 'ช่วยเหลือสำเร็จ'}
                  </span>
                  <h3 className="font-black text-slate-800 text-sm lg:text-base leading-tight italic">"{item.detail}"</h3>
                </div>
                <div className="p-4 lg:p-5 space-y-3 lg:space-y-4">
                  <div className="flex items-center justify-between bg-primary/5 p-2 lg:p-3 rounded-xl lg:rounded-2xl border border-primary/10">
                    <div className="flex flex-col"><span className="text-[9px] lg:text-[10px] text-slate-400 font-black uppercase tracking-widest mb-0.5">ผู้ประสบภัย</span><span className="font-black text-primary text-base lg:text-lg">{item.numberOfPeople} คน</span></div>
                    <Target className="w-5 h-5 lg:w-6 lg:h-6 text-primary/20" />
                  </div>
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 lg:gap-3 w-full bg-slate-900 hover:bg-black text-white font-black py-3 lg:py-4 rounded-xl lg:rounded-2xl transition-all shadow-xl active:scale-95 group">
                    <Navigation className="w-3.5 h-3.5 lg:w-4 lg:h-4 fill-white group-hover:animate-bounce" />
                    <span className="text-[9px] lg:text-[10px] uppercase tracking-[0.2em]">นำทางด้วย GOOGLE MAPS</span>
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}