
import React, { useState } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

const packages = [
  {
    name: "Paket Platinum",
    price: 8000000,
    description: "Layanan termewah untuk hari paling spesialmu.",
    features: [],
    include: [
      "Make Up By Owner",
      "Melati Akad Premium Kalung Melati CPP",
      "Softlens Normal / Minus",
      "1 Kebaya Akad + Pasangan",
      "2 Gaun Resepsi Premium + Pasangan",
      "2x Retouch Make Up",
      "2 Kebaya Premium Ibu Lengkap + Make Up",
      "2 Basecap Premium Bapak Lengkap",
      "4 Kebaya Pagar Ayu + Make Up"
    ],
    exclude: [
      "Biaya Transportasi Luar Kota",
      "Catering & Gedung",
      "Dokumentasi"
    ],
    freebies: [
      "Penggunaan 1 New Gaun Premium",
      "Hena & Fake Nail (Non-Vendor)",
      "Acc Sunda/Betawi/Jawa (Full Melati Segar)",
      "Transportasi (Area Domisili)"
    ]
  },
  {
    name: "Paket Gold",
    price: 6500000,
    description: "Pilihan favorit untuk tampil elegan dan cetar.",
    features: [],
    include: [
      "Make Up By Owner",
      "Melati Akad + Kalung Melati CPP",
      "Softlens Normal / Minus",
      "1 Kebaya Akad + Pasangan",
      "2 Gaun Resepsi + Pasangan",
      "2x Retouch Make Up",
      "2 Kebaya Ibu Lengkap + Make Up",
      "2 Basecap Bapak",
      "4 Kebaya Pagar Ayu + Make Up"
    ],
    exclude: [
      "Biaya Transportasi Luar Kota",
      "Catering & Gedung"
    ],
    freebies: [
      "Penggunaan 1 Gaun Baru",
      "Acc Sunda/Betawi/Jawa (Full Melati Segar)",
      "Transportasi (Area Domisili)"
    ]
  }
];

export const PackageSeeder: React.FC = () => {
  const [status, setStatus] = useState<string>('Ready to seed structured data...');
  const [loading, setLoading] = useState(false);

  const startSeeding = async () => {
    setLoading(true);
    setStatus('Cleaning old data...');
    try {
      const colRef = collection(db, 'packages');
      const snapshot = await getDocs(colRef);
      for (const d of snapshot.docs) {
        await deleteDoc(doc(db, 'packages', d.id));
      }

      setStatus('Injecting structured packages...');
      for (const pkg of packages) {
        await addDoc(colRef, pkg);
      }
      setStatus('✨ Structured Seeding Success!');
    } catch (error: any) {
      setStatus('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', background: '#FDFBF9', borderRadius: '20px', margin: '20px', border: '1px solid #F0E5D8', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
      <h3 style={{ fontFamily: 'serif', fontSize: '1.2rem', marginBottom: '10px' }}>Database Seeder (Categorized)</h3>
      <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '20px' }}>This will split features into Include, Exclude, and Freebies.</p>
      <p>Status: <strong style={{ color: status.includes('Success') ? 'green' : '#D4AF37' }}>{status}</strong></p>
      <button 
        onClick={startSeeding} 
        disabled={loading}
        style={{ 
          padding: '12px 24px', 
          background: '#zinc-900', 
          backgroundColor: '#18181b',
          color: 'white', 
          border: 'none', 
          borderRadius: '12px',
          cursor: 'pointer',
          fontWeight: 'bold',
          marginTop: '10px'
        }}
      >
        {loading ? 'Processing...' : 'Seed Structured Data'}
      </button>
    </div>
  );
};
