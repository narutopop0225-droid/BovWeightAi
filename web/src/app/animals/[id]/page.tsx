"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Edit3, Camera, Activity, Calendar, Save, X, Plus, Trash2, TrendingUp, Ruler } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LabelList } from 'recharts';

export default function AnimalHistoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const animalId = params.id as string;
  const fromHistory = searchParams.get('from') === 'history';
  const fromDashboard = searchParams.get('from') === 'dashboard';
  
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

  const loadData = async () => {
    try {
      const res = await fetch(`/api/animals/${animalId}`, { cache: 'no-store' });
      if (!res.ok) {
        // Fallback to localStorage if API fails or animal not found in DB
        const storedData = localStorage.getItem("mockAnimals");
        if (storedData) {
          const allData = JSON.parse(storedData);
          const currentAnimal = allData[animalId];
          if (currentAnimal) {
            setAnimal(currentAnimal);
            setAnimalName(currentAnimal.name);
            setAnimalAge(currentAnimal.age || "N/A");
          }
        }
        return;
      }
      const data = await res.json();
      setAnimal({
        ...data,
        age: data.age || "N/A", // Use age from DB
        history: data.measurements || []
      });
      setAnimalName(data.name);
      setAnimalAge(data.age || "N/A");
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, [animalId]);

  const handleSaveAnimalInfo = async () => {
    const updatedAnimal = { ...animal, name: animalName, age: animalAge };
    setAnimal(updatedAnimal);
    setIsEditingAnimal(false);
    
    try {
      await fetch('/api/animals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: animal.id,
          name: animalName,
          type: animal.type,
          age: animalAge,
          image: animal.image
        })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveHistory = async (id: string, attempt: number) => {
    const updatedHistory = animal.history.map((record: any) => {
      if (record.id === id || record.attempt === attempt) {
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
    setEditingHistory(null);

    // Call API for update (PUT /api/measurements/[id])
    if (id) {
      try {
        await fetch(`/api/measurements/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            realGirth: editGirth ? Number(editGirth) : null,
            realHeight: editHeight ? Number(editHeight) : null
          })
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDeleteRecord = async (id: string, attempt: number) => {
    if (window.confirm('คุณต้องการลบประวัตินี้ใช่หรือไม่? (สามารถกู้คืนได้ภายหลัง)')) {
      const updatedHistory = animal.history.map((record: any) => {
        if (record.id === id || record.attempt === attempt) return { ...record, isDeleted: true };
        return record;
      });
      setAnimal({ ...animal, history: updatedHistory });
      
      if (id) {
        try {
          await fetch(`/api/measurements/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isDeleted: true })
          });
        } catch (err) {
          console.error(err);
        }
      }
    }
  };

  const handleRestoreRecord = async (id: string, attempt: number) => {
    const updatedHistory = animal.history.map((record: any) => {
      if (record.id === id || record.attempt === attempt) return { ...record, isDeleted: false };
      return record;
    });
    setAnimal({ ...animal, history: updatedHistory });
    
    if (id) {
      try {
        await fetch(`/api/measurements/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isDeleted: false })
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDeleteAnimal = async () => {
    if (window.confirm(`คุณต้องการย้ายข้อมูลของ "${animal.name}" ไปที่ถังขยะใช่หรือไม่? (สามารถกู้คืนได้ภายหลัง)`)) {
      try {
        const res = await fetch(`/api/animals/${animal.id}`, { method: 'DELETE' });
        if (res.ok) {
          router.push("/animals");
        } else {
          alert('เกิดข้อผิดพลาดในการลบข้อมูล');
        }
      } catch (err) {
        console.error(err);
        alert('เกิดข้อผิดพลาดในการลบข้อมูล');
      }
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
          <Link href={fromDashboard ? "/dashboard" : (fromHistory ? "/history" : "/animals")} className="p-2.5 bg-black/30 backdrop-blur-md rounded-full hover:bg-black/50 transition-all active:scale-95 border border-white/20">
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
            <p className="text-2xl font-bold text-[#064e3b]">{activeHistory[0]?.aiWeight || "-"} <span className="text-sm font-medium text-gray-400">KG</span></p>
          </div>
          <div className="w-px bg-gray-200"></div>
          <div className="text-center">
            <p className="text-xs text-gray-500 font-medium mb-1">ส่วนสูงล่าสุด (AI)</p>
            <p className="text-2xl font-bold text-emerald-700">{activeHistory[0]?.aiHeight || "-"} <span className="text-sm font-medium text-gray-400">CM</span></p>
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
                  <BarChart data={chartData} margin={{ top: 15, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 'bold' }} dy={10} />
                    <YAxis 
                      domain={[0, 'auto']} 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 'bold' }} 
                      width={40}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                      labelFormatter={(label, payload) => payload && payload.length ? `${label} (${payload[0].payload.date})` : label}
                      cursor={{ fill: 'transparent' }}
                    />
                    <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                    <Bar 
                      dataKey="น้ำหนัก" 
                      name="AI (KG)"
                      fill="#059669" 
                      radius={[4, 4, 0, 0]}
                    >
                      <LabelList dataKey="น้ำหนัก" position="top" fill="#059669" fontSize={9} fontWeight={600} />
                    </Bar>
                    <Bar 
                      dataKey="น้ำหนักจริง" 
                      name="วัดจริง (KG)"
                      fill="#2563eb" 
                      radius={[4, 4, 0, 0]}
                    >
                      <LabelList dataKey="น้ำหนักจริง" position="top" fill="#2563eb" fontSize={9} fontWeight={600} />
                    </Bar>
                  </BarChart>
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
                  <BarChart data={chartData} margin={{ top: 15, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 'bold' }} dy={10} />
                    <YAxis 
                      domain={[0, 'auto']} 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 'bold' }} 
                      width={40}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                      labelFormatter={(label, payload) => payload && payload.length ? `${label} (${payload[0].payload.date})` : label}
                      cursor={{ fill: 'transparent' }}
                    />
                    <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                    <Bar 
                      dataKey="ส่วนสูง" 
                      name="AI (CM)"
                      fill="#9333ea" 
                      radius={[4, 4, 0, 0]}
                    >
                      <LabelList dataKey="ส่วนสูง" position="top" fill="#9333ea" fontSize={9} fontWeight={600} />
                    </Bar>
                    <Bar 
                      dataKey="ส่วนสูงจริง" 
                      name="วัดจริง (CM)"
                      fill="#ea580c" 
                      radius={[4, 4, 0, 0]}
                    >
                      <LabelList dataKey="ส่วนสูงจริง" position="top" fill="#ea580c" fontSize={9} fontWeight={600} />
                    </Bar>
                  </BarChart>
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
                          onClick={() => handleDeleteRecord(record.id, record.attempt)}
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
                        <button onClick={() => handleSaveHistory(record.id, record.attempt)} className="flex-1 py-2 flex justify-center items-center bg-[#064e3b] text-white rounded-xl hover:bg-[#047857] transition-colors text-sm font-bold">
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
                      onClick={() => handleRestoreRecord(record.id, record.attempt)}
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
