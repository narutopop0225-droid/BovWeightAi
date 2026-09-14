"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EyeOff, Eye } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const [mockProvider, setMockProvider] = useState<'google' | 'apple' | null>(null);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  const handleSocialLogin = (provider: 'google' | 'apple') => {
    // Open the mock provider modal
    setMockProvider(provider);
  };

  const confirmSocialLogin = (provider: 'google' | 'apple') => {
    setMockProvider(null);
    if (provider === 'google') setIsGoogleLoading(true);
    if (provider === 'apple') setIsAppleLoading(true);
    
    // Simulate OAuth redirect delay
    setTimeout(() => {
      router.push("/dashboard");
    }, 800);
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
            style={{ clipPath: 'inset(0 0 28% 0)', marginBottom: '-18%' }}
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

        {/* Social Login */}
        <div className="w-full max-w-[400px] mt-6 relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-[1px] bg-gray-200"></div>
            <span className="text-[13px] text-gray-500 font-medium px-2">เข้าสู่ระบบด้วย</span>
            <div className="flex-1 h-[1px] bg-gray-200"></div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => handleSocialLogin('google')}
              disabled={isGoogleLoading || isAppleLoading}
              className="flex items-center justify-center gap-2 py-3.5 bg-white border border-gray-200 rounded-[20px] hover:bg-gray-50 transition-colors shadow-sm active:scale-95 text-sm font-bold text-gray-700 disabled:opacity-50"
            >
              {isGoogleLoading ? (
                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin"></div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              Google
            </button>
            <button 
              onClick={() => handleSocialLogin('apple')}
              disabled={isGoogleLoading || isAppleLoading}
              className="flex items-center justify-center gap-2 py-3.5 bg-white border border-gray-200 rounded-[20px] hover:bg-gray-50 transition-colors shadow-sm active:scale-95 text-sm font-bold text-gray-900 disabled:opacity-50"
            >
              {isAppleLoading ? (
                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.05 2.53.68 3.14.68.65 0 2.08-.81 3.65-.68 1.48.05 2.76.62 3.52 1.62-3.08 1.7-2.58 5.76.32 6.84-1.2 2.92-3.2 5.4-4.8 6.51h-.03zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
              )}
              Apple
            </button>
          </div>
        </div>

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

      {/* Mock Google Login Modal */}
      {mockProvider === 'google' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-8 text-center">
              <svg className="w-10 h-10 mx-auto mb-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <h3 className="text-xl font-medium text-gray-900 mb-1">Sign in with Google</h3>
              <p className="text-sm text-gray-600 mb-8">Choose an account to continue to <span className="font-semibold">BovWeight AI</span></p>
              
              <div className="flex flex-col border border-gray-200 rounded-xl overflow-hidden">
                <button 
                  onClick={() => confirmSocialLogin('google')}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-[#1A73E8] text-white flex items-center justify-center font-bold text-lg uppercase">
                    {email ? email.charAt(0) : 'N'}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium text-gray-900 truncate">{email ? email.split('@')[0] : 'Narut Pop'}</p>
                    <p className="text-xs text-gray-500 truncate">{email || 'narut.pop@gmail.com'}</p>
                  </div>
                </button>
                
                <div className="h-[1px] bg-gray-100 w-full"></div>
                
                <button 
                  onClick={() => confirmSocialLogin('google')}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 flex items-center justify-center text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700 flex-1">Use another account</span>
                </button>

                <div className="h-[1px] bg-gray-100 w-full"></div>

                <button 
                  onClick={() => confirmSocialLogin('google')}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 flex items-center justify-center text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700 flex-1">Remove an account</span>
                </button>
              </div>
              
              <div className="mt-8 pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500 font-medium">
                <button className="hover:text-gray-800">English (US)</button>
                <div className="flex gap-4">
                  <button className="hover:text-gray-800">Help</button>
                  <button className="hover:text-gray-800">Privacy</button>
                  <button className="hover:text-gray-800">Terms</button>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setMockProvider(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
        </div>
      )}

      {/* Mock Apple Login Modal */}
      {mockProvider === 'apple' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative animate-in slide-in-from-bottom-4 duration-300 border border-gray-100">
            <div className="p-8 text-center flex flex-col items-center">
              <svg className="w-12 h-12 mb-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.05 2.53.68 3.14.68.65 0 2.08-.81 3.65-.68 1.48.05 2.76.62 3.52 1.62-3.08 1.7-2.58 5.76.32 6.84-1.2 2.92-3.2 5.4-4.8 6.51h-.03zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              <h3 className="text-xl font-medium text-gray-900 mb-1">Sign in with Apple ID</h3>
              <p className="text-sm text-gray-600 mb-8">Do you want to sign in to "BovWeight AI" with your Apple ID?</p>
              
              <button 
                onClick={() => confirmSocialLogin('apple')}
                className="w-full flex items-center justify-center gap-2 p-3.5 bg-black text-white hover:bg-gray-900 rounded-xl transition-colors font-semibold"
              >
                Continue
              </button>
            </div>
            
            <button 
              onClick={() => setMockProvider(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
