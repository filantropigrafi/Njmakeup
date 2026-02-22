import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, RefreshCw, User, Phone, MessageSquare, Trash2, CheckCircle2, XCircle, Sparkles, X, MapPin, Instagram, Save, DollarSign, Plus, CreditCard, Edit, FileText, UserCheck } from 'lucide-react';
import { 
  fetchBookings, 
  updateBookingStatus, 
  deleteBooking, 
  addPaymentToBooking, 
  removePaymentFromBooking, 
  addNoteToBooking,
  updateBooking,
  calculateTotalPaid,
  getPaymentStatus 
} from '../services/bookingService';
import { fetchPackages } from '../services/packageService';
import { formatDate } from '../services/whatsappService';
import { Booking, Package, Payment, User as UserType } from '../types';
import InvoicePreview from '../components/InvoicePreview';

interface AdminScheduleProps {
  user: UserType | null;
}

const AdminSchedule: React.FC<AdminScheduleProps> = ({ user }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Confirmed' | 'Cancelled'>('All');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isSavingPayment, setIsSavingPayment] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState('');
  
  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    type: 'dp' as Payment['type'],
    method: 'Transfer',
    note: ''
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    clientName: '',
    clientPhone: '',
    address: '',
    eventDate: '',
    akadTime: '',
    socialMedia: '',
    notes: '',
    packagePrice: 0
  });

  useEffect(() => {
    loadData();
    loadPackages();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const data = await fetchBookings();
    setBookings(data);
    setIsLoading(false);
  };

  const loadPackages = async () => {
    const data = await fetchPackages();
    setPackages(data);
  };

  const getPackageName = (selectedPackageId?: string) => {
    if (!selectedPackageId) return 'Makeup Service';
    const pkg = packages.find(p => p.id === selectedPackageId);
    return pkg ? pkg.name : 'Makeup Service';
  };

  const getPackagePrice = (selectedPackageId?: string) => {
    if (!selectedPackageId) return 0;
    const pkg = packages.find(p => p.id === selectedPackageId);
    return pkg ? pkg.price : 0;
  };

  const handleCardClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setNewNote('');
    setIsEditingNotes(false);
    setShowDetailModal(true);
  };

  const handleEditClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setEditForm({
      clientName: booking.clientName,
      clientPhone: booking.clientPhone,
      address: booking.address || '',
      eventDate: booking.eventDate || '',
      akadTime: booking.akadTime || '',
      socialMedia: booking.socialMedia || '',
      notes: booking.notes || '',
      packagePrice: booking.packagePrice || getPackagePrice(booking.selectedPackage)
    });
    setShowEditModal(true);
  };

  const handleUpdateBooking = async () => {
    if (!selectedBooking) return;
    
    const success = await updateBooking(selectedBooking.id, {
      clientName: editForm.clientName,
      clientPhone: editForm.clientPhone,
      address: editForm.address,
      eventDate: editForm.eventDate,
      akadTime: editForm.akadTime,
      socialMedia: editForm.socialMedia,
      notes: editForm.notes,
      packagePrice: editForm.packagePrice
    });
    
    if (success) {
      await loadData();
      setShowEditModal(false);
      setSelectedBooking(prev => prev ? { 
        ...prev, 
        clientName: editForm.clientName,
        clientPhone: editForm.clientPhone,
        address: editForm.address,
        eventDate: editForm.eventDate,
        akadTime: editForm.akadTime,
        socialMedia: editForm.socialMedia,
        notes: editForm.notes,
        packagePrice: editForm.packagePrice
      } : null);
    }
  };

  const handleStatusChange = async (id: string, status: Booking['status']) => {
    const userName = user?.name || 'Admin';
    const success = await updateBookingStatus(id, status, userName);
    if (success) {
      await loadData();
      if (selectedBooking) {
        setSelectedBooking(prev => prev ? { ...prev, status, lastUpdatedBy: userName } : null);
      }
    }
  };

  const handleAddNote = async () => {
    if (!selectedBooking || !newNote.trim()) return;
    
    setIsSavingNote(true);
    const userName = user?.name || 'Admin';
    const success = await addNoteToBooking(selectedBooking.id, newNote.trim(), userName);
    if (success) {
      await loadData();
      const timestamp = new Date().toLocaleString('id-ID');
      const updatedNotes = selectedBooking.notes 
        ? `${selectedBooking.notes}\n\n[${timestamp}] - ${userName}\n${newNote.trim()}`
        : `[${timestamp}] - ${userName}\n${newNote.trim()}`;
      setSelectedBooking(prev => prev ? { ...prev, notes: updatedNotes, lastUpdatedBy: userName } : null);
      setNewNote('');
    }
    setIsSavingNote(false);
  };

  const handleEditNotes = () => {
    if (!selectedBooking) return;
    setEditedNotes(selectedBooking.notes || '');
    setIsEditingNotes(true);
  };

  const handleSaveEditedNotes = async () => {
    if (!selectedBooking) return;
    
    setIsSavingNote(true);
    const userName = user?.name || 'Admin';
    
    const success = await updateBooking(selectedBooking.id, {
      notes: editedNotes.trim(),
      lastUpdatedBy: userName
    });
    
    if (success) {
      await loadData();
      setSelectedBooking(prev => prev ? { ...prev, notes: editedNotes.trim(), lastUpdatedBy: userName } : null);
      setIsEditingNotes(false);
    }
    setIsSavingNote(false);
  };

  const handleDeleteNotes = async () => {
    if (!selectedBooking) return;
    
    if (!window.confirm('Hapus semua catatan? Tindakan ini tidak dapat dibatalkan.')) return;
    
    setIsSavingNote(true);
    const userName = user?.name || 'Admin';
    
    const success = await updateBooking(selectedBooking.id, {
      notes: '',
      lastUpdatedBy: userName
    });
    
    if (success) {
      await loadData();
      setSelectedBooking(prev => prev ? { ...prev, notes: '', lastUpdatedBy: userName } : null);
    }
    setIsSavingNote(false);
  };

  const handleAddPayment = async () => {
    if (!selectedBooking || paymentForm.amount <= 0) return;
    
    setIsSavingPayment(true);
    const success = await addPaymentToBooking(selectedBooking.id, {
      amount: paymentForm.amount,
      type: paymentForm.type,
      method: paymentForm.method,
      note: paymentForm.note
    });
    
    if (success) {
      await loadData();
      // Refresh selected booking
      const newPayment: Payment = {
        id: `pay_${Date.now()}`,
        amount: paymentForm.amount,
        type: paymentForm.type,
        method: paymentForm.method,
        note: paymentForm.note,
        createdAt: new Date().toISOString()
      };
      setSelectedBooking(prev => prev ? { 
        ...prev, 
        payments: [...(prev.payments || []), newPayment] 
      } : null);
      setPaymentForm({ amount: 0, type: 'dp', method: 'Transfer', note: '' });
      setShowPaymentModal(false);
    }
    setIsSavingPayment(false);
  };

  const handleRemovePayment = async (paymentId: string) => {
    if (!selectedBooking) return;
    
    if (window.confirm('Hapus pembayaran ini?')) {
      const success = await removePaymentFromBooking(selectedBooking.id, paymentId);
      if (success) {
        await loadData();
        setSelectedBooking(prev => prev ? { 
          ...prev, 
          payments: prev.payments?.filter(p => p.id !== paymentId) 
        } : null);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Hapus jadwal ini secara permanen?')) {
      const success = await deleteBooking(id);
      if (success) {
        await loadData();
        setShowDetailModal(false);
        setSelectedBooking(null);
      }
    }
  };

  const filteredBookings = bookings.filter(b => filterStatus === 'All' || b.status === filterStatus);

  const todayStr = new Date().toISOString().split('T')[0];
  const todaySummary = bookings.filter(b => b.date === todayStr && b.status === 'Confirmed');

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'Confirmed': return 'bg-green-500';
      case 'Pending': return 'bg-amber-500';
      case 'Cancelled': return 'bg-zinc-400';
      case 'Completed': return 'bg-blue-500';
      default: return 'bg-zinc-400';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Appointment Schedule</h1>
          <p className="text-sm text-zinc-500">Klik kartu untuk melihat detail jadwal dan pembayaran</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={loadData}
            className="p-2 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <div className="flex bg-white border border-zinc-200 rounded-lg p-1">
            {['All', 'Pending', 'Confirmed'].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s as any)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  filterStatus === s ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Today's Summary Card */}
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 text-white p-5 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37] rounded-full -mr-12 -mt-12 opacity-20"></div>
        <div className="flex items-center justify-between relative z-10">
          <div>
            <h3 className="text-sm font-bold text-[#D4AF37] mb-1">Jadwal Hari Ini</h3>
            <p className="text-2xl font-bold">{todaySummary.length} Appointment</p>
            <p className="text-xs text-zinc-400 mt-1">{formatDate(todayStr, 'id')}</p>
          </div>
          <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center">
            <CalendarIcon size={24} className="text-[#D4AF37]" />
          </div>
        </div>
        {todaySummary.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10 relative z-10">
            <div className="flex flex-wrap gap-2">
              {todaySummary.slice(0, 3).map(b => (
                <div key={b.id} className="bg-white/10 px-3 py-1.5 rounded-lg text-xs">
                  <span className="font-bold">{b.time}</span>
                  <span className="text-zinc-400 ml-2">{b.clientName}</span>
                </div>
              ))}
              {todaySummary.length > 3 && (
                <div className="bg-white/10 px-3 py-1.5 rounded-lg text-xs text-zinc-400">
                  +{todaySummary.length - 3} lainnya
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-zinc-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center">
              <CalendarIcon size={20} className="text-zinc-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900">{bookings.length}</p>
              <p className="text-xs text-zinc-500">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-zinc-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Clock size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900">{bookings.filter(b => b.status === 'Pending').length}</p>
              <p className="text-xs text-zinc-500">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-zinc-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle2 size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900">{bookings.filter(b => b.status === 'Confirmed').length}</p>
              <p className="text-xs text-zinc-500">Confirmed</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-zinc-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <DollarSign size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900">{bookings.filter(b => b.status === 'Confirmed' && getPaymentStatus(b.packagePrice || getPackagePrice(b.selectedPackage), b.payments) === 'Paid').length}</p>
              <p className="text-xs text-zinc-500">Lunas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Cards Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <RefreshCw className="animate-spin text-zinc-300 mb-4" size={40} />
          <p className="text-zinc-400 font-medium">Memuat jadwal...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-zinc-100">
          <CalendarIcon className="text-zinc-200 mb-4" size={48} />
          <p className="text-zinc-400 font-medium">Tidak ada jadwal ditemukan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredBookings.map((booking) => {
            const packagePrice = booking.packagePrice || getPackagePrice(booking.selectedPackage);
            const totalPaid = calculateTotalPaid(booking.payments);
            const paymentStatus = getPaymentStatus(packagePrice, booking.payments);
            
            return (
              <div 
                key={booking.id}
                onClick={() => handleCardClick(booking)}
                className="bg-white rounded-xl border border-zinc-100 shadow-sm hover:shadow-md hover:border-zinc-200 transition-all cursor-pointer overflow-hidden group"
              >
                {/* Status Bar */}
                <div className={`h-1.5 ${getStatusColor(booking.status)}`} />
                
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500">
                        <User size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-900 line-clamp-1">{booking.clientName}</p>
                        <p className="text-[10px] text-zinc-400 font-mono">#{booking.id.slice(-6).toUpperCase()}</p>
                      </div>
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full ${
                      booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                      booking.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 
                      'bg-zinc-100 text-zinc-500'
                    }`}>
                      {booking.status}
                    </span>
                  </div>

                  {/* Date & Time */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <CalendarIcon size={12} />
                      <span>{formatDate(booking.date, 'id')}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <Clock size={12} />
                      <span>{booking.time}</span>
                    </div>
                  </div>

                  {/* Package */}
                  <div className="flex items-center gap-1.5 text-xs text-[#D4AF37] mb-3">
                    <Sparkles size={12} />
                    <span className="font-medium line-clamp-1">{getPackageName(booking.selectedPackage)}</span>
                  </div>

                  {/* Payment Status */}
                  {booking.status === 'Confirmed' && (
                    <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' :
                        paymentStatus === 'Partial' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {paymentStatus}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        {formatCurrency(totalPaid)} / {formatCurrency(packagePrice)}
                      </span>
                    </div>
                  )}

                  {/* Phone */}
                  <div className="flex items-center gap-2 text-xs text-zinc-500 mt-2">
                    <Phone size={12} />
                    <span>{booking.clientPhone}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/80 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-zinc-100 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className={`h-2 ${getStatusColor(selectedBooking.status)}`} />
            <div className="p-5 border-b border-zinc-100 flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold text-zinc-900">{selectedBooking.clientName}</h2>
                <p className="text-xs text-zinc-400 font-mono">#{selectedBooking.id.slice(-6).toUpperCase()}</p>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="text-zinc-400 hover:text-zinc-600 p-1">
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${
                  selectedBooking.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                  selectedBooking.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 
                  'bg-zinc-100 text-zinc-500'
                }`}>
                  {selectedBooking.status === 'Confirmed' ? <CheckCircle2 size={14} /> : 
                   selectedBooking.status === 'Pending' ? <Clock size={14} /> : <XCircle size={14} />}
                  {selectedBooking.status}
                </span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowInvoiceModal(true)}
                    className="text-xs text-[#D4AF37] font-bold flex items-center gap-1 hover:text-zinc-900 bg-[#D4AF37]/10 px-3 py-1.5 rounded-lg hover:bg-[#D4AF37]/20 transition-all"
                  >
                    <FileText size={12} /> Cetak Invoice
                  </button>
                  <button 
                    onClick={() => handleEditClick(selectedBooking)}
                    className="text-xs text-blue-600 font-bold flex items-center gap-1 hover:text-blue-700"
                  >
                    <Edit size={12} /> Edit
                  </button>
                </div>
              </div>

              {/* Date & Time */}
              <div className="bg-zinc-50 rounded-xl p-4 space-y-3">
                <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Jadwal</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <CalendarIcon size={16} className="text-zinc-400" />
                    <div>
                      <p className="text-[10px] text-zinc-400">Tanggal</p>
                      <p className="text-sm font-bold text-zinc-900">{formatDate(selectedBooking.date, 'id')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-zinc-400" />
                    <div>
                      <p className="text-[10px] text-zinc-400">Waktu</p>
                      <p className="text-sm font-bold text-zinc-900">{selectedBooking.time}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Client Info */}
              <div className="bg-zinc-50 rounded-xl p-4 space-y-3">
                <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Info Client</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-zinc-400" />
                    <span className="text-sm font-medium text-zinc-900">{selectedBooking.clientPhone}</span>
                  </div>
                  {selectedBooking.socialMedia && (
                    <div className="flex items-center gap-2">
                      <Instagram size={16} className="text-zinc-400" />
                      <span className="text-sm font-medium text-zinc-900">{selectedBooking.socialMedia}</span>
                    </div>
                  )}
                  {selectedBooking.address && (
                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="text-zinc-400 mt-0.5" />
                      <span className="text-sm text-zinc-700">{selectedBooking.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Package & Price */}
              <div className="bg-zinc-50 rounded-xl p-4 space-y-3">
                <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Paket & Harga</h3>
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-[#D4AF37]" />
                  <span className="text-sm font-bold text-zinc-900">{getPackageName(selectedBooking.selectedPackage)}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-zinc-200">
                  <span className="text-xs text-zinc-500">Harga Paket</span>
                  <span className="text-lg font-bold text-zinc-900">
                    {formatCurrency(selectedBooking.packagePrice || getPackagePrice(selectedBooking.selectedPackage))}
                  </span>
                </div>
              </div>

              {/* Event Details */}
              {(selectedBooking.eventDate || selectedBooking.akadTime) && (
                <div className="bg-zinc-50 rounded-xl p-4 space-y-3">
                  <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Detail Acara</h3>
                  {selectedBooking.eventDate && (
                    <div className="flex items-center gap-2">
                      <CalendarIcon size={16} className="text-zinc-400" />
                      <div>
                        <p className="text-[10px] text-zinc-400">Tanggal Acara</p>
                        <p className="text-sm font-bold text-zinc-900">{formatDate(selectedBooking.eventDate, 'id')}</p>
                      </div>
                    </div>
                  )}
                  {selectedBooking.akadTime && (
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-zinc-400" />
                      <div>
                        <p className="text-[10px] text-zinc-400">Waktu Akad</p>
                        <p className="text-sm font-bold text-zinc-900">{selectedBooking.akadTime}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Payment Section */}
              {selectedBooking.status === 'Confirmed' && (
                <div className="bg-blue-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
                      <CreditCard size={12} /> Pembayaran
                    </h3>
                    <button 
                      onClick={() => setShowPaymentModal(true)}
                      className="text-[10px] font-bold text-blue-600 flex items-center gap-1 hover:text-blue-700"
                    >
                      <Plus size={12} /> Tambah Pembayaran
                    </button>
                  </div>
                  
                  {/* Payment Summary */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white rounded-lg p-2">
                      <p className="text-[10px] text-zinc-400">Total</p>
                      <p className="text-sm font-bold text-zinc-900">{formatCurrency(selectedBooking.packagePrice || getPackagePrice(selectedBooking.selectedPackage))}</p>
                    </div>
                    <div className="bg-white rounded-lg p-2">
                      <p className="text-[10px] text-zinc-400">Terbayar</p>
                      <p className="text-sm font-bold text-green-600">{formatCurrency(calculateTotalPaid(selectedBooking.payments))}</p>
                    </div>
                    <div className="bg-white rounded-lg p-2">
                      <p className="text-[10px] text-zinc-400">Sisa</p>
                      <p className="text-sm font-bold text-amber-600">{formatCurrency((selectedBooking.packagePrice || getPackagePrice(selectedBooking.selectedPackage)) - calculateTotalPaid(selectedBooking.payments))}</p>
                    </div>
                  </div>

                  {/* Payment History */}
                  {selectedBooking.payments && selectedBooking.payments.length > 0 && (
                    <div className="space-y-2 mt-3">
                      <p className="text-[10px] font-bold text-zinc-500">Riwayat Pembayaran:</p>
                      {selectedBooking.payments.map((payment, idx) => (
                        <div key={payment.id} className="bg-white rounded-lg p-3 flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                payment.type === 'dp' ? 'bg-amber-100 text-amber-700' :
                                payment.type === 'final' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                                {payment.type}
                              </span>
                              <span className="text-sm font-bold text-zinc-900">{formatCurrency(payment.amount)}</span>
                            </div>
                            <p className="text-[10px] text-zinc-400 mt-1">
                              {payment.method} • {new Date(payment.createdAt).toLocaleString('id-ID')}
                            </p>
                            {payment.note && <p className="text-[10px] text-zinc-500 italic">{payment.note}</p>}
                          </div>
                          <button 
                            onClick={() => handleRemovePayment(payment.id)}
                            className="text-red-400 hover:text-red-600 p-1"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Existing Notes - View Mode */}
              {selectedBooking.notes && !isEditingNotes && (
                <div className="bg-amber-50 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                      <MessageSquare size={12} /> Catatan
                    </h3>
                    <div className="flex gap-1">
                      <button 
                        onClick={handleEditNotes} 
                        className="text-[10px] text-blue-600 font-bold px-2 py-1 rounded hover:bg-blue-100 transition-all"
                      >
                        <Edit size={12} />
                      </button>
                      <button 
                        onClick={handleDeleteNotes} 
                        className="text-[10px] text-red-600 font-bold px-2 py-1 rounded hover:bg-red-100 transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-amber-900 whitespace-pre-wrap">{selectedBooking.notes}</div>
                </div>
              )}

              {/* Edit Notes Mode */}
              {isEditingNotes && (
                <div className="bg-blue-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
                      <Edit size={12} /> Edit Catatan
                    </h3>
                    <button 
                      onClick={() => setIsEditingNotes(false)} 
                      className="text-[10px] text-zinc-500 font-bold px-2 py-1 rounded hover:bg-zinc-100 transition-all"
                    >
                      Batal
                    </button>
                  </div>
                  <textarea 
                    value={editedNotes}
                    onChange={(e) => setEditedNotes(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                    placeholder="Edit catatan..."
                    rows={4}
                  />
                  <button 
                    onClick={handleSaveEditedNotes}
                    disabled={isSavingNote}
                    className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-50"
                  >
                    {isSavingNote ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                    Simpan Perubahan
                  </button>
                </div>
              )}

              {/* Last Updated By */}
              {selectedBooking.lastUpdatedBy && (
                <div className="bg-green-50 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <UserCheck size={14} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-green-500 uppercase tracking-wider font-bold">Terakhir diperbarui oleh</p>
                    <p className="text-sm font-bold text-green-700">{selectedBooking.lastUpdatedBy}</p>
                  </div>
                </div>
              )}

              {/* Add New Note - Only show when not editing */}
              {!isEditingNotes && (
                <div className="bg-zinc-50 rounded-xl p-4 space-y-3">
                  <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Tambah Catatan</h3>
                  <textarea 
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 resize-none"
                    placeholder="Tulis catatan baru..."
                    rows={2}
                  />
                  <button 
                    onClick={handleAddNote}
                    disabled={!newNote.trim() || isSavingNote}
                    className="w-full py-2 bg-zinc-900 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all disabled:opacity-50"
                  >
                    {isSavingNote ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                    Simpan Catatan
                  </button>
                </div>
              )}

              {/* Quick Status Actions */}
              <div className="space-y-2">
                <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Ubah Status</h3>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => handleStatusChange(selectedBooking.id, 'Pending')}
                    className={`py-2 rounded-lg font-bold text-xs transition-all ${selectedBooking.status === 'Pending' ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}
                  >
                    Pending
                  </button>
                  <button 
                    onClick={() => handleStatusChange(selectedBooking.id, 'Confirmed')}
                    className={`py-2 rounded-lg font-bold text-xs transition-all ${selectedBooking.status === 'Confirmed' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                  >
                    Confirm
                  </button>
                  <button 
                    onClick={() => handleStatusChange(selectedBooking.id, 'Cancelled')}
                    className={`py-2 rounded-lg font-bold text-xs transition-all ${selectedBooking.status === 'Cancelled' ? 'bg-zinc-500 text-white' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'}`}
                  >
                    Cancel
                  </button>
                </div>
              </div>

              {/* Delete Action */}
              <button 
                onClick={() => handleDelete(selectedBooking.id)}
                className="w-full py-2.5 bg-red-50 text-red-600 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-100 transition-all"
              >
                <Trash2 size={16} /> Hapus Jadwal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Payment Modal */}
      {showPaymentModal && selectedBooking && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-zinc-900/80 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-zinc-100">
            <div className="p-5 border-b border-zinc-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-zinc-900">Tambah Pembayaran</h2>
              <button onClick={() => setShowPaymentModal(false)} className="text-zinc-400 hover:text-zinc-600 p-1">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-zinc-50 rounded-xl p-3 text-center">
                <p className="text-[10px] text-zinc-400">Sisa Pembayaran</p>
                <p className="text-xl font-bold text-zinc-900">
                  {formatCurrency((selectedBooking.packagePrice || getPackagePrice(selectedBooking.selectedPackage)) - calculateTotalPaid(selectedBooking.payments))}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Jumlah (Rp) *</label>
                <input 
                  type="number" 
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({...paymentForm, amount: Number(e.target.value)})}
                  className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Tipe Pembayaran</label>
                <select 
                  value={paymentForm.type}
                  onChange={(e) => setPaymentForm({...paymentForm, type: e.target.value as Payment['type']})}
                  className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                >
                  <option value="dp">DP (Uang Muka)</option>
                  <option value="installment">Cicilan</option>
                  <option value="final">Pelunasan</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Metode Pembayaran</label>
                <select 
                  value={paymentForm.method}
                  onChange={(e) => setPaymentForm({...paymentForm, method: e.target.value})}
                  className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                >
                  <option value="Transfer">Transfer Bank</option>
                  <option value="Cash">Cash</option>
                  <option value="QRIS">QRIS</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Catatan (Opsional)</label>
                <input 
                  type="text" 
                  value={paymentForm.note}
                  onChange={(e) => setPaymentForm({...paymentForm, note: e.target.value})}
                  className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                  placeholder="Contoh: Transfer BCA"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-2.5 bg-zinc-100 text-zinc-700 rounded-lg font-bold text-sm hover:bg-zinc-200 transition-all"
                >
                  Batal
                </button>
                <button 
                  onClick={handleAddPayment}
                  disabled={paymentForm.amount <= 0 || isSavingPayment}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                  {isSavingPayment ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Booking Modal */}
      {showEditModal && selectedBooking && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-zinc-900/80 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-zinc-100 max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-zinc-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-zinc-900">Edit Booking</h2>
              <button onClick={() => setShowEditModal(false)} className="text-zinc-400 hover:text-zinc-600 p-1">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Nama Client</label>
                  <input 
                    type="text" 
                    value={editForm.clientName}
                    onChange={(e) => setEditForm({...editForm, clientName: e.target.value})}
                    className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Telepon</label>
                  <input 
                    type="text" 
                    value={editForm.clientPhone}
                    onChange={(e) => setEditForm({...editForm, clientPhone: e.target.value})}
                    className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Alamat</label>
                <input 
                  type="text" 
                  value={editForm.address}
                  onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                  className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Tanggal Acara</label>
                  <input 
                    type="date" 
                    value={editForm.eventDate}
                    onChange={(e) => setEditForm({...editForm, eventDate: e.target.value})}
                    className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Waktu Akad</label>
                  <input 
                    type="text" 
                    value={editForm.akadTime}
                    onChange={(e) => setEditForm({...editForm, akadTime: e.target.value})}
                    className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                    placeholder="08:00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Harga Paket (Rp)</label>
                <input 
                  type="number" 
                  value={editForm.packagePrice}
                  onChange={(e) => setEditForm({...editForm, packagePrice: Number(e.target.value)})}
                  className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Catatan</label>
                <textarea 
                  value={editForm.notes}
                  onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                  className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 bg-zinc-100 text-zinc-700 rounded-lg font-bold text-sm hover:bg-zinc-200 transition-all"
                >
                  Batal
                </button>
                <button 
                  onClick={handleUpdateBooking}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-all"
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Preview Modal */}
      {showInvoiceModal && selectedBooking && (
        <InvoicePreview 
          booking={selectedBooking} 
          onClose={() => setShowInvoiceModal(false)} 
        />
      )}
    </div>
  );
};

export default AdminSchedule;
