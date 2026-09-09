"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, User, Bell, Shield, LogOut, ChevronRight, Smartphone, Camera, Check, X, Home, History, Calculator, CircleUser } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  
  const [isEditing, setIsEditing] = useState(false);
  const [profileName, setProfileName] = useState("ฟาร์มของฉัน");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userEmail] = useState("admin@smartcattle.com"); // Hardcoded login email

  useEffect(() => {
    const stored = localStorage.getItem('userProfile');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.name) setProfileName(parsed.name);
      if (parsed.profileImage) setProfileImage(parsed.profileImage);
    }
  }, []);

  const handleLogout = () => {
    if (window.confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
      router.push("/");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setProfileImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = () => {
    const profile = { name: profileName, profileImage: profileImage };
    localStorage.setItem('userProfile', JSON.stringify(profile));
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-transparent text-[#1c1c1c] font-sans overflow-x-hidden relative pb-32">
      {/* HEADER (Clean, Transparent) */}
      <div className="pt-12 px-6 mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-[#1c1c1c]">การตั้งค่า</h1>
      </div>

      <div className="px-6 space-y-6">
        {/* Profile Section */}
        <div className="bg-white rounded-[32px] p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-50 flex flex-col items-center relative overflow-hidden">
          
          <div className="relative group mb-4">
            <div className="w-24 h-24 bg-emerald-50 rounded-[28px] flex items-center justify-center text-emerald-500 overflow-hidden shadow-inner border border-emerald-100">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={40} strokeWidth={1.5} />
              )}
            </div>
            {isEditing && (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 p-2 bg-emerald-500 text-white rounded-full shadow-lg border-4 border-white hover:bg-emerald-600 transition-colors"
              >
                <Camera size={16} strokeWidth={2.5} />
              </button>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>

          <div className="text-center w-full">
            {isEditing ? (
              <div className="flex flex-col gap-3 w-full items-center">
                <input 
                  type="text" 
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full max-w-[200px] px-4 py-2.5 text-center text-[15px] border-2 border-emerald-100 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 focus:outline-none bg-white text-[#1c1c1c] font-bold rounded-2xl transition-all"
                  autoFocus
                />
                <div className="flex gap-2 w-full max-w-[200px]">
                  <button onClick={saveProfile} className="flex-1 py-2.5 bg-[#1c1c1c] text-white text-[13px] font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-sm flex items-center justify-center gap-1.5">
                    <Check size={16} strokeWidth={2.5} /> บันทึก
                  </button>
                  <button onClick={() => setIsEditing(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-500 text-[13px] font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-1.5">
                    <X size={16} strokeWidth={2.5} /> ยกเลิก
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-[18px] font-bold text-[#1c1c1c] tracking-tight">{profileName}</h2>
                <p className="text-[12px] text-gray-400 font-medium mt-0.5">{userEmail}</p>
                <button onClick={() => setIsEditing(true)} className="text-[11px] font-bold text-emerald-600 mt-3 hover:bg-emerald-100 bg-emerald-50 px-4 py-1.5 rounded-full transition-colors">
                  แก้ไขโปรไฟล์
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Menu Sections */}
        <div className="space-y-4">
          <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-50 overflow-hidden">
            <button className="w-full flex items-center justify-between p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3.5 text-[15px] text-gray-700 font-bold">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
                  <Bell size={20} strokeWidth={2.5} />
                </div>
                การแจ้งเตือน
              </div>
              <ChevronRight size={20} className="text-gray-300" />
            </button>
            <button className="w-full flex items-center justify-between p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3.5 text-[15px] text-gray-700 font-bold">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
                  <Shield size={20} strokeWidth={2.5} />
                </div>
                ความปลอดภัย &amp; รหัสผ่าน
              </div>
              <ChevronRight size={20} className="text-gray-300" />
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3.5 text-[15px] text-gray-700 font-bold">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-500">
                  <Smartphone size={20} strokeWidth={2.5} />
                </div>
                การเชื่อมต่ออุปกรณ์
              </div>
              <ChevronRight size={20} className="text-gray-300" />
            </button>
          </div>

          <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-rose-50 overflow-hidden mt-6">
            <button onClick={handleLogout} className="w-full flex items-center gap-3.5 p-4 hover:bg-rose-50 transition-colors text-rose-500 font-bold text-[15px]">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500">
                <LogOut size={20} strokeWidth={2.5} />
              </div>
              ออกจากระบบ
            </button>
          </div>
        </div>
        
        <p className="text-center text-[10px] font-bold text-gray-300 mt-8 tracking-widest uppercase">Smart CattleWeight AI v1.0.0</p>
      </div>

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

        <Link href="/pricing" className="text-gray-400 hover:text-emerald-500 transition-colors w-12 flex justify-center pl-2">
           <Calculator size={24} strokeWidth={2.5} />
        </Link>
        
        <Link href="/settings" className="text-[#1c1c1c] transition-colors relative w-12 flex justify-center">
           <CircleUser size={24} strokeWidth={2.5} />
           <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#1c1c1c] rounded-full"></span>
        </Link>
      </div>
    </div>
  );
}
