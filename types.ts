
export type Role = 'PUBLIC' | 'ADMIN_MASTER' | 'ADMIN_FITTING';

export interface User {
  id: string;
  email: string;
  role: Role;
  name: string;
  phone?: string;
  instagram?: string;
}

export interface CatalogItem {
  id: string;
  title: string;
  category: string; 
  imageUrl: string; // Google Drive public share link
  description: string;
  stock: number;
  availablePackageIds?: string[]; // Links to Package.id
}

export interface Category {
  id: string;
  name: string;
  order: number;
}

export interface Package {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  include?: string[];
  exclude?: string[];
  freebies?: string[];
}

export interface Payment {
  id: string;
  amount: number;
  type: 'dp' | 'installment' | 'final';
  method?: string;
  note?: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  clientName: string;
  clientPhone: string;
  address?: string;
  eventDate?: string;
  akadTime?: string;
  socialMedia?: string;
  hennaBy?: 'existing' | 'nj';
  selectedPackage?: string;
  date: string;
  time: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  notes?: string;
  payments?: Payment[];
  packagePrice?: number;
  lastUpdatedBy?: string;
}

export interface Order {
  id: string;
  clientName: string;
  clientPhone: string;
  totalAmount: number;
  dpAmount?: number;
  paymentStatus: 'Unpaid' | 'Partial' | 'Paid';
  items: string[];
  notes?: string;
  createdAt: string;
  lastUpdatedBy?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  specialization: string;
  avatar: string;
}

export interface SiteContent {
  companyName: string;
  tagline: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroImageUrl: string;
  logoUrl?: string; // Optioanl logo
  about: string;
  aboutImageUrl?: string; // Photo for about section
  features: {
    title: string;
    items: {
      title: string;
      description: string;
      icon: string;
    }[];
  };
  catalogHero: {
    heroHeadline: string;
    heroSubheadline: string;
    heroImageUrl: string;
  };
  contact: {
    address: string;
    phone: string;
    email: string;
    instagram: string;
    mapsIframe?: string; // Google Maps embed iframe string
  };
}
