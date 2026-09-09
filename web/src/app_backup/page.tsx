"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, EyeOff, Eye } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#F8FAEC] flex flex-col items-center relative overflow-hidden font-sans">
      
      {/* Bottom 1/3 Landscape Image (Faded at the top) */}
      <div className="absolute bottom-0 left-0 w-full h-[35%] pointer-events-none z-0 overflow-hidden">
        {/* Background Image shifted up to reveal the full tree */}
        <div 
          className="absolute bottom-0 w-full h-[200%] bg-no-repeat"
          style={{ 
            backgroundImage: "url('/bg-landscape.jpg')",
            backgroundSize: "100% auto",
            backgroundPosition: "left 30%" // Shifts image to show the tall tree on the left
          }}
        ></div>
        {/* Gradient to smoothly fade the hard top edge of the image into the cream background */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-[#F8FAEC] via-[#F8FAEC]/80 to-transparent"></div>
      </div>

      <div className="w-full flex-1 flex flex-col items-center pt-24 px-8 relative z-auto">
        
        {/* Premium AI Generated Logo - Perfectly Transparent without color distortion */}
        <div className="flex items-center space-x-2 mb-10">
          <img 
            src="/logo-premium.jpg" 
            alt="BovWeight AI Logo" 
            className="w-[96px] h-[96px] object-cover mix-blend-multiply" 
            style={{ filter: 'brightness(1.03)' }}
          />
          <h1 className="text-[32px] font-black text-[#144A29] tracking-tight ml-1">BovWeight AI</h1>
        </div>
        
        {/* Welcome Text */}
        <div className="w-full text-center mb-8">
          <h2 className="text-[28px] font-extrabold text-[#0D301A] mb-1.5">Welcome Back</h2>
          <p className="text-[#204E2D] font-bold text-[15px]">Log in to monitor your herd's weight.</p>
        </div>

        {/* Login Form */}
        <form className="w-full space-y-4 max-w-[400px]" onSubmit={handleSubmit}>
          {/* Email Input */}
          <div className="relative group">
            <span className="absolute left-5 top-[18px] text-gray-400">
              <Mail size={18} strokeWidth={1.5} />
            </span>
            <input
              type="email"
              placeholder="Email Address"
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#225732] transition-all shadow-[0_4px_15px_rgb(0,0,0,0.06)] text-gray-800 font-medium placeholder-gray-400"
              required
            />
          </div>

          {/* Password Input */}
          <div className="relative group">
            <span className="absolute left-5 top-[18px] text-gray-400">
              <Lock size={18} strokeWidth={1.5} />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full pl-12 pr-12 py-3.5 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#225732] transition-all shadow-[0_4px_15px_rgb(0,0,0,0.06)] text-gray-800 font-medium placeholder-gray-400"
              required
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-[18px] text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <Eye size={18} strokeWidth={1.5} /> : <EyeOff size={18} strokeWidth={1.5} />}
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#184524] text-white font-bold py-4 rounded-full hover:bg-[#12331b] transition-all mt-6 shadow-[0_6px_20px_rgba(20,74,41,0.3)] active:scale-95 text-[15px] tracking-wide"
          >
            LOGIN
          </button>
        </form>

        <button className="mt-6 text-sm font-bold text-[#1a4224] hover:text-[#0D301A] transition-colors">
          Forgot Password?
        </button>
      </div>

      {/* Footer Text */}
      <div className="absolute bottom-8 w-full text-center z-10">
        <p className="text-[14px] font-semibold text-white/90 drop-shadow-md">
          <span className="font-medium text-white/90">Don't have an account? </span>
          <button className="hover:underline font-bold text-white">Sign Up</button>
        </p>
      </div>
    </div>
  );
}
