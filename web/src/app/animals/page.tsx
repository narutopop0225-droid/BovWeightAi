"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Search, PawPrint, Plus, MoreVertical, Edit3, Save, X, Trash2, Star, Activity, Calendar } from "lucide-react";

// Initial fallback data
const initialDummyAnimals = [
  { id: "C001", name: "โคเนื้อ #C001", type: "โคเนื้อ", age: "2 ปี 5 เดือน", latestWeight: 450.2, lastScanned: "วันนี้ 10:30 น.", image: "https://images.unsplash.com/photo-1546445317-29f4545e9d53?q=80&w=300&auto=format&fit=crop" },
  { id: "B002", name: "กระบือ #B002", type: "กระบือ", age: "3 ปี 2 เดือน", latestWeight: 380.5, lastScanned: "วันนี้ 14:15 น.", image: "https://images.unsplash.com/photo-1596733430284-f7437764b1a9?q=80&w=300&auto=format&fit=crop" },
  { id: "B001", name: "บุญรอด", type: "กระบือ", age: "2 ปี 1 เดือน", latestWeight: 410.3, lastScanned: "10 ส.ค. 2026", image: "https://images.unsplash.com/photo-1623868270519-21cb0a6ef2fa?q=80&w=300&auto=format&fit=crop" },
  { id: "C002", name: "สีนวล", type: "โคเนื้อ", age: "1 ปี 8 เดือน", latestWeight: 512.0, lastScanned: "12 ส.ค. 2026", image: "https://images.unsplash.com/photo-1546455644-884813586036?q=80&w=300&auto=format&fit=crop" },
];

export default function AnimalsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ทั้งหมด");
  const [showDeleted, setShowDeleted] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const [animals, setAnimals] = useState<any[]>([]);

  const loadData = async () => {
    try {
      const res = await fetch('/api/animals');
      if (!res.ok) {
        // Fallback
        const stored = localStorage.getItem("mockAnimals");
        if (stored) {
          const parsed = JSON.parse(stored);
          const arr = Object.values(parsed).map((a: any) => ({
            id: a.id, name: a.name, type: a.type, age: a.age, image: a.image,
            isDeleted: a.isDeleted || false,
            isFavorite: a.isFavorite || (a.history && a.history.some((h: any) => h.isFavorite)) || false,
            latestWeight: a.history && a.history.length > 0 
              ? (a.history[0].realGirth 
                  ? Number((Math.pow(Number(a.history[0].realGirth), 2) / 50).toFixed(1)) 
                  : (a.history[0].realWeight || a.history[0].aiWeight)) 
              : "-",
            lastScanned: a.history && a.history.length > 0 ? a.history[0].date : "-"
          }));
          setAnimals(arr);
        } else {
          setAnimals(initialDummyAnimals.map(a => ({ ...a, isDeleted: false, isFavorite: false })));
        }
        return;
      }
      
      const data = await res.json();
      const arr = data.map((a: any) => {
        const measurements = a.measurements || [];
        const activeMeasurements = measurements.filter((m: any) => !m.isDeleted);
        activeMeasurements.sort((m1: any, m2: any) => m2.timestamp - m1.timestamp);
        const hasFav = measurements.some((m: any) => m.isFavorite);
        
        return {
          id: a.id,
          name: a.name,
          type: a.type,
          age: a.age || "N/A", // Use database age if exists
          image: a.image,
          isDeleted: a.isDeleted || false,
          isFavorite: hasFav,
          latestWeight: activeMeasurements.length > 0 
            ? (activeMeasurements[0].realGirth 
                ? Number((Math.pow(Number(activeMeasurements[0].realGirth), 2) / 50).toFixed(1)) 
                : (activeMeasurements[0].realWeight || activeMeasurements[0].aiWeight)) 
            : "-",
          lastScanned: activeMeasurements.length > 0 ? activeMeasurements[0].date : "-"
        };
      });
      setAnimals(arr);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleFavorite = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const animal = animals.find(a => a.id === id);
    if (!animal) return;
    
    const newFav = !animal.isFavorite;
    setAnimals(prev => prev.map(a => a.id === id ? { ...a, isFavorite: newFav } : a));
    
    try {
      // Find latest measurement for this animal to toggle favorite on
      const res = await fetch(`/api/animals/${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.measurements && data.measurements.length > 0) {
          const latestM = data.measurements[0];
          await fetch(`/api/measurements/${latestM.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isFavorite: newFav })
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveEdit = async (e: React.MouseEvent) => {
    e.preventDefault();
    const animal = animals.find(a => a.id === editingId);
    if (!animal) return;
    
    setAnimals(prev => prev.map(a => a.id === editingId ? { ...a, name: editName } : a));
    setEditingId(null);

    try {
      await fetch('/api/animals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: animal.id,
          name: editName,
          type: animal.type,
          age: animal.age,
          image: animal.image
        })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`คุณต้องการย้ายข้อมูลของ "${name}" ไปที่ถังขยะใช่หรือไม่? (สามารถกู้คืนได้ภายหลัง)`)) {
      try {
        const res = await fetch(`/api/animals/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete');
        
        setAnimals(prev => prev.map(a => a.id === id ? { ...a, isDeleted: true } : a));
      } catch (err) {
        console.error(err);
        alert('เกิดข้อผิดพลาดในการลบข้อมูล');
      }
    }
  };

  const handleRestore = async (id: string) => {
    try {
      const res = await fetch(`/api/animals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDeleted: false })
      });
      if (!res.ok) throw new Error('Failed to restore');
      
      setAnimals(prev => prev.map(a => a.id === id ? { ...a, isDeleted: false } : a));
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการกู้คืน');
    }
  };

  const filteredAnimals = animals.filter(a => {
    const matchesSearch = a.name.includes(search) || a.id.includes(search);
    const matchesFilter = filter === "ทั้งหมด" ? true : (filter === "รายการโปรด" ? a.isFavorite : a.type === filter);
    return matchesSearch && matchesFilter;
  });

  const activeAnimals = filteredAnimals
    .filter(a => !a.isDeleted)
    .sort((a, b) => {
      if (a.isFavorite === b.isFavorite) return 0;
      return a.isFavorite ? -1 : 1;
    });
    
  const deletedAnimals = animals.filter(a => a.isDeleted); // All deleted animals

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0fdf4] to-[#dcfce7] text-gray-800 pb-20 relative">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#064e3b] to-[#047857] text-white p-4 shadow-lg sticky top-0 z-20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all active:scale-95">
              <ArrowLeft size={22} className="text-emerald-50" />
            </Link>
            <h1 className="text-xl font-bold tracking-wide">ข้อมูลสัตว์ในฟาร์ม</h1>
          </div>
          <Link href="/scan" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all active:scale-95 text-emerald-50">
            <Plus size={22} />
          </Link>
        </div>

        {/* Search & Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-emerald-100/70" size={18} />
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อ หรือ รหัสสัตว์..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/20 border border-white/30 rounded-2xl focus:outline-none focus:bg-white/30 focus:border-white transition-all text-white placeholder-emerald-100/70 shadow-inner"
            />
          </div>
          
          <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-hide">
            {["ทั้งหมด", "รายการโปรด", "โคเนื้อ", "กระบือ"].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-sm flex items-center gap-1 ${
                  filter === f ? 'bg-white text-[#064e3b]' : 'bg-white/10 text-emerald-50 hover:bg-white/20 border border-white/20'
                }`}
              >
                {f === 'รายการโปรด' && <Star size={14} className={filter === f ? 'fill-[#064e3b] text-[#064e3b]' : ''} />}
                {f}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Stats Summary */}
      <div className="px-5 mt-6 mb-4 flex justify-between items-center">
        <h2 className="text-[#064e3b] font-bold text-lg">{filter === 'รายการโปรด' ? 'รายการโปรด' : 'ทั้งหมด'} ({activeAnimals.length} ตัว)</h2>
        <div className="flex items-center space-x-1 text-xs font-medium text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
          <PawPrint size={14} />
          <span>ตรงกับฐานข้อมูล</span>
        </div>
      </div>

      {/* Animal List */}
      <div className="px-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeAnimals.map((animal) => (
          <Link 
            href={`/animals/${animal.id}`}
            key={animal.id}
            className="block bg-gradient-to-br from-emerald-50/80 to-teal-50/50 rounded-[28px] p-2.5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-emerald-100/50 flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow cursor-pointer"
          >
            {/* Top: Big Image */}
            <div className="relative w-full h-40 md:h-48 rounded-[20px] overflow-hidden shrink-0 bg-gray-100 shadow-sm border border-white/60 mb-3">
              <img src={animal.image} alt={animal.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              
              {/* Type Badge */}
              <div className="absolute top-0 left-0 bg-[#064e3b]/80 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-br-[16px] shadow-sm">
                {animal.type}
              </div>
              
              {/* Favorite Star Icon */}
              <div 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(e, animal.id); }}
                className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-sm backdrop-blur-md transition-colors z-10 cursor-pointer ${animal.isFavorite ? 'bg-amber-100' : 'bg-white/80 hover:bg-white'}`}
              >
                <Star size={16} className={animal.isFavorite ? "text-amber-500 fill-amber-500" : "text-gray-400"} />
              </div>
            </div>

            {/* Bottom: Info & Stats */}
            <div className="flex-1 flex flex-col justify-between px-1.5 pb-1">
              {/* Header: Name and Actions */}
              <div className="flex justify-between items-start mb-3">
                <div className="min-w-0 pr-2 w-full">
                  {editingId === animal.id ? (
                    <div className="flex flex-col space-y-2 mb-2 w-full pr-2" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                      <input 
                        type="text" 
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-emerald-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-[#064e3b] font-bold rounded-lg shadow-sm"
                        autoFocus
                        placeholder="ชื่อสัตว์..."
                      />
                      <div className="flex space-x-2">
                        <button onClick={(e) => handleSaveEdit(e)} className="flex-1 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-md hover:bg-emerald-700 transition-colors shadow-sm">
                          เสร็จสิ้น
                        </button>
                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingId(null); }} className="flex-1 py-1.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-md hover:bg-gray-200 transition-colors shadow-sm">
                          ยกเลิก
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="font-bold text-[16px] leading-tight text-emerald-950 truncate">{animal.name}</h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <p className="text-[12px] text-emerald-700 font-bold font-mono bg-emerald-200/40 px-2.5 py-0.5 rounded-full">#{animal.id}</p>
                        <span className="w-1 h-1 bg-emerald-300 rounded-full"></span>
                        <span className="text-[10px] text-emerald-600/70 font-medium">อายุ: {animal.age}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Action Buttons */}
                {editingId !== animal.id && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button className="text-gray-400 hover:text-emerald-600 hover:bg-emerald-100/50 bg-white/50 backdrop-blur-sm rounded-full p-2 transition-colors border border-emerald-100/50" onClick={(e) => { 
                      e.preventDefault();
                      e.stopPropagation();
                      setEditingId(animal.id);
                      setEditName(animal.name);
                    }}>
                      <Edit3 size={14} />
                    </button>
                    <button className="text-rose-400 hover:text-rose-600 hover:bg-rose-100/50 bg-white/50 backdrop-blur-sm rounded-full p-2 transition-colors border border-rose-100/50" onClick={(e) => handleDelete(e, animal.id, animal.name)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* Stats */}
              {editingId !== animal.id && (
                <div className="mt-auto flex justify-between items-center bg-white/60 rounded-xl p-2.5 px-3 border border-emerald-100/50">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-emerald-600/70 font-bold mb-0.5 flex items-center gap-1"><Activity size={10}/> น้ำหนักล่าสุด</span>
                    <span className="font-black text-emerald-700 text-lg leading-none">{animal.latestWeight} <span className="text-[10px] text-emerald-600/60 font-medium">kg</span></span>
                  </div>
                  <div className="flex flex-col items-end text-right">
                    <span className="text-[10px] text-gray-400 flex items-center gap-1"><Calendar size={10}/> อัปเดตล่าสุด</span>
                    <span className="text-[11px] font-bold text-gray-600">{animal.lastScanned}</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#047857] to-emerald-300 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
          </Link>
        ))}
        
        {activeAnimals.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500 font-medium">ไม่พบข้อมูลสัตว์ที่ค้นหา</p>
          </div>
        )}
      </div>

      {/* Deleted Animals Section (Toggle) */}
      {deletedAnimals.length > 0 && (
        <div className="mt-8 mb-4">
          <button 
            onClick={() => setShowDeleted(!showDeleted)}
            className="w-full bg-gradient-to-r from-rose-50/80 to-pink-50/80 text-rose-500 rounded-[24px] p-4 flex items-center justify-between shadow-sm border border-rose-100/50 hover:from-rose-100 hover:to-pink-100 transition-all backdrop-blur-sm"
          >
            <div className="flex items-center font-bold">
              <Trash2 size={20} className="mr-2 text-rose-400" /> 
              ประวัติการลบ <span className="ml-2 bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full text-xs">{deletedAnimals.length}</span>
            </div>
            <span className="text-sm font-medium bg-white/50 px-3 py-1 rounded-full text-rose-500">
              {showDeleted ? 'ซ่อน' : 'ดูประวัติ'}
            </span>
          </button>

          {showDeleted && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              {deletedAnimals.map(animal => (
                <div key={animal.id} className="bg-white/80 backdrop-blur-md rounded-[24px] p-4 flex items-center shadow-[0_2px_15px_rgb(225,29,72,0.05)] border border-rose-50">
                  <img 
                    src={animal.image} 
                    alt={animal.name} 
                    className="w-12 h-12 rounded-xl object-cover saturate-50 opacity-80 mr-4 border border-rose-100/50" 
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-rose-900/70 line-through decoration-rose-300">{animal.name}</h3>
                    <p className="text-xs text-rose-400/80 font-medium">ID: {animal.id}</p>
                  </div>
                  <button 
                    onClick={() => handleRestore(animal.id)}
                    className="text-sm font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full hover:bg-emerald-100 transition-colors shadow-sm"
                  >
                    กู้คืน
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
