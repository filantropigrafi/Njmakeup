
import React, { useState, useEffect } from 'react';
import { 
  Users, ShoppingBag, Calendar, Box, 
  TrendingUp, ArrowUpRight, ArrowDownRight, 
  CreditCard, Loader2, Sparkles, Clock, RefreshCw
} from 'lucide-react';
import { fetchOrders } from '../services/orderService';
import { fetchBookings } from '../services/bookingService';
import { fetchCatalog } from '../services/inventoryService';
import { formatDate } from '../services/whatsappService';
import { Order, Booking, CatalogItem, User } from '../types';
import { GlobalSeeder } from '../components/GlobalSeeder';

interface DashboardProps {
  user: User | null;
}

const AdminDashboard: React.FC<DashboardProps> = ({ user }) => {
  const [data, setData] = useState({
    orders: [] as Order[],
    bookings: [] as Booking[],
    catalog: [] as CatalogItem[],
    isLoading: true
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setData(prev => ({ ...prev, isLoading: true }));
    const [orders, bookings, catalog] = await Promise.all([
      fetchOrders(),
      fetchBookings(),
      fetchCatalog()
    ]);
    setData({ orders, bookings, catalog, isLoading: false });
  };

  if (data.isLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-[#D4AF37] mb-4" size={48} />
        <p className="text-zinc-400 font-serif text-lg">Mengumpulkan data NJ Makeup...</p>
      </div>
    );
  }

  // Calculate Stats
  const totalRevenue = data.orders.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalDP = data.orders.reduce((acc, curr) => acc + (curr.dpAmount || 0), 0);
  const pendingBookings = data.bookings.filter(b => b.status === 'Pending').length;
  const lowStock = data.catalog.filter(i => i.stock < 2).length;

  const cards = [
    { label: 'Total Sales', value: `Rp ${(totalRevenue / 1000000).toFixed(1)}M`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Payment (DP)', value: `Rp ${(totalDP / 1000000).toFixed(1)}M`, icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'New Requests', value: pendingBookings, icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Low Stock', value: lowStock, icon: Box, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  const recentOrders = data.orders.slice(0, 5);
  const upcomingBookings = data.bookings.filter(b => b.status === 'Confirmed').slice(0, 5);

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-serif text-zinc-900 mb-2">Welcome back, <span className="text-[#D4AF37] italic">{user?.name}</span></h1>
          <p className="text-zinc-500 font-medium">Ini ringkasan aktivitas studio Anda hari ini.</p>
        </div>
        <button 
          onClick={loadDashboardData}
          className="p-3 bg-white border border-zinc-100 rounded-2xl shadow-sm text-zinc-400 hover:text-zinc-900 transition-all active:scale-95"
        >
          <RefreshCw size={20} />
        </button>
      </header>

      <GlobalSeeder />

      {/* Hero Stats - MASTER ONLY */}
      {user?.role === 'ADMIN_MASTER' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, i) => (
            <div key={i} className="bg-white p-8 rounded-[2rem] border border-zinc-100 shadow-sm hover:shadow-xl hover:shadow-zinc-200/50 transition-all duration-700 group">
              <div className={`w-14 h-14 ${card.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                <card.icon size={28} className={card.color} />
              </div>
              <p className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em] mb-2">{card.label}</p>
              <div className="flex items-end justify-between">
                <h3 className="text-2xl font-black text-zinc-900">{card.value}</h3>
                <div className={`p-1 rounded-full ${card.color} bg-white border border-zinc-50`}>
                  <ArrowUpRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Recent Orders - Left - MASTER ONLY */}
        {user?.role === 'ADMIN_MASTER' ? (
          <div className="lg:col-span-12 xl:col-span-7 bg-white p-10 rounded-[2.5rem] border border-zinc-100 shadow-sm">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-serif text-zinc-900">Recent Transactions</h3>
              <button className="text-xs font-black uppercase tracking-widest text-[#D4AF37] border-b-2 border-[#D4AF37]/20 pb-1">View All</button>
            </div>
            <div className="space-y-6">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-5 bg-zinc-50/50 rounded-[1.5rem] border border-zinc-50 hover:bg-white hover:border-[#F0E5D8] transition-all group">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-zinc-400 group-hover:bg-[#D4AF37] group-hover:text-white transition-all shadow-sm">
                      <ShoppingBag size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-900">{order.clientName}</h4>
                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">{order.paymentStatus}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-zinc-900">Rp {(order.totalAmount / 1000).toLocaleString()}k</p>
                    <p className="text-[10px] text-zinc-400 font-medium">{formatDate(order.createdAt, 'id')}</p>
                  </div>
                </div>
              ))}
              {recentOrders.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-zinc-400 italic">No transactions recorded yet.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="lg:col-span-12 xl:col-span-7 bg-white p-10 rounded-[2.5rem] border border-zinc-100 shadow-sm flex flex-col items-center justify-center text-center">
            <Box className="text-zinc-100 mb-6" size={80} />
            <h3 className="text-2xl font-serif text-zinc-900 mb-2">Operational Mode</h3>
            <p className="text-zinc-400 max-w-sm">Siapkan kebutuhan fitting dan cek jadwal hari ini melalui menu di samping.</p>
          </div>
        )}

        {/* Schedule Preview - Right */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-8">
          <div className="bg-zinc-900 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37] rounded-full -mr-16 -mt-16 opacity-10 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <Sparkles className="text-[#D4AF37]" size={24} />
                <h3 className="text-2xl font-serif text-white">Upcoming</h3>
              </div>
              <div className="space-y-6">
                {upcomingBookings.map((b) => (
                  <div key={b.id} className="flex gap-4 group">
                    <div className="w-1 bg-[#D4AF37]/30 rounded-full group-hover:bg-[#D4AF37] transition-all"></div>
                    <div>
                      <h4 className="font-bold text-zinc-200 text-sm">{b.clientName}</h4>
                      <p className="text-[10px] text-zinc-500 font-medium flex items-center gap-2 mt-1">
                        <Clock size={10} /> {formatDate(b.date, 'id')} • {b.time}
                      </p>
                    </div>
                  </div>
                ))}
                {upcomingBookings.length === 0 && (
                  <p className="text-zinc-500 text-sm italic">No upcoming confirmed bookings.</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-[#D4AF37]/5 p-10 rounded-[2.5rem] border border-[#D4AF37]/10 flex flex-col items-center text-center">
             <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-[#D4AF37] shadow-lg mb-6">
                <Users size={32} />
             </div>
             <h4 className="text-xl font-serif text-zinc-900 mb-2">Team Sync</h4>
             <p className="text-zinc-500 text-sm mb-6">Semua member tim aktif dan siap melayani pelanggan.</p>
             <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-zinc-200 overflow-hidden shadow-sm">
                    <img src={`https://i.pravatar.cc/100?u=${i}`} alt="team" />
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
