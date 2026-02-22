import React, { useEffect, useState } from 'react';
import { X, Printer, Download, FileText } from 'lucide-react';
import { Booking, Package, SiteContent } from '../types';
import { fetchSiteContent } from '../services/siteService';
import { fetchPackages } from '../services/packageService';
import { formatDate } from '../services/whatsappService';
import { calculateTotalPaid, getPaymentStatus } from '../services/bookingService';
import { getStableImageUrl, isGoogleDriveImageUrl } from '../services/googleDrive';

interface InvoicePreviewProps {
  booking: Booking;
  onClose: () => void;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ booking, onClose }) => {
  const [siteContent, setSiteContent] = useState<SiteContent | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [content, pkgs] = await Promise.all([
      fetchSiteContent(),
      fetchPackages()
    ]);
    setSiteContent(content);
    setPackages(pkgs);
    setIsLoading(false);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const generateInvoiceNumber = () => {
    const date = new Date(booking.date);
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const id = booking.id.slice(-6).toUpperCase();
    return `INV-${year}${month}-${id}`;
  };

  const handlePrint = () => {
    window.print();
  };

  const packagePrice = booking.packagePrice || getPackagePrice(booking.selectedPackage);
  const totalPaid = calculateTotalPaid(booking.payments);
  const remaining = packagePrice - totalPaid;
  const paymentStatus = getPaymentStatus(packagePrice, booking.payments);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-zinc-900/80 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-8">
          <div className="animate-spin w-8 h-8 border-4 border-zinc-200 border-t-zinc-900 rounded-full mx-auto"></div>
          <p className="text-zinc-500 mt-4 text-sm">Memuat invoice...</p>
        </div>
      </div>
    );
  }

  const companyName = siteContent?.companyName || 'NJ Makeup';
  const logoUrl = siteContent?.logoUrl;
  const address = siteContent?.contact?.address || '';
  const phone = siteContent?.contact?.phone || '';
  const instagram = siteContent?.contact?.instagram || '';

  return (
    <>
      {/* Modal Overlay - Hidden on print */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-zinc-900/80 backdrop-blur-sm print:hidden">
        <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl border border-zinc-100 max-h-[95vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="bg-zinc-900 text-white p-5 flex justify-between items-center print:hidden">
            <div className="flex items-center gap-3">
              <FileText size={20} className="text-[#D4AF37]" />
              <h2 className="text-lg font-bold">Preview Invoice</h2>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-zinc-900 rounded-lg font-bold text-sm hover:bg-[#B8960E] transition-all"
              >
                <Printer size={16} />
                Cetak PDF
              </button>
              <button onClick={onClose} className="text-zinc-400 hover:text-white p-2">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Invoice Content */}
          <div id="invoice-content" className="p-8 bg-white">
            {/* Invoice Header */}
            <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-zinc-100">
              {/* Brand Info */}
              <div className="flex items-center gap-4">
                {logoUrl ? (
                  <img 
                    src={isGoogleDriveImageUrl(logoUrl) ? getStableImageUrl(logoUrl) : logoUrl} 
                    alt={companyName}
                    className="w-16 h-16 object-contain"
                  />
                ) : (
                  <div className="w-16 h-16 bg-zinc-900 rounded-xl flex items-center justify-center">
                    <span className="text-[#D4AF37] font-serif text-2xl font-bold">
                      {companyName.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-serif font-bold text-zinc-900">{companyName}</h1>
                  <p className="text-xs text-zinc-500 mt-1">Professional Makeup Artist</p>
                </div>
              </div>
              
              {/* Invoice Info */}
              <div className="text-right">
                <h2 className="text-3xl font-bold text-zinc-900">INVOICE</h2>
                <p className="text-sm text-zinc-500 mt-2 font-mono">{generateInvoiceNumber()}</p>
                <p className="text-xs text-zinc-400 mt-1">
                  Tanggal: {new Date().toLocaleDateString('id-ID', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>

            {/* Client & Studio Info */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              {/* Bill To */}
              <div className="bg-zinc-50 rounded-xl p-5">
                <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-3">Tagihan Kepada</h3>
                <p className="text-lg font-bold text-zinc-900">{booking.clientName}</p>
                <p className="text-sm text-zinc-600 mt-1">{booking.clientPhone}</p>
                {booking.socialMedia && (
                  <p className="text-sm text-zinc-500">@{booking.socialMedia.replace('@', '')}</p>
                )}
                {booking.address && (
                  <p className="text-xs text-zinc-400 mt-2">{booking.address}</p>
                )}
              </div>

              {/* Studio Info */}
              <div className="bg-zinc-50 rounded-xl p-5">
                <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-3">Dari</h3>
                <p className="text-lg font-bold text-zinc-900">{companyName}</p>
                {phone && <p className="text-sm text-zinc-600 mt-1">📞 {phone}</p>}
                {instagram && <p className="text-sm text-zinc-500">📷 @{instagram.replace('@', '')}</p>}
                {address && <p className="text-xs text-zinc-400 mt-2">📍 {address}</p>}
              </div>
            </div>

            {/* Event Details */}
            <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 text-white rounded-xl p-5 mb-8">
              <h3 className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider mb-3">Detail Jadwal</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-[10px] text-zinc-400">Tanggal Booking</p>
                  <p className="text-sm font-bold">{formatDate(booking.date, 'id')}</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-400">Waktu</p>
                  <p className="text-sm font-bold">{booking.time}</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-400">Status</p>
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                    booking.status === 'Confirmed' ? 'bg-green-500 text-white' :
                    booking.status === 'Pending' ? 'bg-amber-500 text-white' :
                    booking.status === 'Completed' ? 'bg-blue-500 text-white' :
                    'bg-zinc-500 text-white'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              </div>
              {booking.eventDate && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-zinc-400">Tanggal Acara</p>
                      <p className="text-sm font-bold">{formatDate(booking.eventDate, 'id')}</p>
                    </div>
                    {booking.akadTime && (
                      <div>
                        <p className="text-[10px] text-zinc-400">Waktu Akad</p>
                        <p className="text-sm font-bold">{booking.akadTime}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Service Details */}
            <div className="mb-8">
              <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-3">Detail Layanan</h3>
              <div className="border border-zinc-200 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-zinc-50">
                      <th className="text-left py-3 px-4 text-xs font-bold text-zinc-500 uppercase">Deskripsi</th>
                      <th className="text-right py-3 px-4 text-xs font-bold text-zinc-500 uppercase">Harga</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-zinc-100">
                      <td className="py-4 px-4">
                        <p className="font-bold text-zinc-900">{getPackageName(booking.selectedPackage)}</p>
                        <p className="text-xs text-zinc-500 mt-1">Makeup Service Package</p>
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-zinc-900">
                        {formatCurrency(packagePrice)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="mb-8">
              <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-3">Ringkasan Pembayaran</h3>
              <div className="bg-zinc-50 rounded-xl p-5">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-600">Total Layanan</span>
                    <span className="font-bold text-zinc-900">{formatCurrency(packagePrice)}</span>
                  </div>
                  <div className="flex justify-between items-center text-green-600">
                    <span>Terbayar</span>
                    <span className="font-bold">-{formatCurrency(totalPaid)}</span>
                  </div>
                  <div className="border-t border-zinc-200 pt-3 flex justify-between items-center">
                    <span className="font-bold text-zinc-900">Sisa Pembayaran</span>
                    <span className={`text-xl font-bold ${remaining > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                      {formatCurrency(remaining)}
                    </span>
                  </div>
                </div>
                
                {/* Payment Status Badge */}
                <div className="mt-4 pt-4 border-t border-zinc-200 flex justify-between items-center">
                  <span className="text-sm text-zinc-500">Status Pembayaran:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' :
                    paymentStatus === 'Partial' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {paymentStatus === 'Paid' ? 'LUNAS' : paymentStatus === 'Partial' ? 'SEBAGIAN' : 'BELUM BAYAR'}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment History */}
            {booking.payments && booking.payments.length > 0 && (
              <div className="mb-8">
                <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-3">Riwayat Pembayaran</h3>
                <div className="border border-zinc-200 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-zinc-50">
                        <th className="text-left py-3 px-4 text-xs font-bold text-zinc-500 uppercase">Tanggal</th>
                        <th className="text-left py-3 px-4 text-xs font-bold text-zinc-500 uppercase">Tipe</th>
                        <th className="text-left py-3 px-4 text-xs font-bold text-zinc-500 uppercase">Metode</th>
                        <th className="text-right py-3 px-4 text-xs font-bold text-zinc-500 uppercase">Jumlah</th>
                      </tr>
                    </thead>
                    <tbody>
                      {booking.payments.map((payment, idx) => (
                        <tr key={payment.id} className="border-t border-zinc-100">
                          <td className="py-3 px-4 text-sm text-zinc-600">
                            {new Date(payment.createdAt).toLocaleDateString('id-ID')}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                              payment.type === 'dp' ? 'bg-amber-100 text-amber-700' :
                              payment.type === 'final' ? 'bg-green-100 text-green-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {payment.type === 'dp' ? 'DP' : payment.type === 'final' ? 'Pelunasan' : 'Cicilan'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-zinc-600">{payment.method || '-'}</td>
                          <td className="py-3 px-4 text-right font-bold text-green-600">
                            {formatCurrency(payment.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Notes */}
            {booking.notes && (
              <div className="mb-8 bg-amber-50 rounded-xl p-5">
                <h3 className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-2">Catatan</h3>
                <p className="text-sm text-amber-900 whitespace-pre-wrap">{booking.notes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="border-t-2 border-zinc-100 pt-6 mt-8">
              <div className="text-center">
                <p className="text-xs text-zinc-400 mb-2">Terima kasih telah mempercayakan kebutuhan makeup Anda kepada kami</p>
                <p className="text-sm font-bold text-zinc-900">{companyName}</p>
                <p className="text-xs text-zinc-400 mt-1">
                  {phone && <span>{phone}</span>}
                  {instagram && <span className="ml-2">| @{instagram.replace('@', '')}</span>}
                </p>
              </div>
              
              {/* Signature Area */}
              <div className="mt-8 grid grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="border-t border-zinc-300 pt-2 mt-16">
                    <p className="text-xs text-zinc-500">Tanda Tangan Client</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="border-t border-zinc-300 pt-2 mt-16">
                    <p className="text-xs text-zinc-500">{companyName}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-content, #invoice-content * {
            visibility: visible;
          }
          #invoice-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }
          @page {
            size: A4;
            margin: 10mm;
          }
        }
      `}</style>
    </>
  );
};

export default InvoicePreview;
