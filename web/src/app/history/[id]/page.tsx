"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Ruler, Save, Activity, CheckCircle2, TrendingDown, TrendingUp, Trash2 } from "lucide-react";

export default function HistoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const recordId = params.id as string;

  const [realGirth, setRealGirth] = useState("");

  // Dummy record data matching the history list
  let record = {
    id: recordId,
    type: "โคเนื้อ",
    time: "วันนี้ 10:30 น.",
    aiWeight: 450.2,
    aiGirth: 152.5,
    accuracy: 92,
    imageUrl: "https://images.unsplash.com/photo-1546445317-29f4545e9d53?q=80&w=600&auto=format&fit=crop"
  };

  if (recordId === "B002") {
    record = {
      id: "B002", type: "กระบือ", time: "วันนี้ 14:15 น.",
      aiWeight: 380.5, aiGirth: 140.0, accuracy: 88,
      imageUrl: "https://images.unsplash.com/photo-1596733430284-f7437764b1a9?q=80&w=600&auto=format&fit=crop"
    };
  } else if (recordId === "C003") {
    record = {
      id: "C003", type: "โคเนื้อ", time: "เมื่อวาน 09:00 น.",
      aiWeight: 420.0, aiGirth: 148.5, accuracy: 95,
      imageUrl: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?q=80&w=600&auto=format&fit=crop"
    };
  } else if (recordId === "B001") {
    record = {
      id: "B001", type: "กระบือ", time: "10 ส.ค. 2026",
      aiWeight: 410.3, aiGirth: 142.0, accuracy: 90,
      imageUrl: "https://images.unsplash.com/photo-1623868270519-21cb0a6ef2fa?q=80&w=600&auto=format&fit=crop"
    };
  } else if (recordId === "C002") {
    record = {
      id: "C002", type: "โคเนื้อ", time: "12 ส.ค. 2026",
      aiWeight: 512.0, aiGirth: 160.0, accuracy: 94,
      imageUrl: "https://images.unsplash.com/photo-1546455644-884813586036?q=80&w=600&auto=format&fit=crop"
    };
  }

  // Mock calculation: (Girth^2) / 50 
  const calculatedWeight = realGirth ? (Math.pow(Number(realGirth), 2) / 50).toFixed(1) : "-";
  const weightDiff = realGirth ? (Number(calculatedWeight) - record.aiWeight).toFixed(1) : "-";
  const diffNumber = Number(weightDiff);

  const handleDelete = () => {
    if (window.confirm("คุณต้องการลบประวัติการชั่งครั้งนี้ใช่หรือไม่?")) {
      router.push("/history");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0fdf4] to-[#dcfce7] text-gray-800 pb-10">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#064e3b] to-[#047857] text-white p-4 shadow-lg flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center space-x-4">
          <Link href="/history" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all active:scale-95">
            <ArrowLeft size={22} className="text-emerald-50" />
          </Link>
          <h1 className="text-xl font-bold tracking-wide">รายละเอียด {record.type} #{record.id}</h1>
        </div>
        <button onClick={handleDelete} className="p-2 bg-red-500/20 text-red-100 rounded-full hover:bg-red-500/40 transition-colors">
          <Trash2 size={20} />
        </button>
      </header>

      <div className="px-5 mt-6 space-y-6">
        {/* Image Section */}
        <div className="glass-panel rounded-3xl overflow-hidden shadow-sm p-3">
          <div className="relative w-full h-56 rounded-2xl overflow-hidden border border-emerald-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={record.imageUrl} 
              alt={`รูปภาพ ${record.type}`} 
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/70 to-transparent p-3 pt-10">
              <p className="text-white font-bold">{record.time}</p>
              <div className="inline-flex items-center space-x-1 mt-1 bg-green-500/20 backdrop-blur-md px-2 py-0.5 rounded-full border border-green-400/30">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                <p className="text-[10px] text-green-100 font-medium">AI ความแม่นยำ {record.accuracy}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Estimation Result */}
        <div className="glass-panel rounded-3xl p-5 border border-emerald-100">
          <h2 className="text-lg font-bold text-[#064e3b] mb-4 flex items-center gap-2">
            <Activity size={20} /> ผลการวิเคราะห์จาก AI
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-center shadow-sm">
              <p className="text-xs text-gray-500 font-medium mb-1">น้ำหนักประเมิน (AI)</p>
              <p className="text-2xl font-bold text-[#064e3b]">{record.aiWeight} <span className="text-sm font-medium text-gray-400">KG</span></p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 text-center shadow-sm relative overflow-hidden">
              <p className="text-xs text-gray-500 font-medium mb-1">รอบอกประเมิน (AI)</p>
              <p className="text-2xl font-bold text-blue-800">{record.aiGirth} <span className="text-sm font-medium text-gray-400">CM</span></p>
            </div>
          </div>
        </div>

        {/* User Input & Comparison */}
        <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100">
          <h2 className="text-lg font-bold text-[#064e3b] mb-4 flex items-center gap-2">
            <Ruler size={20} /> เทียบกับข้อมูลรอบอกจริง
          </h2>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                ใส่ค่ารอบอกที่วัดได้จริง (เซนติเมตร)
              </label>
              <input 
                type="number"
                value={realGirth}
                onChange={(e) => setRealGirth(e.target.value)}
                placeholder="เช่น 150"
                className="w-full px-5 py-4 border-2 border-emerald-100 rounded-2xl focus:ring-4 focus:ring-emerald-50 focus:border-[#047857] outline-none transition-all text-lg font-bold text-center text-[#064e3b]"
              />
            </div>

            {realGirth && (
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 animate-in fade-in slide-in-from-top-4 duration-300">
                <p className="text-center text-sm text-gray-500 mb-3">ผลการคำนวณเปรียบเทียบ</p>
                
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-600 font-medium">น้ำหนักจากสูตรรอบอก:</span>
                  <span className="font-bold text-xl text-[#064e3b]">{calculatedWeight} kg</span>
                </div>
                
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="text-gray-600 font-medium">ส่วนต่างกับ AI:</span>
                  <div className={`flex items-center gap-1 font-bold text-lg ${diffNumber > 0 ? 'text-red-500' : diffNumber < 0 ? 'text-blue-500' : 'text-green-500'}`}>
                    {diffNumber > 0 ? <TrendingUp size={20} /> : diffNumber < 0 ? <TrendingDown size={20} /> : <CheckCircle2 size={20} />}
                    <span>{diffNumber > 0 ? "+" : ""}{weightDiff} kg</span>
                  </div>
                </div>
              </div>
            )}

            <button 
              disabled={!realGirth}
              className={`w-full font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-md ${
                realGirth ? 'bg-[#064e3b] text-white hover:bg-[#047857] active:scale-[0.98]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Save size={20} /> บันทึกข้อมูลและปรับปรุง AI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
