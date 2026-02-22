
import React from 'react';
import { Link } from 'react-router-dom';
import { LogIn, Menu, X, LayoutDashboard } from 'lucide-react';
import { SiteContent, User } from '../../types';
import { translations } from '../../translations';

interface NavbarProps {
  currentUser: User | null;
  isMenuOpen: boolean;
  setIsMenuOpen: (o: boolean) => void;
  lang: 'id' | 'en';
  setLang: (l: 'id' | 'en') => void;
  siteContent: SiteContent;
}

const Navbar: React.FC<NavbarProps> = ({ currentUser, isMenuOpen, setIsMenuOpen, lang, setLang, siteContent }) => {
  const t = translations[lang].nav;
  return (
  <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-md border-b border-[#F0E5D8]">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16 items-center">
        <Link to="/" className="flex items-center gap-2">
          {siteContent.logoUrl ? (
            <img src={siteContent.logoUrl} alt={siteContent.companyName} className="h-8 w-auto" />
          ) : (
            <>
              <span className="font-serif text-2xl tracking-widest font-bold text-[#D4AF37]">
                {siteContent.companyName.split(' ')[0]}
              </span>
              <span className="font-serif text-lg tracking-widest text-zinc-600 uppercase">
                {siteContent.companyName.split(' ').slice(1).join(' ')}
              </span>
            </>
          )}
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-zinc-600 hover:text-[#D4AF37] transition-all font-medium text-sm">{t.home}</Link>
          <Link to="/packages" className="text-zinc-600 hover:text-[#D4AF37] transition-all font-medium text-sm">{t.prices}</Link>
          <Link to="/catalog" className="text-zinc-600 hover:text-[#D4AF37] transition-all font-medium text-sm">{t.catalog}</Link>
          <Link to="/booking" className="text-zinc-600 hover:text-[#D4AF37] transition-all font-medium text-sm">{t.booking}</Link>
          
          <div className="flex bg-zinc-100 p-1 rounded-full border border-zinc-200 ml-2">
            <button onClick={() => setLang('id')} className={`px-2 py-0.5 rounded-full text-[10px] font-black transition-all ${lang === 'id' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-400'}`}>ID</button>
            <button onClick={() => setLang('en')} className={`px-2 py-0.5 rounded-full text-[10px] font-black transition-all ${lang === 'en' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-400'}`}>EN</button>
          </div>

          {currentUser ? (
            <Link to="/admin" className="px-4 py-2 bg-[#D4AF37] text-white rounded-full text-sm font-medium hover:bg-[#B8962D] transition-colors flex items-center gap-2">
              <LayoutDashboard size={16} /> {t.admin}
            </Link>
          ) : (
            <Link 
              to="/login"
              className="text-zinc-400 hover:text-zinc-600 flex items-center gap-1 text-sm font-bold"
            >
              <LogIn size={16} /> {t.login}
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-zinc-600">
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </div>

    {/* Mobile Menu */}
    {isMenuOpen && (
      <div className="md:hidden bg-white border-b border-zinc-100 p-6 space-y-6">
        <Link to="/" onClick={() => setIsMenuOpen(false)} className="block text-zinc-900 font-bold">{t.home}</Link>
        <Link to="/packages" onClick={() => setIsMenuOpen(false)} className="block text-zinc-900 font-bold">{t.prices}</Link>
        <Link to="/catalog" onClick={() => setIsMenuOpen(false)} className="block text-zinc-900 font-bold">{t.catalog}</Link>
        <Link to="/booking" onClick={() => setIsMenuOpen(false)} className="block text-zinc-900 font-bold">{t.booking}</Link>
        
        <div className="flex gap-4 pt-4 border-t border-zinc-50">
          <button onClick={() => setLang('id')} className={`flex-1 py-2 rounded-xl text-xs font-bold border ${lang === 'id' ? 'bg-zinc-900 text-white border-zinc-900' : 'text-zinc-400 border-zinc-100'}`}>Bahasa Indonesia</button>
          <button onClick={() => setLang('en')} className={`flex-1 py-2 rounded-xl text-xs font-bold border ${lang === 'en' ? 'bg-zinc-900 text-white border-zinc-900' : 'text-zinc-400 border-zinc-100'}`}>English</button>
        </div>

        {currentUser ? (
          <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="block text-[#D4AF37] font-black uppercase tracking-widest text-sm pt-4 border-t border-zinc-50">{t.admin}</Link>
        ) : (
          <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-zinc-400 flex items-center gap-2 font-bold text-sm pt-4 border-t border-zinc-50">
            <LogIn size={16} /> {t.login}
          </Link>
        )}
      </div>
    )}
  </nav>
);
}

export default Navbar;
