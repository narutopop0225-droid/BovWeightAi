"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Camera, History, LogOut, ChevronRight, Edit3, Tractor, Bell, Home, CircleUser, Activity, Target, Settings, Calculator } from "lucide-react";

export default function DashboardPage() {
  const [isEditingFarm, setIsEditingFarm] = useState(false);
  const [farmName, setFarmName] = useState("ฟาร์มของฉัน");
  
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    }
  };

  const [farmAnimalsData, setFarmAnimalsData] = useState({ cow: 0, buffalo: 0 });
  const [totalAnimals, setTotalAnimals] = useState(0);
  const [recentHistory, setRecentHistory] = useState<any[]>([]);
  const [totalHistoryCount, setTotalHistoryCount] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem('mockAnimals');
    if (stored) {
      const parsed = JSON.parse(stored);
      let cows = 0;
      let buffaloes = 0;
      let allHistory: any[] = [];
      let tAnimals = 0;

      Object.values(parsed).forEach((animal: any) => {
        if (!animal.isDeleted) {
          tAnimals++;
          if (animal.type === "โคเนื้อ") cows++;
          if (animal.type === "กระบือ") buffaloes++;
        }
        animal.history.forEach((h: any) => {
          if (!h.isDeleted) {
            allHistory.push({
              ...h,
              animalId: animal.id,
              animalName: animal.name,
              type: animal.type,
              image: h.scanImage || animal.image,
              accuracy: 92 // mock accuracy
            });
          }
        });
      });

      setFarmAnimalsData({ cow: cows, buffalo: buffaloes });
      setTotalAnimals(tAnimals);
      setTotalHistoryCount(allHistory.length);
      
      allHistory.sort((a, b) => {
        const timeA = a.timestamp || 0;
        const timeB = b.timestamp || 0;
        return timeB - timeA;
      });

      setRecentHistory(allHistory.slice(0, 3));
    }
    
    // Load profile
    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
      const parsed = JSON.parse(storedProfile);
      if (parsed.profileImage) setProfileImage(parsed.profileImage);
      if (parsed.name) setFarmName(parsed.name);
    }
  }, []);

  const farmAnimals = [
    { type: "โคเนื้อ", count: farmAnimalsData.cow, iconColor: "bg-emerald-100 text-emerald-600" },
    { type: "กระบือ", count: farmAnimalsData.buffalo, iconColor: "bg-blue-100 text-blue-600" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAEC] text-gray-800 relative pb-28 font-sans overflow-x-hidden">
      
      {/* 🌟 Premium Header with Gradient & Abstract Geometry */}
      <div className="bg-gradient-to-br from-[#0f381f] via-[#144A29] to-[#1c663a] pt-14 pb-28 px-6 rounded-b-[40px] shadow-[0_10px_30px_rgba(20,74,41,0.3)] relative z-0 overflow-hidden">
        {/* Abstract shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>
        
        <div className="flex justify-between items-center relative z-10">
          <div className="flex items-center space-x-4">
            
            {/* Uploadable Profile Picture */}
            <Link href="/settings" className="relative group cursor-pointer">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 border-2 border-white/80 shadow-lg relative backdrop-blur-sm p-0.5 transition-transform hover:scale-105 overflow-hidden">
                {profileImage ? (
                  <img src={profileImage} alt="User" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <CircleUser size={32} />
                )}
              </div>
            </Link>

            {/* Farm Name */}
            <div>
              {isEditingFarm ? (
                <div className="flex items-center space-x-2">
                  <div className="flex flex-col space-y-2 mt-1">
                    <input 
                      type="text" 
                      value={farmName}
                      onChange={(e) => setFarmName(e.target.value)}
                      className="bg-white/20 border border-white/50 rounded-lg px-2 py-1.5 text-white text-lg font-bold w-48 focus:outline-none focus:bg-white/30 backdrop-blur-sm shadow-inner"
                      autoFocus
                    />
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => {
                          setIsEditingFarm(false);
                          const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
                          profile.name = farmName;
                          localStorage.setItem('userProfile', JSON.stringify(profile));
                        }} 
                        className="px-3 py-1.5 bg-emerald-500 rounded-lg text-white font-bold text-xs hover:bg-emerald-600 transition-colors shadow-sm"
                      >
                        เสร็จสิ้น
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <h1 className="text-white font-black text-2xl drop-shadow-sm">{farmName}</h1>
                  <button onClick={() => setIsEditingFarm(true)} className="text-emerald-300 hover:text-white transition-colors p-1 bg-white/10 rounded-full">
                    <Edit3 size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
          <Link href="/" className="relative p-3 bg-white/10 text-white hover:bg-white/20 backdrop-blur-md rounded-full transition-all group shadow-sm">
            <LogOut size={20} className="group-hover:-translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* 🌟 Overlapping Main Content */}
      <div className="px-6 -mt-16 relative z-10 space-y-6">
        
        {/* Premium Herd Overview Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[32px] p-7 shadow-[0_20px_40px_rgb(0,0,0,0.06)] border border-white">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-gray-900 font-extrabold text-lg flex items-center">
              <Activity size={20} className="text-[#144A29] mr-2" /> ภาพรวมฟาร์ม
            </h2>
            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">
              อัปเดตล่าสุด
            </span>
          </div>

          <div className="flex justify-between items-end mb-5">
            <div>
              <p className="text-xs text-gray-500 font-bold mb-1 tracking-wide uppercase">สัตว์ที่ลงทะเบียนในฟาร์ม</p>
              <h3 className="text-[42px] font-black text-[#144A29] leading-none drop-shadow-sm">{totalAnimals}</h3>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 font-bold mb-1 tracking-wide uppercase">ประวัติการชั่งน้ำหนักรวม</p>
              <h3 className="text-2xl font-bold text-gray-800 leading-none">{totalHistoryCount}</h3>
            </div>
          </div>

          {/* Smooth Gradient Progress Bar */}
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-6 flex shadow-inner">
            <div className="h-full bg-gradient-to-r from-[#144A29] to-[#1e7540]" style={{ width: `${(farmAnimals[0].count / totalAnimals) * 100}%` }}></div>
            <div className="h-full bg-gradient-to-r from-[#3b82f6] to-[#60a5fa]" style={{ width: `${(farmAnimals[1].count / totalAnimals) * 100}%` }}></div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-5">
            {farmAnimals.map((animal, idx) => (
              <div key={idx} className="flex items-center space-x-3 group">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 ${animal.iconColor}`}>
                  {animal.type === "โคเนื้อ" ? (
                     <span className="text-2xl">🐄</span>
                  ) : (
                     <span className="text-2xl">🐃</span>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold">{animal.type}</p>
                  <p className="text-xl font-black text-gray-900">{animal.count}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 🌟 Quick Cards (Menu) */}
        <div>
          <h2 className="text-gray-900 font-extrabold text-lg mb-4 flex items-center">
            <Target size={20} className="text-[#144A29] mr-2" /> เมนูการใช้งาน
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {/* Card 1: Farm Data */}
            <Link href="/animals" className="bg-white p-6 rounded-[28px] shadow-[0_10px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_15px_35px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all border border-transparent hover:border-emerald-100 relative overflow-hidden group">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform shadow-sm">
                <Tractor size={24} strokeWidth={2.5} />
              </div>
              <h3 className="font-black text-[#144A29] text-lg leading-tight mt-3">ข้อมูลสัตว์<br/>ในฟาร์ม</h3>
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-400/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none group-hover:bg-emerald-400/10 transition-colors"></div>
            </Link>

            {/* Card 2: Scan AI */}
            <Link href="/scan" className="bg-white p-6 rounded-[28px] shadow-[0_10px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_15px_35px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all border border-transparent hover:border-orange-100 relative overflow-hidden group">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-50 rounded-2xl flex items-center justify-center text-orange-600 mb-4 group-hover:scale-110 transition-transform shadow-sm">
                <Camera size={24} strokeWidth={2.5} />
              </div>
              <p className="text-xs text-gray-500 font-bold mb-1">สแกนเลย</p>
              <h3 className="font-black text-orange-600 text-lg leading-tight">ประเมิน<br/>น้ำหนัก AI</h3>
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-400/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none group-hover:bg-orange-400/10 transition-colors"></div>
            </Link>

            {/* Card 3: Price Estimator (Span 2 columns) */}
            <Link href="/pricing" className="col-span-2 bg-gradient-to-r from-[#144A29] to-emerald-800 p-6 rounded-[28px] shadow-[0_10px_30px_rgb(20,74,41,0.2)] hover:shadow-[0_15px_35px_rgb(20,74,41,0.3)] hover:-translate-y-1 transition-all relative overflow-hidden group flex items-center justify-between">
              <div className="flex items-center space-x-4 relative z-10">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-emerald-200 group-hover:scale-110 transition-transform shadow-sm backdrop-blur-sm">
                  <Calculator size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="font-black text-white text-lg leading-tight">ประเมินราคาซื้อ</h3>
                  <p className="text-xs text-emerald-200/80 font-bold mt-1">คำนวณราคาจากน้ำหนัก AI</p>
                </div>
              </div>
              <ChevronRight size={24} className="text-white/50 relative z-10 group-hover:text-white transition-colors" />
              <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
            </Link>
          </div>
        </div>

        {/* 🌟 Recent Activity */}
        <div className="pb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-gray-900 font-extrabold text-lg flex items-center">
              <History size={20} className="text-[#144A29] mr-2" /> ประวัติการชั่งน้ำหนักล่าสุด
            </h2>
            <Link href="/history" className="text-sm font-bold text-emerald-600 hover:text-emerald-800 transition-colors">ดูทั้งหมด</Link>
          </div>
          
          <div className="space-y-3">
            {recentHistory.map((record) => (
              <Link 
                href={`/animals/${record.animalId}?from=history`}
                key={record.attempt + "-" + record.animalId} 
                className="bg-white flex items-center justify-between p-4 rounded-[24px] shadow-[0_4px_15px_rgb(0,0,0,0.03)] hover:shadow-md hover:-translate-y-0.5 transition-all border border-transparent hover:border-gray-100"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-gray-100 rounded-2xl overflow-hidden shadow-inner shrink-0">
                    <img src={record.image} alt={record.type} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-black text-gray-800 truncate max-w-[120px]">{record.animalName}</p>
                    <p className="text-xs font-bold text-gray-400 mt-0.5">{record.time}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <p className="font-black text-lg text-[#144A29]">{record.aiWeight} <span className="text-xs font-bold text-gray-500">kg</span></p>
                  <div className="flex items-center mt-1 space-x-1">
                    <span className="text-[9px] text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full font-bold">แม่นยำ {record.accuracy}%</span>
                    <ChevronRight size={14} className="text-gray-300" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 🌟 Premium Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-[430px] bg-[#144A29] rounded-t-[32px] shadow-[0_-15px_40px_rgba(20,74,41,0.2)] px-6 py-4 flex justify-between items-center z-50 pb-8 border-t border-emerald-900/50 backdrop-blur-xl">
        <Link href="/dashboard" className="flex flex-col items-center text-white group">
          <div className="p-1.5 rounded-full group-hover:bg-white/10 transition-colors">
            <Home size={22} strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-bold mt-0.5">หน้าแรก</span>
        </Link>
        <Link href="/history" className="flex flex-col items-center text-emerald-200/60 hover:text-white transition-colors group">
          <div className="p-1.5 rounded-full group-hover:bg-white/10 transition-colors">
            <History size={22} />
          </div>
          <span className="text-[10px] font-bold mt-0.5">ประวัติ</span>
        </Link>
        
        {/* Center Floating Action Button (Scan) */}
        <div className="relative -top-10">
          <Link href="/scan" className="w-16 h-16 bg-gradient-to-b from-emerald-400 to-emerald-600 text-white rounded-full flex items-center justify-center shadow-[0_10px_25px_rgba(16,185,129,0.5)] hover:shadow-[0_10px_30px_rgba(16,185,129,0.7)] hover:-translate-y-1 transition-all border-4 border-[#144A29]">
            <span className="text-4xl font-light mb-1">+</span>
          </Link>
        </div>

        <button className="flex flex-col items-center text-emerald-200/60 hover:text-white transition-colors group">
          <div className="p-1.5 rounded-full group-hover:bg-white/10 transition-colors relative">
            <Bell size={22} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[#144A29]"></span>
          </div>
          <span className="text-[10px] font-bold mt-0.5">แจ้งเตือน</span>
        </button>
        <Link href="/settings" className="flex flex-col items-center text-emerald-200/60 hover:text-white transition-colors group">
          <div className="p-1.5 rounded-full group-hover:bg-white/10 transition-colors">
            <CircleUser size={22} />
          </div>
          <span className="text-[10px] font-bold mt-0.5">โปรไฟล์</span>
        </Link>
      </div>

    </div>
  );
}
