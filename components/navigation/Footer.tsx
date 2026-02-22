
import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Info } from 'lucide-react';
import { SiteContent } from '../../types';
import { translations } from '../../translations';

interface FooterProps {
  siteContent: SiteContent;
  lang: 'id' | 'en';
}

const Footer: React.FC<FooterProps> = ({ siteContent, lang }) => {
  const t = translations[lang].footer;
  const nt = translations[lang].nav;
  return (
    <footer className="bg-zinc-900 text-white py-20 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center gap-3 mb-6">
            {siteContent.logoUrl ? (
              <img src={siteContent.logoUrl} alt={siteContent.companyName} className="h-10 w-auto" />
            ) : (
              <h3 className="font-serif text-2xl tracking-[0.2em] text-[#D4AF37]">{siteContent.companyName}</h3>
            )}
          </div>
          <p className="text-zinc-400 leading-relaxed max-w-xs text-sm">{siteContent.tagline}</p>
          
          {siteContent.contact.mapsIframe && (
            <div className="pt-6 overflow-hidden rounded-2xl opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0 duration-700">
               <div className="w-full aspect-video" dangerouslySetInnerHTML={{ __html: siteContent.contact.mapsIframe }}></div>
            </div>
          )}
        </div>
        <div className="lg:col-span-4 space-y-6">
          <h4 className="font-black text-xs uppercase tracking-[0.2em] text-zinc-500">{t.contact}</h4>
          <div className="space-y-4 text-zinc-400 text-sm font-medium">
            <p className="flex items-center gap-3"><Phone size={16} className="text-[#D4AF37]" /> {siteContent.contact.phone}</p>
            <p className="flex items-center gap-3"><span className="text-[#D4AF37]">IG:</span> @{siteContent.contact.instagram}</p>
            <p className="flex items-center gap-3"><Info size={16} className="text-[#D4AF37]" /> {siteContent.contact.address}</p>
          </div>
        </div>
        <div className="lg:col-span-4 space-y-6">
          <h4 className="font-black text-xs uppercase tracking-[0.2em] text-zinc-500">{t.links}</h4>
          <div className="flex flex-col gap-3 text-zinc-400 text-sm font-medium">
            <Link to="/" className="hover:text-[#D4AF37] transition-colors">{nt.home}</Link>
            <Link to="/packages" className="hover:text-[#D4AF37] transition-colors">{nt.prices}</Link>
            <Link to="/catalog" className="hover:text-[#D4AF37] transition-colors">{nt.catalog}</Link>
            <Link to="/booking" className="hover:text-[#D4AF37] transition-colors">{nt.booking}</Link>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-zinc-800 text-center text-zinc-500 text-[10px] uppercase font-black tracking-widest">
        &copy; {new Date().getFullYear()} {siteContent.companyName}. Handcrafted with Love.
      </div>
    </footer>
  );
};

export default Footer;
