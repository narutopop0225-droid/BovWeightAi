"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, History, Calendar, Edit3, Tractor, Bell, Home, CircleUser, Activity, Target, Settings, Calculator, Search, Plus, ListFilter, Check, X, Building2, ChevronRight, Heart, MapPin, Star, Syringe } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [isEditingFarm, setIsEditingFarm] = useState(false);
  const [farmName, setFarmName] = useState("Salung Farm");
  
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [farmAnimalsData, setFarmAnimalsData] = useState({ cow: 0, buffalo: 0 });
  const [totalAnimals, setTotalAnimals] = useState(0);
  const [recentHistory, setRecentHistory] = useState<any[]>([]);
  const [totalHistoryCount, setTotalHistoryCount] = useState(0);
  
  const [allAnimalsList, setAllAnimalsList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleLinkClick = (e: React.MouseEvent) => {
    // Left empty since we don't need drag prevention anymore
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('/api/animals');
        if (!res.ok) {
          // Fallback if API fails or DB not ready
          const stored = localStorage.getItem('mockAnimals');
          if (stored) {
            const parsed = JSON.parse(stored);
            let c = 0; let b = 0; let ah: any[] = []; let aa: any[] = [];
            Object.values(parsed).forEach((animal: any) => {
              if (animal.isDeleted) return; // Skip deleted animals
              if (animal.type === "โคเนื้อ") c++;
              if (animal.type === "กระบือ") b++;
              aa.push(animal);
              animal.history.forEach((h: any) => ah.push({ ...h, animalId: animal.id, animalName: animal.name, animalType: animal.type, animalImage: h.scanImage || animal.image }));
            });
            setFarmAnimalsData({ cow: c, buffalo: b }); setTotalAnimals(c + b); setAllAnimalsList(aa);
            ah.sort((a, b) => b.timestamp - a.timestamp);
            const activeHistory = ah.filter(h => !h.isDeleted);
            setRecentHistory(activeHistory.slice(0, 5)); setTotalHistoryCount(activeHistory.length);
          }
          return;
        }

        const animalsData = await res.json();
        
        let cowCount = 0;
        let bufCount = 0;
        let allHistory: any[] = [];
        let allAnim: any[] = [];
        
        animalsData.forEach((animal: any) => {
          if (animal.isDeleted) return; // Skip soft-deleted animals
          
          if (animal.type === "โคเนื้อ") cowCount++;
          if (animal.type === "กระบือ") bufCount++;
          
          allAnim.push(animal);
          
          if (animal.measurements) {
            animal.measurements.forEach((h: any) => {
              allHistory.push({
                ...h,
                animalId: animal.id,
                animalName: animal.name,
                animalType: animal.type,
                animalImage: h.scanImage || animal.image
              });
            });
          }
        });
        
        setFarmAnimalsData({ cow: cowCount, buffalo: bufCount });
        setTotalAnimals(cowCount + bufCount);
        setAllAnimalsList(allAnim);
        
        allHistory.sort((a, b) => b.timestamp - a.timestamp);
        const activeHistory = allHistory.filter(h => !h.isDeleted);
        setRecentHistory(activeHistory.slice(0, 5));
        setTotalHistoryCount(activeHistory.length);
        
      } catch (err) {
        console.error("Failed to load data", err);
      }
    };
    loadData();

    // Load profile
    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
      const parsed = JSON.parse(storedProfile);
      if (parsed.profileImage) setProfileImage(parsed.profileImage);
      if (parsed.name) setFarmName(parsed.name);
    }
    
  }, []);

  const searchResults = allAnimalsList.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const cowPercent = totalAnimals > 0 ? (farmAnimalsData.cow / totalAnimals) * 100 : 0;
  const buffaloPercent = totalAnimals > 0 ? (farmAnimalsData.buffalo / totalAnimals) * 100 : 0;

  const toggleFavorite = async (e: React.MouseEvent, animalId: string, measurementId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const record = recentHistory.find(r => r.id === measurementId);
    if (!record) return;

    const newFav = !record.isFavorite;

    // Update local state
    setRecentHistory(prev => prev.map(r => 
      (r.id === measurementId) ? { ...r, isFavorite: newFav } : r
    ));

    try {
      await fetch(`/api/measurements/${measurementId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: newFav })
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-[#1c1c1c] relative pb-32 font-sans overflow-x-hidden pt-12 px-6">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex-1">
          {isEditingFarm ? (
            <div className="flex items-center space-x-2">
              <input 
                type="text" 
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                className="bg-white border-none rounded-full px-3 py-1.5 text-[#1c1c1c] text-xl font-bold w-48 focus:outline-none shadow-sm"
                autoFocus
              />
              <button 
                onClick={() => {
                  setIsEditingFarm(false);
                  const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
                  profile.name = farmName;
                  localStorage.setItem('userProfile', JSON.stringify(profile));
                }} 
                className="p-1.5 bg-[#1c1c1c] rounded-full text-white"
              >
                <Check size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 cursor-pointer group" onClick={() => setIsEditingFarm(true)}>
              <h1 className="text-2xl font-bold tracking-tight">ยินดีต้อนรับ, {farmName}</h1>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-[0_2px_10px_rgb(0,0,0,0.03)] text-[#1c1c1c]">
            <Bell size={18} strokeWidth={2} />
          </button>
          <Link href="/settings" className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-[0_2px_10px_rgb(0,0,0,0.03)] text-[#1c1c1c] overflow-hidden border border-emerald-100">
             {profileImage ? (
                  <img src={profileImage} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <CircleUser size={18} strokeWidth={2} />
                )}
          </Link>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="relative mb-8 z-40">
        <div className={`bg-white rounded-full flex items-center px-4 py-3 shadow-[0_2px_15px_rgb(0,0,0,0.02)] border ${isSearching ? 'border-emerald-400' : 'border-transparent'} transition-colors`}>
          <Search size={18} className="text-gray-400 mr-3 shrink-0" />
          <input 
            type="text" 
            placeholder="ค้นหาชื่อ หรือ รหัสสัตว์..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearching(e.target.value.length > 0);
            }}
            className="bg-transparent border-none focus:outline-none text-sm w-full font-medium placeholder:text-gray-400"
          />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(""); setIsSearching(false); }} className="text-gray-400 ml-2 hover:text-[#1c1c1c]">
               <X size={16} />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {isSearching && (
          <div className="absolute top-[110%] left-0 right-0 bg-white rounded-[24px] shadow-xl border border-gray-100 max-h-[300px] overflow-y-auto p-2">
             {searchResults.length > 0 ? (
               searchResults.map(animal => (
                 <Link 
                   href={`/animals/${animal.id}`}
                   key={animal.id}
                   onClick={() => { setSearchQuery(""); setIsSearching(false); }}
                   className="flex items-center space-x-3 p-3 hover:bg-emerald-50 rounded-[16px] transition-colors"
                 >
                   <img src={animal.image} className="w-10 h-10 rounded-[10px] object-cover bg-gray-100" />
                   <div>
                     <h4 className="font-bold text-sm text-[#1c1c1c] leading-tight">{animal.name}</h4>
                     <p className="text-[10px] font-mono text-emerald-600">ID: {animal.id}</p>
                   </div>
                 </Link>
               ))
             ) : (
               <p className="text-center py-6 text-sm text-gray-400 font-medium">ไม่พบข้อมูลสัตว์ที่ค้นหา</p>
             )}
          </div>
        )}
      </div>

      {/* DIM BACKGROUND WHEN SEARCHING */}
      {isSearching && (
         <div className="fixed inset-0 bg-black/10 z-30" onClick={() => { setSearchQuery(""); setIsSearching(false); }}></div>
      )}

      {/* PERFORMANCE CARD */}
      <div className="bg-white rounded-[24px] p-5 mb-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] relative overflow-hidden border border-emerald-50">
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-100/50 rounded-full blur-3xl"></div>
        <div className="z-10 relative">
          <h2 className="text-[15px] font-bold mb-4 leading-tight flex items-center">
             <Activity size={16} className="text-emerald-500 mr-2" /> ภาพรวมข้อมูลฟาร์ม
          </h2>
          
          <div className="mb-5 flex justify-between items-center pr-2">
             <div>
               <p className="text-[10px] text-gray-400 font-bold mb-1 tracking-wide">สัตว์ทั้งหมดในฟาร์ม</p>
               <h3 className="text-[44px] font-mono font-black text-[#1c1c1c] tracking-tight leading-none">{totalAnimals} <span className="text-sm font-sans font-medium text-gray-400">ตัว</span></h3>
             </div>

             {/* DYNAMIC DONUT CHART + PERCENTAGES */}
             <div className="flex items-center gap-1.5 pr-4">
                 {/* Left Percent (Blue/Cow) */}
                 {totalAnimals > 0 && (
                    <span className="text-[12px] font-mono font-black text-blue-500 bg-blue-50 px-2 py-1 rounded-md leading-none shadow-[0_2px_10px_rgb(59,130,246,0.15)] z-10">
                       {cowPercent.toFixed(0)}%
                    </span>
                 )}
                 
                 {/* Chart */}
                 <div className="w-[110px] h-[110px] relative flex items-center justify-center drop-shadow-md mx-[-2px]">
                    <svg viewBox="0 0 36 36" className="w-full h-full transform rotate-90">
                       {totalAnimals === 0 ? (
                          <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="#f3f4f6" strokeWidth="4"></circle>
                       ) : (
                          <>
                            {/* Green (Buffalo) Base */}
                            <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="#10b981" strokeWidth="4"></circle>
                            {/* Blue (Cow) Overlay */}
                            <circle 
                               cx="18" cy="18" r="15.9155" 
                               fill="transparent" 
                               stroke="#3b82f6" 
                               strokeWidth="4" 
                               strokeLinecap="round"
                               strokeDasharray={`${cowPercent} ${100 - cowPercent}`} 
                               strokeDashoffset="0"
                               className="transition-all duration-1000 ease-out"
                            ></circle>
                          </>
                       )}
                    </svg>
                 </div>

                 {/* Right Percent (Green/Buffalo) */}
                 {totalAnimals > 0 && (
                    <span className="text-[12px] font-mono font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md leading-none shadow-[0_2px_10px_rgb(16,185,129,0.15)] z-10">
                       {buffaloPercent.toFixed(0)}%
                    </span>
                 )}
             </div>
          </div>

          <div className="flex gap-3 mb-4">
             {/* COW (BLUE) */}
             <div className="flex-1 bg-white p-3 rounded-[16px] border border-blue-100 flex items-center shadow-sm">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-xl mr-3 shadow-sm border border-blue-100/50">🐄</div>
                <div>
                   <span className="text-[10px] text-blue-500 font-bold block mb-0.5">โคเนื้อ</span>
                   <span className="text-lg font-mono font-bold text-[#1c1c1c] leading-none">{farmAnimalsData.cow}</span>
                </div>
             </div>
             {/* BUFFALO (GREEN) */}
             <div className="flex-1 bg-white p-3 rounded-[16px] border border-emerald-100 flex items-center shadow-sm">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center text-xl mr-3 shadow-sm border border-emerald-100/50">🐃</div>
                <div>
                   <span className="text-[10px] text-emerald-500 font-bold block mb-0.5">กระบือ</span>
                   <span className="text-lg font-mono font-bold text-[#1c1c1c] leading-none">{farmAnimalsData.buffalo}</span>
                </div>
             </div>
          </div>
          
          <div className="bg-emerald-50 p-3.5 rounded-[16px] flex justify-between items-center border border-emerald-100/50">
             <span className="text-[11px] font-bold text-emerald-800">จำนวนการประเมินน้ำหนักทั้งหมด</span>
             <span className="text-lg font-mono font-bold text-emerald-600">{totalHistoryCount} <span className="text-[10px] font-sans text-emerald-500">ครั้ง</span></span>
          </div>
        </div>
      </div>

      {/* MENU CARDS (Horizontal Scroll) */}
      <div className="mb-8">
         <h2 className="text-[17px] font-bold mb-4">เมนูหลัก</h2>
         
         <div 
           className="grid grid-cols-2 md:grid-cols-4 gap-4"
         >
           
           {/* Card 1: Scan (Now Blue) */}
           <Link onClick={handleLinkClick} href="/scan" className="bg-white rounded-[24px] p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col relative overflow-hidden border border-gray-50/50 group h-full">
             {/* Illustration area */}
             <div className="h-[100px] bg-gradient-to-br from-blue-100 to-blue-50 rounded-[16px] mb-3 flex items-center justify-center relative overflow-hidden border border-blue-100">
               <div className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center text-blue-500 relative z-10 group-hover:scale-110 transition-transform">
                  <Camera size={28} strokeWidth={2} />
               </div>
               {/* New AI Decor instead of line */}
               <div className="absolute top-2 left-3 text-lg animate-bounce">✨</div>
               <div className="absolute bottom-2 right-3 text-lg animate-pulse">🤖</div>
             </div>
             
             {/* Text area */}
             <div className="flex flex-col flex-1 justify-between">
               <div>
                  <h3 className="font-bold text-[13px] text-[#1c1c1c] leading-tight mb-1">ประเมินน้ำหนัก AI</h3>
                  <p className="text-[10px] text-gray-400 font-medium leading-tight line-clamp-2">วิเคราะห์น้ำหนักผ่านรูปด้วย AI</p>
               </div>
               
               {/* Full Progress line */}
               <div className="mt-3 w-full bg-blue-500 h-[3px] rounded-full overflow-hidden flex"></div>
             </div>
           </Link>

           {/* Card 2: Pricing (Now Amber/Gold) */}
           <Link onClick={handleLinkClick} href="/pricing" className="bg-white rounded-[24px] p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col relative overflow-hidden border border-gray-50/50 group h-full">
             {/* Illustration area */}
             <div className="h-[100px] bg-gradient-to-br from-amber-100 to-amber-50 rounded-[16px] mb-3 flex items-center justify-center relative overflow-hidden border border-amber-100">
               <div className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center text-amber-500 relative z-10 group-hover:scale-110 transition-transform">
                  <Calculator size={28} strokeWidth={2} />
               </div>
               {/* Deco dots */}
               <div className="absolute top-2 right-3 text-lg animate-pulse">💸</div>
               <div className="absolute bottom-2 left-3 text-lg">📊</div>
             </div>
             
             {/* Text area */}
             <div className="flex flex-col flex-1 justify-between">
               <div>
                  <h3 className="font-bold text-[13px] text-[#1c1c1c] leading-tight mb-1">ประเมินราคา</h3>
                  <p className="text-[10px] text-gray-400 font-medium leading-tight line-clamp-2">คำนวณราคากลางตามน้ำหนัก</p>
               </div>
               
               {/* Full Progress line */}
               <div className="mt-3 w-full bg-amber-400 h-[3px] rounded-full overflow-hidden flex"></div>
             </div>
           </Link>

           {/* Card 3: Animals (Now Emerald) */}
           <Link onClick={handleLinkClick} href="/animals" className="bg-white rounded-[24px] p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col relative overflow-hidden border border-gray-50/50 group h-full">
             {/* Illustration area */}
             <div className="h-[100px] bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-[16px] mb-3 flex items-center justify-center relative overflow-hidden border border-emerald-100">
               <div className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center text-emerald-500 relative z-10 group-hover:scale-110 transition-transform">
                  <Building2 size={28} strokeWidth={2} />
               </div>
               <div className="absolute top-2 left-3 text-lg">🐄</div>
               <div className="absolute bottom-2 right-3 text-lg">🐃</div>
             </div>
             
             {/* Text area */}
             <div className="flex flex-col flex-1 justify-between">
               <div>
                  <h3 className="font-bold text-[13px] text-[#1c1c1c] leading-tight mb-1">ข้อมูลในฟาร์ม</h3>
                  <p className="text-[10px] text-gray-400 font-medium leading-tight line-clamp-2">จัดการและดูประวัติสัตว์</p>
               </div>
               
               {/* Full Progress line */}
               <div className="mt-3 w-full bg-emerald-500 h-[3px] rounded-full overflow-hidden flex"></div>
             </div>
           </Link>

           {/* Card 4: Medicine (Rose) */}
           <Link onClick={handleLinkClick} href="/medicine" className="bg-white rounded-[24px] p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col relative overflow-hidden border border-gray-50/50 group h-full">
             {/* Illustration area */}
             <div className="h-[100px] bg-gradient-to-br from-rose-100 to-rose-50 rounded-[16px] mb-3 flex items-center justify-center relative overflow-hidden border border-rose-100">
               <div className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center text-rose-500 relative z-10 group-hover:scale-110 transition-transform">
                  <Syringe size={28} strokeWidth={2} />
               </div>
               <div className="absolute top-2 left-3 text-lg animate-pulse">💊</div>
               <div className="absolute bottom-2 right-3 text-lg">💉</div>
             </div>
             
             {/* Text area */}
             <div className="flex flex-col flex-1 justify-between">
               <div>
                  <h3 className="font-bold text-[13px] text-[#1c1c1c] leading-tight mb-1">คำนวณยา</h3>
                  <p className="text-[10px] text-gray-400 font-medium leading-tight line-clamp-2">คำนวณโดสยาอัตโนมัติ</p>
               </div>
               
               {/* Full Progress line */}
               <div className="mt-3 w-full bg-rose-500 h-[3px] rounded-full overflow-hidden flex"></div>
             </div>
           </Link>

         </div>
      </div>

      {/* TODAY'S TASKS / HISTORY */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[17px] font-bold">ประวัติการชั่งล่าสุด</h2>
        <Link href="/history" className="text-[12px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">ดูทั้งหมด</Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-4">
        {recentHistory.length === 0 && (
          <div className="col-span-2 md:col-span-4 w-full text-center py-6 bg-white rounded-[24px]">
            <p className="text-sm text-gray-400">ไม่มีประวัติ</p>
          </div>
        )}
        {recentHistory.map((record, i) => {
          const isFav = record.isFavorite;
          return (
            <Link 
              href={`/animals/${record.animalId}?from=dashboard`}
              key={record.attempt + "-" + record.animalId} 
              className="w-full bg-white rounded-[24px] p-2.5 shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col group hover:shadow-[0_8px_30px_rgba(16,185,129,0.08)] hover:border-emerald-200 transition-all duration-300 relative"
            >
              {/* Image Box */}
              <div className="w-full h-[120px] rounded-[18px] border border-gray-100 bg-[#f4f5f7] relative overflow-hidden mb-3 shadow-inner">
                 <img src={record.animalImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                 
                 {/* Favorite Star Icon */}
                 <div 
                   onClick={(e) => toggleFavorite(e, record.animalId, record.id)}
                   className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center shadow-sm backdrop-blur-md transition-colors z-10 ${isFav ? 'bg-amber-100' : 'bg-white/80 hover:bg-white'}`}
                 >
                    <Star size={14} className={isFav ? "text-amber-500 fill-amber-500" : "text-gray-400"} />
                 </div>
              </div>

              {/* Info */}
              <div className="px-1 flex-1 flex flex-col">
                 <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5 line-clamp-1">{record.type}</p>
                 <h3 className="font-bold text-[14px] text-[#1c1c1c] leading-tight line-clamp-1 mb-1">{record.animalName || 'ไม่ระบุชื่อ'}</h3>
                 
                 {/* Weight acting as Price */}
                 <div className="flex items-baseline gap-1 mb-3 mt-1">
                    <span className="font-black font-mono text-[18px] text-emerald-500 leading-none tracking-tight">{record.aiWeight}</span>
                    <span className="text-[10px] font-bold text-emerald-600/70">kg</span>
                 </div>
                 
                 <div className="mt-auto flex items-center justify-between pb-0.5">
                    <div className="flex items-center gap-1 text-gray-400">
                       <MapPin size={10} className="shrink-0" />
                       <span className="text-[9px] font-medium truncate max-w-[80px]">
                         {record.date ? `${record.date} ${record.time}` : (record.time || 'ล่าสุด')}
                       </span>
                    </div>
                    
                    {/* Rating Pill */}
                    <div className="flex items-center gap-1 border border-gray-200 rounded-[8px] px-1.5 py-0.5 shrink-0">
                       <Star size={8} className="text-gray-400 fill-gray-400" />
                       <span className="text-[9px] font-bold text-gray-600">AI</span>
                    </div>
                 </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* FLOATING BOTTOM NAV */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[90%] max-w-[380px] bg-white/90 backdrop-blur-xl rounded-full shadow-[0_10px_40px_rgb(0,0,0,0.1)] flex justify-between items-center px-4 py-3 z-50 border border-white/50">
        <Link href="/dashboard" className="text-[#1c1c1c] transition-colors relative w-12 flex justify-center">
           <Home size={24} strokeWidth={2.5} />
           <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
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

        <Link href="/pricing" className="text-gray-400 hover:text-emerald-500 transition-colors w-12 flex justify-center pl-2">
           <Calculator size={24} strokeWidth={2.5} />
        </Link>
        
        <Link href="/settings" className="text-gray-400 hover:text-emerald-500 transition-colors w-12 flex justify-center">
           <CircleUser size={24} strokeWidth={2.5} />
        </Link>
      </div>

    </div>
  );
}
