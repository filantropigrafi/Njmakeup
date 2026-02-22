
import React, { useState, useEffect } from 'react';
import { 
  Save, 
  User as UserIcon, 
  Globe, 
  Instagram, 
  Phone, 
  MapPin, 
  Mail, 
  Image as ImageIcon,
  Layout,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Cloud,
  Sparkles,
  Heart,
  Type,
  Maximize2
} from 'lucide-react';
import { User, SiteContent } from '../types';
import { fetchSiteContent, updateSiteContent } from '../services/siteService';
import { updateUserProfile, fetchUserProfile } from '../services/userService';
import { getStableImageUrl, isGoogleDriveImageUrl } from '../services/googleDrive';
import GoogleDrivePicker from '../components/GoogleDrivePicker';

interface SettingsProps {
  user: User | null;
}

const AdminSettings: React.FC<SettingsProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'site' | 'catalog' | 'features' | 'profile'>('site');
  const [siteContent, setSiteContent] = useState<SiteContent | null>(null);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    instagram: user?.instagram || ''
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showDrivePicker, setShowDrivePicker] = useState<{ activeField: string } | null>(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setIsLoading(true);
    const content = await fetchSiteContent();
    setSiteContent(content);

    if (user?.id) {
      const profile = await fetchUserProfile(user.id);
      if (profile) {
        setProfileForm({
          name: profile.name || user.name || '',
          phone: profile.phone || '',
          instagram: profile.instagram || ''
        });
      }
    }
    setIsLoading(false);
  };

  const handleSaveSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteContent) return;
    
    setIsSaving(true);
    const success = await updateSiteContent(siteContent);
    setIsSaving(false);
    
    if (success) {
      setMessage({ type: 'success', text: 'Konfigurasi website berhasil disimpan!' });
    } else {
      setMessage({ type: 'error', text: 'Terjadi kesalahan saat menyimpan.' });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    
    setIsSaving(true);
    const success = await updateUserProfile(user.id, profileForm);
    setIsSaving(false);
    
    if (success) {
      setMessage({ type: 'success', text: 'Profil admin diperbarui!' });
    } else {
      setMessage({ type: 'error', text: 'Gagal memperbarui profil.' });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const onDriveSelect = (url: string) => {
    if (!siteContent || !showDrivePicker) return;
    
    const field = showDrivePicker.activeField;
    if (field === 'logoUrl') setSiteContent({ ...siteContent, logoUrl: url });
    if (field === 'heroImageUrl') setSiteContent({ ...siteContent, heroImageUrl: url });
    if (field === 'aboutImageUrl') setSiteContent({ ...siteContent, aboutImageUrl: url });
    if (field === 'catalogHeroUrl') setSiteContent({ ...siteContent, catalogHero: { ...siteContent.catalogHero, heroImageUrl: url } });
    
    setShowDrivePicker(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-40">
        <Loader2 className="animate-spin text-[#D4AF37]" size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <header>
        <h1 className="text-4xl font-serif text-zinc-900 mb-2">Omni-Settings Panel</h1>
        <p className="text-zinc-500 font-medium">Kendali penuh atas seluruh konten publik dan profil studio.</p>
      </header>

      {/* Message Toast */}
      {message && (
        <div className={`fixed bottom-10 right-10 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-fade-in-up ${message.type === 'success' ? 'bg-zinc-900 text-white border-l-4 border-[#D4AF37]' : 'bg-red-500 text-white'}`}>
          {message.type === 'success' ? <CheckCircle2 size={20} className="text-[#D4AF37]" /> : <AlertCircle size={20} />}
          <span className="font-bold text-sm tracking-wide">{message.text}</span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation Sidebar */}
        <aside className="lg:w-72 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 no-scrollbar">
          <button 
            onClick={() => setActiveTab('site')}
            className={`whitespace-nowrap flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'site' ? 'bg-zinc-900 text-white shadow-xl translate-x-1' : 'bg-white text-zinc-400 border border-zinc-100 hover:border-zinc-200'}`}
          >
            <Globe size={16} /> Home Setup
          </button>
          <button 
            onClick={() => setActiveTab('catalog')}
            className={`whitespace-nowrap flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'catalog' ? 'bg-zinc-900 text-white shadow-xl translate-x-1' : 'bg-white text-zinc-400 border border-zinc-100 hover:border-zinc-200'}`}
          >
            <Maximize2 size={16} /> Catalog Hero
          </button>
          <button 
            onClick={() => setActiveTab('features')}
            className={`whitespace-nowrap flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'features' ? 'bg-zinc-900 text-white shadow-xl translate-x-1' : 'bg-white text-zinc-400 border border-zinc-100 hover:border-zinc-200'}`}
          >
            <Sparkles size={16} /> Highlights
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`whitespace-nowrap flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'profile' ? 'bg-zinc-900 text-white shadow-xl translate-x-1' : 'bg-white text-zinc-400 border border-zinc-100 hover:border-zinc-200'}`}
          >
            <UserIcon size={16} /> Admin Profile
          </button>
        </aside>

        {/* Form Area */}
        <main className="flex-1">
          <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-zinc-100 shadow-sm relative overflow-hidden">
             {/* Decorative Background Icon */}
             <div className="absolute top-10 right-10 text-zinc-50 opacity-10 pointer-events-none">
                {activeTab === 'site' && <Globe size={200} />}
                {activeTab === 'catalog' && <Maximize2 size={200} />}
                {activeTab === 'features' && <Sparkles size={200} />}
                {activeTab === 'profile' && <UserIcon size={200} />}
             </div>

            {activeTab === 'site' && siteContent && (
              <form onSubmit={handleSaveSite} className="space-y-12 relative z-10">
                <section className="space-y-8">
                  <div className="flex items-center gap-4 border-b border-zinc-100 pb-4">
                    <div className="p-3 bg-zinc-900 text-[#D4AF37] rounded-xl"><Globe size={20} /></div>
                    <h3 className="font-serif text-2xl text-zinc-900">Landing Page Basics</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block ml-1">Brand Name / Studio</label>
                      <input type="text" value={siteContent.companyName} onChange={e => setSiteContent({...siteContent, companyName: e.target.value})} className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-zinc-900/5 transition-all text-sm font-medium" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block ml-1">Logo Provider</label>
                       <div className="flex gap-2">
                         <input type="text" placeholder="URL Gambar..." value={siteContent.logoUrl || ''} onChange={e => setSiteContent({...siteContent, logoUrl: e.target.value})} className="flex-1 px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none text-sm font-medium" />
                         <button type="button" onClick={() => setShowDrivePicker({ activeField: 'logoUrl' })} className="px-6 bg-[#D4AF37] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-zinc-900 transition-all"><Cloud size={16}/> Drive</button>
                       </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block ml-1">Home Hero Headline</label>
                      <input type="text" value={siteContent.heroHeadline} onChange={e => setSiteContent({...siteContent, heroHeadline: e.target.value})} className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-zinc-900/5 transition-all text-xl font-serif italic" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                       <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block ml-1">Home Hero Image</label>
                       <div className="flex gap-2">
                         <input type="text" value={siteContent.heroImageUrl} onChange={e => setSiteContent({...siteContent, heroImageUrl: e.target.value})} className="flex-1 px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none text-sm font-medium" />
                         <button type="button" onClick={() => setShowDrivePicker({ activeField: 'heroImageUrl' })} className="px-6 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-[#D4AF37] transition-all"><Cloud size={16}/> Cloud</button>
                       </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                       <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block ml-1">About Studio / Story</label>
                       <textarea rows={4} value={siteContent.about} onChange={e => setSiteContent({...siteContent, about: e.target.value})} className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none text-sm font-medium resize-none leading-relaxed" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                       <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block ml-1">About Section Image</label>
                       <div className="flex gap-2">
                         <input type="text" value={siteContent.aboutImageUrl || ''} onChange={e => setSiteContent({...siteContent, aboutImageUrl: e.target.value})} className="flex-1 px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none text-sm font-medium" />
                         <button type="button" onClick={() => setShowDrivePicker({ activeField: 'aboutImageUrl' })} className="px-6 bg-[#D4AF37] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-zinc-900 transition-all"><Cloud size={16}/> NJ Cloud</button>
                       </div>
                    </div>
                  </div>
                </section>

                <section className="space-y-8">
                  <div className="flex items-center gap-4 border-b border-zinc-100 pb-4">
                    <div className="p-3 bg-zinc-50 text-zinc-400 rounded-xl"><Mail size={20} /></div>
                    <h3 className="font-serif text-2xl text-zinc-900">Communication & Contact</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block ml-1">WhatsApp Business</label>
                      <input type="text" value={siteContent.contact.phone} onChange={e => setSiteContent({...siteContent, contact: {...siteContent.contact, phone: e.target.value}})} className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none text-sm font-medium" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block ml-1">Instagram Account</label>
                      <input type="text" value={siteContent.contact.instagram} onChange={e => setSiteContent({...siteContent, contact: {...siteContent.contact, instagram: e.target.value}})} className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none text-sm font-medium" />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block ml-1">Studio Address</label>
                      <textarea rows={2} value={siteContent.contact.address} onChange={e => setSiteContent({...siteContent, contact: {...siteContent.contact, address: e.target.value}})} className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none text-sm font-medium resize-none" />
                    </div>
                  </div>
                </section>
                
                <div className="flex justify-end">
                   <button disabled={isSaving} className="px-12 py-5 bg-zinc-900 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl hover:bg-[#D4AF37] transition-all flex items-center gap-3">
                     {isSaving ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>} Simpan Setup Beranda
                   </button>
                </div>
              </form>
            )}

            {activeTab === 'catalog' && siteContent && (
              <form onSubmit={handleSaveSite} className="space-y-12 relative z-10">
                <section className="space-y-10">
                  <div className="flex items-center gap-4 border-b border-zinc-100 pb-4">
                    <div className="p-3 bg-zinc-900 text-[#D4AF37] rounded-xl"><Maximize2 size={20} /></div>
                    <h3 className="font-serif text-2xl text-zinc-900">Catalog Hero Interaction</h3>
                  </div>
                  
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block ml-1">Hero Title</label>
                      <input type="text" value={siteContent.catalogHero.heroHeadline} onChange={e => setSiteContent({...siteContent, catalogHero: {...siteContent.catalogHero, heroHeadline: e.target.value}})} className="w-full px-10 py-6 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] focus:outline-none focus:ring-4 focus:ring-zinc-900/5 text-3xl font-serif" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block ml-1">Hero Backdrop Image</label>
                       <div className="flex gap-2">
                         <input type="text" value={siteContent.catalogHero.heroImageUrl} onChange={e => setSiteContent({...siteContent, catalogHero: {...siteContent.catalogHero, heroImageUrl: e.target.value}})} className="flex-1 px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none text-sm font-medium" />
                         <button type="button" onClick={() => setShowDrivePicker({ activeField: 'catalogHeroUrl' })} className="px-6 bg-[#D4AF37] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-zinc-900 transition-all"><Cloud size={16}/> NJ Cloud</button>
                       </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block ml-1">Description / Sub-headline</label>
                      <textarea rows={4} value={siteContent.catalogHero.heroSubheadline} onChange={e => setSiteContent({...siteContent, catalogHero: {...siteContent.catalogHero, heroSubheadline: e.target.value}})} className="w-full px-8 py-6 bg-zinc-50 border border-zinc-100 rounded-[2rem] focus:outline-none text-sm font-medium resize-none leading-relaxed" />
                    </div>
                  </div>

                   <div className="p-10 bg-zinc-50 rounded-[3rem] border border-zinc-100">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Live Preview Concept</p>
                      <div className="relative h-48 rounded-3xl overflow-hidden shadow-xl">
                         <img src={isGoogleDriveImageUrl(siteContent.catalogHero.heroImageUrl) ? getStableImageUrl(siteContent.catalogHero.heroImageUrl) : siteContent.catalogHero.heroImageUrl} className="w-full h-full object-cover grayscale" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-6 text-center">
                           <h4 className="text-white font-serif text-2xl">{siteContent.catalogHero.heroHeadline}</h4>
                        </div>
                     </div>
                  </div>
                </section>
                
                <div className="flex justify-end">
                   <button disabled={isSaving} className="px-12 py-5 bg-zinc-900 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl hover:bg-[#D4AF37] transition-all flex items-center gap-3">
                     {isSaving ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>} Update Hero Katalog
                   </button>
                </div>
              </form>
            )}

            {activeTab === 'features' && siteContent && (
              <form onSubmit={handleSaveSite} className="space-y-12 relative z-10">
                <section className="space-y-10">
                  <div className="flex items-center gap-4 border-b border-zinc-100 pb-4">
                    <div className="p-3 bg-zinc-900 text-[#D4AF37] rounded-xl"><Sparkles size={20} /></div>
                    <h3 className="font-serif text-2xl text-zinc-900">Kenapa Harus NJ Makeup?</h3>
                  </div>
                  
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block ml-1">Section Title</label>
                     <input type="text" value={siteContent.features.title} onChange={e => setSiteContent({...siteContent, features: {...siteContent.features, title: e.target.value}})} className="w-full px-8 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none font-serif text-2xl" />
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {siteContent.features.items.map((item, idx) => (
                      <div key={idx} className="p-8 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] relative group">
                        <div className="absolute top-4 right-6 text-zinc-200 font-serif text-4xl italic">0{idx + 1}</div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           <div className="space-y-2">
                             <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Icon Theme</label>
                             <select value={item.icon} onChange={e => {
                               const newItems = [...siteContent.features.items];
                               newItems[idx].icon = e.target.value;
                               setSiteContent({...siteContent, features: {...siteContent.features, items: newItems}});
                             }} className="w-full px-6 py-4 bg-white border border-zinc-100 rounded-xl focus:outline-none text-xs font-bold appearance-none">
                                <option value="Sparkles">Sparkles ✨</option>
                                <option value="Heart">Heart ❤️</option>
                                <option value="CheckCircle2">Checkmark ✅</option>
                                <option value="Award">Award 🏆</option>
                             </select>
                           </div>
                           <div className="md:col-span-2 space-y-2">
                             <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Feature Title</label>
                             <input type="text" value={item.title} onChange={e => {
                               const newItems = [...siteContent.features.items];
                               newItems[idx].title = e.target.value;
                               setSiteContent({...siteContent, features: {...siteContent.features, items: newItems}});
                             }} className="w-full px-6 py-4 bg-white border border-zinc-100 rounded-xl focus:outline-none text-sm font-bold" />
                           </div>
                           <div className="md:col-span-3 space-y-2">
                             <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Small Description</label>
                             <textarea rows={2} value={item.description} onChange={e => {
                               const newItems = [...siteContent.features.items];
                               newItems[idx].description = e.target.value;
                               setSiteContent({...siteContent, features: {...siteContent.features, items: newItems}});
                             }} className="w-full px-6 py-4 bg-white border border-zinc-100 rounded-xl focus:outline-none text-sm font-medium resize-none" />
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
                
                <div className="flex justify-end">
                   <button disabled={isSaving} className="px-12 py-5 bg-zinc-900 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl hover:bg-[#D4AF37] transition-all flex items-center gap-3">
                     {isSaving ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>} Update Highlights
                   </button>
                </div>
              </form>
            )}

            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfile} className="space-y-12 relative z-10">
                 <section className="space-y-8">
                  <div className="flex items-center gap-4 border-b border-zinc-100 pb-4">
                    <div className="p-3 bg-zinc-900 text-[#D4AF37] rounded-xl"><UserIcon size={20} /></div>
                    <h3 className="font-serif text-2xl text-zinc-900">Admin Personal Profile</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block ml-1">Full Name</label>
                      <input type="text" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none text-sm font-medium" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block ml-1">Admin Email</label>
                       <div className="w-full px-6 py-4 bg-zinc-100 border border-zinc-100 rounded-2xl text-zinc-400 text-sm font-medium italic select-none">{user?.email}</div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block ml-1">WhatsApp Primary</label>
                      <input type="text" value={profileForm.phone} placeholder="08..." onChange={e => setProfileForm({...profileForm, phone: e.target.value})} className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none text-sm font-medium" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block ml-1">Instagram (@)</label>
                      <input type="text" value={profileForm.instagram} placeholder="username" onChange={e => setProfileForm({...profileForm, instagram: e.target.value})} className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none text-sm font-medium" />
                    </div>
                  </div>
                </section>

                <div className="pt-10 flex justify-end">
                  <button disabled={isSaving} className="px-12 py-5 bg-zinc-900 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl hover:bg-[#D4AF37] transition-all flex items-center gap-3">
                    {isSaving ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>} Update Profil Saya
                  </button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>

      {showDrivePicker && (
        <GoogleDrivePicker 
          onSelect={onDriveSelect} 
          onClose={() => setShowDrivePicker(null)} 
        />
      )}
    </div>
  );
};

export default AdminSettings;
