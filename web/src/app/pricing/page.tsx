"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Calculator, TrendingUp, Edit3, Check, Save, Coins, X, Plus, Minus, Search, Home, History, CircleUser, Camera, Star, Trash2 } from "lucide-react";

export default function PricingCalculatorPage() {
  const [globalPrice, setGlobalPrice] = useState<number>(80);
  const [farmAnimals, setFarmAnimals] = useState<any[]>([]);
  const [historyRecords, setHistoryRecords] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'farm' | 'history' | 'favorites'>('farm');
  
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ทั้งหมด");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempCustomPrice, setTempCustomPrice] = useState<string>("");
  const [showDeletedHistory, setShowDeletedHistory] = useState(false);

  const toggleFavorite = async (e: React.MouseEvent, animalId: string, measurementId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (measurementId) {
      const rec = historyRecords.find(h => h.id === measurementId);
      if (rec) {
        const newFav = !rec.isFavorite;
        setHistoryRecords(prev => prev.map(h => h.id === measurementId ? { ...h, isFavorite: newFav } : h));
        
        // Sync the farmAnimals state too, so if this was the latest measurement, the animal card updates
        setFarmAnimals(prev => prev.map(a => a.id === animalId ? { ...a, isFavorite: newFav } : a));
        
        try { await fetch(`/api/measurements/${measurementId}`, { method: 'PUT', body: JSON.stringify({ isFavorite: newFav }) }); } catch(err) {}
      }
    } else {
      const animal = farmAnimals.find(a => a.id === animalId);
      if (animal) {
        const newFav = !animal.isFavorite;
        setFarmAnimals(prev => prev.map(a => a.id === animalId ? { ...a, isFavorite: newFav } : a));
        try {
          const res = await fetch(`/api/animals/${animalId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.measurements && data.measurements.length > 0) {
              const latestM = data.measurements[0];
              
              // Also update the local historyRecords state so it shows up immediately in the favorites tab!
              setHistoryRecords(prev => prev.map(h => h.id === latestM.id ? { ...h, isFavorite: newFav } : h));

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
      }
    }
  };

  useEffect(() => {
    const savedGlobal = localStorage.getItem('globalPricePerKg');
    if (savedGlobal) setGlobalPrice(Number(savedGlobal));

    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await fetch('/api/animals');
      if (!res.ok) return;
      const data = await res.json();
      
      const animalPrices = JSON.parse(localStorage.getItem('animalCustomPrices') || '{}');
      const measurePrices = JSON.parse(localStorage.getItem('measurementCustomPrices') || '{}');

      const animalsList = data.map((a: any) => {
        const activeM = (a.measurements || []).filter((m: any) => !m.isDeleted);
        activeM.sort((m1: any, m2: any) => m2.timestamp - m1.timestamp);
        return {
          ...a,
          isFavorite: activeM.some((m: any) => m.isFavorite),
          history: activeM,
          customPrice: animalPrices[a.id]
        };
      });
      setFarmAnimals(animalsList);

      let allHistory: any[] = [];
      data.forEach((a: any) => {
        if (a.measurements) {
          a.measurements.forEach((m: any) => {
            allHistory.push({
              ...m,
              animalId: a.id,
              animalName: a.name,
              animalType: a.type,
              animalImage: m.scanImage || a.image,
              customPrice: measurePrices[m.id]
            });
          });
        }
      });
      allHistory.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      setHistoryRecords(allHistory);

    } catch (err) {
      console.error(err);
    }
  };

  const getLatestWeight = (animal: any) => {
    if (!animal || !animal.history || animal.history.length === 0) return 0;
    return animal.history[0].aiWeight || animal.history[0].realWeight || 0;
  };

  const updateGlobalPrice = (newPrice: number) => {
    if (newPrice < 0) return;
    setGlobalPrice(newPrice);
    localStorage.setItem('globalPricePerKg', newPrice.toString());
  };

  const startEditCustomPrice = (uniqueId: string, currentCustom: number | undefined) => {
    setEditingId(uniqueId);
    setTempCustomPrice(currentCustom !== undefined ? currentCustom.toString() : globalPrice.toString());
  };

  const saveFarmCustomPrice = (animalId: string) => {
    const newPrice = Number(tempCustomPrice);
    const isClearing = !tempCustomPrice || newPrice <= 0;
    
    const animalPrices = JSON.parse(localStorage.getItem('animalCustomPrices') || '{}');
    if (isClearing) delete animalPrices[animalId];
    else animalPrices[animalId] = newPrice;
    localStorage.setItem('animalCustomPrices', JSON.stringify(animalPrices));
    
    setEditingId(null);
    loadData();
  };

  const saveHistoryCustomPrice = (measurementId: string) => {
    const newPrice = Number(tempCustomPrice);
    const isClearing = !tempCustomPrice || newPrice <= 0;
    
    const measurePrices = JSON.parse(localStorage.getItem('measurementCustomPrices') || '{}');
    if (isClearing) delete measurePrices[measurementId];
    else measurePrices[measurementId] = newPrice;
    localStorage.setItem('measurementCustomPrices', JSON.stringify(measurePrices));
    
    setEditingId(null);
    loadData();
  };

  const toggleCustomModeFarm = (animal: any) => {
    const isCustom = animal.customPrice !== undefined && animal.customPrice !== null;
    if (isCustom) {
      const animalPrices = JSON.parse(localStorage.getItem('animalCustomPrices') || '{}');
      delete animalPrices[animal.id];
      localStorage.setItem('animalCustomPrices', JSON.stringify(animalPrices));
      loadData();
    } else {
      startEditCustomPrice(`farm-${animal.id}`, undefined);
    }
  };

  const toggleCustomModeHistory = (record: any) => {
    const isCustom = record.customPrice !== undefined && record.customPrice !== null;
    if (isCustom) {
      const measurePrices = JSON.parse(localStorage.getItem('measurementCustomPrices') || '{}');
      delete measurePrices[record.id];
      localStorage.setItem('measurementCustomPrices', JSON.stringify(measurePrices));
      loadData();
    } else {
      startEditCustomPrice(`history-${record.id}`, undefined);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 }).format(amount);
  };

  const filteredFarmAnimals = farmAnimals.filter(a => {
    const matchesSearch = a.name.includes(search) || a.id.includes(search);
    const matchesFilter = filter === "ทั้งหมด" ? true : a.type === filter;
    return matchesSearch && matchesFilter;
  });

  const activeHistoryRecords = historyRecords.filter(a => !a.isDeleted);
  const deletedHistoryRecords = historyRecords.filter(a => a.isDeleted);

  const handleDeleteHistory = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('คุณต้องการย้ายประวัติการชั่งนี้ไปที่ถังขยะใช่หรือไม่? (สามารถกู้คืนได้)')) {
      try {
        const res = await fetch(`/api/measurements/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isDeleted: true })
        });
        if (!res.ok) throw new Error('Failed to delete');
        setHistoryRecords(prev => prev.map(r => r.id === id ? { ...r, isDeleted: true } : r));
      } catch (err) {
        console.error(err);
        alert('เกิดข้อผิดพลาดในการลบข้อมูล');
      }
    }
  };

  const handleRestoreHistory = async (id: string) => {
    try {
      const res = await fetch(`/api/measurements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDeleted: false })
      });
      if (!res.ok) throw new Error('Failed to restore');
      setHistoryRecords(prev => prev.map(r => r.id === id ? { ...r, isDeleted: false } : r));
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการกู้คืน');
    }
  };

  const handlePermanentDeleteHistory = async (id: string, name: string) => {
    if (window.confirm(`คุณต้องการลบประวัติการชั่งของ "${name}" แบบถาวรใช่หรือไม่? (ไม่สามารถกู้คืนได้)`)) {
      try {
        const res = await fetch(`/api/measurements/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to permanent delete');
        setHistoryRecords(prev => prev.filter(r => r.id !== id));
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการลบถาวร');
      }
    }
  };

  const filteredHistoryRecords = activeHistoryRecords.filter(a => {
    const matchesSearch = (a.animalName || '').includes(search) || (a.animalId || '').includes(search);
    const matchesFilter = filter === "ทั้งหมด" ? true : a.animalType === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-transparent text-[#1c1c1c] pb-32 font-sans overflow-x-hidden pt-12 px-6">
      
      {/* HEADER BAR */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-400 text-white px-6 pt-12 pb-6 -mx-6 -mt-12 mb-6 rounded-b-[32px] shadow-md relative overflow-hidden">
        {/* Deco circles */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/5 rounded-full translate-y-1/2 -translate-x-1/3"></div>
        
        <div className="flex justify-between items-center relative z-10 mb-4">
          <Link href="/dashboard" className="w-10 h-10 bg-white/20 hover:bg-white/30 transition-colors rounded-full flex items-center justify-center text-white backdrop-blur-sm">
            <ArrowLeft size={20} strokeWidth={2.5} />
          </Link>
          <h1 className="text-[19px] font-bold tracking-tight">ประเมินราคาซื้อขาย</h1>
          <div className="w-10 h-10 flex items-center justify-center text-gray-300">
             {/* Spacer to center title perfectly */}
          </div>
        </div>

        {/* Search & Filter */}
        <div className="space-y-3 relative z-10">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-amber-100/70" size={18} />
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อ หรือ รหัสสัตว์..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/20 border border-white/30 rounded-2xl focus:outline-none focus:bg-white/30 focus:border-white transition-all text-white placeholder-amber-100/70 shadow-inner"
            />
          </div>
          
          <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-hide">
            {["ทั้งหมด", "โคเนื้อ", "กระบือ"].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-sm ${
                  filter === f ? 'bg-white text-amber-600' : 'bg-white/10 text-amber-50 hover:bg-white/20 border border-white/20'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TABS (Mockup style Date picker equivalent) */}
      <div className="flex items-center space-x-4 mb-8 overflow-x-auto pb-2 no-scrollbar">
        <button 
          onClick={() => setActiveTab('farm')}
          className={`px-5 py-2.5 rounded-[14px] font-bold text-[13px] whitespace-nowrap transition-all ${activeTab === 'farm' ? 'bg-white text-[#1c1c1c] shadow-[0_2px_10px_rgb(0,0,0,0.03)]' : 'text-gray-400'}`}
        >
          สัตว์ในฟาร์ม
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`px-5 py-2.5 rounded-[14px] font-bold text-[13px] whitespace-nowrap transition-all ${activeTab === 'history' ? 'bg-white text-[#1c1c1c] shadow-[0_2px_10px_rgb(0,0,0,0.03)]' : 'text-gray-400'}`}
        >
          ประวัติทั้งหมด
        </button>
        <button 
          onClick={() => setActiveTab('favorites')}
          className={`px-5 py-2.5 rounded-[14px] font-bold text-[13px] whitespace-nowrap transition-all flex items-center gap-1 ${activeTab === 'favorites' ? 'bg-white text-amber-500 shadow-[0_2px_10px_rgb(0,0,0,0.03)]' : 'text-gray-400'}`}
        >
          <Star size={14} className={activeTab === 'favorites' ? 'fill-amber-500 text-amber-500' : ''} /> รายการโปรด
        </button>
      </div>

      {/* GLOBAL PRICE CARD */}
      <div className="bg-white rounded-[24px] p-5 mb-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border-l-4 border-l-amber-400">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-[14px] font-bold leading-tight">ราคามาตรฐาน (Global Price)</h2>
            <p className="text-[10px] text-gray-400 mt-1">ใช้คำนวณราคาสัตว์พื้นฐาน</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between bg-[#f8f8f8] rounded-[18px] p-1.5">
          <button 
            onClick={() => updateGlobalPrice(globalPrice - 1)}
            className="w-12 h-12 bg-white rounded-[14px] flex items-center justify-center shadow-sm text-[#1c1c1c] active:scale-95 transition-transform"
          >
            <Minus size={20} strokeWidth={2.5} />
          </button>
          
          <div className="flex-1 flex flex-col items-center justify-center">
            <input 
              type="number"
              value={globalPrice || ""}
              onChange={(e) => updateGlobalPrice(Number(e.target.value))}
              onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
              className="w-full text-center text-3xl font-mono font-bold text-[#1c1c1c] bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">THB / KG</span>
          </div>
          
          <button 
            onClick={() => updateGlobalPrice(globalPrice + 1)}
            className="w-12 h-12 bg-[#1c1c1c] rounded-[14px] flex items-center justify-center text-white shadow-sm active:scale-95 transition-transform"
          >
            <Plus size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-6">

        {/* FARM TAB */}
        {activeTab === 'farm' && filteredFarmAnimals.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4 bg-white rounded-[24px]">ไม่มีข้อมูลสัตว์ในฟาร์ม</p>
        )}
        {activeTab === 'farm' && filteredFarmAnimals.map((animal, i) => {
          const weight = getLatestWeight(animal);
          const isCustom = animal.customPrice !== undefined && animal.customPrice !== null;
          const activePrice = isCustom ? animal.customPrice : globalPrice;
          const totalPrice = weight * activePrice;
          const uniqueId = `farm-${animal.id}`;
          const isEditing = editingId === uniqueId;

          return (
            <div key={uniqueId} className="bg-gradient-to-br from-amber-50/80 to-orange-50/50 rounded-[28px] p-2.5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-amber-100/50 flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow">
              {/* Top: Big Image */}
              <div className="relative w-full h-40 md:h-48 rounded-[20px] overflow-hidden shrink-0 bg-gray-100 shadow-sm border border-white/60 mb-3">
                 <img src={animal.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                 <div className={`absolute top-0 left-0 text-[10px] font-bold px-3 py-1.5 rounded-br-[16px] shadow-sm backdrop-blur-md ${isCustom ? 'bg-amber-500/90 text-white' : 'bg-gray-800/80 text-white'}`}>
                    {isCustom ? 'ราคากำหนดเอง' : 'ราคามาตรฐาน'}
                 </div>
                 
                 {/* Favorite Star Icon */}
                 <div 
                   onClick={(e) => toggleFavorite(e, animal.id)}
                   className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-sm backdrop-blur-md transition-colors z-10 cursor-pointer ${animal.isFavorite ? 'bg-amber-100' : 'bg-white/80 hover:bg-white'}`}
                 >
                    <Star size={16} className={animal.isFavorite ? "text-amber-500 fill-amber-500" : "text-gray-400"} />
                 </div>
              </div>

              {/* Bottom: Info & Pricing */}
              <div className="flex-1 flex flex-col justify-between px-1.5 pb-1">
                 {/* Header: Name and Toggle */}
                 <div className="flex justify-between items-start mb-3">
                    <div className="min-w-0 pr-2">
                       <h3 className="font-bold text-[16px] leading-tight text-amber-950 truncate">{animal.name}</h3>
                       <p className="text-[12px] text-amber-700 font-bold font-mono mt-1 bg-amber-200/40 inline-block px-2.5 py-0.5 rounded-full">{weight > 0 ? weight.toFixed(1) : "0"} kg</p>
                    </div>
                    
                    {/* Toggle Switch */}
                    <div onClick={() => toggleCustomModeFarm(animal)} className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors shrink-0 ${isCustom ? 'bg-amber-400' : 'bg-gray-300'}`}>
                       <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${isCustom ? 'translate-x-4' : 'translate-x-0'}`}></div>
                    </div>
                 </div>

                 {/* Price Edit & Total */}
                 <div className="mt-auto flex flex-col gap-2">
                    <div className="flex justify-between items-center bg-white/70 backdrop-blur-sm px-3 py-2 rounded-[14px] border border-white/50">
                       <span className="text-[11px] text-gray-500 font-bold flex items-center gap-1 cursor-pointer" onClick={() => !isEditing && startEditCustomPrice(uniqueId, animal.customPrice)}>
                          ราคา/กก. {isEditing ? '' : <Edit3 size={12} className="hover:text-amber-500 transition-colors"/>}
                       </span>
                       
                       {isEditing ? (
                         <div className="flex items-center gap-1">
                           <input type="number" value={tempCustomPrice} onChange={(e) => setTempCustomPrice(e.target.value)} className="w-14 bg-white border border-amber-300 text-sm font-mono font-bold text-[#1c1c1c] rounded-md px-1 py-1 focus:outline-none text-center" autoFocus />
                           <button onClick={() => saveFarmCustomPrice(animal.id)} className="bg-amber-500 text-white p-1.5 rounded-md hover:bg-amber-600"><Check size={12} /></button>
                           <button onClick={() => setEditingId(null)} className="bg-white text-gray-500 p-1.5 rounded-md border border-gray-200 hover:bg-gray-50"><X size={12} /></button>
                         </div>
                       ) : (
                         <span className="font-mono text-[14px] font-bold text-amber-900 leading-none cursor-pointer hover:text-amber-600" onClick={() => startEditCustomPrice(uniqueId, animal.customPrice)}>{activePrice} ฿</span>
                       )}
                    </div>

                    <div className="flex justify-between items-end px-1 mt-1">
                       <span className="text-[11px] font-bold text-amber-700/70">ประเมินราคา</span>
                       <span className="text-[22px] font-mono font-black text-amber-600 leading-none tracking-tight">{formatCurrency(totalPrice)} <span className="text-[12px] font-sans text-amber-500">฿</span></span>
                    </div>
                 </div>
              </div>
            </div>
          );
        })}

        {/* HISTORY & FAVORITES TAB */}
        {(activeTab === 'history' || activeTab === 'favorites') && (() => {
          const displayedHistory = activeTab === 'favorites' ? filteredHistoryRecords.filter(r => r.isFavorite) : filteredHistoryRecords;
          
          if (displayedHistory.length === 0) {
            return <p className="text-sm text-gray-400 text-center py-4 bg-white rounded-[24px]">{activeTab === 'favorites' ? 'ไม่มีรายการโปรด' : 'ไม่มีประวัติการประเมินราคา'}</p>;
          }

          return displayedHistory.map((record, i) => {
            const weight = record.aiWeight || 0;
            const isCustom = record.customPrice !== undefined && record.customPrice !== null;
            const activePrice = isCustom ? record.customPrice : globalPrice;
            const totalPrice = weight * activePrice;
            const uniqueId = `hist-${record.animalId}-${record.attempt}`;
            const isEditing = editingId === uniqueId;

            const dateObj = record.timestamp ? new Date(record.timestamp) : null;
            const timeString = dateObj ? dateObj.toLocaleTimeString('th-TH', {hour: '2-digit', minute:'2-digit'}) : 'วันนี้';
            const dateString = dateObj ? dateObj.toLocaleDateString('th-TH', {day: 'numeric', month: 'short'}) : '';

            return (
              <div key={uniqueId} className="bg-gradient-to-br from-amber-50/80 to-orange-50/50 rounded-[28px] p-2.5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-amber-100/50 flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow">
                {/* Top: Big Image */}
                <div className="relative w-full h-40 md:h-48 rounded-[20px] overflow-hidden shrink-0 bg-gray-100 shadow-sm border border-white/60 mb-3">
                   <img src={record.animalImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                   <div className={`absolute top-0 left-0 text-[10px] font-bold px-3 py-1.5 rounded-br-[16px] shadow-sm backdrop-blur-md ${isCustom ? 'bg-amber-500/90 text-white' : 'bg-gray-800/80 text-white'}`}>
                      {isCustom ? 'ราคากำหนดเอง' : 'ราคามาตรฐาน'}
                   </div>
                   
                   {/* Favorite Star Icon */}
                   <div 
                     onClick={(e) => toggleFavorite(e, record.animalId, record.id)}
                     className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-sm backdrop-blur-md transition-colors z-10 cursor-pointer ${record.isFavorite ? 'bg-amber-100' : 'bg-white/80 hover:bg-white'}`}
                   >
                      <Star size={16} className={record.isFavorite ? "text-amber-500 fill-amber-500" : "text-gray-400"} />
                   </div>
                </div>

              {/* Bottom: Info & Pricing */}
              <div className="flex-1 flex flex-col justify-between px-1.5 pb-1">
                 {/* Header: Name and Toggle */}
                 <div className="flex justify-between items-start mb-3">
                    <div className="min-w-0 pr-2">
                       <h3 className="font-bold text-[16px] leading-tight text-amber-950 truncate">{record.animalName || 'ไม่ระบุชื่อ'}</h3>
                       <div className="flex items-center gap-1.5 mt-1">
                          <p className="text-[12px] text-amber-700 font-bold font-mono bg-amber-200/40 px-2.5 py-0.5 rounded-full">{weight > 0 ? weight.toFixed(1) : "0"} kg</p>
                          <span className="w-1 h-1 bg-amber-300 rounded-full"></span>
                          <span className="text-[10px] text-amber-600/70 font-medium">{dateString}</span>
                       </div>
                    </div>
                    
                    {/* Actions: Delete & Toggle Switch */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                       <div onClick={() => toggleCustomModeHistory(record)} className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${isCustom ? 'bg-amber-400' : 'bg-gray-300'}`}>
                          <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${isCustom ? 'translate-x-4' : 'translate-x-0'}`}></div>
                       </div>
                       <button onClick={(e) => handleDeleteHistory(e, record.id)} className="text-rose-400 hover:text-rose-600 hover:bg-rose-100/50 bg-white/50 backdrop-blur-sm rounded-full p-1.5 transition-colors border border-rose-100/50">
                          <Trash2 size={14} />
                       </button>
                    </div>
                 </div>

                 {/* Price Edit & Total */}
                 <div className="mt-auto flex flex-col gap-2">
                    <div className="flex justify-between items-center bg-white/70 backdrop-blur-sm px-3 py-2 rounded-[14px] border border-white/50">
                       <span className="text-[11px] text-gray-500 font-bold flex items-center gap-1 cursor-pointer" onClick={() => !isEditing && startEditCustomPrice(uniqueId, record.customPrice)}>
                          ราคา/กก. {isEditing ? '' : <Edit3 size={12} className="hover:text-amber-500 transition-colors"/>}
                       </span>
                       
                       {isEditing ? (
                         <div className="flex items-center gap-1">
                           <input type="number" value={tempCustomPrice} onChange={(e) => setTempCustomPrice(e.target.value)} className="w-14 bg-white border border-amber-300 text-sm font-mono font-bold text-[#1c1c1c] rounded-md px-1 py-1 focus:outline-none text-center" autoFocus />
                           <button onClick={() => saveHistoryCustomPrice(record.id)} className="bg-amber-500 text-white p-1.5 rounded-md hover:bg-amber-600"><Check size={12} /></button>
                           <button onClick={() => setEditingId(null)} className="bg-white text-gray-500 p-1.5 rounded-md border border-gray-200 hover:bg-gray-50"><X size={12} /></button>
                         </div>
                       ) : (
                         <span className="font-mono text-[14px] font-bold text-amber-900 leading-none cursor-pointer hover:text-amber-600" onClick={() => startEditCustomPrice(uniqueId, record.customPrice)}>{activePrice} ฿</span>
                       )}
                    </div>

                    <div className="flex justify-between items-end px-1 mt-1">
                       <span className="text-[11px] font-bold text-amber-700/70">ประเมินราคา</span>
                       <span className="text-[22px] font-mono font-black text-amber-600 leading-none tracking-tight">{formatCurrency(totalPrice)} <span className="text-[12px] font-sans text-amber-500">฿</span></span>
                    </div>
                 </div>
              </div>
            </div>
          );
        })})()}
      </div>

      {/* Deleted History Section (Toggle) */}
      {(activeTab === 'history' || activeTab === 'favorites') && deletedHistoryRecords.length > 0 && (
        <div className="mt-8 mb-4">
          <button 
            onClick={() => setShowDeletedHistory(!showDeletedHistory)}
            className="w-full bg-gradient-to-r from-rose-50/80 to-pink-50/80 text-rose-500 rounded-[24px] p-4 flex items-center justify-between shadow-sm border border-rose-100/50 hover:from-rose-100 hover:to-pink-100 transition-all backdrop-blur-sm"
          >
            <div className="flex items-center font-bold">
              <Trash2 size={20} className="mr-2 text-rose-400" /> 
              ประวัติการลบ <span className="ml-2 bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full text-xs">{deletedHistoryRecords.length}</span>
            </div>
            <span className="text-sm font-medium bg-white/50 px-3 py-1 rounded-full text-rose-500">
              {showDeletedHistory ? 'ซ่อน' : 'ดูประวัติ'}
            </span>
          </button>

          {showDeletedHistory && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              {deletedHistoryRecords.map(record => {
                const dateObj = record.timestamp ? new Date(record.timestamp) : null;
                const dateString = dateObj ? dateObj.toLocaleDateString('th-TH', {day: 'numeric', month: 'short'}) : '';
                return (
                  <div key={`del-hist-${record.id}`} className="bg-white/80 backdrop-blur-md rounded-[24px] p-3 flex items-center shadow-[0_2px_15px_rgb(225,29,72,0.05)] border border-rose-50">
                    <img 
                      src={record.animalImage} 
                      alt={record.animalName} 
                      className="w-12 h-12 rounded-[14px] object-cover saturate-50 opacity-80 mr-4 border border-rose-100/50" 
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-rose-900/70 text-[14px] leading-tight truncate decoration-rose-300 line-through">{record.animalName || 'ไม่ระบุชื่อ'}</h3>
                      <p className="text-[11px] text-rose-400/80 font-medium">{record.aiWeight} kg • {dateString}</p>
                    </div>
                    <div className="flex">
                      <button 
                        onClick={() => handleRestoreHistory(record.id)}
                        className="text-[12px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors shadow-sm whitespace-nowrap"
                      >
                        กู้คืน
                      </button>
                      <button 
                        onClick={() => handlePermanentDeleteHistory(record.id, record.animalName)}
                        className="text-[12px] font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full hover:bg-gray-100 hover:text-gray-700 transition-colors shadow-sm whitespace-nowrap ml-2"
                      >
                        ลบถาวร
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}


      {/* FLOATING BOTTOM NAV */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[90%] max-w-[380px] bg-white/90 backdrop-blur-xl rounded-full shadow-[0_10px_40px_rgb(0,0,0,0.1)] flex justify-between items-center px-4 py-3 z-50 border border-white/50">
        <Link href="/dashboard" className="text-gray-400 hover:text-emerald-500 transition-colors w-12 flex justify-center">
           <Home size={24} strokeWidth={2.5} />
        </Link>
        
        <Link href="/history" className="text-gray-400 hover:text-emerald-500 transition-colors w-12 flex justify-center pr-2">
           <History size={24} strokeWidth={2.5} />
        </Link>

        {/* Center Prominent Scan Button */}
        <div className="w-16 flex justify-center relative">
          <Link href="/scan" className="absolute left-1/2 -translate-x-1/2 -top-12 w-16 h-16 bg-gradient-to-tr from-blue-600 to-blue-400 text-white rounded-full flex items-center justify-center shadow-[0_10px_25px_rgba(59,130,246,0.4)] hover:scale-105 active:scale-95 transition-all border-4 border-white/90">
             <Camera size={26} strokeWidth={2.5} className="mr-0.5 mb-0.5" />
          </Link>
        </div>

        <Link href="/pricing" className="text-[#1c1c1c] transition-colors relative w-12 flex justify-center pl-2">
           <Calculator size={24} strokeWidth={2.5} />
           <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#1c1c1c] rounded-full"></span>
        </Link>
        
        <Link href="/settings" className="text-gray-400 hover:text-emerald-500 transition-colors w-12 flex justify-center">
           <CircleUser size={24} strokeWidth={2.5} />
        </Link>
      </div>

    </div>
  );
}
