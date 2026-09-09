"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Edit3, Camera, Activity, Calendar, Save, X, Plus, Trash2, TrendingUp, Ruler } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function AnimalHistoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const animalId = params.id as string;
  const fromHistory = searchParams.get('from') === 'history';
  
  // Use state for animal to allow dynamic updating
  const [animal, setAnimal] = useState<any>(null);
  const [isEditingAnimal, setIsEditingAnimal] = useState(false);
  const [animalName, setAnimalName] = useState("");
  const [animalAge, setAnimalAge] = useState("");
  
  const [editingHistory, setEditingHistory] = useState<number | null>(null);
  const [editGirth, setEditGirth] = useState("");
  const [editHeight, setEditHeight] = useState("");

  const [viewImage, setViewImage] = useState<string | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);

  useEffect(() => {
    // Initial mock data dictionary
    const initialMockData: Record<string, any> = {
      "C001": {
        id: "C001", name: "โคเนื้อ #C001", type: "โคเนื้อ", age: "2 ปี 5 เดือน",
        image: "https://images.unsplash.com/photo-1546445317-29f4545e9d53?q=80&w=600&auto=format&fit=crop",
        history: [
          { attempt: 3, date: "วันนี้", time: "10:30 น.", aiWeight: 450.2, aiGirth: 150.0, aiHeight: 145.5, realGirth: 152, realHeight: 146, isDeleted: false, scanImage: "https://images.unsplash.com/photo-1546445317-29f4545e9d53?q=80&w=400&auto=format&fit=crop" },
          { attempt: 2, date: "25 ก.ค. 2026", time: "09:15 น.", aiWeight: 420.5, aiGirth: 145.2, aiHeight: 142.0, realGirth: null, realHeight: null, isDeleted: false, scanImage: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?q=80&w=400&auto=format&fit=crop" },
          { attempt: 1, date: "20 มิ.ย. 2026", time: "14:00 น.", aiWeight: 390.1, aiGirth: 139.0, aiHeight: 138.5, realGirth: 140, realHeight: 139, isDeleted: false, scanImage: "https://images.unsplash.com/photo-1596733430284-f7437764b1a9?q=80&w=400&auto=format&fit=crop" },
        ]
      },
      "B002": {
        id: "B002", name: "กระบือ #B002", type: "กระบือ", age: "3 ปี 2 เดือน",
        image: "https://images.unsplash.com/photo-1596733430284-f7437764b1a9?q=80&w=600&auto=format&fit=crop",
        history: [
          { attempt: 2, date: "วันนี้", time: "14:15 น.", aiWeight: 380.5, aiGirth: 140.0, aiHeight: 135.0, realGirth: null, realHeight: null, isDeleted: false, scanImage: "https://images.unsplash.com/photo-1596733430284-f7437764b1a9?q=80&w=400&auto=format&fit=crop" },
          { attempt: 1, date: "10 พ.ค. 2026", time: "08:30 น.", aiWeight: 360.0, aiGirth: 135.0, aiHeight: 130.0, realGirth: 135, realHeight: 132, isDeleted: false },
        ]
      },
      "B001": {
        id: "B001", name: "บุญรอด", type: "กระบือ", age: "2 ปี 1 เดือน",
        image: "https://images.unsplash.com/photo-1623868270519-21cb0a6ef2fa?q=80&w=600&auto=format&fit=crop",
        history: [
          { attempt: 1, date: "10 ส.ค. 2026", time: "11:00 น.", aiWeight: 410.3, aiGirth: 142.0, aiHeight: 138.0, realGirth: 142, realHeight: null, isDeleted: false, scanImage: "https://images.unsplash.com/photo-1623868270519-21cb0a6ef2fa?q=80&w=400&auto=format&fit=crop" },
        ]
      },
      "C002": {
        id: "C002", name: "สีนวล", type: "โคเนื้อ", age: "1 ปี 8 เดือน",
        image: "https://images.unsplash.com/photo-1546455644-884813586036?q=80&w=600&auto=format&fit=crop",
        history: [
          { attempt: 2, date: "12 ส.ค. 2026", time: "16:20 น.", aiWeight: 512.0, aiGirth: 160.0, aiHeight: 150.0, realGirth: 161, realHeight: 151, isDeleted: false, scanImage: "https://images.unsplash.com/photo-1546455644-884813586036?q=80&w=400&auto=format&fit=crop" },
          { attempt: 1, date: "10 มิ.ย. 2026", time: "10:00 น.", aiWeight: 480.0, aiGirth: 155.0, aiHeight: 145.0, realGirth: null, realHeight: null, isDeleted: false },
        ]
      }
    };

    // Load from localStorage or use initial
    const storedData = localStorage.getItem("mockAnimals");
    let allData = initialMockData;
    
    if (storedData) {
      allData = JSON.parse(storedData);
    } else {
      localStorage.setItem("mockAnimals", JSON.stringify(initialMockData));
    }

    const currentAnimal = allData[animalId] || initialMockData["C001"];
    setAnimal(currentAnimal);
    setAnimalName(currentAnimal.name);
    setAnimalAge(currentAnimal.age);
  }, [animalId]);

  const handleSaveAnimalInfo = () => {
    const updatedAnimal = { ...animal, name: animalName, age: animalAge };
    setAnimal(updatedAnimal);
    
    const storedData = localStorage.getItem("mockAnimals");
    if (storedData) {
      const allData = JSON.parse(storedData);
      allData[animalId] = updatedAnimal;
      localStorage.setItem("mockAnimals", JSON.stringify(allData));
    }
    setIsEditingAnimal(false);
  };

  const handleSaveHistory = (attempt: number) => {
    const updatedHistory = animal.history.map((record: any) => {
      if (record.attempt === attempt) {
        return {
          ...record,
          realGirth: editGirth ? Number(editGirth) : null,
          realHeight: editHeight ? Number(editHeight) : null
        };
      }
      return record;
    });

    const updatedAnimal = { ...animal, history: updatedHistory };
    setAnimal(updatedAnimal);
    
    const storedData = localStorage.getItem("mockAnimals");
    if (storedData) {
      const allData = JSON.parse(storedData);
      allData[animalId] = updatedAnimal;
      localStorage.setItem("mockAnimals", JSON.stringify(allData));
    }
    
    setEditingHistory(null);
  };

  const handleDeleteRecord = (attempt: number) => {
    if (window.confirm('คุณต้องการลบประวัตินี้ใช่หรือไม่? (สามารถกู้คืนได้ภายหลัง)')) {
      const updatedHistory = animal.history.map((record: any) => {
        if (record.attempt === attempt) return { ...record, isDeleted: true };
        return record;
      });
      const updatedAnimal = { ...animal, history: updatedHistory };
      setAnimal(updatedAnimal);
      
      const storedData = localStorage.getItem("mockAnimals");
      if (storedData) {
        const allData = JSON.parse(storedData);
        allData[animalId] = updatedAnimal;
        localStorage.setItem("mockAnimals", JSON.stringify(allData));
      }
    }
  };

  const handleRestoreRecord = (attempt: number) => {
    const updatedHistory = animal.history.map((record: any) => {
      if (record.attempt === attempt) return { ...record, isDeleted: false };
      return record;
    });
    const updatedAnimal = { ...animal, history: updatedHistory };
    setAnimal(updatedAnimal);
    
    const storedData = localStorage.getItem("mockAnimals");
    if (storedData) {
      const allData = JSON.parse(storedData);
      allData[animalId] = updatedAnimal;
      localStorage.setItem("mockAnimals", JSON.stringify(allData));
    }
  };

  const handleDeleteAnimal = () => {
    if (window.confirm(`คุณต้องการลบข้อมูลของ "${animal.name}" และประวัติทั้งหมดออกจากฟาร์มใช่หรือไม่?`)) {
      const storedData = localStorage.getItem("mockAnimals");
      if (storedData) {
        const allData = JSON.parse(storedData);
        if (allData[animal.id]) {
          allData[animal.id].isDeleted = true;
          localStorage.setItem("mockAnimals", JSON.stringify(allData));
        }
      }
      router.push("/animals");
    }
  };

  if (!animal) return <div className="min-h-screen bg-[#f0fdf4] flex items-center justify-center">กำลังโหลดข้อมูล...</div>;

  const activeHistory = animal.history.filter((h: any) => !h.isDeleted);
  const deletedHistory = animal.history.filter((h: any) => h.isDeleted);

  const chartData = [...activeHistory].reverse().map((h: any) => {
    const calWeight = h.realGirth ? Number((Math.pow(Number(h.realGirth), 2) / 50).toFixed(1)) : null;
    return {
      name: `ครั้งที่ ${h.attempt}`,
      date: h.date,
      น้ำหนัก: h.aiWeight,
      น้ำหนักจริง: calWeight,
      ส่วนสูง: h.aiHeight,
      ส่วนสูงจริง: h.realHeight ? Number(h.realHeight) : null
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0fdf4] to-[#dcfce7] text-gray-800 pb-20 relative">
      {/* Header Image & Actions */}
      <div className="relative h-72 bg-[#064e3b]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={animal.image} alt={animal.name} className="w-full h-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#064e3b] via-transparent to-transparent"></div>
        
        {/* Top bar */}
        <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-10">
          <Link href={fromHistory ? "/history" : "/animals"} className="p-2.5 bg-black/30 backdrop-blur-md rounded-full hover:bg-black/50 transition-all active:scale-95 border border-white/20">
            <ArrowLeft size={22} className="text-white" />
          </Link>
          <div className="flex space-x-2">
            <Link href={`/scan?animalId=${animal.id}`} className="p-2.5 bg-black/30 backdrop-blur-md rounded-full hover:bg-black/50 transition-all active:scale-95 border border-white/20">
              <Camera size={22} className="text-white" />
            </Link>
            <button onClick={handleDeleteAnimal} className="p-2.5 bg-red-500/80 backdrop-blur-md rounded-full hover:bg-red-600 transition-all active:scale-95 border border-red-400/50">
              <Trash2 size={22} className="text-white" />
            </button>
          </div>
        </div>

        {/* Animal Info Overlay */}
        <div className="absolute bottom-0 left-0 w-full p-5 text-white">
          <div className="flex justify-between items-end">
            <div>
              <div className="inline-flex items-center space-x-2 mb-2">
                <span className="bg-emerald-500/80 backdrop-blur-sm px-2.5 py-0.5 rounded-md text-[10px] font-bold border border-emerald-400">
                  {animal.type}
                </span>
                <span className="text-emerald-200 text-sm font-medium">#{animal.id}</span>
              </div>
              
              {isEditingAnimal ? (
                <div className="space-y-2 mt-1">
                  <input 
                    type="text" 
                    value={animalName}
                    onChange={(e) => setAnimalName(e.target.value)}
                    placeholder="ชื่อสัตว์"
                    className="block bg-white/20 border border-white/50 rounded-lg px-3 py-1 text-white font-bold text-2xl w-56 focus:outline-none focus:bg-white/30"
                  />
                  <div className="flex flex-col space-y-2">
                    <input 
                      type="text" 
                      value={animalAge}
                      onChange={(e) => setAnimalAge(e.target.value)}
                      placeholder="อายุ (เช่น 2 ปี)"
                      className="bg-white/20 border border-white/50 rounded-lg px-3 py-1.5 text-white text-sm w-56 focus:outline-none focus:bg-white/30"
                    />
                    <div className="flex space-x-2">
                      <button onClick={handleSaveAnimalInfo} className="flex-1 py-2 bg-emerald-500 rounded-lg text-white font-bold text-sm hover:bg-emerald-600 transition-colors">
                        เสร็จสิ้น
                      </button>
                      <button onClick={() => setIsEditingAnimal(false)} className="flex-1 py-2 bg-white/20 rounded-lg text-white font-bold text-sm hover:bg-white/30 transition-colors">
                        ยกเลิก
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <h1 className="text-4xl font-bold tracking-wide drop-shadow-md">{animalName}</h1>
                    <button onClick={() => setIsEditingAnimal(true)} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm">
                      <Edit3 size={16} />
                    </button>
                  </div>
                  <p className="text-emerald-100 text-sm font-medium">อายุ: {animalAge}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-5 mt-6 space-y-6">
        
        {/* Stats Overview */}
        <div className="glass-panel rounded-3xl p-5 border border-emerald-100 flex justify-around">
          <div className="text-center">
            <p className="text-xs text-gray-500 font-medium mb-1">น้ำหนักล่าสุด (AI)</p>
            <p className="text-2xl font-bold text-[#064e3b]">{animal.history[0].aiWeight} <span className="text-sm font-medium text-gray-400">KG</span></p>
          </div>
          <div className="w-px bg-gray-200"></div>
          <div className="text-center">
            <p className="text-xs text-gray-500 font-medium mb-1">ส่วนสูงล่าสุด (AI)</p>
            <p className="text-2xl font-bold text-emerald-700">{animal.history[0].aiHeight} <span className="text-sm font-medium text-gray-400">CM</span></p>
          </div>
        </div>

        {/* Growth Charts */}
        {chartData.length > 1 && (
          <div className="space-y-6">
            {/* Weight Chart */}
            <div>
              <h2 className="text-lg font-bold text-[#064e3b] flex items-center gap-2 mb-4 px-1">
                <TrendingUp size={20} /> กราฟน้ำหนัก
              </h2>
              <div className="h-64 w-full bg-white rounded-3xl p-4 shadow-sm border border-emerald-100">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorRealW" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 'bold' }} dy={10} />
                    <YAxis 
                      domain={[(dataMin: number) => Math.max(0, Math.floor(dataMin - 20)), (dataMax: number) => Math.ceil(dataMax + 100)]} 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 'bold' }} 
                      width={40}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                      labelFormatter={(label, payload) => payload && payload.length ? `${label} (${payload[0].payload.date})` : label}
                    />
                    <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                    <Area 
                      type="linear" 
                      dataKey="น้ำหนัก" 
                      name="AI (KG)"
                      stroke="#059669" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#colorWeight)" 
                      dot={{ r: 4, fill: '#059669', stroke: '#fff', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: '#064e3b', stroke: '#fff', strokeWidth: 2 }}
                    />
                    <Area 
                      type="linear" 
                      dataKey="น้ำหนักจริง" 
                      name="วัดจริง (KG)"
                      stroke="#2563eb" 
                      strokeWidth={3} 
                      fillOpacity={0.8} 
                      fill="url(#colorRealW)" 
                      connectNulls={true}
                      dot={{ r: 4, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: '#1e40af', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Height Chart */}
            <div>
              <h2 className="text-lg font-bold text-[#064e3b] flex items-center gap-2 mb-4 px-1">
                <Ruler size={20} /> กราฟส่วนสูง
              </h2>
              <div className="h-64 w-full bg-white rounded-3xl p-4 shadow-sm border border-emerald-100">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorHeight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ea580c" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorRealH" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 'bold' }} dy={10} />
                    <YAxis 
                      domain={[(dataMin: number) => Math.max(0, Math.floor(dataMin - 10)), (dataMax: number) => Math.ceil(dataMax + 20)]} 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 'bold' }} 
                      width={40}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                      labelFormatter={(label, payload) => payload && payload.length ? `${label} (${payload[0].payload.date})` : label}
                    />
                    <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                    <Area 
                      type="linear" 
                      dataKey="ส่วนสูง" 
                      name="AI (CM)"
                      stroke="#ea580c" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#colorHeight)" 
                      dot={{ r: 4, fill: '#ea580c', stroke: '#fff', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: '#9a3412', stroke: '#fff', strokeWidth: 2 }}
                    />
                    <Area 
                      type="linear" 
                      dataKey="ส่วนสูงจริง" 
                      name="วัดจริง (CM)"
                      stroke="#2563eb" 
                      strokeWidth={3} 
                      fillOpacity={0.8} 
                      fill="url(#colorRealH)" 
                      connectNulls={true}
                      dot={{ r: 4, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: '#1e40af', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Timeline History */}
        <div>
          <div className="flex items-center justify-between mb-5 px-1">
            <h2 className="text-lg font-bold text-[#064e3b] flex items-center gap-2">
              <Calendar size={20} /> ประวัติการทำนายน้ำหนัก
            </h2>
            <Link href={`/scan?animalId=${animal.id}`} className="text-sm text-emerald-600 font-bold bg-emerald-100 px-3 py-1.5 rounded-full hover:bg-emerald-200 transition-colors flex items-center gap-1">
              <Plus size={14} /> เพิ่มข้อมูลใหม่
            </Link>
          </div>

          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[23px] before:w-0.5 before:bg-emerald-100">
            {activeHistory.map((record: any) => {
              const calWeight = record.realGirth ? (Math.pow(Number(record.realGirth), 2) / 50).toFixed(1) : "-";
              
              return (
              <div key={record.attempt} className="relative flex items-start group">
                <div className="absolute left-0 mt-1.5 w-12 h-12 bg-white border-4 border-emerald-100 rounded-full flex items-center justify-center z-10 shadow-sm font-bold text-emerald-700 text-sm">
                  #{record.attempt}
                </div>
                
                <div className="ml-16 w-full glass-panel rounded-3xl p-4 border border-gray-100/50 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3 border-b border-gray-100 pb-3">
                    <div className="flex gap-3 items-center">
                      {record.scanImage && (
                        <div 
                          className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border-2 border-emerald-100 shadow-sm cursor-pointer hover:border-emerald-300 transition-colors" 
                          onClick={() => setViewImage(record.scanImage)}
                        >
                          <img src={record.scanImage} alt="Scan" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-[#064e3b]">{record.date}</p>
                        <p className="text-xs text-gray-500 mt-0.5">เวลา {record.time}</p>
                      </div>
                    </div>
                    {editingHistory !== record.attempt && (
                      <div className="flex gap-1">
                        <button 
                          onClick={() => {
                            setEditingHistory(record.attempt);
                            setEditGirth(record.realGirth?.toString() || "");
                            setEditHeight(record.realHeight?.toString() || "");
                          }}
                          className="p-1.5 text-gray-400 hover:text-emerald-600 bg-gray-50 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteRecord(record.attempt)}
                          className="p-1.5 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 4 Data Points Grid */}
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="bg-emerald-50/50 p-2.5 rounded-xl text-center">
                      <p className="text-[10px] text-gray-500 font-medium">น้ำหนัก (AI)</p>
                      <p className="font-bold text-[#047857] text-[15px]">{record.aiWeight} <span className="text-[9px] text-gray-400">KG</span></p>
                    </div>
                    <div className="bg-emerald-50/50 p-2.5 rounded-xl text-center">
                      <p className="text-[10px] text-gray-500 font-medium">รอบอก (AI)</p>
                      <p className="font-bold text-[#047857] text-[15px]">{record.aiGirth} <span className="text-[9px] text-gray-400">CM</span></p>
                    </div>
                    <div className="bg-emerald-50/50 p-2.5 rounded-xl text-center">
                      <p className="text-[10px] text-gray-500 font-medium">ส่วนสูง (AI)</p>
                      <p className="font-bold text-[#047857] text-[15px]">{record.aiHeight} <span className="text-[9px] text-gray-400">CM</span></p>
                    </div>
                    <div className="bg-blue-50/50 p-2.5 rounded-xl text-center">
                      <p className="text-[10px] text-gray-500 font-medium">นน. จากรอบอกจริง</p>
                      <p className="font-bold text-blue-700 text-[15px]">{calWeight} {calWeight !== "-" && <span className="text-[9px] text-gray-400">KG</span>}</p>
                    </div>
                  </div>

                  {/* Edit Form */}
                  {editingHistory === record.attempt ? (
                    <div className="mt-3 pt-3 border-t border-emerald-100 animate-in fade-in slide-in-from-top-2 space-y-2">
                      <div>
                        <label className="block text-[11px] font-bold text-[#064e3b] mb-1">รอบอกจริง (ซม.)</label>
                        <input 
                          type="number"
                          value={editGirth}
                          onChange={(e) => setEditGirth(e.target.value)}
                          placeholder="ยังไม่มีข้อมูล"
                          className="w-full px-3 py-2 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold text-[#064e3b]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#064e3b] mb-1">ส่วนสูงจริง (ซม.)</label>
                        <input 
                          type="number"
                          value={editHeight}
                          onChange={(e) => setEditHeight(e.target.value)}
                          placeholder="ยังไม่มีข้อมูล"
                          className="w-full px-3 py-2 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold text-[#064e3b]"
                        />
                      </div>
                      <div className="flex space-x-2 pt-1">
                        <button onClick={() => handleSaveHistory(record.attempt)} className="flex-1 py-2 flex justify-center items-center bg-[#064e3b] text-white rounded-xl hover:bg-[#047857] transition-colors text-sm font-bold">
                          เสร็จสิ้น
                        </button>
                        <button onClick={() => setEditingHistory(null)} className="flex-1 py-2 flex justify-center items-center bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-bold">
                          ยกเลิก
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-gray-500 space-y-1 px-1 border-t border-gray-100 pt-2">
                      <div className="flex justify-between">
                        <span>รอบอกที่วัดได้จริง:</span>
                        <span className="font-bold text-gray-700">{record.realGirth ? `${record.realGirth} ซม.` : "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ส่วนสูงที่วัดได้จริง:</span>
                        <span className="font-bold text-gray-700">{record.realHeight ? `${record.realHeight} ซม.` : "-"}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        </div>

        {/* Deleted Records Section */}
        {deletedHistory.length > 0 && (
          <div className="mt-8 border-t border-red-100 pt-6">
            <button 
              onClick={() => setShowDeleted(!showDeleted)}
              className="w-full flex items-center justify-between p-4 bg-red-50/80 rounded-2xl text-red-600 hover:bg-red-100 transition-colors border border-red-100/50"
            >
              <span className="font-bold flex items-center gap-2 text-sm"><Trash2 size={18} className="text-red-500"/> ประวัติการลบข้อมูล</span>
              <span className="bg-red-200 text-red-700 px-2.5 py-0.5 rounded-full text-xs font-bold">{deletedHistory.length}</span>
            </button>
            
            {showDeleted && (
              <div className="mt-4 space-y-3">
                {deletedHistory.map((record: any) => (
                  <div key={record.attempt} className="flex justify-between items-center p-4 bg-red-50 border border-red-100/60 rounded-2xl opacity-80 shadow-sm">
                    <div>
                      <p className="font-bold text-red-500 line-through">ครั้งที่ {record.attempt} - {record.date}</p>
                      <p className="text-xs text-red-400 mt-1">น้ำหนัก (AI): {record.aiWeight} KG</p>
                    </div>
                    <button 
                      onClick={() => handleRestoreRecord(record.attempt)}
                      className="px-3 py-1.5 bg-white text-red-600 font-bold text-xs rounded-xl hover:bg-red-100 transition-colors border border-red-200 shadow-sm"
                    >
                      กู้คืนข้อมูล
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Image Modal */}
      {viewImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setViewImage(null)}>
          <div className="relative max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setViewImage(null)}
              className="absolute -top-12 right-0 p-2 text-white bg-white/20 rounded-full hover:bg-white/40 transition-colors"
            >
              <X size={24} />
            </button>
            <img src={viewImage} alt="Full Scan" className="w-full rounded-2xl shadow-2xl object-cover" />
          </div>
        </div>
      )}
    </div>
  );
}
