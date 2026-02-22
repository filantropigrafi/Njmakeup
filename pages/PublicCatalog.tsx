
import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Check, ChevronLeft, ChevronRight, Fingerprint, Sparkles, MapPin, Zap, ArrowDown, Expand, X, ShoppingBag, Heart, Filter, SlidersHorizontal } from 'lucide-react';
import { fetchCatalog, fetchCategories } from '../services/inventoryService';
import { fetchPackages } from '../services/packageService';
import { CatalogItem, Category, Package as PackageType, SiteContent } from '../types';
import { getStableImageUrl, isGoogleDriveImageUrl, getAllThumbnailUrls } from '../services/googleDrive';

// Helper to get the best image URL for display
const getDisplayImageUrl = (url: string): string => {
  if (!url) return '';
  if (isGoogleDriveImageUrl(url)) {
    return getStableImageUrl(url);
  }
  return url;
};

// Component for images with Google Drive fallback support
const DriveImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  fallbackSeed?: string;
}> = ({ src, alt, className, fallbackSeed }) => {
  const [currentSrc, setCurrentSrc] = useState(() => getDisplayImageUrl(src));
  const [attemptIndex, setAttemptIndex] = useState(0);
  const fallbackUrls = useRef<string[]>([]);

  useEffect(() => {
    const displayUrl = getDisplayImageUrl(src);
    setCurrentSrc(displayUrl);
    setAttemptIndex(0);
    if (isGoogleDriveImageUrl(src)) {
      fallbackUrls.current = getAllThumbnailUrls(src);
    } else {
      fallbackUrls.current = [];
    }
  }, [src]);

  const handleError = () => {
    const nextAttempt = attemptIndex + 1;
    if (nextAttempt < fallbackUrls.current.length) {
      setCurrentSrc(fallbackUrls.current[nextAttempt]);
      setAttemptIndex(nextAttempt);
    } else if (fallbackSeed) {
      setCurrentSrc(`https://picsum.photos/seed/${fallbackSeed}/800/600`);
    }
  };

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onError={handleError}
      loading="lazy"
    />
  );
};

const DetailModal: React.FC<{
  item: CatalogItem;
  onClose: () => void;
  getPackageName: (id: string) => string;
}> = ({ item, onClose, getPackageName }) => {
  const [showInfo, setShowInfo] = useState(false);

  // Close only if clicking the darkest background area or (X) button
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      if (showInfo) {
        setShowInfo(false);
      } else {
        onClose();
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black animate-fade-in select-none"
      onClick={handleBackdropClick}
    >
       {/* The Image Canvas - Clicking toggles information */}
       <div 
         className="absolute inset-0 overflow-hidden cursor-pointer"
         onClick={(e) => {
           e.stopPropagation();
           setShowInfo(!showInfo);
         }}
       >
          <DriveImage
            src={item.imageUrl}
            alt={item.title}
            className={`w-full h-full object-cover md:object-contain transition-all duration-[1s] ease-out ${showInfo ? 'opacity-40 scale-105 blur-md' : 'opacity-100 scale-100'}`}
            fallbackSeed={item.id}
          />
          <div className={`absolute inset-0 bg-black/50 transition-all duration-700 ${showInfo ? 'opacity-100' : 'opacity-0'}`}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
       </div>

       {/* Tap Hint - MINIMALIST BOTTOM VERSION */}
       {!showInfo && (
         <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20 animate-pulse pointer-events-none">
            <Fingerprint size={14} strokeWidth={1} />
            <span className="text-[7px] font-black uppercase tracking-[0.6em] ml-[0.6em]">Tap for details</span>
         </div>
       )}

       {/* Detailed Information Overlay */}
       {showInfo && (
         <div 
           onClick={(e) => e.stopPropagation()}
           className="relative z-10 w-full max-w-4xl px-8 flex flex-col items-center text-center space-y-10 animate-fade-in-up"
         >
            <div className="space-y-4">
               <div className="flex items-center justify-center gap-4">
                  <div className="h-px w-10 bg-[#D4AF37]"></div>
                  <span className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.6em]">Exquisite Archive</span>
                  <div className="h-px w-10 bg-[#D4AF37]"></div>
               </div>
               <h2 className="text-5xl md:text-8xl font-serif text-white leading-tight tracking-tighter uppercase drop-shadow-2xl">
                  {item.title}
               </h2>
            </div>

            <div className="max-w-2xl mx-auto">
               <p className="text-white/90 text-xl md:text-3xl font-serif italic leading-[1.6] drop-shadow-md">
                  "{item.description}"
               </p>
            </div>

            <div className="pt-4 flex flex-col items-center gap-6">
               <span className="text-white/40 text-[9px] font-black uppercase tracking-[0.4em]">Available Packages</span>
               <div className="flex flex-wrap justify-center gap-4">
                  {item.availablePackageIds?.map(pkgId => (
                     <div key={pkgId} className="px-8 py-3 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-full text-white font-black text-[10px] uppercase tracking-widest shadow-xl">
                        {getPackageName(pkgId)}
                     </div>
                  ))}
               </div>
            </div>

            <button 
              onClick={(e) => { e.stopPropagation(); setShowInfo(false); }}
              className="pt-10 text-white/30 text-[9px] font-black uppercase tracking-[0.5em] hover:text-[#D4AF37] transition-all"
            >
               Tap image to hide info
            </button>
         </div>
       )}

       {/* Eternal Close Button (Top Right) */}
       <button 
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="absolute top-10 right-10 z-[110] w-14 h-14 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-[#D4AF37] transition-all shadow-2xl"
       >
          <X size={24} />
       </button>
    </div>
  );
};

const CatalogSection: React.FC<{
  cat: Category;
  items: CatalogItem[];
  index: number;
  getPackageName: (id: string) => string;
}> = ({ cat, items, index, getPackageName }) => {
  const [activeItem, setActiveItem] = useState<CatalogItem | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };
  
  if (items.length === 0) return null;

  return (
    <section className="relative py-2 bg-white overflow-hidden border-b border-zinc-50 last:border-0 opacity-0 animate-fade-in-up" style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}>
      <div className="max-w-[1400px] mx-auto w-full px-6">
        {/* Category Header */}
        <div className="flex items-end justify-between mb-10 px-2">
            <div className="space-y-2">
               <div className="flex items-center gap-3">
                  <span className="text-[#D4AF37] text-[9px] font-black uppercase tracking-[0.5em]">Section 0{index + 1}</span>
                  <div className="w-8 h-px bg-[#D4AF37]/30"></div>
               </div>
               <h2 className="text-4xl md:text-5xl font-serif text-zinc-900 tracking-tight uppercase">
                 {cat.name}
               </h2>
            </div>
            <div className="flex gap-2">
               <button onClick={() => scroll('left')} className="w-10 h-10 rounded-full border border-zinc-100 flex items-center justify-center text-zinc-300 hover:bg-zinc-900 hover:text-white transition-all duration-300">
                 <ChevronLeft size={18} />
               </button>
               <button onClick={() => scroll('right')} className="w-10 h-10 rounded-full border border-zinc-100 flex items-center justify-center text-zinc-300 hover:bg-zinc-900 hover:text-white transition-all duration-300">
                 <ChevronRight size={18} />
               </button>
            </div>
        </div>

        {/* Horizontal Row */}
        <div 
          ref={scrollRef}
          className="flex gap-5 md:gap-8 overflow-x-auto no-scrollbar snap-x snap-mandatory md:snap-proximity pb-8 px-4 md:px-2"
        >
          {items.map((item, idx) => (
            <div 
              key={item.id} 
              onClick={() => setActiveItem(item)}
              className="w-[64vw] md:w-[260px] flex-shrink-0 snap-center md:snap-start group cursor-pointer space-y-4 animate-fade-in"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              {/* Portrait Image Container */}
              <div className="aspect-[3/4.5] bg-zinc-50 overflow-hidden relative shadow-[0_8px_30px_rgb(0,0,0,0.04)] group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-700 rounded-sm">
                <DriveImage
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s] ease-out"
                  fallbackSeed={`${item.id}/400/600`}
                />
                
                {/* Package Badge - POJOK ATAS (Top Right) */}
                <div className="absolute top-4 right-4 z-10">
                   {item.availablePackageIds?.slice(0, 1).map(pkgId => (
                     <div key={pkgId} className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-white/20 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                        <span className="text-zinc-900 text-[8px] font-black uppercase tracking-widest whitespace-nowrap">
                          {getPackageName(pkgId).replace('Paket ', '')}
                        </span>
                     </div>
                   ))}
                </div>

                {/* Explore Badge - POJOK ATAS (Top Left) */}
                <div className="absolute top-4 left-4 z-10">
                  <div className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-zinc-900 shadow-xl opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500">
                    <Expand size={16} />
                  </div>
                </div>

                {/* Overlay Detail (Bottom) */}
                <div className="absolute bottom-5 left-5 right-5 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-700">
                   <div className="flex items-center gap-2">
                      <div className="w-6 h-px bg-[#D4AF37]"></div>
                      <span className="text-white text-[9px] font-black uppercase tracking-[0.2em] drop-shadow-md">NJ Signature</span>
                   </div>
                </div>
              </div>

              {/* Title & Collection Detail */}
              <div className="space-y-1 text-center md:text-left px-1 transform group-hover:translate-x-1 transition-transform duration-500">
                <h4 className="text-base font-serif text-zinc-900 tracking-wide group-hover:text-[#D4AF37] transition-colors">{item.title}</h4>
                <div className="flex items-center justify-center md:justify-start gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                   <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-[0.3em]">Exquisite Edition</p>
                </div>
              </div>
            </div>
          ))}
          <div className="min-w-[40px]" />
        </div>
      </div>

      {/* Immersive Overlay Detail Modal - TWO STEP INTERACTION */}
      {activeItem && (() => {
        // We use a internal state for info visibility to stay within functional component structure
        // A better way is to manage it inside the component scope or a local hook
        return <DetailModal 
          item={activeItem} 
          onClose={() => setActiveItem(null)} 
          getPackageName={getPackageName} 
        />;
      })()}
    </section>
  );
};

const PublicCatalog: React.FC<{ lang: 'id' | 'en', siteContent: SiteContent }> = ({ lang, siteContent }) => {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filtering States
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPackage, setSelectedPackage] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [catData, itemData, pkgData] = await Promise.all([
      fetchCategories(),
      fetchCatalog(),
      fetchPackages()
    ]);
    setCategories(catData);
    setItems(itemData);
    setPackages(pkgData);
    setIsLoading(false);
  };

  const getPackageName = (id: string) => packages.find(p => p.id === id)?.name || 'Premium';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="relative">
           <Loader2 className="animate-spin text-zinc-100" size={50} strokeWidth={1} />
           <Sparkles className="absolute inset-0 m-auto text-[#D4AF37] animate-pulse" size={20} />
        </div>
      </div>
    );
  }

  const heroImageUrl = siteContent?.catalogHero?.heroImageUrl;
  const heroDisplayUrl = heroImageUrl
    ? (isGoogleDriveImageUrl(heroImageUrl) ? getStableImageUrl(heroImageUrl) : heroImageUrl)
    : "https://picsum.photos/seed/nj-catalog-new/1920/1080";

  return (
    <div className="min-h-screen bg-white selection:bg-[#D4AF37] selection:text-white pt-16">
      {/* Immersive Editorial Hero */}
      <section className="relative h-screen bg-[#F8F7F5] flex items-center overflow-hidden">
         {/* Elegant Background Image with Fade */}
         <div className="absolute inset-0 overflow-hidden">
            <img 
              src={heroDisplayUrl} 
              className="w-full h-full object-cover object-center grayscale-[0.3] opacity-40 animate-slow-zoom" 
              alt="NJ Professional Exhibition"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://picsum.photos/seed/nj-catalog-new/1920/1080";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#F8F7F5] via-[#F8F7F5]/80 to-transparent"></div>
         </div>
         
         <div className="max-w-[1400px] mx-auto w-full px-8 relative z-10 flex flex-col justify-center h-full">
            <div className="space-y-12 max-w-3xl">
               <div className="flex items-center gap-6 animate-slide-in-left opacity-0" style={{ animationFillMode: 'forwards' }}>
                  <div className="w-12 h-px bg-[#D4AF37]"></div>
                  <span className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.8em]">Since 2018</span>
               </div>
               
               <h1 
                 className="text-4xl md:text-[8rem] font-serif text-zinc-900 leading-[0.9] md:leading-[0.8] tracking-tighter animate-fade-in-up opacity-0 delay-300" 
                 style={{ animationFillMode: 'forwards' }}
                 dangerouslySetInnerHTML={{ __html: (siteContent?.catalogHero?.heroHeadline || 'PRIVATE ARCHIVE').replace(' ', '<br/>') }}
               />
               
               <div className="space-y-12 animate-fade-in opacity-0 delay-700" style={{ animationFillMode: 'forwards' }}>
                  <p className="text-zinc-600 text-xl md:text-2xl font-medium font-serif italic max-w-xl leading-relaxed">
                    "{siteContent?.catalogHero?.heroSubheadline || 'Exquisite masterpieces designed for your aura.'}"
                  </p>
                  
                  {/* Subtle Scroll Indicator */}
                  <div className="pt-10 flex flex-col items-center md:items-start gap-4">
                     <div className="w-px h-16 bg-gradient-to-b from-[#D4AF37] to-transparent animate-scroll-line"></div>
                     <span className="text-[9px] font-black text-[#D4AF37] uppercase tracking-[0.4em]">Scroll to Explore</span>
                  </div>
               </div>
            </div>
         </div>
         
         {/* Vertical Chapter Indicator */}
         <div className="absolute right-10 bottom-20 hidden lg:flex flex-col items-center gap-10 opacity-30 animate-fade-in delay-1000">
            <span className="text-[9px] font-black text-zinc-900 uppercase tracking-[1em] vertical-text">Exhibition Sessions</span>
            <div className="w-[1px] h-32 bg-zinc-900"></div>
         </div>
      </section>

      {/* Sorting & Filter Shell */}
      <div id="explore" className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-zinc-50 py-4 md:py-6">
         <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between gap-4">
            {/* Title - Hidden on small mobile */}
            <div className="hidden sm:flex items-center gap-4 text-zinc-400">
               <SlidersHorizontal size={14} />
               <span className="text-[9px] font-black uppercase tracking-[0.3em]">Curation</span>
            </div>
            
            <div className="flex flex-1 md:flex-none items-center justify-end gap-3 md:gap-8">
               {/* Category Filter */}
               <div className="flex flex-col gap-1 flex-1 md:flex-none max-w-[140px] md:max-w-none">
                  <label className="hidden md:block text-[8px] font-black text-zinc-300 uppercase tracking-widest pl-1">Category</label>
                  <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-zinc-50 md:bg-zinc-100 border-none rounded-lg md:rounded-xl px-3 py-2.5 md:px-6 md:py-3 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-900 appearance-none cursor-pointer focus:ring-1 focus:ring-[#D4AF37] transition-all w-full md:min-w-[180px]"
                  >
                    <option value="all">{lang === 'id' ? 'Kategori' : 'Category'}</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
               </div>

               {/* Package Filter */}
               <div className="flex flex-col gap-1 flex-1 md:flex-none max-w-[140px] md:max-w-none">
                  <label className="hidden md:block text-[8px] font-black text-zinc-300 uppercase tracking-widest pl-1">Package</label>
                  <select 
                    value={selectedPackage}
                    onChange={(e) => setSelectedPackage(e.target.value)}
                    className="bg-zinc-50 md:bg-zinc-100 border-none rounded-lg md:rounded-xl px-3 py-2.5 md:px-6 md:py-3 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-900 appearance-none cursor-pointer focus:ring-1 focus:ring-[#D4AF37] transition-all w-full md:min-w-[180px]"
                  >
                    <option value="all">{lang === 'id' ? 'Pilih Paket' : 'Packages'}</option>
                    {packages.map(p => (
                      <option key={p.id} value={p.id}>{p.name.replace('Paket ', '')}</option>
                    ))}
                  </select>
               </div>
            </div>
         </div>
      </div>

      {/* Structured Chapter Sections */}
      <div className="pb-32">
        {categories
          .filter(cat => selectedCategory === 'all' || cat.name === selectedCategory)
          .map((cat, idx) => {
            const catItems = items.filter(item => {
              const categoryMatch = item.category === cat.name;
              const packageMatch = selectedPackage === 'all' || item.availablePackageIds?.includes(selectedPackage);
              return categoryMatch && packageMatch;
            });
            
            return (
              <CatalogSection 
                key={cat.id} 
                cat={cat} 
                items={catItems} 
                index={idx} 
                getPackageName={getPackageName} 
              />
            );
          })}
        
        {/* Empty State */}
        {categories.filter(cat => {
            const catMatch = selectedCategory === 'all' || cat.name === selectedCategory;
            const hasItems = items.some(item => 
              item.category === cat.name && 
              (selectedPackage === 'all' || item.availablePackageIds?.includes(selectedPackage))
            );
            return catMatch && hasItems;
          }).length === 0 && (
          <div className="py-40 text-center space-y-6">
             <Fingerprint size={60} className="mx-auto text-zinc-100" strokeWidth={0.5} />
             <p className="text-zinc-400 font-serif italic text-xl">No masterpieces found for this selection.</p>
             <button onClick={() => { setSelectedCategory('all'); setSelectedPackage('all'); }} className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.3em] hover:opacity-100 opacity-60 transition-opacity">Reset Filter</button>
          </div>
        )}
      </div>

      {/* Editorial Footer */}
      <footer className="py-40 px-6 bg-zinc-950 flex flex-col items-center gap-16 text-center overflow-hidden relative">
         <div className="absolute inset-0 opacity-5 pointer-events-none grayscale">
            <img src="https://picsum.photos/seed/footer/1920/1080" className="w-full h-full object-cover" />
         </div>
         
         <div className="space-y-6 relative z-10 transition-transform duration-1000 hover:scale-105">
            <Fingerprint size={50} className="mx-auto text-[#D4AF37] opacity-60" strokeWidth={1} />
            <h2 className="text-5xl md:text-7xl font-serif text-white tracking-tighter uppercase">TIMELESS GRACE</h2>
            <div className="w-20 h-[1px] bg-[#D4AF37]/40 mx-auto"></div>
         </div>
         
         <p className="text-white/30 font-medium italic text-lg max-w-xl mx-auto leading-relaxed relative z-10 font-serif">
           "Elegance is the only beauty that never fades. Let us make your wedding timeless."
         </p>
         
         <div className="flex flex-col md:flex-row gap-6 relative z-10">
            <a href="/#/admin" className="px-16 py-7 bg-[#D4AF37] text-white rounded-sm text-[10px] font-black uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(212,175,55,0.3)] hover:bg-[#B8962E] hover:-translate-y-2 transition-all duration-500">
               Schedule Fitting
            </a>
            <a href="/" className="px-16 py-7 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.4em] hover:bg-white hover:text-zinc-950 transition-all duration-500">
               Back to Home
            </a>
         </div>
      </footer>
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .vertical-text {
          writing-mode: vertical-rl;
          text-orientation: mixed;
          transform: rotate(180deg);
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes zoom-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slow-zoom {
          from { transform: scale(1.1); }
          to { transform: scale(1); }
        }
        
        .animate-fade-in { animation: fade-in 1s ease-out forwards; }
        .animate-fade-in-up { animation: fade-in-up 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        .animate-slide-in-left { animation: slide-in-left 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        .animate-zoom-in { animation: zoom-in 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        .animate-slow-zoom { animation: slow-zoom 8s ease-out forwards; }
        
        @keyframes scroll-line {
          0% { transform: scaleY(0); transform-origin: top; opacity: 0; }
          50% { transform: scaleY(1); transform-origin: top; opacity: 1; }
          51% { transform: scaleY(1); transform-origin: bottom; opacity: 1; }
          100% { transform: scaleY(0); transform-origin: bottom; opacity: 0; }
        }
        .animate-scroll-line { animation: scroll-line 3s cubic-bezier(0.19, 1, 0.22, 1) infinite; }

        .delay-300 { animation-delay: 300ms; }
        .delay-700 { animation-delay: 700ms; }
        .delay-1000 { animation-delay: 1000ms; }
      `}</style>
    </div>
  );
};

export default PublicCatalog;
