"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Calculator, TrendingUp, Edit3, Check, Save, Coins, X, Plus, Minus, Search } from "lucide-react";

export default function PricingCalculatorPage() {
  const [globalPrice, setGlobalPrice] = useState<number>(80);
  const [farmAnimals, setFarmAnimals] = useState<any[]>([]);
  const [historyRecords, setHistoryRecords] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'farm' | 'history'>('farm');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempCustomPrice, setTempCustomPrice] = useState<string>("");

  useEffect(() => {
    // Load global price if saved
    const savedGlobal = localStorage.getItem('globalPricePerKg');
    if (savedGlobal) setGlobalPrice(Number(savedGlobal));

    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  const loadData = () => {
    const stored = localStorage.getItem('mockAnimals');
    if (stored) {
      const parsed = JSON.parse(stored);
      
      // Load Farm Animals
      const animalsList = Object.values(parsed).filter((a: any) => !a.isDeleted);
      setFarmAnimals(animalsList);

      // Load History Records
      let allHistory: any[] = [];
      Object.values(parsed).forEach((animal: any) => {
        if (animal.history) {
          animal.history.forEach((h: any) => {
            if (!h.isDeleted) {
              allHistory.push({
                ...h,
                animalId: animal.id,
                animalName: animal.name,
                animalType: animal.type,
                animalImage: h.scanImage || animal.image
              });
            }
          });
        }
      });
      allHistory.sort((a, b) => {
        const timeA = a.timestamp || 0;
        const timeB = b.timestamp || 0;
        return timeB - timeA; // newest first
      });
      setHistoryRecords(allHistory);
    }
  };

  const getLatestWeight = (animal: any) => {
    if (!animal || !animal.history || animal.history.length === 0) return 0;
    const validHistory = animal.history.filter((h: any) => !h.isDeleted);
    if (validHistory.length === 0) return 0;
    validHistory.sort((a: any, b: any) => b.attempt - a.attempt);
    return validHistory[0].aiWeight || 0;
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
    
    const stored = localStorage.getItem('mockAnimals');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed[animalId]) {
        if (isClearing) delete parsed[animalId].customPrice;
        else parsed[animalId].customPrice = newPrice;
        localStorage.setItem('mockAnimals', JSON.stringify(parsed));
      }
    }
    setEditingId(null);
    loadData();
  };

  const saveHistoryCustomPrice = (animalId: string, attempt: number) => {
    const newPrice = Number(tempCustomPrice);
    const isClearing = !tempCustomPrice || newPrice <= 0;
    
    const stored = localStorage.getItem('mockAnimals');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed[animalId] && parsed[animalId].history) {
        const hIndex = parsed[animalId].history.findIndex((h:any) => h.attempt === attempt);
        if (hIndex >= 0) {
          if (isClearing) delete parsed[animalId].history[hIndex].customPrice;
          else parsed[animalId].history[hIndex].customPrice = newPrice;
          localStorage.setItem('mockAnimals', JSON.stringify(parsed));
        }
      }
    }
    setEditingId(null);
    loadData();
  };

  const toggleCustomModeFarm = (animal: any) => {
    const isCustom = animal.customPrice !== undefined && animal.customPrice !== null;
    if (isCustom) {
      setTempCustomPrice("");
      saveFarmCustomPrice(animal.id);
    } else {
      startEditCustomPrice(`farm-${animal.id}`, animal.customPrice);
    }
  };

  const toggleCustomModeHistory = (record: any) => {
    const isCustom = record.customPrice !== undefined && record.customPrice !== null;
    if (isCustom) {
      setTempCustomPrice("");
      saveHistoryCustomPrice(record.animalId, record.attempt);
    } else {
      startEditCustomPrice(`hist-${record.animalId}-${record.attempt}`, record.customPrice);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="min-h-screen bg-[#F8FAEC] text-gray-800 pb-20 font-sans">
      <header className="bg-gradient-to-r from-[#144A29] to-emerald-800 text-white p-5 shadow-lg relative overflow-hidden pb-12">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="flex items-center gap-4 relative z-10 mb-2">
          <Link href="/dashboard" className="p-2 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-all border border-white/20">
            <ArrowLeft size={22} />
          </Link>
          <h1 className="text-xl font-black tracking-wide">ประเมินราคาซื้อสัตว์</h1>
        </div>
        <p className="text-emerald-100/80 text-sm ml-14 font-bold relative z-10">คำนวณราคาประเมินจากน้ำหนัก AI</p>
      </header>

      <div className="px-5 -mt-8 relative z-10 space-y-6">
        
        {/* Global Price Card */}
        <div className="bg-white rounded-[32px] p-7 shadow-[0_15px_35px_rgb(0,0,0,0.06)] border border-emerald-50">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-gray-900 font-extrabold flex items-center text-lg">
              <TrendingUp size={22} className="text-[#144A29] mr-2" /> กำหนดราคามาตรฐาน
            </h2>
          </div>
          
          <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-2xl p-2 shadow-inner">
            <button 
              onClick={() => updateGlobalPrice(globalPrice - 1)}
              className="w-16 h-16 bg-[#144A29] text-white rounded-[18px] flex items-center justify-center hover:bg-emerald-800 shadow-md transition-all active:scale-95"
            >
              <Minus size={28} strokeWidth={3} />
            </button>
            
            <div className="flex-1 flex flex-col items-center justify-center">
              <input 
                type="number"
                value={globalPrice || ""}
                onChange={(e) => updateGlobalPrice(Number(e.target.value))}
                className="w-full text-center text-4xl font-black text-[#144A29] bg-transparent focus:outline-none"
              />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide mt-1">บาท / กก.</span>
            </div>
            
            <button 
              onClick={() => updateGlobalPrice(globalPrice + 1)}
              className="w-16 h-16 bg-[#144A29] text-white rounded-[18px] flex items-center justify-center hover:bg-emerald-800 shadow-md transition-all active:scale-95"
            >
              <Plus size={28} strokeWidth={3} />
            </button>
          </div>
          
          <p className="text-xs text-center text-gray-400 mt-4 font-bold">
            ราคานี้จะใช้คำนวณกับรายการที่เลือกใช้ราคามาตรฐาน
          </p>
        </div>

        {/* List Section */}
        <div>
          <div className="flex justify-between items-center mb-4 ml-2 mr-2">
            <h2 className="text-gray-900 font-extrabold text-xl">
              รายการประเมินราคา
            </h2>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-200/60 p-1.5 rounded-2xl mb-5 mx-1">
            <button 
              onClick={() => setActiveTab('farm')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'farm' ? 'bg-white text-[#144A29] shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
            >
              สัตว์ในฟาร์ม
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'history' ? 'bg-white text-[#144A29] shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
            >
              ประวัติทั้งหมด
            </button>
          </div>
          
          <div className="space-y-5">
            
            {/* FARM TAB */}
            {activeTab === 'farm' && farmAnimals.length === 0 && (
              <div className="text-center p-10 bg-white rounded-[32px] shadow-sm text-gray-400 font-bold text-lg">
                ยังไม่มีข้อมูลสัตว์ในฟาร์ม
              </div>
            )}
            {activeTab === 'farm' && farmAnimals.map(animal => {
              const weight = getLatestWeight(animal);
              const isCustom = animal.customPrice !== undefined && animal.customPrice !== null;
              const activePrice = isCustom ? animal.customPrice : globalPrice;
              const totalPrice = weight * activePrice;
              const uniqueId = `farm-${animal.id}`;
              const isEditing = editingId === uniqueId;

              return (
                <div key={uniqueId} className="bg-white rounded-[32px] p-5 shadow-[0_10px_30px_rgb(0,0,0,0.06)] border border-transparent hover:border-emerald-100 transition-all flex flex-col gap-4">
                  <div className="flex gap-4 items-center">
                    <Link href={`/animals/${animal.id}`} className="w-20 h-20 bg-gray-100 rounded-2xl overflow-hidden shrink-0 shadow-inner block">
                      <img src={animal.image} alt={animal.name} className="w-full h-full object-cover" />
                    </Link>
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-black text-gray-800 text-lg leading-tight truncate">{animal.name}</p>
                          <p className="text-xs font-bold text-gray-400 mt-0.5">{animal.type} <span className="text-emerald-600">#{animal.id}</span></p>
                        </div>
                        <div className="flex flex-col items-end">
                          <p className={`text-[9px] font-bold mb-1 uppercase tracking-widest ${isCustom ? 'text-orange-500' : 'text-gray-400'}`}>
                            {isCustom ? 'กำหนดเอง' : 'มาตรฐาน'}
                          </p>
                          <div 
                            onClick={() => toggleCustomModeFarm(animal)}
                            className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors shadow-inner ${isCustom ? 'bg-orange-500' : 'bg-gray-300'}`}
                          >
                            <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${isCustom ? 'translate-x-5' : 'translate-x-0'}`}></div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100 flex items-center">
                          <span className="text-[10px] text-gray-500 font-bold mr-1.5 uppercase tracking-wide">น้ำหนัก</span>
                          <span className="text-sm font-black text-gray-800">{weight > 0 ? weight.toFixed(1) : "0"} <span className="text-[10px] font-bold text-gray-500">กก.</span></span>
                        </div>
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <input 
                              type="number"
                              value={tempCustomPrice}
                              onChange={(e) => setTempCustomPrice(e.target.value)}
                              className="w-16 bg-white border-2 border-emerald-400 text-sm font-black text-[#144A29] rounded-lg px-2 py-1 focus:outline-none shadow-sm text-center"
                              autoFocus
                            />
                            <button 
                              onClick={() => saveFarmCustomPrice(animal.id)}
                              className="bg-[#144A29] text-white p-1.5 rounded-lg hover:bg-emerald-800 shadow-sm transition-colors"
                            >
                              <Check size={14} strokeWidth={3} />
                            </button>
                            <button 
                              onClick={() => setEditingId(null)}
                              className="bg-gray-100 text-gray-500 p-1.5 rounded-lg hover:bg-gray-200 shadow-sm transition-colors"
                            >
                              <X size={14} strokeWidth={3} />
                            </button>
                          </div>
                        ) : (
                          <div 
                            className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-2 cursor-pointer transition-colors group ${isCustom ? 'bg-orange-50 border-orange-100' : 'bg-gray-50 border-gray-100 hover:bg-emerald-50 hover:border-emerald-100'}`}
                            onClick={() => startEditCustomPrice(uniqueId, animal.customPrice)}
                          >
                            <div className="flex items-center">
                              <span className={`text-[10px] font-bold mr-1.5 uppercase tracking-wide ${isCustom ? 'text-orange-600' : 'text-gray-500'}`}>ราคา/กก.</span>
                              <span className={`text-sm font-black ${isCustom ? 'text-orange-600' : 'text-gray-800'}`}>{activePrice} <span className="text-[10px] font-bold">฿</span></span>
                            </div>
                            <Edit3 size={12} className={`${isCustom ? 'text-orange-400' : 'text-gray-400 group-hover:text-emerald-600'}`} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="bg-emerald-50/50 rounded-2xl p-4 flex items-center justify-between border border-emerald-100/50 mt-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-sm">
                        <Coins size={20} />
                      </div>
                      <div>
                        <p className="text-emerald-800/80 text-[10px] font-bold uppercase tracking-wider mb-0.5">ราคาประเมินรวม</p>
                        <p className="text-2xl font-black text-[#144A29] leading-none tracking-tight">{formatCurrency(totalPrice)}</p>
                      </div>
                    </div>
                    <span className="text-emerald-600 font-bold text-sm bg-emerald-100/50 px-2.5 py-1 rounded-lg">บาท</span>
                  </div>
                </div>
              );
            })}

            {/* HISTORY TAB */}
            {activeTab === 'history' && historyRecords.length === 0 && (
              <div className="text-center p-10 bg-white rounded-[32px] shadow-sm text-gray-400 font-bold text-lg">
                ไม่มีประวัติการชั่งน้ำหนัก
              </div>
            )}
            {activeTab === 'history' && historyRecords.map((record) => {
              const weight = record.aiWeight || 0;
              const isCustom = record.customPrice !== undefined && record.customPrice !== null;
              const activePrice = isCustom ? record.customPrice : globalPrice;
              const totalPrice = weight * activePrice;
              const uniqueId = `hist-${record.animalId}-${record.attempt}`;
              const isEditing = editingId === uniqueId;

              // Format date nicely
              const dateObj = record.timestamp ? new Date(record.timestamp) : null;
              const timeString = dateObj ? dateObj.toLocaleTimeString('th-TH', {hour: '2-digit', minute:'2-digit'}) : 'ไม่ระบุเวลา';
              const dateString = dateObj ? dateObj.toLocaleDateString('th-TH', {day: 'numeric', month: 'short'}) : '';

              return (
                <div key={uniqueId} className="bg-white rounded-[32px] p-5 shadow-[0_10px_30px_rgb(0,0,0,0.06)] border border-transparent hover:border-emerald-100 transition-all flex flex-col gap-4">
                  <div className="flex gap-4 items-center">
                    <Link href="/history" className="w-20 h-20 bg-gray-100 rounded-2xl overflow-hidden shrink-0 shadow-inner block relative">
                      <img src={record.animalImage} alt="scan" className="w-full h-full object-cover" />
                      <div className="absolute top-0 right-0 bg-[#144A29] text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                        ครั้งที่ {record.attempt}
                      </div>
                    </Link>
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-black text-gray-800 text-lg leading-tight truncate">{record.animalName || 'ไม่ระบุชื่อ'}</p>
                          <p className="text-xs font-bold text-gray-400 mt-0.5">{dateString} {timeString}</p>
                        </div>
                        <div className="flex flex-col items-end">
                          <p className={`text-[9px] font-bold mb-1 uppercase tracking-widest ${isCustom ? 'text-orange-500' : 'text-gray-400'}`}>
                            {isCustom ? 'กำหนดเอง' : 'มาตรฐาน'}
                          </p>
                          <div 
                            onClick={() => toggleCustomModeHistory(record)}
                            className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors shadow-inner ${isCustom ? 'bg-orange-500' : 'bg-gray-300'}`}
                          >
                            <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${isCustom ? 'translate-x-5' : 'translate-x-0'}`}></div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100 flex items-center">
                          <span className="text-[10px] text-gray-500 font-bold mr-1.5 uppercase tracking-wide">น้ำหนัก</span>
                          <span className="text-sm font-black text-gray-800">{weight > 0 ? weight.toFixed(1) : "0"} <span className="text-[10px] font-bold text-gray-500">กก.</span></span>
                        </div>
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <input 
                              type="number"
                              value={tempCustomPrice}
                              onChange={(e) => setTempCustomPrice(e.target.value)}
                              className="w-16 bg-white border-2 border-emerald-400 text-sm font-black text-[#144A29] rounded-lg px-2 py-1 focus:outline-none shadow-sm text-center"
                              autoFocus
                            />
                            <button 
                              onClick={() => saveHistoryCustomPrice(record.animalId, record.attempt)}
                              className="bg-[#144A29] text-white p-1.5 rounded-lg hover:bg-emerald-800 shadow-sm transition-colors"
                            >
                              <Check size={14} strokeWidth={3} />
                            </button>
                            <button 
                              onClick={() => setEditingId(null)}
                              className="bg-gray-100 text-gray-500 p-1.5 rounded-lg hover:bg-gray-200 shadow-sm transition-colors"
                            >
                              <X size={14} strokeWidth={3} />
                            </button>
                          </div>
                        ) : (
                          <div 
                            className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-2 cursor-pointer transition-colors group ${isCustom ? 'bg-orange-50 border-orange-100' : 'bg-gray-50 border-gray-100 hover:bg-emerald-50 hover:border-emerald-100'}`}
                            onClick={() => startEditCustomPrice(uniqueId, record.customPrice)}
                          >
                            <div className="flex items-center">
                              <span className={`text-[10px] font-bold mr-1.5 uppercase tracking-wide ${isCustom ? 'text-orange-600' : 'text-gray-500'}`}>ราคา/กก.</span>
                              <span className={`text-sm font-black ${isCustom ? 'text-orange-600' : 'text-gray-800'}`}>{activePrice} <span className="text-[10px] font-bold">฿</span></span>
                            </div>
                            <Edit3 size={12} className={`${isCustom ? 'text-orange-400' : 'text-gray-400 group-hover:text-emerald-600'}`} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="bg-emerald-50/50 rounded-2xl p-4 flex items-center justify-between border border-emerald-100/50 mt-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-sm">
                        <Coins size={20} />
                      </div>
                      <div>
                        <p className="text-emerald-800/80 text-[10px] font-bold uppercase tracking-wider mb-0.5">ราคาประเมินรวม</p>
                        <p className="text-2xl font-black text-[#144A29] leading-none tracking-tight">{formatCurrency(totalPrice)}</p>
                      </div>
                    </div>
                    <span className="text-emerald-600 font-bold text-sm bg-emerald-100/50 px-2.5 py-1 rounded-lg">บาท</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
