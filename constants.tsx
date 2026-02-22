
import React from 'react';
import { SiteContent, CatalogItem, Booking, Order, TeamMember, Package } from './types';

export const COLORS = {
  primary: '#D4AF37', // Gold
  secondary: '#E7C6C6', // Rose Gold
  accent: '#FFF8F0', // Champagne
  background: '#FFFDFB',
  text: '#1A1A1A',
  muted: '#71717A'
};

export const INITIAL_CONTENT: SiteContent = {
  companyName: "NJ Makeup",
  tagline: "Make you look beautiful",
  heroHeadline: "PRIVATE ARCHIVE",
  heroSubheadline: "Showcasing the finest masterpieces designed specifically to radiate your aura of luxury.",
  heroImageUrl: "https://picsum.photos/seed/nj-catalog-new/1920/1080",
  logoUrl: "", // Use text if empty
  about: "Founded with a passion for beauty and self-expression, NJ Makeup provides world-class bridal makeup and luxury gown rentals. We believe every bride deserves to feel like royalty on her special day.",
  aboutImageUrl: "https://images.unsplash.com/photo-1522673607200-16488bcdd397?auto=format&fit=crop&q=80&w=800",
  features: {
    title: "Why Choose NJ Makeup?",
    items: [
      { title: "Premium Quality", description: "Only the finest cosmetics and luxury gowns for your big day.", icon: "Sparkles" },
      { title: "Personal Styling", description: "Tailored looks that complement your unique personality and aura.", icon: "Heart" },
      { title: "Exquisite Results", description: "Attention to detail that ensures you look breathtaking from every angle.", icon: "CheckCircle2" }
    ]
  },
  catalogHero: {
    heroHeadline: "CATALOGUE",
    heroSubheadline: "Explore our curated collection of luxury gowns and accessories.",
    heroImageUrl: "https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&q=80&w=1920"
  },
  contact: {
    address: "Kp karet Jl.jatayu rt03/11 kec Tajurhalang Bogor",
    phone: "0852-8387-6601",
    email: "njmakeup@gmail.com",
    instagram: "nj_makeup_wedding",
    mapsIframe: `<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.384316946007!2d106.75541817604022!3d-6.47290766329067!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69c34f3098dd3f%3A0x862315d25ba031b8!2sNJ%20Makeup%20Wedding!5e0!3m2!1sid!2sid!4v1770787556359!5m2!1sid!2sid" width="100%" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`
  }
};

export const MOCK_PACKAGES: Package[] = [
  {
    id: 'p1',
    name: 'Eternal Bliss Bridal',
    price: 15000000,
    description: 'The ultimate luxury experience for your wedding day.',
    features: ['Premium Bridal Makeup', 'Luxury Gown Rental', 'Professional Hair Styling', 'Touch-up Service', 'Accessory Rental']
  },
  {
    id: 'p2',
    name: 'Classic Elegance',
    price: 8500000,
    description: 'Perfect for intimate ceremonies and sophisticated looks.',
    features: ['Standard Bridal Makeup', 'Designer Gown Rental', 'Hair Styling', 'One Accessory']
  }
];

export const MOCK_CATALOG: CatalogItem[] = [
  {
    id: '1',
    title: 'Royal White Silk Gown',
    category: 'Gown',
    imageUrl: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&q=80&w=800',
    description: 'Hand-stitched silk gown with delicate lace details.',
    stock: 2
  },
  {
    id: '2',
    title: 'Crystal Tiara Collection',
    category: 'Accessory',
    imageUrl: 'https://images.unsplash.com/photo-1596540321289-498c4f923a1a?auto=format&fit=crop&q=80&w=800',
    description: 'Premium Swarovski crystal tiara for a regal look.',
    stock: 5
  }
];

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    clientName: 'Siti Aminah',
    clientPhone: '0812222333',
    selectedPackage: 'Fitting',
    date: '2023-12-25',
    time: '10:00',
    status: 'Confirmed'
  },
  {
    id: 'b2',
    clientName: 'Rina Wijaya',
    clientPhone: '0813333444',
    selectedPackage: 'Makeup',
    date: '2023-12-26',
    time: '08:00',
    status: 'Pending'
  }
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-001',
    clientName: 'Siti Aminah',
    clientPhone: '08123456789',
    totalAmount: 16500000,
    dpAmount: 5000000,
    paymentStatus: 'Partial',
    items: ['Royal White Silk Gown', 'Modern Minimalist Veil'],
    createdAt: '2023-12-10'
  }
];

export const MOCK_TEAM: TeamMember[] = [
  {
    id: 't1',
    name: 'Natasya J.',
    role: 'Founder & Head Artist',
    specialization: 'High-Fashion Bridal',
    avatar: 'https://i.pravatar.cc/150?u=nj'
  },
  {
    id: 't2',
    name: 'Andi Pratama',
    role: 'Senior Stylist',
    specialization: 'Traditional & Modern Gowns',
    avatar: 'https://i.pravatar.cc/150?u=andi'
  }
];
