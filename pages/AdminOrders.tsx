import React, { useState, useEffect } from 'react';
import { Search, Plus, User, Phone, DollarSign, Tag, RefreshCw, Trash2, CheckCircle2, AlertCircle, X, Calendar, FileText, MessageSquare, Save, Sparkles, CreditCard, UserCheck, Edit } from 'lucide-react';
import { fetchOrders, addOrder, updateOrder, updateOrderStatus, deleteOrder } from '../services/orderService';
import { fetchConfirmedBookings, calculateTotalPaid, getPaymentStatus } from '../services/bookingService';
import { fetchPackages } from '../services/packageService';
import { formatDate } from '../services/whatsappService';
import { Order, Booking, Package, User as UserType } from '../types';

// Interface for combined display item
interface OrderDisplayItem {
  id: string;
  type: 'order' | 'booking';
  clientName: string;
  clientPhone: string;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: 'Unpaid' | 'Partial' | 'Paid';
  date: string;
  items: string[];
  notes?: string;
  lastUpdatedBy?: string;
  originalData: Order | Booking;
}

interface AdminOrdersProps {
  user: UserType | null;
}

const AdminOrders: React.FC<AdminOrdersProps> = ({ user }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [confirmedBookings, setConfirmedBookings] = useState<Booking[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<OrderDisplayItem | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [newNote, setNewNote] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [viewMode, setViewMode] = useState<'all' | 'orders' | 'bookings'>('all');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState('');
  
  // New Order Form State
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    totalAmount: 0,
    dpAmount: 0,
    paymentStatus: 'Unpaid' as Order['paymentStatus'],
    items: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
    loadPackages();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [ordersData, bookingsData] = await Promise.all([
      fetchOrders(),
      fetchConfirmedBookings()
    ]);
    setOrders(ordersData);
    setConfirmedBookings(bookingsData);
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

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const newOrder: Omit<Order, 'id'> = {
      ...formData,
      items: formData.items.split(',').map(i => i.trim()),
      createdAt: new Date().toISOString()
    };
    
    const id = await addOrder(newOrder);
    if (id) {
      await loadData();
      setShowAddModal(false);
      setFormData({ 
        clientName: '', clientPhone: '', totalAmount: 0, dpAmount: 0, 
        paymentStatus: 'Unpaid', items: '', notes: '' 
      });
    }
  };

  const handleCardClick = (item: OrderDisplayItem) => {
    setSelectedItem(item);
    setNewNote('');
    setIsEditingNotes(false);
    setEditedNotes('');
    setShowDetailModal(true);
  };

  const handleEditNotes = () => {
    if (!selectedItem) return;
    setEditedNotes(selectedItem.notes || '');
    setIsEditingNotes(true);
  };

  const handleSaveEditedNotes = async () => {
    if (!selectedItem || selectedItem.type !== 'order') return;
    
    setIsSavingNote(true);
    const order = selectedItem.originalData as Order;
    const userName = user?.name || 'Admin';
    
    const success = await updateOrder(selectedItem.id, {
      clientName: order.clientName,
      clientPhone: order.clientPhone,
      totalAmount: order.totalAmount,
      dpAmount: order.dpAmount || 0,
      paymentStatus: order.paymentStatus,
      items: order.items,
      notes: editedNotes.trim(),
      lastUpdatedBy: userName
    });
    
    if (success) {
      await loadData();
      setSelectedItem(prev => prev ? { ...prev, notes: editedNotes.trim(), lastUpdatedBy: userName } : null);
      setIsEditingNotes(false);
    }
    setIsSavingNote(false);
  };

  const handleDeleteNotes = async () => {
    if (!selectedItem || selectedItem.type !== 'order') return;
    
    if (!window.confirm('Hapus semua catatan? Tindakan ini tidak dapat dibatalkan.')) return;
    
    setIsSavingNote(true);
    const order = selectedItem.originalData as Order;
    const userName = user?.name || 'Admin';
    
    const success = await updateOrder(selectedItem.id, {
      clientName: order.clientName,
      clientPhone: order.clientPhone,
      totalAmount: order.totalAmount,
      dpAmount: order.dpAmount || 0,
      paymentStatus: order.paymentStatus,
      items: order.items,
      notes: '',
      lastUpdatedBy: userName
    });
    
    if (success) {
      await loadData();
      setSelectedItem(prev => prev ? { ...prev, notes: '', lastUpdatedBy: userName } : null);
    }
    setIsSavingNote(false);
  };

  const handleAddNote = async () => {
    if (!selectedItem || selectedItem.type !== 'order' || !newNote.trim()) return;
    
    setIsSavingNote(true);
    const order = selectedItem.originalData as Order;
    const existingNotes = order.notes || '';
    const timestamp = new Date().toLocaleString('id-ID');
    const userName = user?.name || 'Admin';
    const updatedNotes = existingNotes 
      ? `${existingNotes}\n\n[${timestamp}] - ${userName}\n${newNote.trim()}`
      : `[${timestamp}] - ${userName}\n${newNote.trim()}`;
    
    const success = await updateOrder(selectedItem.id, {
      clientName: order.clientName,
      clientPhone: order.clientPhone,
      totalAmount: order.totalAmount,
      dpAmount: order.dpAmount || 0,
      paymentStatus: order.paymentStatus,
      items: order.items,
      notes: updatedNotes,
      lastUpdatedBy: userName
    });
    
    if (success) {
      await loadData();
      setSelectedItem(prev => prev ? { ...prev, notes: updatedNotes, lastUpdatedBy: userName } : null);
      setNewNote('');
    }
    setIsSavingNote(false);
  };

  const handleUpdateStatus = async (id: string, status: Order['paymentStatus']) => {
    const userName = user?.name || 'Admin';
    const success = await updateOrderStatus(id, { paymentStatus: status, lastUpdatedBy: userName });
    if (success) {
      await loadData();
      if (selectedItem && selectedItem.type === 'order') {
        setSelectedItem(prev => prev ? { ...prev, paymentStatus: status, lastUpdatedBy: userName } : null);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Hapus data pesanan ini? Tindakan ini tidak dapat dibatalkan.')) {
      const success = await deleteOrder(id);
      if (success) {
        await loadData();
        setShowDetailModal(false);
        setSelectedItem(null);
      }
    }
  };

  // Convert orders and bookings to display items
  const convertToDisplayItems = (): OrderDisplayItem[] => {
    const orderItems: OrderDisplayItem[] = orders.map(order => ({
      id: order.id,
      type: 'order' as const,
      clientName: order.clientName,
      clientPhone: order.clientPhone,
      totalAmount: order.totalAmount,
      paidAmount: order.dpAmount || 0,
      paymentStatus: order.paymentStatus,
      date: order.createdAt,
      items: order.items,
      notes: order.notes,
      lastUpdatedBy: order.lastUpdatedBy,
      originalData: order
    }));

    const bookingItems: OrderDisplayItem[] = confirmedBookings.map(booking => {
      const packagePrice = booking.packagePrice || getPackagePrice(booking.selectedPackage);
      const totalPaid = calculateTotalPaid(booking.payments);
      const paymentStatus = getPaymentStatus(packagePrice, booking.payments);
      
      return {
        id: booking.id,
        type: 'booking' as const,
        clientName: booking.clientName,
        clientPhone: booking.clientPhone,
        totalAmount: packagePrice,
        paidAmount: totalPaid,
        paymentStatus,
        date: booking.date,
        items: [getPackageName(booking.selectedPackage)],
        notes: booking.notes,
        originalData: booking
      };
    });

    return [...orderItems, ...bookingItems];
  };

  // Filter items
  const getFilteredItems = () => {
    let allItems = convertToDisplayItems();

    // Filter by view mode
    if (viewMode === 'orders') {
      allItems = allItems.filter(item => item.type === 'order');
    } else if (viewMode === 'bookings') {
      allItems = allItems.filter(item => item.type === 'booking');
    }

    // Filter by payment status
    if (filterStatus !== 'all') {
      allItems = allItems.filter(item => item.paymentStatus === filterStatus);
    }

    // Filter by search
    if (search) {
      allItems = allItems.filter(item => 
        item.clientName.toLowerCase().includes(search.toLowerCase()) ||
        item.id.toLowerCase().includes(search.toLowerCase()) ||
        item.clientPhone.includes(search)
      );
    }

    // Sort by date
    return allItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const filteredItems = getFilteredItems();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-500';
      case 'Partial': return 'bg-amber-500';
      default: return 'bg-red-500';
    }
  };

  // Calculate totals
  const totalRevenue = orders.reduce((acc, o) => acc + o.totalAmount, 0) + 
    confirmedBookings.reduce((acc, b) => acc + (b.packagePrice || getPackagePrice(b.selectedPackage)), 0);
  const totalPaid = orders.reduce((acc, o) => acc + (o.dpAmount || 0), 0) + 
    confirmedBookings.reduce((acc, b) => acc + calculateTotalPaid(b.payments), 0);
  const totalUnpaid = totalRevenue - totalPaid;

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Order & Omzet</h1>
          <p className="text-sm text-zinc-500">Transaksi dari pesanan manual dan booking yang dikonfirmasi</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={loadData}
            className="p-2 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-bold shadow-lg shadow-zinc-900/20 active:scale-95 transition-all"
          >
            <Plus size={18} /> Order Manual
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-zinc-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center">
              <FileText size={20} className="text-zinc-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900">{orders.length + confirmedBookings.length}</p>
              <p className="text-xs text-zinc-500">Total Transaksi</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-zinc-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <DollarSign size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-zinc-900">{formatCurrency(totalRevenue)}</p>
              <p className="text-xs text-zinc-500">Total Omzet</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-zinc-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <CreditCard size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-zinc-900">{formatCurrency(totalPaid)}</p>
              <p className="text-xs text-zinc-500">Terbayar</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-zinc-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertCircle size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-zinc-900">{formatCurrency(totalUnpaid)}</p>
              <p className="text-xs text-zinc-500">Belum Terbayar</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl border border-zinc-100 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama, telepon, atau ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all" 
            />
          </div>
          <select 
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as any)}
            className="px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
          >
            <option value="all">Semua Sumber</option>
            <option value="orders">Order Manual</option>
            <option value="bookings">Dari Booking</option>
          </select>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
          >
            <option value="all">Semua Status</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Partial">DP</option>
            <option value="Paid">Lunas</option>
          </select>
        </div>
      </div>

      {/* Order Cards Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <RefreshCw className="animate-spin text-zinc-300 mb-4" size={40} />
          <p className="text-zinc-400 font-medium">Memuat data...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-zinc-100">
          <DollarSign className="text-zinc-200 mb-4" size={48} />
          <p className="text-zinc-400 font-medium">Tidak ada transaksi ditemukan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <div 
              key={`${item.type}-${item.id}`}
              onClick={() => handleCardClick(item)}
              className="bg-white rounded-xl border border-zinc-100 shadow-sm hover:shadow-md hover:border-zinc-200 transition-all cursor-pointer overflow-hidden group"
            >
              {/* Status Bar */}
              <div className={`h-1.5 ${getStatusColor(item.paymentStatus)}`} />
              
              <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${item.type === 'booking' ? 'bg-blue-100 text-blue-600' : 'bg-zinc-100 text-zinc-500'}`}>
                      {item.type === 'booking' ? <Sparkles size={16} /> : <User size={16} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-900 line-clamp-1">{item.clientName}</p>
                      <p className="text-[10px] text-zinc-400 font-mono">#{item.id.slice(-6).toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      item.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' :
                      item.paymentStatus === 'Partial' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {item.paymentStatus}
                    </span>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                      item.type === 'booking' ? 'bg-blue-50 text-blue-600' : 'bg-zinc-100 text-zinc-500'
                    }`}>
                      {item.type === 'booking' ? 'BOOKING' : 'MANUAL'}
                    </span>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-2 text-xs text-zinc-500 mb-3">
                  <Phone size={12} />
                  <span>{item.clientPhone}</span>
                </div>

                {/* Items */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.items.slice(0, 2).map((itemText, idx) => (
                    <span key={idx} className="text-[9px] font-medium bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded">
                      {itemText}
                    </span>
                  ))}
                  {item.items.length > 2 && (
                    <span className="text-[9px] font-medium bg-zinc-100 text-zinc-400 px-2 py-0.5 rounded">
                      +{item.items.length - 2}
                    </span>
                  )}
                </div>

                {/* Amount */}
                <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
                  <div>
                    <p className="text-[10px] text-zinc-400">Total</p>
                    <p className="text-sm font-bold text-zinc-900">{formatCurrency(item.totalAmount)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-zinc-400">Terbayar</p>
                    <p className="text-sm font-bold text-green-600">{formatCurrency(item.paidAmount)}</p>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-center gap-1.5 mt-3 text-[10px] text-zinc-400">
                  <Calendar size={10} />
                  <span>{formatDate(item.date, 'id')}</span>
                </div>

                {/* Notes indicator */}
                {item.notes && (
                  <div className="flex items-center gap-1.5 mt-2 text-[10px] text-blue-500">
                    <MessageSquare size={10} />
                    <span>Ada catatan</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Order Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/80 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-zinc-100 max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
              <h2 className="text-lg font-bold text-zinc-900">Order Manual Baru</h2>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-zinc-600 p-1">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateOrder} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Nama Client *</label>
                  <input required type="text" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10" placeholder="Nama lengkap" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">WhatsApp *</label>
                  <input required type="tel" value={formData.clientPhone} onChange={e => setFormData({...formData, clientPhone: e.target.value})} className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10" placeholder="08..." />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Items (pisah koma) *</label>
                <input required type="text" value={formData.items} onChange={e => setFormData({...formData, items: e.target.value})} className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10" placeholder="Makeup, Dress, Aksesoris" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Total (Rp) *</label>
                  <input required type="number" value={formData.totalAmount} onChange={e => setFormData({...formData, totalAmount: Number(e.target.value)})} className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10" placeholder="0" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">DP (Rp)</label>
                  <input type="number" value={formData.dpAmount} onChange={e => setFormData({...formData, dpAmount: Number(e.target.value)})} className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10" placeholder="0" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Status Pembayaran</label>
                <select value={formData.paymentStatus} onChange={e => setFormData({...formData, paymentStatus: e.target.value as any})} className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10">
                  <option value="Unpaid">Unpaid (Belum Bayar)</option>
                  <option value="Partial">Partial (Sudah DP)</option>
                  <option value="Paid">Paid (Lunas)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Catatan Awal</label>
                <textarea 
                  value={formData.notes} 
                  onChange={e => setFormData({...formData, notes: e.target.value})} 
                  className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 resize-none" 
                  placeholder="Catatan tambahan..."
                  rows={2}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 bg-zinc-100 text-zinc-700 rounded-lg font-bold text-sm hover:bg-zinc-200 transition-all">
                  Batal
                </button>
                <button type="submit" className="flex-1 py-2.5 bg-zinc-900 text-white rounded-lg font-bold text-sm shadow-lg hover:bg-zinc-800 transition-all">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/80 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-zinc-100 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className={`h-2 ${getStatusColor(selectedItem.paymentStatus)}`} />
            <div className="p-5 border-b border-zinc-100 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-zinc-900">{selectedItem.clientName}</h2>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                    selectedItem.type === 'booking' ? 'bg-blue-50 text-blue-600' : 'bg-zinc-100 text-zinc-500'
                  }`}>
                    {selectedItem.type === 'booking' ? 'DARI BOOKING' : 'ORDER MANUAL'}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 font-mono">#{selectedItem.id.slice(-6).toUpperCase()}</p>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="text-zinc-400 hover:text-zinc-600 p-1">
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${
                  selectedItem.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' :
                  selectedItem.paymentStatus === 'Partial' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                }`}>
                  {selectedItem.paymentStatus === 'Paid' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                  {selectedItem.paymentStatus}
                </span>
                <p className="text-xs text-zinc-400">{formatDate(selectedItem.date, 'id')}</p>
              </div>

              {/* Client Info */}
              <div className="bg-zinc-50 rounded-xl p-4 space-y-3">
                <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Info Client</h3>
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-zinc-400" />
                  <span className="text-sm font-medium text-zinc-900">{selectedItem.clientPhone}</span>
                </div>
              </div>

              {/* Items */}
              <div className="bg-zinc-50 rounded-xl p-4 space-y-3">
                <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Items / Layanan</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedItem.items.map((item, idx) => (
                    <span key={idx} className="text-xs font-medium bg-white border border-zinc-200 text-zinc-700 px-3 py-1.5 rounded-lg flex items-center gap-1">
                      <Tag size={10} /> {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Financials */}
              <div className="bg-zinc-50 rounded-xl p-4 space-y-3">
                <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Keuangan</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-zinc-400">Total</p>
                    <p className="text-lg font-bold text-zinc-900">{formatCurrency(selectedItem.totalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-400">Terbayar</p>
                    <p className="text-lg font-bold text-green-600">{formatCurrency(selectedItem.paidAmount)}</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-zinc-200">
                  <p className="text-[10px] text-zinc-400">Sisa Pembayaran</p>
                  <p className="text-base font-bold text-amber-600">{formatCurrency(selectedItem.totalAmount - selectedItem.paidAmount)}</p>
                </div>
              </div>

              {/* Existing Notes */}
              {selectedItem.notes && !isEditingNotes && (
                <div className="bg-blue-50 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
                      <MessageSquare size={12} /> Catatan
                    </h3>
                    {selectedItem.type === 'order' && (
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
                    )}
                  </div>
                  <div className="text-sm text-blue-900 whitespace-pre-wrap">{selectedItem.notes}</div>
                </div>
              )}

              {/* Edit Notes Mode */}
              {isEditingNotes && selectedItem.type === 'order' && (
                <div className="bg-blue-50 rounded-xl p-4 space-y-3">
                  <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
                    <Edit size={12} /> Edit Catatan
                  </h3>
                  <textarea 
                    value={editedNotes}
                    onChange={(e) => setEditedNotes(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 resize-none"
                    rows={4}
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setIsEditingNotes(false)}
                      className="flex-1 py-2 bg-zinc-200 text-zinc-700 rounded-lg font-bold text-sm hover:bg-zinc-300 transition-all"
                    >
                      Batal
                    </button>
                    <button 
                      onClick={handleSaveEditedNotes}
                      disabled={isSavingNote}
                      className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-50"
                    >
                      {isSavingNote ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                      Simpan
                    </button>
                  </div>
                </div>
              )}

              {/* Last Updated By */}
              {selectedItem.lastUpdatedBy && selectedItem.type === 'order' && (
                <div className="bg-green-50 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <UserCheck size={14} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-green-500 uppercase tracking-wider font-bold">Terakhir diperbarui oleh</p>
                    <p className="text-sm font-bold text-green-700">{selectedItem.lastUpdatedBy}</p>
                  </div>
                </div>
              )}

              {/* Add New Note - Only for manual orders */}
              {selectedItem.type === 'order' && !isEditingNotes && (
                <div className="bg-zinc-50 rounded-xl p-4 space-y-3">
                  <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Tambah Catatan Baru</h3>
                  <textarea 
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 resize-none"
                    placeholder="Tulis catatan khusus untuk order ini..."
                    rows={2}
                  />
                  <button 
                    onClick={handleAddNote}
                    disabled={!newNote.trim() || isSavingNote}
                    className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSavingNote ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <Save size={14} />
                    )}
                    Simpan Catatan
                  </button>
                </div>
              )}

              {/* Quick Status Actions - Only for manual orders */}
              {selectedItem.type === 'order' && (
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Ubah Status Pembayaran</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      onClick={() => handleUpdateStatus(selectedItem.id, 'Unpaid')}
                      className={`py-2 rounded-lg font-bold text-xs transition-all ${selectedItem.paymentStatus === 'Unpaid' ? 'bg-red-500 text-white' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                    >
                      Unpaid
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(selectedItem.id, 'Partial')}
                      className={`py-2 rounded-lg font-bold text-xs transition-all ${selectedItem.paymentStatus === 'Partial' ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}
                    >
                      DP
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(selectedItem.id, 'Paid')}
                      className={`py-2 rounded-lg font-bold text-xs transition-all ${selectedItem.paymentStatus === 'Paid' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                    >
                      Lunas
                    </button>
                  </div>
                </div>
              )}

              {/* Info for booking type */}
              {selectedItem.type === 'booking' && (
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-blue-600">
                    💡 Pembayaran dan catatan untuk booking dapat diubah di menu <strong>Appointment Schedule</strong>
                  </p>
                </div>
              )}

              {/* Delete Action - Only for manual orders */}
              {selectedItem.type === 'order' && (
                <button 
                  onClick={() => handleDelete(selectedItem.id)}
                  className="w-full py-2.5 bg-red-50 text-red-600 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-100 transition-all"
                >
                  <Trash2 size={16} /> Hapus Order
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
