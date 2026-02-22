
import { db } from './services/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

const packages = [
  {
    name: "Paket Platinum",
    price: 8000000,
    description: "Layanan termewah untuk hari paling spesialmu.",
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
    exclude: ["Biaya Transportasi Luar Kota", "Catering & Gedung", "Dokumentasi"],
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
    exclude: ["Biaya Transportasi Luar Kota", "Catering & Gedung"],
    freebies: [
      "Penggunaan 1 Gaun Baru",
      "Acc Sunda/Betawi/Jawa (Full Melati Segar)",
      "Transportasi (Area Domisili)"
    ]
  }
];

const team = [
  {
    name: "Nurul Jihan",
    role: "Owner & Lead MUA",
    specialization: "Bridal & Glamour Makeup",
    avatar: "https://picsum.photos/seed/nj-owner/300/300"
  },
  {
    name: "Siti Aminah",
    role: "Senior Stylist",
    specialization: "Traditional Hair & Hijab Do",
    avatar: "https://picsum.photos/seed/nj-staff1/300/300"
  },
  {
    name: "Rizky Pratama",
    role: "Wardrobe Manager",
    specialization: "Gown Fitting & Styling",
    avatar: "https://picsum.photos/seed/nj-staff2/300/300"
  }
];

const catalog = [
  {
    title: "The Royal Silk Gown",
    category: "Gown",
    price: 15000000,
    stock: 2,
    imageUrl: "https://picsum.photos/seed/gown1/800/1200",
    description: "Premium silk gown with hand-woven embroidery."
  },
  {
    title: "Diamond Tiara Collection",
    category: "Accessory",
    price: 2500000,
    stock: 5,
    imageUrl: "https://picsum.photos/seed/acc1/800/800",
    description: "Authentic swarovski elements for your crown."
  }
];

async function clearCollection(name: string) {
  const colRef = collection(db, name);
  const snapshot = await getDocs(colRef);
  for (const d of snapshot.docs) {
    await deleteDoc(doc(db, name, d.id));
  }
  console.log(`✅ Cleared collection: ${name}`);
}

async function seed() {
  console.log("🚀 Starting Global Seed...");
  
  try {
    // Packages
    await clearCollection('packages');
    for (const p of packages) await addDoc(collection(db, 'packages'), p);
    console.log("📦 Packages Seeded.");

    // Team
    await clearCollection('team');
    for (const t of team) await addDoc(collection(db, 'team'), t);
    console.log("👥 Team Seeded.");

    // Catalog
    await clearCollection('catalog');
    for (const c of catalog) await addDoc(collection(db, 'catalog'), c);
    console.log("🖼️ Catalog Seeded.");

    console.log("✨ Seed completed successfully!");
  } catch (error) {
    console.error("❌ Seed failed:", error);
  }
}

seed();
