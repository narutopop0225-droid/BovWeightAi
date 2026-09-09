"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EyeOff, Eye } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden font-sans">
      
      {/* Subtle Line-Art Background */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-15">
        <div 
          className="absolute inset-0 bg-cover bg-[center_bottom] bg-no-repeat"
          style={{ backgroundImage: "url('/bg-lineart-market.jpg')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white"></div>
      </div>

      <div className="w-full flex-1 flex flex-col items-center pt-[12vh] px-8 relative">
        
        {/* Line Art Logo (Text Cropped Out via CSS) */}
        <div className="flex flex-col items-center mb-6 relative">
          <img 
            src="/logo-naihoi-lineart.png" 
            alt="BovWeight AI Logo" 
            className="w-[320px] h-auto mix-blend-multiply" 
            style={{ clipPath: 'inset(0 0 24% 0)', marginBottom: '-15%' }}
          />
          <h1 className="text-[34px] font-black tracking-tight mt-0 text-[#092b13]">
            BovWeight AI
          </h1>
        </div>
        
        {/* Welcome Text */}
        <div className="w-full text-center mb-10">
          <h2 className="text-[28px] font-black text-[#1A1A1A] mb-1">Welcome back</h2>
          <p className="text-[#647168] font-medium text-[15px]">ยินดีต้อนรับกลับมา!</p>
        </div>

        {/* Login Form */}
        <form className="w-full space-y-4 max-w-[400px]" onSubmit={handleSubmit}>
          {/* Email/Username Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="อีเมล / ชื่อผู้ใช้"
              className="w-full px-5 py-4 bg-white border border-gray-300 rounded-[28px] focus:outline-none focus:border-[#2B5740] focus:ring-1 focus:ring-[#2B5740] transition-all text-gray-800 font-medium placeholder-gray-400"
              required
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="รหัสผ่าน"
              className="w-full pl-5 pr-12 py-4 bg-white border border-gray-300 rounded-[28px] focus:outline-none focus:border-[#2B5740] focus:ring-1 focus:ring-[#2B5740] transition-all text-gray-800 font-medium placeholder-gray-400"
              required
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-[18px] text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <Eye size={20} strokeWidth={1.5} /> : <EyeOff size={20} strokeWidth={1.5} />}
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#2B5740] text-white font-bold py-4 rounded-[28px] hover:bg-[#1f3f2e] transition-all mt-4 active:scale-[0.98] text-[16px]"
          >
            เข้าสู่ระบบ
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-8 text-center space-y-3 relative z-10">
          <button className="text-[14px] font-medium text-gray-700 hover:text-gray-900 transition-colors block w-full">
            ลืมรหัสผ่าน?
          </button>
          <p className="text-[14px] font-medium text-gray-700">
            ยังไม่มีบัญชี? <button className="font-bold text-[#2B5740] hover:underline">สมัครสมาชิก</button>
          </p>
        </div>
      </div>
    </div>
  );
}
