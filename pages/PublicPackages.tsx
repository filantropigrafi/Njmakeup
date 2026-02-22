
import React, { useState, useEffect } from 'react';
import { Check, Sparkles, Loader2, Calendar, Star, XCircle, Gift, ArrowLeft } from 'lucide-react';
import { fetchPackages } from '../services/packageService';
import { Package } from '../types';
import { translations } from '../translations';

interface PackagesProps {
  lang: 'id' | 'en';
}

const PublicPackages: React.FC<PackagesProps> = ({ lang }) => {
  const t = translations[lang].packages;
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [lang]);

  const loadData = async () => {
    setIsLoading(true);
    const data = await fetchPackages();
    setPackages(data);
    setIsLoading(false);
  };

  const FeatureSection = ({ title, items, icon: Icon, color }: { title: string, items: string[] | undefined, icon: any, color: string }) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="space-y-4 mb-8">
        <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 ${color}`}>
          <Icon size={14} />
          {title}
        </h4>
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${color.replace('text-', 'bg-').split(' ')[0]}`} />
              <span className="text-zinc-600 text-sm font-medium leading-tight">{item}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FDFBF9] py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-[#D4AF37]/5 text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.3em] mb-10 border border-[#D4AF37]/10">
            <Star size={14} className="fill-[#D4AF37]" />
            <span>Premium Bridal Packages</span>
          </div>
          <h1 className="font-serif text-5xl md:text-7xl mb-8 text-zinc-900 leading-tight" dangerouslySetInnerHTML={{ __html: t.title }} />
          <p className="text-zinc-500 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
            {t.sub}
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <Loader2 className="animate-spin text-[#D4AF37] mb-6" size={56} />
            <p className="text-zinc-400 font-serif text-2xl italic">{t.loading}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
            {packages.map((pkg, idx) => (
              <div key={pkg.id} className="bg-white rounded-[3.5rem] p-10 md:p-14 shadow-2xl shadow-zinc-200/40 border border-zinc-100 flex flex-col group hover:-translate-y-4 transition-all duration-1000 relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37] rounded-full -mr-16 -mt-16 opacity-[0.03] blur-2xl group-hover:scale-150 transition-transform"></div>
                
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center text-[#D4AF37] border border-zinc-50 group-hover:bg-zinc-900 group-hover:text-white transition-all duration-700">
                    <Sparkles size={32} />
                  </div>
                  {idx === 0 && (
                    <span className="bg-[#D4AF37] text-white text-[9px] font-black px-5 py-2 rounded-full uppercase tracking-[0.2em] shadow-lg shadow-[#D4AF37]/20">Most Wanted</span>
                  )}
                </div>
                
                <h3 className="text-4xl font-serif text-zinc-900 mb-2 tracking-tight">{pkg.name}</h3>
                <p className="text-zinc-400 text-sm mb-10 font-medium italic">"{pkg.description}"</p>
                
                <div className="mb-12 flex items-baseline gap-2 pb-10 border-b border-zinc-50">
                  <span className="text-sm font-black text-zinc-300 uppercase tracking-widest mr-1">Rp</span>
                  <span className="text-5xl font-black text-zinc-900 tracking-tighter">{(pkg.price / 1000).toLocaleString()}k</span>
                  <span className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] ml-1">Session</span>
                </div>

                <div className="flex-1 relative z-10">
                  {/* Categorized Features */}
                  <FeatureSection 
                    title={lang === 'id' ? "Sudah Termasuk" : "Included"} 
                    items={pkg.include} 
                    icon={Check} 
                    color="text-emerald-500" 
                  />
                  
                  <FeatureSection 
                    title={lang === 'id' ? "Bonus Spesial" : "Special Freebies"} 
                    items={pkg.freebies} 
                    icon={Gift} 
                    color="text-[#D4AF37]" 
                  />

                  <FeatureSection 
                    title={lang === 'id' ? "Tidak Termasuk" : "Excluded"} 
                    items={pkg.exclude} 
                    icon={XCircle} 
                    color="text-zinc-400" 
                  />

                  {/* Fallback for old data if any */}
                  {(!pkg.include && pkg.features && pkg.features.length > 0) && (
                    <FeatureSection title="Features" items={pkg.features} icon={Check} color="text-zinc-600" />
                  )}
                </div>

                <a 
                  href="#/booking" 
                  className="w-full text-center py-6 bg-zinc-900 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-zinc-900/20 hover:bg-[#D4AF37] transition-all flex items-center justify-center gap-3 mt-10"
                >
                  <span className="relative z-10">{t.cta}</span>
                  <Calendar size={18} className="group-hover:rotate-12 transition-transform" />
                </a>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-40 bg-zinc-900 p-16 md:p-32 rounded-[5rem] text-center relative overflow-hidden group shadow-2xl">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#D4AF37] rounded-full -mr-96 -mt-96 opacity-[0.05] group-hover:scale-110 transition-transform duration-1000 blur-3xl"></div>
          <div className="relative z-10">
            <h4 className="font-serif text-5xl md:text-6xl text-white mb-8">Want a <span className="text-[#D4AF37] italic">Custom</span> Package?</h4>
            <p className="text-zinc-400 mb-12 max-w-2xl mx-auto text-xl font-medium leading-relaxed">
              {lang === 'id' ? 'Beda kebutuhan, beda harga. Yuk konsultasi buat dapetin budget yang paling pas buat kamu.' : 'Different needs, different prices. Let\'s chat to find the perfect budget for you.'}
            </p>
            <a href="#/booking" className="inline-flex items-center gap-4 px-12 py-6 bg-[#D4AF37] text-white rounded-full font-black uppercase tracking-[0.3em] text-xs hover:bg-[#B8962D] transition-all shadow-2xl shadow-[#D4AF37]/40 active:scale-95 group">
              {lang === 'id' ? 'Chat Admin Sekarang' : 'Chat With Us Now'}
              <ArrowLeft size={18} className="rotate-180 group-hover:translate-x-2 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicPackages;
