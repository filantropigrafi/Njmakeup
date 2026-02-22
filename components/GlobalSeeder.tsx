
import React, { useState } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

export const GlobalSeeder: React.FC = () => {
  const [status, setStatus] = useState<string>('Ready to seed all data...');
  const [loading, setLoading] = useState(false);

  const startSeeding = async () => {
    setLoading(true);
    setStatus('Clearing all collections...');
    try {
      const collections = ['packages', 'team', 'catalog', 'categories'];
      
      for (const col of collections) {
        const colRef = collection(db, col);
        const snapshot = await getDocs(colRef);
        for (const d of snapshot.docs) {
          await deleteDoc(doc(db, col, d.id));
        }
      }

      setStatus('Injecting sample data...');
      
      // 1. Categories
      const categories = [
        { name: "Gown" },
        { name: "Shoes" },
        { name: "Siger" },
        { name: "Accessories" }
      ];
      for (const cat of categories) await addDoc(collection(db, 'categories'), cat);

      // 2. Packages
      const packagesData = [
        {
          name: "Paket Platinum",
          price: 8000000,
          description: "Layanan termewah untuk hari paling spesialmu.",
          include: ["Make Up By Owner", "Melati Akad Premium", "1 Kebaya Akad + Pasangan", "2 Gaun Resepsi Premium + Pasangan"],
          exclude: ["Biaya Transportasi Luar Kota"],
          freebies: ["Penggunaan 1 New Gaun Premium", "Hena & Fake Nail"]
        },
        {
          name: "Paket Gold",
          price: 6500000,
          description: "Pilihan favorit untuk tampil elegan dan cetar.",
          include: ["Make Up By Owner", "Melati Akad", "1 Kebaya Akad + Pasangan", "2 Gaun Resepsi + Pasangan"],
          exclude: ["Transportasi Luar Kota"],
          freebies: ["Melati Segar"]
        }
      ];

      const pRefs: string[] = [];
      for (const p of packagesData) {
        const docRef = await addDoc(collection(db, 'packages'), p);
        pRefs.push(docRef.id);
      }

      // 3. Team
      const team = [
        { name: "Nurul Jihan", role: "Owner & Lead MUA", specialization: "Bridal & Glamour Makeup", avatar: "https://picsum.photos/seed/nj-owner/300/300" },
        { name: "Siti Aminah", role: "Senior Stylist", specialization: "Traditional Hair & Hijab Do", avatar: "https://picsum.photos/seed/nj-staff1/300/300" }
      ];
      for (const t of team) await addDoc(collection(db, 'team'), t);

      // 4. Catalog (linking to Platinum package as example)
      const catalog = [
        { 
          title: "The Royal Silk Gown", 
          category: "Gown", 
          stock: 2, 
          imageUrl: "https://picsum.photos/seed/gown1/800/1200", 
          description: "Premium silk gown with hand-woven diamonds.",
          availablePackageIds: [pRefs[0]] 
        },
        { 
          title: "Silver Siger Betawi", 
          category: "Siger", 
          stock: 1, 
          imageUrl: "https://picsum.photos/seed/siger1/800/800", 
          description: "Authentic silver plating for traditional wedding.",
          availablePackageIds: [pRefs[0], pRefs[1]]
        }
      ];
      for (const c of catalog) await addDoc(collection(db, 'catalog'), c);

      setStatus('✨ Full Database Seed Successful!');
    } catch (error: any) {
      setStatus('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 mb-10 shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37] rounded-full -mr-16 -mt-16 opacity-10 group-hover:scale-150 transition-transform duration-1000"></div>
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-serif text-white mb-2 tracking-tight">System Data Synchronizer</h3>
          <p className="text-zinc-500 text-sm font-medium">Clear and seed sample data for Packages, Team, and Catalog Categories.</p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <p className={`text-[10px] font-black uppercase tracking-widest ${status.includes('Success') ? 'text-emerald-500' : 'text-[#D4AF37]'}`}>{status}</p>
          <button 
            onClick={startSeeding} 
            disabled={loading}
            className="px-8 py-3 bg-[#D4AF37] text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-[#B8962D] transition-all disabled:opacity-50 active:scale-95"
          >
            {loading ? 'Processing...' : 'Run Full Database Seed'}
          </button>
        </div>
      </div>
    </div>
  );
};
