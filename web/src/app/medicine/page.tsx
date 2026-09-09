"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Syringe, Shield, Search, Star, Clock, Calculator, Edit3, Save, X, Plus, ChevronDown, ChevronLeft, ChevronRight, Check, Trash2, BellRing } from "lucide-react";

const DEFAULT_INVENTORY = [
  { id: "M01", name: "Ivermectin", desc: "ยาถ่ายพยาธิภายนอกและภายใน", type: "medicine", dosageRule: "1 ml / 50 kg", dosagePerKg: 1/50, unit: "ml", icon: "💊" },
  { id: "M02", name: "Oxytetracycline LA", desc: "ยาปฏิชีวนะออกฤทธิ์ยาว", type: "medicine", dosageRule: "1 ml / 10 kg", dosagePerKg: 1/10, unit: "ml", icon: "💊" },
  { id: "M03", name: "B-Complex", desc: "วิตามินบำรุง", type: "medicine", dosageRule: "1 ml / 20 kg", dosagePerKg: 1/20, unit: "ml", icon: "💊" },
  { id: "V01", name: "FMD Vaccine", desc: "วัคซีนป้องกันโรคปากและเท้าเปื่อย", type: "vaccine", dosageRule: "2 ml / ตัว", fixedDosage: 2, unit: "ml", icon: "💉", injectionInterval: "ทุก 6 เดือน" },
  { id: "V02", name: "HS Vaccine", desc: "วัคซีนป้องกันโรคคอบวม", type: "vaccine", dosageRule: "2 ml / ตัว", fixedDosage: 2, unit: "ml", icon: "💉", injectionInterval: "ทุก 1 ปี" },
];

const THAI_MONTHS = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
const THAI_MONTHS_SHORT = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
const DAYS_IN_WEEK = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];

export default function MedicinePage() {
  const [activeTab, setActiveTab] = useState<'inventory' | 'vaccine_program' | 'animals' | 'history' | 'favorites'>('inventory');
  const [search, setSearch] = useState("");
  
  const [animals, setAnimals] = useState<any[]>([]);
  const [historyRecords, setHistoryRecords] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [selectedMed, setSelectedMed] = useState<string>("");
  const [vaccineHistory, setVaccineHistory] = useState<any[]>([]);

  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedAnimalHistoryId, setSelectedAnimalHistoryId] = useState<string | null>(null);
  const [confirmRecord, setConfirmRecord] = useState<{item: any, dose: string, med: any} | null>(null);

  // Calendar State
  const today = new Date();
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);

  // Scroll state
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    // Load Inventory
    const storedInv = localStorage.getItem("farmInventory");
    if (storedInv) {
      setInventory(JSON.parse(storedInv));
      if (JSON.parse(storedInv).length > 0) setSelectedMed(JSON.parse(storedInv)[0].id);
    } else {
      setInventory(DEFAULT_INVENTORY);
      localStorage.setItem("farmInventory", JSON.stringify(DEFAULT_INVENTORY));
      setSelectedMed(DEFAULT_INVENTORY[0].id);
    }

    // Load Vaccine History
    const storedVacHist = localStorage.getItem("farmVaccineHistory");
    if (storedVacHist) {
      let parsedHist = JSON.parse(storedVacHist);
      let modified = false;
      parsedHist = parsedHist.map((r: any) => {
        if (r.animalImage || r.customImage) {
          modified = true;
          const { animalImage, customImage, ...rest } = r;
          return rest;
        }
        return r;
      });
      if (modified) {
        try {
          localStorage.setItem("farmVaccineHistory", JSON.stringify(parsedHist));
        } catch (e) {}
      }
      setVaccineHistory(parsedHist);
    }

    const loadData = async () => {
      try {
        const res = await fetch('/api/animals');
        if (!res.ok) return;
        const data = await res.json();
        
        // Load Animals
        const arr = data.map((a: any) => {
          const activeM = (a.measurements || []).filter((m: any) => !m.isDeleted);
          activeM.sort((m1: any, m2: any) => m2.timestamp - m1.timestamp);
          return {
            id: a.id,
            name: a.name,
            type: a.type,
            age: a.age || "N/A", 
            image: a.image,
            isFavorite: activeM.some((m: any) => m.isFavorite) || false,
            latestWeight: activeM.length > 0 ? (activeM[0].realWeight || activeM[0].aiWeight) : 0,
          };
        });
        setAnimals(arr);

        // Load History
        let allHistory: any[] = [];
        data.forEach((a: any) => {
          if (a.measurements) {
            a.measurements.forEach((m: any) => {
              if (!m.isDeleted) {
                allHistory.push({
                  ...m,
                  animalId: a.id,
                  animalName: a.name,
                  animalAge: "N/A",
                  animalImage: a.image,
                  weightToUse: m.realWeight || m.aiWeight
                });
              }
            });
          }
        });
        
        allHistory.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        setHistoryRecords(allHistory);
      } catch(err) {
        console.error(err);
      }
    };

    loadData();
  }, []);

  const saveInventory = (newInv: any[]) => {
    setInventory(newInv);
    localStorage.setItem("farmInventory", JSON.stringify(newInv));
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;
    try {
      const isNew = !inventory.find(i => i.id === editingItem.id);
      let newInv;
      if (isNew) {
        newInv = [...inventory, editingItem];
      } else {
        newInv = inventory.map(i => i.id === editingItem.id ? editingItem : i);
      }
      setInventory(newInv);
      localStorage.setItem("farmInventory", JSON.stringify(newInv));
      setEditingItem(null);
    } catch (e: any) {
      alert("บันทึกไม่สำเร็จ ขนาดรูปภาพอาจใหญ่เกินไป กรุณาเปลี่ยนรูปให้เล็กลง (" + e.message + ")");
    }
  };

  const handleConfirmSaveRecord = () => {
    if (!confirmRecord) return;
    try {
      const { item, dose, med } = confirmRecord;
      const newRecord = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        animalId: item.id || item.animalId,
        animalName: item.name || item.animalName,
        medId: med.id,
        medName: med.name,
        medIcon: med.icon || '💊',
        dose: dose,
        unit: med.unit || 'ml',
        injectionInterval: med.injectionInterval || null
      };
      const newHistory = [newRecord, ...vaccineHistory];
      setVaccineHistory(newHistory);
      localStorage.setItem("farmVaccineHistory", JSON.stringify(newHistory));
      setConfirmRecord(null);
    } catch (err: any) {
      alert("Error saving record: " + err.message);
    }
  };

  const handleDeleteHistoryRecord = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if(confirm("ต้องการลบประวัตินี้ใช่หรือไม่?")) {
      const newHistory = vaccineHistory.filter(r => r.id !== id);
      setVaccineHistory(newHistory);
      localStorage.setItem("farmVaccineHistory", JSON.stringify(newHistory));
    }
  };

  const handleDelete = (id: string) => {
    if(confirm("ต้องการลบรายการนี้ใช่หรือไม่?")) {
      const newInv = inventory.filter(i => i.id !== id);
      saveInventory(newInv);
    }
  };

  // Scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDown(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };
  const handleMouseLeave = () => setIsDown(false);
  const handleMouseUp = () => setIsDown(false);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const currentMed = inventory.find(m => m.id === selectedMed);

  const calculateDose = (weight: number) => {
    if (!currentMed || !weight) return "-";
    
    if (currentMed.fixedDosageStr) {
      const amountMatch = currentMed.fixedDosageStr.match(/[\d.]+/);
      if (amountMatch) return parseFloat(amountMatch[0]).toFixed(1);
    }
    
    const rule = currentMed.dosageRule || "";
    try {
      const parts = rule.toLowerCase().split('/');
      if (parts.length === 2) {
        const amountMatch = parts[0].match(/[\d.]+/);
        const amount = amountMatch ? parseFloat(amountMatch[0]) : 0;
        
        if (parts[1].includes('kg') || parts[1].includes('กิโล') || parts[1].includes('น้ำหนัก')) {
          const perWeightMatch = parts[1].match(/[\d.]+/);
          const perWeight = perWeightMatch ? parseFloat(perWeightMatch[0]) : 1;
          if (perWeight > 0) return (weight * (amount / perWeight)).toFixed(1);
        }
      } else {
        const amountMatch = rule.match(/^[\d.]+/);
        if (amountMatch) return parseFloat(amountMatch[0]).toFixed(1);
      }
    } catch(e) {}

    if (currentMed.fixedDosage) return currentMed.fixedDosage.toFixed(1);
    if (currentMed.dosagePerKg) return (weight * currentMed.dosagePerKg).toFixed(1);
    return "-";
  };

  const parseAgeToMonths = (ageStr: string) => {
    if (!ageStr) return 0;
    let months = 0;
    const yearMatch = ageStr.match(/(\d+)\s*ปี/);
    if (yearMatch) months += parseInt(yearMatch[1]) * 12;
    const monthMatch = ageStr.match(/(\d+)\s*เดือน/);
    if (monthMatch) months += parseInt(monthMatch[1]);
    return months;
  };

  const parseIntervalToDays = (str: string) => {
    if(!str) return null;
    const numMatch = str.match(/\d+/);
    if(!numMatch) return null;
    const num = parseInt(numMatch[0]);
    if(str.includes("ปี")) return num * 365;
    if(str.includes("เดือน")) return num * 30;
    if(str.includes("วัน")) return num;
    return null;
  };

  const getCountdown = (recordDateStr: string, intervalStr: string) => {
    const days = parseIntervalToDays(intervalStr);
    if(!days) return null;
    const recordDate = new Date(recordDateStr);
    const nextDate = new Date(recordDate.getTime() + days * 24 * 60 * 60 * 1000);
    const todayStr = new Date();
    todayStr.setHours(0,0,0,0);
    nextDate.setHours(0,0,0,0);
    const diffDays = Math.round((nextDate.getTime() - todayStr.getTime()) / (1000 * 3600 * 24));
    
    if(diffDays < 0) return { text: "เลยกำหนดแล้ว!", type: 'danger' };
    if(diffDays === 0) return { text: "ถึงกำหนดวันนี้!", type: 'warning' };
    
    if(diffDays >= 30) {
      const m = Math.floor(diffDays / 30);
      const d = diffDays % 30;
      return { text: `อีก ${m} เดือน ${d > 0 ? d + ' วัน' : ''}`, type: 'normal' };
    }
    return { text: `อีก ${diffDays} วัน`, type: 'normal' };
  };

  const renderConfirmModal = () => {
    if (!confirmRecord) return null;
    const { item, dose, med } = confirmRecord;
    const itemName = item.name || item.animalName;
    return (
      <div className="fixed inset-0 bg-black/40 z-[250] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl">
          <h3 className="font-bold text-lg mb-2 text-gray-900">ยืนยันการบันทึก</h3>
          <p className="text-sm text-gray-600 mb-5 leading-relaxed">
            คุณต้องการบันทึกประวัติการให้ <span className="font-bold text-rose-600">{med.name}</span> ปริมาณ <span className="font-bold text-rose-600">{dose} {med.unit || 'ml'}</span> สำหรับ <span className="font-bold text-gray-900">{itemName}</span> ใช่หรือไม่?
          </p>
          <div className="flex gap-2">
            <button onClick={(e) => { e.preventDefault(); setConfirmRecord(null); }} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl transition-colors">ยกเลิก</button>
            <button onClick={(e) => { e.preventDefault(); handleConfirmSaveRecord(); }} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold py-2.5 rounded-xl transition-colors shadow-sm">ยืนยันบันทึก</button>
          </div>
        </div>
      </div>
    );
  };

  const renderAnimalHistoryModal = () => {
    if (!selectedAnimalHistoryId) return null;
    
    const animalRecords = vaccineHistory.filter(r => r.animalId === selectedAnimalHistoryId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const animalName = animalRecords.length > 0 ? animalRecords[0].animalName : '';
    const animalImage = animalRecords.length > 0 ? animalRecords[0].animalImage : '';

    return (
      <div className="fixed inset-0 bg-black/40 z-[200] flex items-end sm:items-center justify-center sm:p-4">
        <div className="bg-[#fcf9f9] rounded-t-3xl sm:rounded-3xl w-full max-w-sm max-h-[85vh] flex flex-col shadow-2xl">
          <div className="p-5 bg-white rounded-t-3xl sm:rounded-3xl border-b border-gray-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <img src={animalImage} className="w-12 h-12 rounded-xl object-cover bg-gray-100" />
              <div>
                <h3 className="font-bold text-lg text-gray-900">{animalName}</h3>
                <span className="text-[11px] text-gray-500">ประวัติการฉีดวัคซีนและให้ยา</span>
              </div>
            </div>
            <button onClick={() => setSelectedAnimalHistoryId(null)} className="text-gray-400 p-2 bg-gray-50 rounded-full hover:bg-gray-100"><X size={20}/></button>
          </div>
          
          <div className="p-5 overflow-y-auto space-y-3">
            {animalRecords.map(record => {
              const recDate = new Date(record.date);
              const dateStr = `${recDate.getDate()} ${THAI_MONTHS_SHORT[recDate.getMonth()]} ${recDate.getFullYear() + 543}`;
              const countdown = record.injectionInterval ? getCountdown(record.date, record.injectionInterval) : null;
              const med = inventory.find(m => m.id === record.medId);
              const customImage = med?.customImage || record.customImage;
              
              return (
                <div key={record.id} className={`p-4 rounded-2xl shadow-sm border ${med?.type === 'vaccine' ? 'bg-blue-50/30 border-blue-100' : 'bg-rose-50/30 border-rose-100'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg relative overflow-hidden shrink-0 border ${med?.type === 'vaccine' ? 'bg-blue-100/50 border-blue-100 text-blue-500' : 'bg-rose-100/50 border-rose-100 text-rose-500'}`}>
                        {customImage ? (
                          <img src={customImage} className="w-full h-full object-cover" />
                        ) : (
                          record.medIcon
                        )}
                      </div>
                      <div>
                        <h4 className={`font-bold text-sm ${med?.type === 'vaccine' ? 'text-blue-900' : 'text-rose-900'}`}>{record.medName}</h4>
                        <p className="text-[10px] text-gray-500 font-bold mt-0.5">{dateStr}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="bg-white px-2 py-1 rounded border border-gray-100 text-right">
                        <span className="text-[10px] text-gray-400 block font-bold leading-none mb-1">ปริมาณ</span>
                        <span className={`text-xs font-bold leading-none ${med?.type === 'vaccine' ? 'text-blue-600' : 'text-rose-600'}`}>{record.dose} {record.unit}</span>
                      </div>
                      <button onClick={(e) => handleDeleteHistoryRecord(record.id, e)} className="p-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-md transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  
                  {countdown && (
                    <div className={`mt-2 p-2 rounded-xl border flex justify-between items-center ${
                      countdown.type === 'danger' ? 'bg-red-50 border-red-100' :
                      countdown.type === 'warning' ? 'bg-amber-50 border-amber-100' :
                      'bg-blue-50 border-blue-100'
                    }`}>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 font-bold mb-0.5">รอบถัดไป ({record.injectionInterval})</span>
                        <span className={`text-xs font-bold ${
                          countdown.type === 'danger' ? 'text-red-600' :
                          countdown.type === 'warning' ? 'text-amber-600' :
                          'text-blue-600'
                        }`}>{countdown.text}</span>
                      </div>
                      <Clock size={16} className={
                        countdown.type === 'danger' ? 'text-red-400' :
                        countdown.type === 'warning' ? 'text-amber-400' :
                        'text-blue-400'
                      }/>
                    </div>
                  )}
                </div>
              );
            })}
            
            {animalRecords.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">ไม่พบประวัติ</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderEditModal = () => {
    if (!editingItem) return null;
    
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setEditingItem({...editingItem, customImage: reader.result as string});
        };
        reader.readAsDataURL(file);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-5 w-full max-w-sm max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">{editingItem.id.startsWith('New') ? 'เพิ่มรายการใหม่' : 'แก้ไขข้อมูล'}</h3>
            <button onClick={() => setEditingItem(null)} className="text-gray-400 p-1"><X size={20}/></button>
          </div>
          
          <div className="flex flex-col items-center mb-4">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl mb-2 relative overflow-hidden border border-gray-100 shadow-sm ${editingItem.type === 'medicine' ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'}`}>
              {editingItem.customImage ? (
                <img src={editingItem.customImage} className="w-full h-full object-cover" />
              ) : (
                editingItem.icon
              )}
            </div>
            <label className="text-[11px] bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full font-bold cursor-pointer transition-colors">
              เปลี่ยนรูปภาพ
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-gray-500 mb-1 block">ชื่อรายการ</label>
              <input type="text" value={editingItem.name} onChange={e => setEditingItem({...editingItem, name: e.target.value})} className="w-full border rounded-xl p-2.5 text-sm font-bold" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 mb-1 block">รายละเอียด</label>
              <input type="text" value={editingItem.desc} onChange={e => setEditingItem({...editingItem, desc: e.target.value})} className="w-full border rounded-xl p-2.5 text-sm" />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs font-bold text-gray-500 mb-1 block">ประเภท</label>
                <select value={editingItem.type} onChange={e => setEditingItem({...editingItem, type: e.target.value})} className="w-full border rounded-xl p-2.5 text-sm">
                  <option value="medicine">ยา</option>
                  <option value="vaccine">วัคซีน</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100">
              <label className="text-[13px] font-bold text-gray-900 mb-2 block">เลือกกำหนดปริมาณแบบใดแบบหนึ่ง</label>
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <label className="text-xs font-bold text-gray-600 mb-1 block">1) สัดส่วนอัตราต่อกิโลกรัม</label>
                  <input type="text" value={editingItem.dosageRule || ''} onChange={e => setEditingItem({...editingItem, dosageRule: e.target.value, fixedDosageStr: ''})} className="w-full border rounded-xl p-2.5 text-sm text-rose-600 font-bold" placeholder="เช่น 1 ml / 50 kg" />
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <label className="text-xs font-bold text-gray-600 mb-1 block">2) อัตราส่วนยาคงที่ (ml / ตัว)</label>
                  <input type="text" value={editingItem.fixedDosageStr || ''} onChange={e => setEditingItem({...editingItem, fixedDosageStr: e.target.value, dosageRule: ''})} className="w-full border rounded-xl p-2.5 text-sm text-blue-600 font-bold" placeholder="เช่น 2 ml / ตัว" />
                </div>
              </div>
            </div>

            <div className="mt-2 pt-4 border-t border-gray-100">
              <label className="text-[13px] font-bold text-gray-900 mb-2 block">ข้อจำกัดอายุ (ถ้ามี)</label>
              <input type="text" value={editingItem.minAgeRule || ''} onChange={e => setEditingItem({...editingItem, minAgeRule: e.target.value})} className="w-full border rounded-xl p-2.5 text-sm text-amber-600 font-bold" placeholder="เช่น 1 ปี 2 เดือน" />
              <p className="text-[10px] text-gray-400 mt-1">* หากกรอก ระบบจะใช้แจ้งเตือนในสัตว์ที่อายุต่ำกว่าเกณฑ์</p>
            </div>

            {editingItem.type === 'vaccine' && (
              <div className="mt-2 pt-4 border-t border-gray-100">
                <label className="text-[13px] font-bold text-gray-900 mb-2 block">ระยะเวลาการฉีด</label>
                <input type="text" value={editingItem.injectionInterval || ''} onChange={e => setEditingItem({...editingItem, injectionInterval: e.target.value})} className="w-full border rounded-xl p-2.5 text-sm text-blue-600 font-bold" placeholder="เช่น ทุก 6 เดือน" />
              </div>
            )}
            
            <button onClick={handleSaveEdit} className="w-full bg-rose-500 text-white rounded-xl py-3 font-bold mt-2 shadow-lg shadow-rose-200">บันทึกข้อมูล</button>
          </div>
        </div>
      </div>
    );
  };

  const renderInventoryList = (type: 'medicine' | 'vaccine') => {
    const items = inventory.filter(m => m.type === type);
    return (
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-gray-900 font-bold text-[15px] flex items-center gap-2">
            {type === 'medicine' ? <Syringe size={18} className="text-rose-500" /> : <Shield size={18} className="text-blue-500" />}
            {type === 'medicine' ? 'ยาที่ใช้ในฟาร์ม' : 'วัคซีนที่ใช้ในฟาร์ม'}
          </h3>
          <button onClick={() => setEditingItem({id: 'New_' + Date.now(), name: '', desc: '', type, dosageRule: '', fixedDosageStr: '', dosagePerKg: 0, fixedDosage: 0, unit: 'ml', icon: type === 'medicine' ? '💊' : '💉'})} className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-md flex items-center gap-1">
             <Plus size={12} /> เพิ่ม
          </button>
        </div>
        
        {items.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-3 flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg relative overflow-hidden shrink-0 ${type === 'medicine' ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'}`}>
                {item.customImage ? (
                  <img src={item.customImage} className="w-full h-full object-cover" />
                ) : (
                  item.icon || (type === 'medicine' ? '💊' : '💉')
                )}
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  {item.name}
                </h4>
                <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                  <span className="text-[11px] text-gray-500">{item.desc}</span>
                  {item.minAgeRule && (
                    <span className="text-[9px] font-bold bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded border border-amber-100">
                      อายุ {item.minAgeRule} ขึ้นไป
                    </span>
                  )}
                  {item.injectionInterval && (
                    <span className="text-[9px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">
                      ฉีด {item.injectionInterval}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 text-right shrink-0">
                <span className="text-[10px] text-gray-400 block mb-0.5 font-bold">อัตราการใช้</span>
                <span className={`text-xs font-bold ${type === 'medicine' ? 'text-rose-600' : 'text-blue-600'}`}>{item.fixedDosageStr || item.dosageRule}</span>
              </div>
              <div className="flex flex-col gap-1 ml-1">
                <button onClick={() => setEditingItem(item)} className="p-1.5 bg-gray-50 text-gray-500 rounded-md hover:bg-gray-200"><Edit3 size={14}/></button>
                <button onClick={() => handleDelete(item.id)} className="p-1.5 bg-red-50 text-red-500 rounded-md hover:bg-red-100"><X size={14}/></button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-center text-xs text-gray-400 py-4">ไม่มีข้อมูล</p>}
      </div>
    );
  };

  const renderCalculationList = (list: any[], type: 'animal' | 'history') => {
    const filtered = list.filter(item => 
      (item.name || item.animalName).toLowerCase().includes(search.toLowerCase()) || 
      (item.id || item.animalId).toLowerCase().includes(search.toLowerCase())
    );

    return (
      <div className="space-y-3 pb-20">
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 mb-4 sticky top-0 z-20">
          <label className="text-[11px] font-bold text-gray-500 mb-1.5 block">เลือกยา/วัคซีน เพื่อคำนวณปริมาณ:</label>
          <select 
            value={selectedMed}
            onChange={(e) => setSelectedMed(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:border-rose-300"
          >
            <optgroup label="ยา (Medicines)">
              {inventory.filter(m => m.type === 'medicine').map(m => (
                <option key={m.id} value={m.id}>{m.icon} {m.name} ({m.fixedDosageStr || m.dosageRule})</option>
              ))}
            </optgroup>
            <optgroup label="วัคซีน (Vaccines)">
              {inventory.filter(m => m.type === 'vaccine').map(m => (
                <option key={m.id} value={m.id}>{m.icon} {m.name} ({m.fixedDosageStr || m.dosageRule})</option>
              ))}
            </optgroup>
          </select>
        </div>

        {filtered.map((item, idx) => {
          const weight = item.latestWeight || item.weightToUse || 0;
          const itemName = item.name || item.animalName;
          const itemId = item.id || item.animalId;
          const itemImage = item.image || item.animalImage;
          const attempt = item.attempt;
          const animalAgeStr = item.age || item.animalAge || "";
          
          const dose = calculateDose(weight);
          
          let ageWarning = false;
          if (currentMed && currentMed.minAgeRule && animalAgeStr) {
            const reqMonths = parseAgeToMonths(currentMed.minAgeRule);
            const actualMonths = parseAgeToMonths(animalAgeStr);
            if (reqMonths > 0 && actualMonths < reqMonths) {
              ageWarning = true;
            }
          }

          let isCountingDown = false;
          let countdownText = "";
          let givenToday = false;

          if (currentMed) {
            const latestRecord = vaccineHistory.filter(r => r.animalId === itemId && r.medId === currentMed.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
            if (latestRecord) {
              const recDate = new Date(latestRecord.date);
              const today = new Date();
              if (recDate.getDate() === today.getDate() && recDate.getMonth() === today.getMonth() && recDate.getFullYear() === today.getFullYear()) {
                givenToday = true;
              }

              if (latestRecord.injectionInterval) {
                const cd = getCountdown(latestRecord.date, latestRecord.injectionInterval);
                if (cd && cd.type === 'normal') {
                  isCountingDown = true;
                  countdownText = cd.text;
                }
              }
            }
          }
          
          return (
            <div key={idx} className={`bg-white p-3 rounded-2xl shadow-sm border flex flex-col gap-3 transition-colors ${ageWarning ? 'border-amber-200' : 'border-rose-50 hover:border-rose-200'}`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <img src={itemImage} className="w-12 h-12 rounded-xl object-cover bg-gray-100" />
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{itemName}</h4>
                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md mt-1 inline-block">
                      #{itemId} {attempt && ` • ครั้งที่ ${attempt}`}
                    </span>
                    {animalAgeStr && (
                      <span className="text-[10px] font-bold text-gray-400 block mt-1">อายุ: {animalAgeStr}</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 font-bold block">น้ำหนักอ้างอิง</span>
                  <span className="text-[15px] font-black text-gray-700">{weight || '-'} <span className="text-[10px] font-bold text-gray-400">kg</span></span>
                </div>
              </div>
              
              {ageWarning ? (
                <div className="bg-amber-50/80 rounded-xl p-3 border border-amber-200 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-500 text-lg">⚠️</span>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-amber-700">อายุไม่ถึงเกณฑ์การใช้ยา</span>
                      <span className="text-[10px] font-bold text-amber-600/80">ขั้นต่ำ {currentMed.minAgeRule}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-rose-50/50 rounded-xl p-3 border border-rose-100 flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Calculator size={16} className="text-rose-500" />
                      <span className="text-xs font-bold text-gray-700">ปริมาณที่ต้องใช้:</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-black text-rose-600">{dose}</span>
                      <span className="text-xs font-bold text-rose-400">{currentMed?.unit || 'ml'}</span>
                    </div>
                  </div>
                  {isCountingDown ? (
                    <div className="w-full bg-blue-50 text-blue-600 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 shadow-sm border border-blue-100">
                      <Clock size={14} /> ได้รับแล้ว (รอรอบถัดไป {countdownText})
                    </div>
                  ) : givenToday ? (
                    <div className="w-full bg-gray-100 text-gray-500 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 shadow-sm border border-gray-200">
                      <Check size={14} /> บันทึกแล้ววันนี้
                    </div>
                  ) : (
                    <button onClick={() => setConfirmRecord({item, dose, med: currentMed})} className="w-full bg-rose-500 hover:bg-rose-600 transition-colors text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 shadow-sm">
                      <Check size={14} /> บันทึกการให้{currentMed?.type === 'vaccine' ? 'วัคซีน' : 'ยา'}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-10 text-gray-400 text-sm">ไม่พบข้อมูล</div>
        )}
      </div>
    );
  };

  const renderVaccineProgram = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(selectedYear, selectedMonth, 1).getDay();
    const emptyCells = Array.from({length: firstDayOfWeek}, () => null);
    const dayCells = Array.from({length: daysInMonth}, (_, i) => i + 1);

    const displayHistory = vaccineHistory.filter(record => {
      const recDate = new Date(record.date);
      return recDate.getDate() === selectedDay &&
             recDate.getMonth() === selectedMonth &&
             recDate.getFullYear() === selectedYear;
    });

    const getDotsForDay = (d: number) => {
      const records = vaccineHistory.filter(record => {
        const recDate = new Date(record.date);
        return recDate.getDate() === d &&
               recDate.getMonth() === selectedMonth &&
               recDate.getFullYear() === selectedYear;
      });
      return records.map(r => {
        const med = inventory.find(m => m.id === r.medId);
        return { type: med?.type || 'medicine' };
      });
    };

    return (
      <div className="pb-20">
        <div className="flex items-center justify-between mb-4 relative z-50">
          <div className="relative">
            <div 
              className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100"
              onClick={() => setIsMonthPickerOpen(!isMonthPickerOpen)}
            >
              <h2 className="text-gray-900 font-bold text-sm">{THAI_MONTHS[selectedMonth]} {selectedYear + 543}</h2>
              <div className={`text-gray-500 transition-transform ${isMonthPickerOpen ? 'rotate-180' : ''}`}>
                <ChevronDown size={14} />
              </div>
            </div>
            
            {isMonthPickerOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 z-[100]">
                <div className="flex items-center justify-between mb-3 px-2 pb-3 border-b border-gray-100">
                  <button onClick={(e) => { e.stopPropagation(); setSelectedYear(y => y - 1); }} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors">
                    <ChevronLeft size={16} />
                  </button>
                  <span className="font-bold text-gray-900 text-sm">{selectedYear + 543}</span>
                  <button onClick={(e) => { e.stopPropagation(); setSelectedYear(y => y + 1); }} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors">
                    <ChevronRight size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {THAI_MONTHS.map((monthName, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedMonth(index);
                        setIsMonthPickerOpen(false);
                        const newMonthDays = new Date(selectedYear, index + 1, 0).getDate();
                        if (selectedDay > newMonthDays) setSelectedDay(newMonthDays);
                      }}
                      className={`py-2 px-1 text-xs font-bold rounded-xl transition-colors ${selectedMonth === index ? 'bg-rose-500 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
                    >
                      {THAI_MONTHS_SHORT[index]}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS_IN_WEEK.map(day => (
              <div key={day} className="text-center text-[10px] font-bold text-gray-400">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-2 gap-x-1">
            {emptyCells.map((_, i) => <div key={`empty-${i}`} />)}
            {dayCells.map(d => {
              const isSelected = selectedDay === d;
              const dots = getDotsForDay(d);
              return (
                <button
                  key={d}
                  onClick={() => setSelectedDay(d)}
                  className={`relative flex flex-col items-center justify-center h-10 rounded-xl transition-all ${isSelected ? 'bg-rose-500 text-white shadow-sm font-bold scale-105' : 'text-gray-700 hover:bg-gray-50 font-medium'}`}
                >
                  <span className="text-sm">{d}</span>
                  {dots.length > 0 && (
                     <div className="absolute bottom-1 flex gap-0.5 max-w-full overflow-hidden px-1">
                       {dots.slice(0, 3).map((dot, index) => (
                         <div key={index} className={`w-1 h-1 rounded-full shrink-0 ${isSelected ? 'bg-white' : (dot.type === 'vaccine' ? 'bg-blue-400' : 'bg-rose-400')}`}></div>
                       ))}
                     </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-gray-900 font-bold text-sm mb-4 flex items-center gap-2">
            ประวัติการฉีด/การให้ยา ในวันที่ {selectedDay}
          </h3>
          <div className="space-y-3">
            {displayHistory.map(record => {
              const med = inventory.find(m => m.id === record.medId);
              const customImage = med?.customImage || record.customImage;
              const animal = animals.find(a => a.id === record.animalId);
              const animalImage = animal?.image || record.animalImage || "https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=100&q=80";

              return (
                <div 
                  key={record.id} 
                  onClick={() => setSelectedAnimalHistoryId(record.animalId)}
                  className={`p-3 rounded-2xl shadow-sm border flex items-center justify-between cursor-pointer transition-colors ${med?.type === 'vaccine' ? 'bg-blue-50/30 hover:bg-blue-50 border-blue-100' : 'bg-rose-50/30 hover:bg-rose-50 border-rose-100'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl relative overflow-hidden shrink-0 border ${med?.type === 'vaccine' ? 'bg-blue-100/50 border-blue-100 text-blue-500' : 'bg-rose-100/50 border-rose-100 text-rose-500'}`}>
                      {customImage ? (
                        <img src={customImage} className="w-full h-full object-cover" />
                      ) : (
                        record.medIcon
                      )}
                    </div>
                    <div>
                      <h4 className={`font-bold text-sm flex items-center gap-1.5 ${med?.type === 'vaccine' ? 'text-blue-900' : 'text-rose-900'}`}>{record.medName}</h4>
                      <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                        ให้ <span className={`font-bold ${med?.type === 'vaccine' ? 'text-blue-600' : 'text-rose-600'}`}>{record.dose} {record.unit}</span> กับ {record.animalName}
                      </div>
                    </div>
                  </div>
                  <img src={animalImage} className="w-10 h-10 rounded-xl object-cover bg-gray-100 border border-gray-100 shrink-0" />
                </div>
              );
            })}
            {displayHistory.length === 0 && (
              <div className="text-center py-10 text-gray-400 text-sm">
                ไม่มีประวัติการฉีดวัคซีนหรือให้ยา
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderNotifications = () => {
    const upcoming: any[] = [];
    animals.forEach(animal => {
      inventory.filter(med => med.injectionInterval).forEach(med => {
        const latestRecord = vaccineHistory.filter(r => r.animalId === animal.id && r.medId === med.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        if (latestRecord && latestRecord.injectionInterval) {
          const days = parseIntervalToDays(latestRecord.injectionInterval);
          if (days) {
            const nextDate = new Date(new Date(latestRecord.date).getTime() + days * 24 * 60 * 60 * 1000);
            const todayStr = new Date();
            todayStr.setHours(0,0,0,0);
            nextDate.setHours(0,0,0,0);
            const diffDays = Math.round((nextDate.getTime() - todayStr.getTime()) / (1000 * 3600 * 24));
            
            if (diffDays <= 7) { 
              upcoming.push({ animal, med, diffDays, record: latestRecord });
            }
          }
        }
      });
    });
    
    upcoming.sort((a, b) => a.diffDays - b.diffDays);

    if (upcoming.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className="text-gray-900 font-bold text-[13px] mb-3 flex items-center gap-1.5">
          <BellRing size={16} className="text-amber-500" /> แจ้งเตือนครบกำหนด
        </h3>
        <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide snap-x -mx-5 px-5">
          {upcoming.map((item, idx) => (
            <div key={idx} onClick={() => { setActiveTab('vaccine_program'); setSelectedAnimalHistoryId(item.animal.id); }} className={`min-w-[240px] p-3 rounded-2xl border shrink-0 snap-start shadow-sm flex items-start gap-3 cursor-pointer transition-transform hover:scale-[1.02] ${
              item.diffDays < 0 ? 'bg-red-50/50 border-red-200' :
              item.diffDays === 0 ? 'bg-amber-50/50 border-amber-200' :
              'bg-blue-50/50 border-blue-200'
            }`}>
               <img src={item.animal.image || "https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=100&q=80"} className="w-12 h-12 rounded-xl object-cover bg-white border border-gray-100" />
               <div className="flex-1">
                 <h4 className="font-bold text-sm text-gray-900">{item.animal.name}</h4>
                 <p className="text-[11px] text-gray-600 mt-0.5">ครบกำหนด: <span className="font-bold">{item.med.name}</span></p>
                 <span className={`text-[10px] font-bold mt-1.5 inline-block px-2 py-0.5 rounded-md ${
                    item.diffDays < 0 ? 'bg-red-100 text-red-600' :
                    item.diffDays === 0 ? 'bg-amber-100 text-amber-600' :
                    'bg-blue-100 text-blue-600'
                 }`}>
                   {item.diffDays < 0 ? `เลยกำหนดมา ${Math.abs(item.diffDays)} วัน` :
                    item.diffDays === 0 ? 'ครบกำหนดวันนี้!' :
                    `อีก ${item.diffDays} วัน`}
                 </span>
               </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#fcf9f9] text-[#1c1c1c] font-sans relative overflow-x-hidden pt-12 px-5">
      {renderEditModal()}
      {renderConfirmModal()}
      {renderAnimalHistoryModal()}
      
      <div className="flex justify-between items-center mb-6">
        <Link href="/dashboard" className="text-gray-700 bg-white shadow-sm p-2.5 rounded-full transition-colors border border-gray-100">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-gray-900 font-bold text-lg flex items-center gap-2">
           <Syringe size={20} className="text-rose-500" /> คำนวณยา/วัคซีน
        </h1>
        <div className="w-10"></div>
      </div>

      {renderNotifications()}

      <div className="mb-2">
        <span className="text-xs font-bold text-gray-500 mb-2 block">การจัดการ</span>
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide snap-x -mx-5 px-5">
          {[
            { id: 'inventory', label: 'ข้อมูลยา/วัคซีน', icon: <Syringe size={14} /> },
            { id: 'vaccine_program', label: 'โปรแกรมวัคซีน', icon: <Shield size={14} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 snap-start
                ${activeTab === tab.id 
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-200 border border-rose-600' 
                  : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <span className="text-xs font-bold text-gray-500 mb-2 block">คำนวณโดสยาและวัคซีน</span>
        <div 
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className={`flex space-x-2 overflow-x-auto pb-2 scrollbar-hide snap-x -mx-5 px-5 ${isDown ? 'cursor-grabbing snap-none' : 'cursor-grab'}`}
        >
          {[
            { id: 'animals', label: 'สัตว์ในฟาร์ม', icon: <Search size={14} /> },
            { id: 'history', label: 'ประวัติการชั่ง', icon: <Clock size={14} /> },
            { id: 'favorites', label: 'รายการโปรด', icon: <Star size={14} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 snap-start
                ${activeTab === tab.id 
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-200 border border-rose-600' 
                  : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {['animals', 'history', 'favorites'].includes(activeTab) && (
        <div className="relative mb-5">
          <input 
            type="text"
            placeholder="ค้นหาชื่อ หรือ รหัสสัตว์..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-full py-3 pl-11 pr-4 text-sm font-medium focus:outline-none focus:border-rose-300 shadow-sm"
          />
          <Search size={16} className="absolute left-4 top-3.5 text-gray-400" />
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="pb-20">
          {renderInventoryList('medicine')}
          {renderInventoryList('vaccine')}
        </div>
      )}
      {activeTab === 'vaccine_program' && renderVaccineProgram()}
      {activeTab === 'animals' && renderCalculationList(animals, 'animal')}
      {activeTab === 'history' && renderCalculationList(historyRecords, 'history')}
      {activeTab === 'favorites' && renderCalculationList(
        [...animals.filter(a => a.isFavorite), ...historyRecords.filter(h => h.isFavorite)], 
        'animal'
      )}

    </div>
  );
}
