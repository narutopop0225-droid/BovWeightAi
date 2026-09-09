"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, User, Bell, Shield, LogOut, ChevronRight, Smartphone, Camera, Check, X } from "lucide-react";
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
    <div className="min-h-screen bg-[#F8FAEC] text-gray-800 pb-20">
      <header className="bg-gradient-to-r from-[#064e3b] to-[#047857] text-white p-5 shadow-md flex items-center gap-4">
        <Link href="/dashboard" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all">
          <ArrowLeft size={22} />
        </Link>
        <h1 className="text-xl font-bold">การตั้งค่า</h1>
      </header>

      <div className="p-5 space-y-6">
        {/* Profile Section */}
        <div className="bg-white rounded-3xl p-5 shadow-sm flex items-center gap-4 relative overflow-hidden">
          
          <div className="relative group">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 border-2 border-emerald-50 overflow-hidden shadow-sm">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={36} />
              )}
            </div>
            {isEditing && (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-1.5 bg-[#064e3b] text-white rounded-full shadow-md border-2 border-white hover:bg-[#047857] transition-colors"
              >
                <Camera size={14} />
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

          <div className="flex-1">
            {isEditing ? (
              <div className="flex flex-col gap-2 w-full">
                <input 
                  type="text" 
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-emerald-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-[#064e3b] font-bold rounded-lg shadow-sm"
                  autoFocus
                />
                <div className="flex gap-2 mt-1">
                  <button onClick={saveProfile} className="flex-1 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-md hover:bg-emerald-700 transition-colors shadow-sm flex items-center justify-center gap-1">
                    <Check size={14} /> บันทึก
                  </button>
                  <button onClick={() => setIsEditing(false)} className="flex-1 py-1.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-md hover:bg-gray-200 transition-colors shadow-sm flex items-center justify-center gap-1">
                    <X size={14} /> ยกเลิก
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-black text-[#064e3b] tracking-tight">{profileName}</h2>
                <p className="text-sm text-gray-500 font-medium">{userEmail}</p>
                <button onClick={() => setIsEditing(true)} className="text-xs font-bold text-emerald-600 mt-2 hover:underline bg-emerald-50 px-3 py-1 rounded-full">
                  แก้ไขโปรไฟล์
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Menu Sections */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
            <button className="w-full flex items-center justify-between p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3 text-gray-700 font-bold">
                <Bell size={20} className="text-emerald-500" /> การแจ้งเตือน
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </button>
            <button className="w-full flex items-center justify-between p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3 text-gray-700 font-bold">
                <Shield size={20} className="text-emerald-500" /> ความปลอดภัย &amp; รหัสผ่าน
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3 text-gray-700 font-bold">
                <Smartphone size={20} className="text-emerald-500" /> การเชื่อมต่ออุปกรณ์
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </button>
          </div>

          <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-red-50">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 p-4 hover:bg-red-50 transition-colors text-red-500 font-bold">
              <LogOut size={20} /> ออกจากระบบ
            </button>
          </div>
        </div>
        
        <p className="text-center text-xs font-bold text-gray-400 mt-10 tracking-wider">Smart CattleWeight AI v1.0.0</p>
      </div>
    </div>
  );
}
