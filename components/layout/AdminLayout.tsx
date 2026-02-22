
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, LayoutDashboard, Calendar, ShoppingBag, Box, Tag, Users, Settings, LogOut 
} from 'lucide-react';
import { User } from '../../types';

interface AdminLayoutProps {
  children: React.ReactNode;
  currentUser: User | null;
  logout: () => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, currentUser, logout }) => (
  <div className="h-screen bg-[#FDFBF9] flex overflow-hidden">
    {/* Admin Sidebar */}
    <aside className="w-72 bg-zinc-900 text-white flex-shrink-0 hidden lg:flex flex-col h-full border-r border-zinc-800">
      <div className="p-8 border-b border-zinc-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#D4AF37] rounded-xl flex items-center justify-center font-serif text-white font-black">NJ</div>
          <div>
            <h2 className="font-serif text-lg leading-tight tracking-wider text-white">ADMIN PANEL</h2>
            <p className="text-[10px] text-[#D4AF37] font-black uppercase tracking-widest mt-1 opacity-80">{currentUser?.role.replace('ADMIN_', '')}</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-4 ml-2">General</p>
        <Link to="/admin" className="flex items-center gap-4 px-4 py-3 hover:bg-white/5 rounded-2xl transition-all group font-medium text-sm">
          <LayoutDashboard size={20} className="text-zinc-500 group-hover:text-[#D4AF37]" /> Dashboard
        </Link>
        <Link to="/admin/schedule" className="flex items-center gap-4 px-4 py-3 hover:bg-white/5 rounded-2xl transition-all group font-medium text-sm">
          <Calendar size={20} className="text-zinc-500 group-hover:text-[#D4AF37]" /> Jadwal Booking
        </Link>
        
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-4 mt-8 ml-2">Management</p>
        {currentUser?.role === 'ADMIN_MASTER' && (
          <Link to="/admin/orders" className="flex items-center gap-4 px-4 py-3 hover:bg-white/5 rounded-2xl transition-all group font-medium text-sm">
            <ShoppingBag size={20} className="text-zinc-500 group-hover:text-[#D4AF37]" /> Orders / Omzet
          </Link>
        )}
        <Link to="/admin/inventory" className="flex items-center gap-4 px-4 py-3 hover:bg-white/5 rounded-2xl transition-all group font-medium text-sm">
          <Box size={20} className="text-zinc-500 group-hover:text-[#D4AF37]" /> Katalog
        </Link>
        {currentUser?.role === 'ADMIN_MASTER' && (
          <Link to="/admin/packages" className="flex items-center gap-4 px-4 py-3 hover:bg-white/5 rounded-2xl transition-all group font-medium text-sm">
            <Tag size={20} className="text-zinc-500 group-hover:text-[#D4AF37]" /> Paket Bridal
          </Link>
        )}
        <Link to="/admin/team" className="flex items-center gap-4 px-4 py-3 hover:bg-white/5 rounded-2xl transition-all group font-medium text-sm">
          <Users size={20} className="text-zinc-500 group-hover:text-[#D4AF37]" /> Tim Creative
        </Link>
        <Link to="/admin/settings" className="flex items-center gap-4 px-4 py-3 hover:bg-white/5 rounded-2xl transition-all group font-medium text-sm">
          <Settings size={20} className="text-zinc-500 group-hover:text-[#D4AF37]" /> Settings
        </Link>
      </nav>

      <div className="p-6 border-t border-zinc-800 space-y-3">
        <Link to="/" className="flex items-center gap-4 px-4 py-3 text-zinc-400 hover:text-white transition-all text-sm font-medium">
          <Home size={18} /> View Site
        </Link>
        <button onClick={logout} className="w-full flex items-center gap-4 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-2xl transition-all text-sm font-black uppercase tracking-widest group">
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" /> Logout
        </button>
      </div>
    </aside>

    {/* Main Content Area */}
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <main className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar bg-[#FDFBF9]">
        {children}
      </main>
    </div>
  </div>
);

export default AdminLayout;
