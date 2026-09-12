"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight, Edit3, Check, Trash2, History as HistoryIcon, Star, ChevronDown, Clock, MoreHorizontal } from "lucide-react";

export default function HistoryPage() {
  const [allData, setAllData] = useState<any>({});
  const [historyRecords, setHistoryRecords] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'favorites'>('all');
  
  const [showAllDates, setShowAllDates] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);

  const THAI_MONTHS = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
  const THAI_MONTHS_SHORT = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  const DAYS_IN_WEEK = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

  const toggleFavorite = async (e: React.MouseEvent, record: any) => {
    e.preventDefault();
    e.stopPropagation();
    
    const currentFav = record.isFavorite || false;
    const newFav = !currentFav;
    
    // Optimistic UI update
    setHistoryRecords(prev => 
      prev.map(rec => (rec.id === record.id) ? { ...rec, isFavorite: newFav } : rec)
    );
    
    try {
      const res = await fetch(`/api/measurements/${record.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: newFav })
      });
      if (!res.ok) throw new Error('Failed');
    } catch (err) {
      // Revert on fail
      setHistoryRecords(prev => 
        prev.map(rec => (rec.id === record.id) ? { ...rec, isFavorite: currentFav } : rec)
      );
      console.error(err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('/api/animals', { cache: 'no-store' });
        if (!res.ok) {
          // Fallback to localStorage
          const stored = localStorage.getItem('mockAnimals');
          if (stored) {
            const parsed = JSON.parse(stored);
            setAllData(parsed);
            let allHistory: any[] = [];
            Object.values(parsed).forEach((animal: any) => {
              animal.history.forEach((h: any) => {
                allHistory.push({ ...h, animalId: animal.id, animalName: animal.name, animalType: animal.type, animalImage: h.scanImage || animal.image });
              });
            });
            allHistory.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
            setHistoryRecords(allHistory);
          }
          return;
        }

        const data = await res.json();
        const formattedData: any = {};
        let allHistory: any[] = [];

        data.forEach((animal: any) => {
          formattedData[animal.id] = animal;
          if (animal.measurements) {
            animal.measurements.forEach((h: any) => {
              allHistory.push({
                ...h,
                animalId: animal.id,
                animalName: animal.name,
                animalType: animal.type,
                animalAge: animal.age,
                animalImage: h.scanImage || animal.image
              });
            });
          }
        });

        setAllData(formattedData);
        allHistory.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        setHistoryRecords(allHistory);

      } catch (err) {
        console.error("Failed to load history", err);
      }
    };
    
    loadData();
  }, []);

  const startEditing = (e: React.MouseEvent, record: any) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingId(record.attempt + "-" + record.animalId);
    setEditName(record.animalName);
  };

  const saveEditing = async (e: React.MouseEvent | React.FormEvent, record: any) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Update local flattened list
    setHistoryRecords(prev => 
      prev.map(rec => rec.animalId === record.animalId ? { ...rec, animalName: editName } : rec)
    );
    setEditingId(null);

    try {
      await fetch('/api/animals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: record.animalId,
          name: editName,
          type: record.animalType,
          age: record.animalAge,
          image: record.animalImage
        })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (e: React.MouseEvent, record: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`คุณต้องการลบประวัติการชั่งของ "${record.animalName}" ใช่หรือไม่? (สามารถกู้คืนได้ภายหลัง)`)) {
      setHistoryRecords(prev => 
        prev.map(rec => (rec.id === record.id) ? { ...rec, isDeleted: true } : rec)
      );

      try {
        await fetch(`/api/measurements/${record.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isDeleted: true })
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleRestore = async (record: any) => {
    setHistoryRecords(prev => 
      prev.map(rec => (rec.id === record.id) ? { ...rec, isDeleted: false } : rec)
    );

    try {
      await fetch(`/api/measurements/${record.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDeleted: false })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handlePermanentDelete = async (record: any) => {
    if (window.confirm(`คุณต้องการลบประวัติการชั่งของ "${record.animalName}" แบบถาวรใช่หรือไม่? (ไม่สามารถกู้คืนได้)`)) {
      setHistoryRecords(prev => prev.filter(rec => rec.id !== record.id));
      
      try {
        await fetch(`/api/measurements/${record.id}`, { method: 'DELETE' });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const activeRecords = historyRecords.filter(rec => !rec.isDeleted);
  let displayRecords = filterType === 'favorites' ? activeRecords.filter(rec => rec.isFavorite) : activeRecords;

  if (!showAllDates) {
    const today = new Date();
    const isSelectedToday = selectedDay === today.getDate() && selectedMonth === today.getMonth() && selectedYear === today.getFullYear();
    
    displayRecords = displayRecords.filter(rec => {
      if (isSelectedToday && rec.date === "วันนี้") return true;
      
      const parts = rec.date.split(' ');
      if (parts.length >= 2) {
        const d = parseInt(parts[0]);
        const mStr = parts[1];
        const m = THAI_MONTHS_SHORT.indexOf(mStr);
        // Sometimes year is present, sometimes not (fallback to selectedYear if missing to be safe)
        const y = parts.length >= 3 ? parseInt(parts[2]) : selectedYear;
        
        return d === selectedDay && m === selectedMonth && y === selectedYear;
      }
      
      // Fallback exact match
      const targetDateString = `${selectedDay} ${THAI_MONTHS_SHORT[selectedMonth]} ${selectedYear}`;
      return rec.date === targetDateString;
    });
  }

  const deletedRecords = historyRecords.filter(rec => rec.isDeleted);

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const dateList = Array.from({length: daysInMonth}, (_, i) => {
    const d = i + 1;
    const dayOfWeek = new Date(selectedYear, selectedMonth, d).getDay();
    return {
      day: DAYS_IN_WEEK[dayOfWeek],
      date: d
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 pb-24 font-sans relative">
      
      {/* Header */}
      <header className="bg-gradient-to-r from-red-700 to-red-500 text-white p-4 shadow-lg sticky top-0 z-20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all active:scale-95">
              <ArrowLeft size={22} className="text-red-50" />
            </Link>
            <h1 className="text-xl font-bold tracking-wide">ประวัติทั้งหมด</h1>
          </div>
          <button className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all active:scale-95 text-red-50">
            <MoreHorizontal size={22} />
          </button>
        </div>

        {/* Tabs for favorites */}
        <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-sm flex items-center gap-1 ${
              filterType === 'all' ? 'bg-white text-red-700' : 'bg-white/10 text-red-50 hover:bg-white/20 border border-white/20'
            }`}
          >
            ทั้งหมด
          </button>
          <button
            onClick={() => setFilterType('favorites')}
            className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-sm flex items-center gap-1 ${
              filterType === 'favorites' ? 'bg-white text-amber-600' : 'bg-white/10 text-red-50 hover:bg-white/20 border border-white/20'
            }`}
          >
            <Star size={14} className={filterType === 'favorites' ? 'fill-amber-500' : ''} />
            รายการโปรด
          </button>
        </div>
      </header>

      <div className="p-4">
        {/* Month Selector & 'All Dates' Toggle */}
        <div className="flex items-center justify-between mb-4 relative z-50">
          <div className="relative">
            <div 
              className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setIsMonthPickerOpen(!isMonthPickerOpen)}
            >
              <h2 className="text-gray-900 font-bold text-xl">{THAI_MONTHS[selectedMonth]} {selectedYear}</h2>
              <div className={`bg-white/60 p-1 rounded-full text-gray-500 transition-transform ${isMonthPickerOpen ? 'rotate-180' : ''}`}>
                <ChevronDown size={14} />
              </div>
            </div>
            
            {/* Month Dropdown */}
            {isMonthPickerOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 z-[100] grid grid-cols-3 gap-2">
                {THAI_MONTHS.map((monthName, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedMonth(index);
                      setIsMonthPickerOpen(false);
                      setShowAllDates(false);
                    }}
                    className={`py-2 px-1 text-xs font-bold rounded-xl transition-colors ${selectedMonth === index ? 'bg-[#144A29] text-white' : 'hover:bg-gray-100 text-gray-700'}`}
                  >
                    {THAI_MONTHS_SHORT[index]}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <label className="flex items-center space-x-2 bg-white/50 px-3 py-1.5 rounded-full border border-gray-200 cursor-pointer hover:bg-white transition-colors">
            <input 
              type="checkbox" 
              checked={showAllDates}
              onChange={(e) => setShowAllDates(e.target.checked)}
              className="w-3.5 h-3.5 text-[#144A29] rounded focus:ring-[#144A29] border-gray-300"
            />
            <span className="text-xs font-bold text-gray-700">ทั้งหมด</span>
          </label>
        </div>

        {/* Date Row (Scrollable) */}
        <div className={`flex space-x-2 overflow-x-auto pb-4 pt-2 scrollbar-hide snap-x transition-opacity ${showAllDates ? 'opacity-50 grayscale' : ''}`}>
          {dateList.map((d, i) => {
            const isSelected = selectedDay === d.date;
            return (
              <button 
                key={i}
                onClick={() => {
                  setSelectedDay(d.date);
                  setShowAllDates(false);
                }}
                className={`flex flex-col items-center justify-center min-w-[50px] h-16 rounded-2xl transition-all shrink-0 snap-center ${isSelected && !showAllDates ? 'bg-white shadow-[0_4px_12px_rgb(0,0,0,0.1)] text-gray-900 border-2 border-[#144A29] scale-105' : 'bg-white/40 text-gray-500 hover:bg-white/80'}`}
              >
                <span className={`text-[10px] mb-0.5 ${isSelected && !showAllDates ? 'font-bold' : 'font-medium'}`}>{d.day}</span>
                <span className={`text-lg font-bold ${isSelected && !showAllDates ? 'text-[#144A29]' : 'text-gray-600'}`}>{d.date}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content (Timeline) */}
      <div className="px-6 relative z-20">
        {displayRecords.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            {filterType === 'favorites' ? 'ไม่มีรายการโปรด' : 'ไม่มีประวัติการชั่งน้ำหนัก'}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayRecords.map((record, index) => (
            <div key={record.attempt + "-" + record.animalId} className="bg-gradient-to-br from-emerald-50/80 to-teal-50/50 rounded-[28px] p-2.5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-emerald-100/50 flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = `/animals/${record.animalId}?from=history`}>
              
              {/* Top: Big Image */}
              <div className="relative w-full h-40 md:h-48 rounded-[20px] overflow-hidden shrink-0 bg-gray-100 shadow-sm border border-white/60 mb-3">
                <img src={record.animalImage} alt="Animal" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-0 left-0 text-[10px] font-bold px-3 py-1.5 rounded-br-[16px] shadow-sm backdrop-blur-md bg-gray-800/80 text-white">
                  #{record.animalId}
                </div>
                
                {/* Favorite Star Icon */}
                <div 
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(e, record); }}
                  className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-sm backdrop-blur-md transition-colors z-10 cursor-pointer ${record.isFavorite ? 'bg-amber-100' : 'bg-white/80 hover:bg-white'}`}
                >
                  <Star size={16} className={record.isFavorite ? "text-amber-500 fill-amber-500" : "text-gray-400"} />
                </div>
              </div>

              {/* Bottom: Info & Stats */}
              <div className="flex-1 flex flex-col justify-between px-1.5 pb-1">
                {/* Header: Name and Actions */}
                <div className="flex justify-between items-start mb-3">
                  <div className="min-w-0 pr-2">
                    <h3 className="font-bold text-[16px] leading-tight text-emerald-950 truncate">{record.animalName}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <p className="text-[12px] text-emerald-700 font-bold font-mono bg-emerald-200/40 px-2.5 py-0.5 rounded-full">{record.time || '10:00 น.'}</p>
                      {showAllDates && (
                        <>
                          <span className="w-1 h-1 bg-emerald-300 rounded-full"></span>
                          <span className="text-[10px] text-emerald-600/70 font-medium">{record.date}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Buttons: Delete */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button 
                      onClick={(e) => handleDelete(e, record)} 
                      className="text-rose-400 hover:text-rose-600 hover:bg-rose-100/50 bg-white/50 backdrop-blur-sm rounded-full p-2 transition-colors border border-rose-100/50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-auto flex flex-col gap-2">
                  {record.realWeight ? (
                    <>
                      {/* Real Stats Row */}
                      <div className="grid grid-cols-3 gap-2 bg-blue-50/70 backdrop-blur-sm rounded-[14px] p-2 border border-blue-100/50 shadow-sm">
                        <div className="flex flex-col text-center justify-center">
                          <span className="text-[10px] text-blue-500 font-bold mb-0.5">รอบอก (จริง)</span>
                          <span className="text-[13px] font-bold text-blue-900">{record.realGirth || '-'} <span className="text-[9px] font-medium text-blue-400">cm</span></span>
                        </div>
                        <div className="flex flex-col text-center justify-center border-x border-blue-200/50">
                          <span className="text-[10px] text-blue-500 font-bold mb-0.5">ส่วนสูง (จริง)</span>
                          <span className="text-[13px] font-bold text-blue-900">{record.realHeight || '-'} <span className="text-[9px] font-medium text-blue-400">cm</span></span>
                        </div>
                        <div className="flex flex-col text-center justify-center">
                          <span className="text-[10px] text-blue-600 font-bold mb-0.5">น้ำหนัก (จริง)</span>
                          <span className="text-[16px] font-black text-blue-600">{record.realWeight || '-'} <span className="text-[10px] font-bold text-blue-400">kg</span></span>
                        </div>
                      </div>
                      
                      {/* AI Stats Row (Smaller) */}
                      <div className="flex justify-between items-center bg-white/50 rounded-xl p-2 px-3">
                        <span className="text-[10px] font-bold text-gray-500">ประเมินโดย AI:</span>
                        <div className="flex gap-3">
                          <span className="text-[10px] text-gray-600"><span className="text-gray-400">อก:</span> {record.aiGirth||'-'}</span>
                          <span className="text-[10px] text-gray-600"><span className="text-gray-400">สูง:</span> {record.aiHeight||'-'}</span>
                          <span className="text-[10px] text-gray-800 font-bold"><span className="text-gray-400 font-normal">นน:</span> {record.aiWeight||'-'}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 bg-white/70 backdrop-blur-sm rounded-[14px] p-2 border border-emerald-50 shadow-sm">
                      <div className="flex flex-col text-center justify-center">
                        <span className="text-[10px] text-emerald-600/70 font-bold mb-0.5">รอบอก</span>
                        <span className="text-[14px] font-bold text-[#144A29]">{record.aiGirth || '-'} <span className="text-[9px] font-medium text-emerald-400">cm</span></span>
                      </div>
                      <div className="flex flex-col text-center justify-center border-x border-emerald-100/50">
                        <span className="text-[10px] text-emerald-600/70 font-bold mb-0.5">ส่วนสูง</span>
                        <span className="text-[14px] font-bold text-[#144A29]">{record.aiHeight || '-'} <span className="text-[9px] font-medium text-emerald-400">cm</span></span>
                      </div>
                      <div className="flex flex-col text-center justify-center">
                        <span className="text-[10px] text-emerald-600/80 font-bold mb-0.5">น้ำหนัก AI</span>
                        <span className="text-[18px] font-black text-emerald-600 leading-none">{record.aiWeight || '-'} <span className="text-[10px] font-bold text-emerald-500">kg</span></span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Deleted Records Section */}
        {deletedRecords.length > 0 && (
          <div className="mt-8 pt-6 relative">
            <button 
              onClick={() => setShowDeleted(!showDeleted)}
              className="w-full flex items-center justify-between p-4 bg-red-50/80 rounded-2xl text-red-600 hover:bg-red-100 transition-colors border border-red-100 relative overflow-hidden shadow-sm"
            >
              <span className="font-bold flex items-center gap-2 text-sm">
                <Trash2 size={16} className="text-red-500" /> ประวัติการลบข้อมูล
              </span>
              <span className="bg-red-200/60 text-red-700 px-2.5 py-0.5 rounded-full text-xs font-bold">{deletedRecords.length}</span>
            </button>
            
            {showDeleted && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {deletedRecords.map((record) => (
                  <div key={record.attempt + "-" + record.animalId} className="flex justify-between items-center p-4 bg-red-50/30 border border-red-100/70 rounded-2xl shadow-sm relative overflow-hidden">
                    {/* Small red accent line on the side */}
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-400/80"></div>
                    
                    <div className="flex items-center space-x-3 pl-2">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0 grayscale opacity-80 border border-red-100">
                        <img src={record.animalImage} alt={record.animalType} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-red-700/70 line-through">{record.animalName}</p>
                        <p className="text-xs text-red-400/80 mt-0.5">{record.time}</p>
                      </div>
                    </div>
                    <div className="flex">
                      <button 
                        onClick={() => handleRestore(record)}
                        className="px-3 py-1.5 bg-white text-red-600 font-bold text-xs rounded-xl hover:bg-red-50 transition-colors border border-red-200 shadow-sm whitespace-nowrap"
                      >
                        กู้คืน
                      </button>
                      <button 
                        onClick={() => handlePermanentDelete(record)}
                        className="px-3 py-1.5 bg-white text-gray-500 font-bold text-xs rounded-xl hover:bg-gray-100 hover:text-gray-700 transition-colors border border-gray-200 shadow-sm whitespace-nowrap ml-2"
                      >
                        ลบถาวร
                      </button>
                    </div>
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
