"use client";

import { useState } from 'react';

export default function MigratePage() {
  const [status, setStatus] = useState('Idle');

  const migrateData = async () => {
    setStatus('Reading localStorage...');
    const dataStr = localStorage.getItem('mockAnimals');
    if (!dataStr) {
      setStatus('No data in localStorage!');
      return;
    }

    const allData = JSON.parse(dataStr);
    const animals = Object.values(allData);

    setStatus(`Found ${animals.length} animals. Migrating...`);

    let successCount = 0;
    for (const animal of animals as any[]) {
      try {
        const response = await fetch('/api/animals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: animal.id,
            name: animal.name,
            type: animal.type,
            image: animal.image,
            measurements: animal.history
          })
        });

        if (response.ok) {
          successCount++;
        } else {
          console.error("Failed to migrate animal:", animal.id);
        }
      } catch (err) {
        console.error("Error migrating:", err);
      }
    }

    setStatus(`Done! Successfully migrated ${successCount} out of ${animals.length} animals.`);
  };

  return (
    <div className="p-10 font-sans">
      <h1 className="text-2xl font-bold mb-4">Database Migration Tool</h1>
      <p className="mb-4">This tool will copy all data from localStorage to the PostgreSQL database.</p>
      <button 
        onClick={migrateData}
        className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700"
      >
        Start Migration
      </button>
      <div className="mt-6 p-4 bg-gray-100 rounded">
        <strong>Status:</strong> {status}
      </div>
    </div>
  );
}
