"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Search, PawPrint, Plus, MoreVertical, Edit3, Save, X, Trash2 } from "lucide-react";

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const [animals, setAnimals] = useState<any[]>([]);
  const [showDeleted, setShowDeleted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("mockAnimals");
    if (stored) {
      const parsed = JSON.parse(stored);
      // Map the object map into an array for listing
      const arr = Object.values(parsed).map((a: any) => ({
        id: a.id,
        name: a.name,
        type: a.type,
        age: a.age,
        image: a.image,
        isDeleted: a.isDeleted || false,
        // Calculate latest weight and scan time from history
        latestWeight: a.history && a.history.length > 0 ? a.history[0].aiWeight : "-",
        lastScanned: a.history && a.history.length > 0 ? a.history[0].date : "-"
      }));
      setAnimals(arr);
    } else {
      setAnimals(initialDummyAnimals.map(a => ({ ...a, isDeleted: false })));
    }
  }, []);

  const saveToLocal = (newAnimals: any[]) => {
    setAnimals(newAnimals);
    const stored = localStorage.getItem("mockAnimals");
    if (stored) {
      const parsed = JSON.parse(stored);
      newAnimals.forEach(a => {
        if (parsed[a.id]) {
          parsed[a.id].isDeleted = a.isDeleted;
          parsed[a.id].name = a.name;
        }
      });
      localStorage.setItem("mockAnimals", JSON.stringify(parsed));
    }
  };

  const handleSaveEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    const updated = animals.map(a => a.id === editingId ? { ...a, name: editName } : a);
    saveToLocal(updated);
    setEditingId(null);
  };

  const handleDelete = (e: React.MouseEvent, id: string, name: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`คุณต้องการลบข้อมูลของ "${name}" ออกจากฟาร์มใช่หรือไม่? (สามารถกู้คืนได้ภายหลัง)`)) {
      saveToLocal(animals.map(a => a.id === id ? { ...a, isDeleted: true } : a));
    }
  };

  const handleRestore = (id: string) => {
    saveToLocal(animals.map(a => a.id === id ? { ...a, isDeleted: false } : a));
  };

  const filteredAnimals = animals.filter(a => {
    const matchesSearch = a.name.includes(search) || a.id.includes(search);
    const matchesFilter = filter === "ทั้งหมด" ? true : a.type === filter;
    return matchesSearch && matchesFilter;
  });

  const activeAnimals = filteredAnimals.filter(a => !a.isDeleted);
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
            {["ทั้งหมด", "โคเนื้อ", "กระบือ"].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-sm ${
                  filter === f ? 'bg-white text-[#064e3b]' : 'bg-white/10 text-emerald-50 hover:bg-white/20 border border-white/20'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Stats Summary */}
      <div className="px-5 mt-6 mb-4 flex justify-between items-center">
        <h2 className="text-[#064e3b] font-bold text-lg">ทั้งหมด ({activeAnimals.length} ตัว)</h2>
        <div className="flex items-center space-x-1 text-xs font-medium text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
          <PawPrint size={14} />
          <span>ตรงกับฐานข้อมูล</span>
        </div>
      </div>

      {/* Animal List */}
      <div className="px-5 space-y-4">
        {activeAnimals.map((animal) => (
          <Link 
            href={`/animals/${animal.id}`}
            key={animal.id}
            className="block bg-white rounded-3xl p-3 shadow-[0_5px_15px_rgba(4,120,87,0.08)] border border-gray-100 hover:shadow-[0_8px_25px_rgba(4,120,87,0.12)] hover:-translate-y-0.5 transition-all group relative overflow-hidden"
          >
            <div className="flex items-center space-x-4">
              {/* Thumbnail */}
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 shadow-inner border border-gray-100">
                <img src={animal.image} alt={animal.name} className="w-full h-full object-cover" />
                <div className="absolute top-0 left-0 bg-[#064e3b]/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-br-lg">
                  {animal.type}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 py-1">
                <div className="flex justify-between items-start">
                  <div className="flex-1 mr-2">
                    {editingId === animal.id ? (
                      <div className="flex flex-col space-y-2 mb-2 w-full pr-2">
                        <input 
                          type="text" 
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                          className="w-full px-3 py-2 text-sm border border-emerald-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-[#064e3b] font-bold rounded-lg shadow-sm"
                          autoFocus
                          placeholder="ชื่อสัตว์..."
                        />
                        <div className="flex space-x-2">
                          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSaveEdit(e); }} className="flex-1 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-md hover:bg-emerald-700 transition-colors shadow-sm">
                            เสร็จสิ้น
                          </button>
                          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingId(null); }} className="flex-1 py-1.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-md hover:bg-gray-200 transition-colors shadow-sm">
                            ยกเลิก
                          </button>
                        </div>
                      </div>
                    ) : (
                      <h3 className="font-bold text-lg text-[#064e3b] truncate pr-2">{editingId === animal.id ? editName : animal.name}</h3>
                    )}
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                      รหัส: {animal.id} <span className="mx-1">•</span> อายุ: {animal.age}
                    </p>
                  </div>
                  {editingId !== animal.id && (
                    <div className="flex items-center space-x-1">
                      <button className="text-gray-400 hover:text-emerald-600 transition-colors p-1" onClick={(e) => { 
                        e.preventDefault();
                        e.stopPropagation();
                        setEditingId(animal.id);
                        setEditName(animal.name);
                      }}>
                        <Edit3 size={18} />
                      </button>
                      <button className="text-gray-400 hover:text-red-500 transition-colors p-1" onClick={(e) => handleDelete(e, animal.id, animal.name)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] text-gray-400 mb-0.5">น้ำหนักล่าสุด</p>
                    <p className="font-bold text-[#047857] text-lg leading-none">{animal.latestWeight} <span className="text-xs text-gray-500 font-medium">kg</span></p>
                  </div>
                  <p className="text-[10px] text-gray-400 text-right">
                    อัปเดต:<br/>{animal.lastScanned}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#047857] to-emerald-300 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
          </Link>
        ))}
        
        {activeAnimals.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500 font-medium">ไม่พบข้อมูลสัตว์ที่ค้นหา</p>
          </div>
        )}

        {/* Deleted Animals Section */}
        {deletedAnimals.length > 0 && (
          <div className="mt-8 border-t border-red-200/50 pt-6">
            <button 
              onClick={() => setShowDeleted(!showDeleted)}
              className="w-full flex items-center justify-between p-4 bg-red-50/80 rounded-2xl text-red-600 hover:bg-red-100 transition-colors border border-red-100/50"
            >
              <span className="font-bold flex items-center gap-2 text-sm">
                <Trash2 size={18} className="text-red-500"/> ประวัติสัตว์ที่ถูกลบออกจากฟาร์ม
              </span>
              <span className="bg-red-200 text-red-700 px-2.5 py-0.5 rounded-full text-xs font-bold">{deletedAnimals.length}</span>
            </button>
            
            {showDeleted && (
              <div className="mt-4 space-y-3">
                {deletedAnimals.map((animal) => (
                  <div key={animal.id} className="flex justify-between items-center p-4 bg-red-50 border border-red-100/60 rounded-2xl opacity-80 shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0 opacity-70 grayscale">
                        <img src={animal.image} alt={animal.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-red-500 line-through">{animal.name}</p>
                        <p className="text-xs text-red-400 mt-0.5">รหัส: {animal.id}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRestore(animal.id)}
                      className="px-3 py-1.5 bg-white text-red-600 font-bold text-xs rounded-xl hover:bg-red-100 transition-colors border border-red-200 shadow-sm whitespace-nowrap ml-2"
                    >
                      กู้คืนสัตว์
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
