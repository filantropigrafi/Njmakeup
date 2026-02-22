import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, MessageSquare, CheckCircle2, UserCheck, Loader2, ArrowLeft, MapPin, Instagram, Check, Sparkles, AlertCircle } from 'lucide-react';
import { addBooking, fetchConfirmedBookings } from '../services/bookingService';
import { fetchPackages } from '../services/packageService';
import { Booking, Package } from '../types';
import { translations } from '../translations';
import BookingCalendar from '../components/BookingCalendar';

interface BookingProps {
  lang: 'id' | 'en';
}

const PublicBooking: React.FC<BookingProps> = ({ lang }) => {
  const t = translations[lang].booking;
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);
  const [confirmedBookings, setConfirmedBookings] = useState<any[]>([]);
  
  // Form State
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    address: '',
    eventDate: '',
    akadTime: '',
    socialMedia: '',
    hennaBy: 'existing' as 'existing' | 'nj',
    selectedPackage: '',
    date: '',
    time: '10:00',
    notes: ''
  });

  useEffect(() => {
    loadConfirmed();
    loadPackages();
  }, [lang]);

  const loadConfirmed = async () => {
    const data = await fetchConfirmedBookings();
    setConfirmedBookings(data);
  };

  const loadPackages = async () => {
    setIsLoadingPackages(true);
    const data = await fetchPackages();
    setPackages(data);
    setIsLoadingPackages(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowReminderModal(true);
  };

  const confirmBooking = async () => {
    setIsLoading(true);
    const newBooking = {
      ...formData,
      status: 'Pending' as const
    };
    
    const id = await addBooking(newBooking, lang);
    if (id) {
      setSubmitted(true);
      setShowReminderModal(false);
    }
    setIsLoading(false);
  };

  // Reminder Modal
  if (showReminderModal) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center">
                <AlertCircle className="text-amber-600" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900">{t.reminder.title}</h2>
            </div>
            
            <div className="space-y-6 text-zinc-700">
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
                <p className="font-medium">{t.reminder.locationReminder}</p>
              </div>
              
              <div>
                <h3 className="font-bold text-lg mb-3">{t.reminder.notes}</h3>
                <ul className="space-y-2">
                  <li className="text-sm">{t.reminder.minDp}</li>
                  <li className="text-sm">{t.reminder.maxPayment}</li>
                  <li className="text-sm">{t.reminder.maxReturn}</li>
                  <li className="text-sm">{t.reminder.stopWhitening}</li>
                  <li className="text-sm">{t.reminder.noLulur}</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-bold text-lg mb-3">{t.reminder.prepareTitle}</h3>
                <ul className="space-y-2">
                  {t.reminder.prepareItems.map((item, index) => (
                    <li key={index} className="text-sm">{item}</li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowReminderModal(false)}
                className="flex-1 py-3 bg-zinc-100 text-zinc-700 rounded-2xl font-bold hover:bg-zinc-200 transition-colors"
              >
                {t.reminder.cancel}
              </button>
              <button
                onClick={confirmBooking}
                disabled={isLoading}
                className="flex-1 py-3 bg-[#D4AF37] text-white rounded-2xl font-bold hover:bg-[#B8941F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                {t.reminder.confirm}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF9] p-4">
        <div className="max-w-md w-full text-center p-12 bg-white rounded-[3rem] shadow-2xl border border-zinc-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-[#D4AF37]"></div>
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-10 text-green-500">
            <CheckCircle2 size={56} />
          </div>
          <h2 className="font-serif text-4xl mb-6 text-zinc-900 leading-tight">{t.successTitle}</h2>
          <p className="text-zinc-500 mb-10 leading-relaxed font-medium">
            {t.successSub}
          </p>
          <div className="space-y-4">
            <button 
              onClick={() => {
                setSubmitted(false);
                setFormData({ 
                  clientName: '', 
                  clientPhone: '', 
                  address: '',
                  eventDate: '',
                  akadTime: '',
                  socialMedia: '',
                  hennaBy: 'existing',
                  selectedPackage: '',
                  date: '', 
                  time: '10:00', 
                  notes: ''
                });
              }}
              className="w-full py-5 bg-zinc-900 text-white rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl shadow-zinc-900/20 active:scale-95 transition-all"
            >
              {t.another}
            </button>
            <a 
              href="#/"
              className="block w-full py-5 bg-white border border-zinc-200 text-zinc-900 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-zinc-50 transition-all active:scale-95"
            >
              {t.backHome}
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF9] py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Left: Schedule Info & Filled Slots */}
          <div className="lg:col-span-12 xl:col-span-5 space-y-12">
            <div className="space-y-4">
               <div className="w-12 h-1 bg-[#D4AF37] rounded-full"></div>
               <h1 className="font-serif text-5xl md:text-6xl text-zinc-900 leading-tight" dangerouslySetInnerHTML={{ __html: t.title }} />
               <p className="text-zinc-500 text-lg leading-relaxed font-medium">
                 {t.sub}
               </p>
            </div>

            {/* Booking Calendar */}
            <BookingCalendar
              bookings={confirmedBookings}
              selectedDate={formData.date}
              onDateSelect={(date) => setFormData({...formData, date})}
              lang={lang}
            />
            
            <div className="p-10 bg-zinc-900 rounded-[2.5rem] text-white shadow-2xl shadow-zinc-900/30 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37] rounded-full -mr-16 -mt-16 opacity-[0.05] group-hover:scale-150 transition-transform duration-1000"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                   <Clock size={24} className="text-[#D4AF37]" />
                   <h4 className="font-serif text-2xl">{t.hours}</h4>
                </div>
                <div className="space-y-4 font-medium">
                  <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                    <span className="text-zinc-400 text-sm">Monday - Friday</span> 
                    <span className="text-white font-black text-sm tracking-widest">09:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                    <span className="text-zinc-400 text-sm">Saturday - Sunday</span> 
                    <span className="text-[#D4AF37] font-black text-sm tracking-widest">10:00 - 16:00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Booking Form */}
          <div className="lg:col-span-12 xl:col-span-7 bg-white p-10 md:p-20 rounded-[4rem] shadow-2xl shadow-zinc-200/50 border border-zinc-100 xl:sticky xl:top-24">
            <div className="mb-12">
              <h3 className="font-serif text-4xl mb-4 text-zinc-900 tracking-tight">
                {t.formTitle}
              </h3>
              <p className="text-zinc-400 font-medium">{t.formSub}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Basic Info */}
              <div className="space-y-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] block ml-1">{t.labels.name}</label>
                  <div className="relative group">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-[#D4AF37] transition-all" size={20} />
                    <input 
                      required 
                      type="text" 
                      value={formData.clientName}
                      onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                      className="w-full pl-16 pr-6 py-5 bg-zinc-50 border border-zinc-100 focus:border-[#D4AF37]/30 focus:bg-white rounded-[1.5rem] focus:outline-none transition-all placeholder:text-zinc-300 font-medium" 
                      placeholder="e.g. Siti Aminah" 
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] block ml-1">{t.labels.phone}</label>
                  <div className="relative group">
                    <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-[#D4AF37] transition-all" size={20} />
                    <input 
                      required 
                      type="tel" 
                      value={formData.clientPhone}
                      onChange={(e) => setFormData({...formData, clientPhone: e.target.value})}
                      className="w-full pl-16 pr-6 py-5 bg-zinc-50 border border-zinc-100 focus:border-[#D4AF37]/30 focus:bg-white rounded-[1.5rem] focus:outline-none transition-all placeholder:text-zinc-300 font-medium" 
                      placeholder="081234..." 
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] block ml-1">{t.labels.address}</label>
                  <div className="relative group">
                    <MapPin className="absolute left-6 top-6 text-zinc-300 group-focus-within:text-[#D4AF37] transition-all" size={20} />
                    <textarea 
                      rows={2} 
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full pl-16 pr-6 py-6 bg-zinc-50 border border-zinc-100 focus:border-[#D4AF37]/30 focus:bg-white rounded-[1.5rem] focus:outline-none transition-all placeholder:text-zinc-300 resize-none font-medium" 
                      placeholder={lang === 'id' ? "Alamat lengkap Anda..." : "Your full address..."}
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div className="space-y-10">
                <h4 className="font-serif text-xl text-zinc-900">{t.eventDetails}</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] block ml-1">{t.labels.eventDate}</label>
                    <div className="relative group">
                      <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-[#D4AF37] transition-all" size={20} />
                      <input 
                        required 
                        type="date" 
                        value={formData.eventDate}
                        onChange={(e) => setFormData({...formData, eventDate: e.target.value})}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full pl-16 pr-6 py-5 bg-zinc-50 border border-zinc-100 focus:border-[#D4AF37]/30 focus:bg-white rounded-[1.5rem] focus:outline-none transition-all font-medium" 
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] block ml-1">{t.labels.akadTime}</label>
                    <div className="relative group">
                      <Clock className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-[#D4AF37] transition-all" size={20} />
                      <input 
                        required 
                        type="time" 
                        value={formData.akadTime}
                        onChange={(e) => setFormData({...formData, akadTime: e.target.value})}
                        className="w-full pl-16 pr-6 py-5 bg-zinc-50 border border-zinc-100 focus:border-[#D4AF37]/30 focus:bg-white rounded-[1.5rem] focus:outline-none transition-all font-medium" 
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] block ml-1">{t.labels.socialMedia}</label>
                  <div className="relative group">
                    <Instagram className="absolute left-6 top-6 text-zinc-300 group-focus-within:text-[#D4AF37] transition-all" size={20} />
                    <input 
                      type="text" 
                      value={formData.socialMedia}
                      onChange={(e) => setFormData({...formData, socialMedia: e.target.value})}
                      className="w-full pl-16 pr-6 py-5 bg-zinc-50 border border-zinc-100 focus:border-[#D4AF37]/30 focus:bg-white rounded-[1.5rem] focus:outline-none transition-all placeholder:text-zinc-300 font-medium" 
                      placeholder="@username Instagram" 
                    />
                  </div>
                </div>
              </div>

              {/* Henna Selection */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] block ml-1">{t.labels.hennaBy}</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, hennaBy: 'existing'})}
                    className={`px-6 py-5 rounded-2xl border-2 transition-all font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 ${
                      formData.hennaBy === 'existing' 
                        ? 'border-[#D4AF37] bg-[#D4AF37] text-white shadow-lg shadow-[#D4AF37]/20 scale-105' 
                        : 'border-zinc-50 bg-zinc-50/50 text-zinc-400 hover:border-zinc-100 hover:text-zinc-600'
                    }`}
                  >
                    <Check size={16} className={formData.hennaBy === 'existing' ? 'text-white' : 'text-zinc-400'} />
                    {t.hennaExisting}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, hennaBy: 'nj'})}
                    className={`px-6 py-5 rounded-2xl border-2 transition-all font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 ${
                      formData.hennaBy === 'nj' 
                        ? 'border-[#D4AF37] bg-[#D4AF37] text-white shadow-lg shadow-[#D4AF37]/20 scale-105' 
                        : 'border-zinc-50 bg-zinc-50/50 text-zinc-400 hover:border-zinc-100 hover:text-zinc-600'
                    }`}
                  >
                    <Check size={16} className={formData.hennaBy === 'nj' ? 'text-white' : 'text-zinc-400'} />
                    {t.hennaByNJ}
                  </button>
                </div>
              </div>

              {/* Booking Schedule */}
              <div className="space-y-10">
                <h4 className="font-serif text-xl text-zinc-900">{t.bookingSchedule}</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] block ml-1">{t.labels.bookingDate}</label>
                    <div className="relative group">
                      <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-[#D4AF37] transition-all" size={20} />
                      <input 
                        required 
                        type="date" 
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full pl-16 pr-6 py-5 bg-zinc-50 border border-zinc-100 focus:border-[#D4AF37]/30 focus:bg-white rounded-[1.5rem] focus:outline-none transition-all font-medium" 
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] block ml-1">{t.labels.time}</label>
                    <div className="relative group">
                      <Clock className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-[#D4AF37] transition-all" size={20} />
                      <input 
                        required 
                        type="time" 
                        value={formData.time}
                        onChange={(e) => setFormData({...formData, time: e.target.value})}
                        className="w-full pl-16 pr-6 py-5 bg-zinc-50 border border-zinc-100 focus:border-[#D4AF37]/30 focus:bg-white rounded-[1.5rem] focus:outline-none transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] block ml-1">{t.labels.interest}</label>
                  {isLoadingPackages ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="animate-spin text-[#D4AF37] mr-3" size={20} />
                      <span className="text-zinc-400 text-sm">{lang === 'id' ? 'Memuat paket...' : 'Loading packages...'}</span>
                    </div>
                  ) : packages.length > 0 ? (
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                      {packages.map((pkg) => (
                        <button
                          key={pkg.id}
                          type="button"
                          onClick={() => setFormData({...formData, selectedPackage: pkg.id})}
                          className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
                            formData.selectedPackage === pkg.id 
                              ? 'border-[#D4AF37] bg-[#D4AF37]/5 text-zinc-900 shadow-lg' 
                              : 'border-zinc-50 bg-zinc-50/50 text-zinc-600 hover:border-zinc-100 hover:bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                                  formData.selectedPackage === pkg.id ? 'bg-[#D4AF37] text-white' : 'bg-zinc-200 text-zinc-500'
                                }`}>
                                  <Sparkles size={16} />
                                </div>
                                <h4 className="font-bold text-zinc-900">{pkg.name}</h4>
                              </div>
                              <p className="text-sm text-zinc-500 italic mb-2">"{pkg.description}"</p>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-zinc-300 uppercase tracking-widest">Rp</span>
                                <span className="text-lg font-black text-zinc-900">{(pkg.price / 1000).toLocaleString()}k</span>
                                <span className="text-xs text-zinc-400">{lang === 'id' ? 'sesi' : 'session'}</span>
                              </div>
                              {pkg.include && pkg.include.length > 0 && (
                                <div className="mt-3">
                                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                                    {lang === 'id' ? 'Termasuk:' : 'Includes:'}
                                  </span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {pkg.include.slice(0, 3).map((item, i) => (
                                      <span key={i} className="text-[10px] bg-zinc-100 text-zinc-600 px-2 py-1 rounded-full">
                                        {item}
                                      </span>
                                    ))}
                                    {pkg.include.length > 3 && (
                                      <span className="text-[10px] bg-zinc-100 text-zinc-600 px-2 py-1 rounded-full">
                                        +{pkg.include.length - 3} {lang === 'id' ? 'lagi' : 'more'}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-zinc-400">
                      <Sparkles size={32} className="mx-auto mb-3 text-zinc-200" />
                      <p className="text-sm">{lang === 'id' ? 'Belum ada paket tersedia' : 'No packages available'}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] block ml-1">{t.labels.notes}</label>
                <div className="relative group">
                  <MessageSquare className="absolute left-6 top-6 text-zinc-300 group-focus-within:text-[#D4AF37] transition-all" size={20} />
                  <textarea 
                    rows={4} 
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full pl-16 pr-6 py-6 bg-zinc-50 border border-zinc-100 focus:border-[#D4AF37]/30 focus:bg-white rounded-[1.5rem] focus:outline-none transition-all placeholder:text-zinc-300 resize-none font-medium" 
                    placeholder={lang === 'id' ? "Kasih tau kita wedding theme kamu atau gaun yang pengen dicoba..." : "Tell us about your wedding theme or specific gowns you want to try..."}
                  ></textarea>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-6 bg-zinc-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-zinc-900/30 hover:bg-[#D4AF37] transition-all disabled:opacity-50 flex items-center justify-center gap-4 active:scale-[0.98] group mt-6"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <>
                    {t.submit}
                    <CheckCircle2 className="group-hover:rotate-12 transition-transform" size={20} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicBooking;
