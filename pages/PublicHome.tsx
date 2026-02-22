import React from 'react';
import { Sparkles, ArrowRight, Star, Award, Heart, CheckCircle2 } from 'lucide-react';
import { SiteContent, TeamMember } from '../types';
import { translations } from '../translations';
import { getStableImageUrl, isGoogleDriveImageUrl } from '../services/googleDrive';

interface HomeProps {
  siteContent: SiteContent;
  team: TeamMember[];
  lang: 'id' | 'en';
}

const IconMap: { [key: string]: any } = {
  Sparkles,
  Heart,
  CheckCircle2,
  Award
};

const PublicHome: React.FC<HomeProps> = ({ siteContent, team, lang }) => {
  const t = translations[lang].home;

  return (
    <div className="overflow-hidden pt-16">
      {/* Hero Section */}
      <section className="relative h-[95vh] flex items-center justify-center bg-[#FDFBF9]">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <img src={isGoogleDriveImageUrl(siteContent.heroImageUrl) ? getStableImageUrl(siteContent.heroImageUrl) : siteContent.heroImageUrl} alt="Hero bg" className="w-full h-full object-cover grayscale" />
          <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white"></div>
        </div>
        
        <div className="relative z-10 text-center px-6 max-w-5xl">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-[#D4AF37]/5 text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.2em] mb-10 border border-[#D4AF37]/10">
            <Sparkles size={14} />
            <span>{siteContent.tagline}</span>
          </div>
          <h1 
            className="font-serif text-5xl md:text-8xl mb-10 leading-tight tracking-tight text-zinc-900" 
          >
            {siteContent.heroHeadline}
          </h1>
          <p className="text-lg md:text-xl text-zinc-500 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
            {siteContent.heroSubheadline}
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a href="#/booking" className="px-10 py-5 bg-zinc-900 text-white rounded-3xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-zinc-900/20 hover:bg-[#D4AF37] transition-all flex items-center gap-3 justify-center active:scale-95 group">
              {t.ctaBook} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <a href="#/catalog" className="px-10 py-5 bg-white border border-zinc-200 text-zinc-900 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-zinc-50 transition-all flex items-center gap-3 justify-center">
              {t.ctaCatalog}
            </a>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="relative group">
            <div className="absolute -inset-4 border border-[#D4AF37]/20 rounded-[3rem] -z-10 transition-transform group-hover:scale-105 duration-700"></div>
            <img src={isGoogleDriveImageUrl(siteContent?.aboutImageUrl) ? getStableImageUrl(siteContent?.aboutImageUrl) : siteContent?.aboutImageUrl || "https://picsum.photos/seed/njm-about/1000/1200"} alt="About" className="rounded-[2.5rem] shadow-2xl relative z-10 w-full" />
            <div className="absolute -bottom-10 -right-10 bg-[#D4AF37] p-8 rounded-3xl text-white shadow-2xl hidden md:block">
              <p className="text-4xl font-serif mb-1 italic">10+</p>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Years of Glam</p>
            </div>
          </div>
          <div className="space-y-10">
            <div className="space-y-4">
               <h4 className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.3em]">{t.sectionAbout}</h4>
               <h2 className="font-serif text-5xl text-zinc-900 leading-tight">Crafting Your <span className="text-[#D4AF37]">Dream</span> Wedding Vibe</h2>
            </div>
            <p className="text-zinc-500 text-xl leading-relaxed font-medium">
              {siteContent.about}
            </p>
            <div className="flex gap-12 pt-4">
              <div className="space-y-2 border-l-2 border-[#D4AF37]/20 pl-6">
                <span className="text-3xl font-black text-zinc-900">2K+</span>
                <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-black">Happy Brides</p>
              </div>
              <div className="space-y-2 border-l-2 border-[#D4AF37]/20 pl-6">
                <span className="text-3xl font-black text-zinc-900">100%</span>
                <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-black">Satisfaction</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features/Services */}
      <section className="py-32 px-6 bg-[#FDFBF9]">
        <div className="max-w-7xl mx-auto text-center mb-24">
          <h2 className="font-serif text-5xl mb-6 text-zinc-900">{siteContent?.features?.title || 'Why Choose NJ?'}</h2>
          <div className="w-24 h-1 bg-[#D4AF37] mx-auto rounded-full"></div>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          {siteContent?.features?.items?.map((f, i) => {
            const Icon = IconMap[f.icon] || Sparkles;
            return (
              <div key={i} className="bg-white p-12 rounded-[3rem] border border-zinc-100 shadow-sm hover:shadow-2xl hover:shadow-zinc-200/50 transition-all duration-500 group">
                <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center text-[#D4AF37] mb-8 border border-zinc-50 group-hover:bg-[#D4AF37] group-hover:text-white transition-all duration-500">
                  <Icon size={32} />
                </div>
                <h3 className="text-2xl font-black text-zinc-900 mb-4">{f.title}</h3>
                <p className="text-zinc-500 leading-relaxed font-medium">{f.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Team/Meet section as already in Home but refined */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto text-center mb-20">
          <h2 className="font-serif text-5xl mb-6 text-zinc-900">Meet the <span className="text-[#D4AF37] italic">Dream Team</span></h2>
          <p className="text-zinc-400 font-medium tracking-wide">The creative souls behind every transformation</p>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
          {team.map((member) => (
            <div key={member.id} className="text-center group">
              <div className="relative mb-8 inline-block">
                <div className="absolute inset-0 bg-[#D4AF37]/10 rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-all -z-10 blur-xl"></div>
                <img src={isGoogleDriveImageUrl(member.avatar) ? getStableImageUrl(member.avatar) : member.avatar} alt={member.name} className="w-40 h-40 md:w-56 md:h-56 rounded-full object-cover mx-auto ring-8 ring-zinc-50 group-hover:ring-[#D4AF37]/20 transition-all duration-500" />
              </div>
              <h4 className="font-serif text-2xl text-zinc-900 mb-1">{member.name}</h4>
              <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-widest">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-40 bg-zinc-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4AF37] rounded-full -mr-64 -mt-64 opacity-[0.03] blur-3xl"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="flex justify-center gap-1.5 text-[#D4AF37] mb-12">
            {[1,2,3,4,5].map(i => <Star key={i} size={28} fill="currentColor" stroke="none" />)}
          </div>
          <p className="font-serif text-3xl md:text-5xl italic leading-relaxed mb-16 text-zinc-100">
            "NJ Makeup transformed my vision into reality. My setup was breathable and exquisite—I felt truly magical."
          </p>
          <div className="inline-block px-10 py-4 bg-white/5 rounded-full border border-white/5">
             <h5 className="font-black tracking-[0.3em] text-[10px] uppercase text-[#D4AF37]">Sarah & Michael</h5>
             <p className="text-zinc-500 text-[10px] mt-1 font-bold">OCTOBER WEDDING, 2023</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PublicHome;
