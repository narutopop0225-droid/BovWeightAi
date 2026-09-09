"use client";

import { useState, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, UploadCloud, Camera, Loader2, Save, Activity, Ruler, Banknote, ShieldCheck, TrendingUp, TrendingDown, CheckCircle2, X, AlertTriangle, Smartphone } from "lucide-react";

function ScanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetAnimalId = searchParams.get("animalId");
  
  const [showGuidelines, setShowGuidelines] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [realGirth, setRealGirth] = useState("");
  const [animalName, setAnimalName] = useState(targetAnimalId ? targetAnimalId : "");
  const [isSavingToFarm, setIsSavingToFarm] = useState(true);
  const [selectedType, setSelectedType] = useState("โคเนื้อ");

  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      // Force landscape if supported
      if (screen.orientation && (screen.orientation as any).lock) {
        try {
          await (screen.orientation as any).lock('landscape');
        } catch (e) {
          console.log("Orientation lock failed", e);
        }
      }
    } catch (err) {
      console.error("Camera access error:", err);
      alert("ไม่สามารถเข้าถึงกล้องได้ กรุณาตรวจสอบสิทธิ์การเข้าถึง");
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const MAX_WIDTH = 1280;
      let targetWidth = video.videoWidth;
      let targetHeight = video.videoHeight;
      
      if (targetWidth > MAX_WIDTH) {
        targetHeight = (MAX_WIDTH / targetWidth) * targetHeight;
        targetWidth = MAX_WIDTH;
      }
      
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setBase64Image(dataUrl);
        setSelectedImage(dataUrl);
        stopCamera();
        setResult(null);
        setRealGirth("");
        setAnimalName("");
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
    if (screen.orientation && screen.orientation.unlock) {
      screen.orientation.unlock();
    }
  };

  const handleSave = async () => {
    if (isSavingToFarm && result && !showSuccess) {
      try {
        const animalIdToSave = targetAnimalId || `M${Date.now()}`;
        const finalName = animalName || (targetAnimalId ? "ไม่มีชื่อ" : `${selectedType} #${animalIdToSave}`);
        
        // Disable further saves immediately
        setShowSuccess(true);
        
        // Fetch existing attempt count if it's an existing animal
        let nextAttempt = 1;
        if (targetAnimalId) {
          const res = await fetch(`/api/animals/${targetAnimalId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.measurements) {
              nextAttempt = data.measurements.length + 1;
            }
          }
        }

        const newMeasurement = {
          attempt: nextAttempt,
          date: "วันนี้",
          time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + " น.",
          aiWeight: Number(result.weight),
          aiGirth: Number(result.aiGirth),
          aiHeight: Number(result.height),
          realGirth: realGirth ? Number(realGirth) : null,
          realHeight: null,
          scanImage: base64Image || null,
          timestamp: Date.now()
        };

        const res = await fetch('/api/animals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: animalIdToSave,
            name: finalName,
            type: selectedType,
            image: base64Image || undefined,
            measurements: [newMeasurement]
          })
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          alert(`เกิดข้อผิดพลาดในการบันทึก: ${errorData.error || res.statusText}`);
          setShowSuccess(false);
          return;
        }
      } catch (err: any) {
        console.error(err);
        alert(`เกิดข้อผิดพลาดในการเชื่อมต่อ: ${err.message}`);
        setShowSuccess(false);
      }
    } else if (!isSavingToFarm) {
      setShowSuccess(true);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1280;
          let targetWidth = img.width;
          let targetHeight = img.height;
          
          if (targetWidth > MAX_WIDTH) {
            targetHeight = (MAX_WIDTH / targetWidth) * targetHeight;
            targetWidth = MAX_WIDTH;
          }
          
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
            setBase64Image(canvas.toDataURL('image/jpeg', 0.8));
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);

      setResult(null); // Reset previous result
      setRealGirth("");
      setAnimalName("");
    }
  };

  const handleAnalyze = () => {
    setIsProcessing(true);
    // Simulate AI processing delay
    setTimeout(() => {
      setIsProcessing(false);
      setResult({
        animalType: selectedType, // Simulated AI classification based on user choice
        weight: "425.1",
        aiGirth: "150.0",
        height: "145.5",
        accuracy: "98.3",
        price: "22,500"
      });
    }, 2500);
  };

  // Mock calculation: (Girth^2) / 50 
  const calculatedWeight = realGirth ? (Math.pow(Number(realGirth), 2) / 50).toFixed(1) : "-";
  const weightDiff = realGirth && result ? (Number(calculatedWeight) - Number(result.weight)).toFixed(1) : "-";
  const diffNumber = Number(weightDiff);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 text-gray-800 flex flex-col relative overflow-hidden">
      
      {/* Decorative background elements */}
      <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
      
      {/* Guidelines Modal */}
      {showGuidelines && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 relative">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-600 p-5 pt-8 text-center relative">
              <button 
                onClick={() => setShowGuidelines(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white p-1 bg-white/10 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              <h2 className="text-white font-bold text-xl mb-1">คำแนะนำในการถ่ายรูป<br/>และเลือกรูปภาพ</h2>
              <p className="text-blue-100 text-sm">ขั้นตอนการถ่ายภาพให้ AI วิเคราะห์ได้แม่นยำ</p>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">1</div>
                  <p className="text-sm text-gray-700 leading-relaxed"><strong className="text-gray-900">รูปแบบภาพถ่าย:</strong> ต้องเป็นภาพถ่ายแนวนอน</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">2</div>
                  <p className="text-sm text-gray-700 leading-relaxed"><strong className="text-gray-900">เว้นระยะ:</strong> ต้องเว้นระยะให้ห่างจากตัวสัตว์ประมาณ 2-3 เมตร</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">3</div>
                  <p className="text-sm text-gray-700 leading-relaxed"><strong className="text-gray-900">เช็กจุดโฟกัส:</strong> ตรวจสอบในจอว่าเห็นโค/กระบือ ให้เต็มตัวอย่าให้หัวหรือหางหลุดจากรูปภาพ</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">4</div>
                  <p className="text-sm text-gray-700 leading-relaxed"><strong className="text-gray-900">ถือกล้องตรง:</strong> ถือสมาร์ตโฟนให้ตั้งฉากกับพื้น เล็งกลางลำตัวสัตว์ แล้วกดถ่าย</p>
                </li>
              </ul>

              {/* Warning Alert */}
              <div className="bg-red-50 border border-red-200 p-3 rounded-2xl flex items-start gap-3 mt-2">
                <AlertTriangle size={20} className="text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm font-bold text-red-600 leading-tight">
                  ข้อควรระวัง: ภาพที่ถ่ายต้องเป็นภาพถ่ายแนวนอน
                </p>
              </div>

              <button 
                onClick={() => setShowGuidelines(false)}
                className="w-full py-3.5 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 transition-colors shadow-md mt-2"
              >
                รับทราบ และเริ่มใช้งาน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 p-8 flex flex-col items-center text-center relative">
            
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-5 relative">
              <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20"></div>
              <CheckCircle2 size={40} className="text-[#1e3a8a]" />
            </div>
            
            <h2 className="text-2xl font-black text-[#1e3a8a] mb-2">บันทึกสำเร็จ!</h2>
            <p className="text-gray-500 mb-8">ข้อมูลการประเมินถูกจัดเก็บเรียบร้อยแล้ว</p>
            
            <div className="w-full space-y-3">
              <button 
                onClick={() => { 
                  setShowSuccess(false); 
                  window.location.href = targetAnimalId ? `/animals/${targetAnimalId}` : '/dashboard';
                }}
                className="w-full py-4 bg-[#1e3a8a] text-white font-bold rounded-2xl hover:bg-[#1d4ed8] transition-all shadow-md"
              >
                {targetAnimalId ? "กลับไปหน้าโปรไฟล์สัตว์" : "กลับหน้าแรก"}
              </button>
              <button 
                onClick={() => { 
                  setShowSuccess(false); 
                  window.location.href = '/history';
                }}
                className="w-full py-4 bg-gray-100 text-[#1e3a8a] font-bold rounded-2xl hover:bg-gray-200 transition-all"
              >
                ดูประวัติการชั่งรวม
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <header className="bg-white/40 backdrop-blur-md text-[#1e3a8a] p-4 flex items-center justify-between z-10 border-b border-white/50">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="p-2.5 bg-white/60 shadow-sm rounded-full hover:bg-white transition-all active:scale-95 text-[#1d4ed8]">
            <ArrowLeft size={22} />
          </Link>
          <h1 className="text-xl font-bold tracking-wide">วิเคราะห์ภาพวัว</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-5 flex flex-col items-center z-10 overflow-y-auto pb-10">
        
        {/* Upload Area */}
        <div className="w-full max-w-sm glass-panel rounded-3xl overflow-hidden flex flex-col transition-all duration-300">
          <div className="p-4 bg-white/40 border-b border-white/50 flex justify-between items-center">
            <h2 className="font-bold text-[#1e3a8a] flex items-center gap-2">
              <Camera size={18} />
              <span>ภาพสำหรับวิเคราะห์</span>
            </h2>
            {selectedImage && !isProcessing && (
               <button onClick={() => { setSelectedImage(null); setResult(null); setRealGirth(""); setAnimalName(""); }} className="text-red-500 text-sm font-semibold hover:underline">เปลี่ยนรูป</button>
            )}
          </div>

          {/* Animal Type Selection */}
          {!selectedImage && (
            <div className="px-5 pt-5 pb-1 bg-gradient-to-b from-white/40 to-white/30">
              <label className="block text-sm font-bold text-[#1e3a8a] mb-2">เลือกประเภทสัตว์</label>
              <div className="flex bg-white rounded-xl p-1 border border-blue-100 shadow-sm">
                <button 
                  onClick={() => setSelectedType('โคเนื้อ')}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${selectedType === 'โคเนื้อ' ? 'bg-[#1e3a8a] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  โคเนื้อ
                </button>
                <button 
                  onClick={() => setSelectedType('กระบือ')}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${selectedType === 'กระบือ' ? 'bg-[#1e3a8a] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  กระบือ
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 min-h-[320px] flex flex-col items-center justify-center p-5 relative bg-gradient-to-b from-white/30 to-transparent">
            {selectedImage ? (
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-inner border border-white/50">
                <img src={selectedImage} alt="Cow" className="w-full h-full object-cover" />
                
                {/* Scanning Animation Overlay */}
                {isProcessing && (
                  <div className="absolute inset-0 bg-[#1e3a8a]/80 backdrop-blur-sm flex flex-col items-center justify-center text-white transition-all duration-300">
                    <Loader2 size={48} className="animate-spin text-blue-400 mb-4" />
                    <p className="font-bold text-lg animate-pulse tracking-wide">กำลังประมวลผล AI...</p>
                    <p className="text-sm font-light text-blue-200 mt-2">จำแนกประเภทและสัดส่วน</p>
                    
                    {/* Scanner Line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-blue-400 shadow-[0_0_15px_#34d399] animate-[scan_2s_ease-in-out_infinite]"></div>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full flex gap-3 h-full">
                {/* Upload from Gallery */}
                <label className="flex-1 flex flex-col items-center justify-center h-full border-2 border-dashed border-[#1d4ed8]/40 rounded-2xl cursor-pointer hover:bg-white/50 hover:border-[#1d4ed8] transition-all bg-white/30 group">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3 text-[#1d4ed8] group-hover:scale-110 transition-transform shadow-sm">
                    <UploadCloud size={32} />
                  </div>
                  <span className="text-[#1e3a8a] font-bold">อัปโหลดรูปภาพ</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>

                {/* Take Photo from Camera */}
                <button 
                  onClick={startCamera}
                  className="flex-1 flex flex-col items-center justify-center h-full border-2 border-dashed border-[#1d4ed8]/40 rounded-2xl cursor-pointer hover:bg-white/50 hover:border-[#1d4ed8] transition-all bg-white/30 group"
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3 text-[#1d4ed8] group-hover:scale-110 transition-transform shadow-sm">
                    <Camera size={32} />
                  </div>
                  <span className="text-[#1e3a8a] font-bold">ถ่ายภาพจากกล้อง</span>
                </button>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="p-5 bg-white/40 border-t border-white/50">
            <button 
              onClick={handleAnalyze}
              disabled={!selectedImage || isProcessing}
              className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 text-lg shadow-lg ${
                !selectedImage || isProcessing 
                  ? 'bg-gray-200/50 text-gray-400 cursor-not-allowed border border-gray-300/50' 
                  : 'bg-gradient-to-r from-[#1e3a8a] to-[#1d4ed8] text-white hover:opacity-95 active:scale-[0.98]'
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={22} className="animate-spin" />
                  กำลังคำนวณ...
                </>
              ) : (
                <>
                  <Activity size={22} />
                  เริ่มวิเคราะห์ข้อมูลด้วย AI
                </>
              )}
            </button>
          </div>
        </div>

        {/* Result Area */}
        {result && (
          <div className="w-full max-w-sm mt-6 glass-panel rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 shadow-xl border border-blue-300 relative">
             <div className="bg-gradient-to-r from-blue-500 to-teal-500 text-white p-4 pb-8 text-center font-bold flex flex-col items-center justify-center shadow-inner relative">
               <div className="flex items-center gap-2">
                 <ShieldCheck size={20} />
                 ผลการประเมินเสร็จสมบูรณ์
               </div>
             </div>
             
             {/* Badge Overlapping Header and Content */}
             <div className="absolute top-11 left-1/2 -translate-x-1/2 bg-white px-6 py-2 rounded-full shadow-md border-2 border-blue-400 flex items-center gap-2 text-[#1e3a8a] font-bold z-10 w-max">
               <span className="text-xs text-gray-500">ประเภท:</span> 
               <span className="text-lg">{result.animalType}</span>
             </div>

             <div className="p-6 pt-10 space-y-5">
                {/* Main Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white p-3 rounded-2xl border border-gray-100 text-center shadow-sm relative overflow-hidden flex flex-col justify-center">
                    <p className="text-[10px] text-gray-500 font-bold mb-1">น้ำหนัก (AI)</p>
                    <p className="text-xl font-bold text-[#1e3a8a]">{result.weight}</p>
                    <p className="text-[10px] text-gray-400">KG</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100 text-center shadow-sm relative overflow-hidden flex flex-col justify-center">
                    <p className="text-[10px] text-blue-700 font-bold mb-1">รอบอก (AI)</p>
                    <p className="text-xl font-bold text-blue-700">{result.aiGirth}</p>
                    <p className="text-[10px] text-blue-600/70">CM</p>
                  </div>
                  <div className="bg-white p-3 rounded-2xl border border-gray-100 text-center shadow-sm relative overflow-hidden flex flex-col justify-center">
                    <p className="text-[10px] text-gray-500 font-bold mb-1">ส่วนสูง (AI)</p>
                    <p className="text-xl font-bold text-[#1e3a8a]">{result.height}</p>
                    <p className="text-[10px] text-gray-400">CM</p>
                  </div>
                </div>

                {/* Compare Real Girth Input */}
                <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-[#1e3a8a] mb-2 flex items-center gap-2">
                      <Ruler size={16} /> ใส่ค่ารอบอกวัดจริง (ซม.)
                    </label>
                    <input 
                      type="number"
                      value={realGirth}
                      onChange={(e) => setRealGirth(e.target.value)}
                      placeholder="เช่น 150"
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1d4ed8] focus:border-transparent outline-none transition-all font-bold text-[#1e3a8a]"
                    />
                    
                    {realGirth && (
                      <div className="mt-4 pt-4 border-t border-blue-200 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">น้ำหนักจากสูตรรอบอก:</span>
                          <span className="font-bold text-[#1e3a8a]">{calculatedWeight} kg</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">ส่วนต่างความคลาดเคลื่อน:</span>
                          <div className={`flex items-center gap-1 font-bold ${diffNumber > 0 ? 'text-red-500' : diffNumber < 0 ? 'text-blue-500' : 'text-green-500'}`}>
                            {diffNumber > 0 ? <TrendingUp size={16} /> : diffNumber < 0 ? <TrendingDown size={16} /> : <CheckCircle2 size={16} />}
                            <span>{diffNumber > 0 ? "+" : ""}{weightDiff} kg</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-4 border-t border-blue-200">
                    <label className="block text-sm font-bold text-[#1e3a8a] mb-3">
                      ความต้องการบันทึกข้อมูล
                    </label>
                    
                    <div className="flex bg-white rounded-xl p-1 border border-gray-200 mb-4 shadow-sm">
                      <button 
                        onClick={() => setIsSavingToFarm(true)}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${isSavingToFarm ? 'bg-[#1e3a8a] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                      >
                        เก็บเข้าฟาร์ม
                      </button>
                      <button 
                        onClick={() => setIsSavingToFarm(false)}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${!isSavingToFarm ? 'bg-gray-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                      >
                        ไม่เก็บเข้าฟาร์ม
                      </button>
                    </div>

                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      {targetAnimalId ? (
                        <div className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-sm">
                          <span className="font-bold text-[#1e3a8a]">อัปเดตข้อมูลสัตว์: #{targetAnimalId}</span>
                          <CheckCircle2 size={18} className="text-blue-500" />
                        </div>
                      ) : (
                        <input 
                          type="text"
                          value={animalName}
                          onChange={(e) => setAnimalName(e.target.value)}
                          placeholder="ชื่อ/รหัสสัตว์ (ไม่บังคับ) เช่น เจ้าบุญรอด"
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1d4ed8] focus:border-transparent outline-none transition-all text-sm"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                {isSavingToFarm ? (
                  <button onClick={handleSave} className="w-full py-4 bg-[#1e3a8a] text-white font-bold text-lg rounded-2xl hover:bg-[#1d4ed8] transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 mt-4">
                    <Save size={20} />
                    บันทึกข้อมูลลงระบบฟาร์ม
                  </button>
                ) : (
                  <button onClick={handleSave} className="w-full py-4 bg-gray-600 text-white font-bold text-lg rounded-2xl hover:bg-gray-700 transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 mt-4">
                    <Save size={20} />
                    บันทึกเฉพาะประวัติ
                  </button>
                )}
             </div>
          </div>
        )}

      </div>

      {/* Custom Camera View */}
      {showCamera && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col">
          {/* Pure camera feed, no overlays */}
          <div className="relative flex-1 flex items-center justify-center overflow-hidden">
            <video ref={videoRef} autoPlay playsInline className="absolute w-full h-full object-cover" />
            
            {/* Minimal Instructions */}
            <div className="absolute bottom-32 flex flex-col items-center pointer-events-none">
              <p className="text-white text-2xl font-bold drop-shadow-lg">จัดตัวสัตว์ให้อยู่ภายในหน้าจอ</p>
            </div>

            {/* Portrait warning (if screen is tall) */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-black/80 portrait:flex landscape:hidden z-10 backdrop-blur-sm">
              <div className="text-white text-center p-6 flex flex-col items-center">
                <Smartphone className="w-20 h-20 animate-[spin_3s_ease-in-out_infinite] mb-6 text-blue-400" />
                <p className="text-2xl font-bold mb-2">กรุณาหมุนโทรศัพท์เป็นแนวนอน</p>
                <p className="text-blue-100/80">เพื่อให้ AI วิเคราะห์สัดส่วนได้อย่างแม่นยำ</p>
              </div>
            </div>
          </div>

          {/* Camera Controls */}
          <div className="bg-black/90 h-28 flex items-center justify-between px-10 pb-safe">
            <button onClick={stopCamera} className="text-white p-4 rounded-full hover:bg-white/20 transition-colors">
              <X size={32} />
            </button>
            <button 
              onClick={capturePhoto} 
              className="w-20 h-20 rounded-full bg-white border-4 border-blue-500 shadow-[0_0_20px_#3b82f6] active:scale-90 transition-transform focus:outline-none"
            >
              <div className="w-full h-full rounded-full border-4 border-black/10"></div>
            </button>
            <div className="w-16"></div> {/* Spacer for alignment */}
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}
    </div>
  );
}

export default function ScanPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-blue-50 flex items-center justify-center"><Loader2 className="animate-spin text-[#1e3a8a]" size={40} /></div>}>
      <ScanContent />
    </Suspense>
  );
}
