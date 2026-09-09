"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight, Edit3, Check, Trash2, History as HistoryIcon } from "lucide-react";

export default function HistoryPage() {
  const [allData, setAllData] = useState<any>({});
  const [historyRecords, setHistoryRecords] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);

  useEffect(() => {
    const loadData = () => {
      const stored = localStorage.getItem('mockAnimals');
      if (stored) {
        const parsed = JSON.parse(stored);
        setAllData(parsed);
        // Flatten history
        let allHistory: any[] = [];
        Object.values(parsed).forEach((animal: any) => {
          animal.history.forEach((h: any) => {
            allHistory.push({
              ...h,
              animalId: animal.id,
              animalName: animal.name,
              animalType: animal.type,
              animalImage: h.scanImage || animal.image
            });
          });
        });
        
        // Sort by timestamp descending (newest first). For mock data without timestamp, put them at the end.
        allHistory.sort((a, b) => {
          const timeA = a.timestamp || 0;
          const timeB = b.timestamp || 0;
          return timeB - timeA;
        });

        setHistoryRecords(allHistory);
      }
    };
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  const startEditing = (e: React.MouseEvent, record: any) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingId(record.attempt + "-" + record.animalId);
    setEditName(record.animalName);
  };

  const saveEditing = (e: React.MouseEvent | React.FormEvent, record: any) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Update the animal name in allData
    const newData = { ...allData };
    if (newData[record.animalId]) {
      newData[record.animalId].name = editName;
      localStorage.setItem('mockAnimals', JSON.stringify(newData));
      setAllData(newData);
      
      // Update local flattened list
      setHistoryRecords(prev => 
        prev.map(rec => rec.animalId === record.animalId ? { ...rec, animalName: editName } : rec)
      );
    }
    setEditingId(null);
  };

  const handleDelete = (e: React.MouseEvent, record: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`คุณต้องการลบประวัติการชั่งของ "${record.animalName}" ใช่หรือไม่? (สามารถกู้คืนได้ภายหลัง)`)) {
      const newData = { ...allData };
      if (newData[record.animalId]) {
        const hIndex = newData[record.animalId].history.findIndex((h: any) => h.attempt === record.attempt);
        if (hIndex !== -1) {
          newData[record.animalId].history[hIndex].isDeleted = true;
          localStorage.setItem('mockAnimals', JSON.stringify(newData));
          setAllData(newData);
          
          setHistoryRecords(prev => 
            prev.map(rec => (rec.animalId === record.animalId && rec.attempt === record.attempt) ? { ...rec, isDeleted: true } : rec)
          );
        }
      }
    }
  };

  const handleRestore = (record: any) => {
    const newData = { ...allData };
    if (newData[record.animalId]) {
      const hIndex = newData[record.animalId].history.findIndex((h: any) => h.attempt === record.attempt);
      if (hIndex !== -1) {
        newData[record.animalId].history[hIndex].isDeleted = false;
        localStorage.setItem('mockAnimals', JSON.stringify(newData));
        setAllData(newData);
        
        setHistoryRecords(prev => 
          prev.map(rec => (rec.animalId === record.animalId && rec.attempt === record.attempt) ? { ...rec, isDeleted: false } : rec)
        );
      }
    }
  };

  const activeRecords = historyRecords.filter(rec => !rec.isDeleted);
  const deletedRecords = historyRecords.filter(rec => rec.isDeleted);

  return (
    <div className="min-h-screen bg-[#F6F8F5] pb-24 font-sans relative">
      
      {/* Header */}
      <div className="bg-[#144A29] pt-14 pb-8 px-6 rounded-b-[32px] shadow-lg relative z-10 flex items-center">
        <Link href="/dashboard" className="text-white hover:bg-white/10 p-2 rounded-full transition-colors mr-3">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-white font-bold text-2xl">ประวัติการชั่งน้ำหนักทั้งหมด</h1>
      </div>

      {/* Main Content */}
      <div className="px-6 mt-8">
        <div className="bg-white rounded-3xl p-2 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
          {activeRecords.length === 0 && (
            <div className="text-center py-10 text-gray-400">ไม่มีประวัติการชั่งน้ำหนัก</div>
          )}
          {activeRecords.map((record, index) => (
            <Link 
              href={`/animals/${record.animalId}?from=history`}
              key={record.attempt + "-" + record.animalId} 
              className={`flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors ${index !== activeRecords.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl overflow-hidden shadow-inner shrink-0 border border-gray-100">
                  <img src={record.animalImage} alt={record.animalType} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  {editingId === (record.attempt + "-" + record.animalId) ? (
                    <div 
                      className="flex flex-col space-y-2 mb-1 w-full"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    >
                      <input 
                        type="text" 
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        autoFocus
                        className="w-full px-3 py-2 text-sm border border-emerald-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-[#064e3b] font-bold rounded-lg shadow-sm"
                      />
                      <div className="flex space-x-2">
                        <button 
                          onClick={(e) => saveEditing(e, record)}
                          className="flex-1 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-md hover:bg-emerald-700 transition-colors shadow-sm"
                        >
                          เสร็จสิ้น
                        </button>
                        <button 
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingId(null); }}
                          className="flex-1 py-1.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-md hover:bg-gray-200 transition-colors shadow-sm"
                        >
                          ยกเลิก
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="font-bold text-[#144A29] truncate">{record.animalName}</p>
                      <button 
                        onClick={(e) => startEditing(e, record)} 
                        className="text-gray-400 hover:text-[#144A29] transition-colors p-1"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button 
                        onClick={(e) => handleDelete(e, record)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">{record.time}</p>
                </div>
              </div>
              
              <div className="flex flex-col items-end pl-2 shrink-0">
                <p className="font-bold text-gray-800">{record.aiWeight} <span className="text-xs font-normal text-gray-500">kg</span></p>
                <div className="flex items-center mt-1">
                  <span className="text-[10px] text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full font-medium mr-1">
                    แม่นยำ {record.accuracy}%
                  </span>
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Deleted Records Section */}
        {deletedRecords.length > 0 && (
          <div className="mt-8 border-t border-red-200/50 pt-6">
            <button 
              onClick={() => setShowDeleted(!showDeleted)}
              className="w-full flex items-center justify-between p-4 bg-red-50/80 rounded-2xl text-red-600 hover:bg-red-100 transition-colors border border-red-100/50"
            >
              <span className="font-bold flex items-center gap-2 text-sm">
                <Trash2 size={18} className="text-red-500"/> ประวัติการลบข้อมูล
              </span>
              <span className="bg-red-200 text-red-700 px-2.5 py-0.5 rounded-full text-xs font-bold">{deletedRecords.length}</span>
            </button>
            
            {showDeleted && (
              <div className="mt-4 space-y-3">
                {deletedRecords.map((record) => (
                  <div key={record.attempt + "-" + record.animalId} className="flex justify-between items-center p-4 bg-red-50 border border-red-100/60 rounded-2xl opacity-80 shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0 opacity-70 grayscale">
                        <img src={record.animalImage} alt={record.animalType} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-red-500 line-through">{record.animalName}</p>
                        <p className="text-xs text-red-400 mt-0.5">{record.time}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRestore(record)}
                      className="px-3 py-1.5 bg-white text-red-600 font-bold text-xs rounded-xl hover:bg-red-100 transition-colors border border-red-200 shadow-sm whitespace-nowrap ml-2"
                    >
                      กู้คืนข้อมูล
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
