import { fetchPackages } from './packageService';

// Admin WhatsApp number (Indonesian international format)
// Original: 0852-8387-6601
const ADMIN_PHONE_NUMBER = '6285283876601';

// Month names in Indonesian and English
const MONTHS_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const MONTHS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Format date to DD-Month-YYYY
 * @param dateString - Date in YYYY-MM-DD format or ISO string
 * @param lang - Language for month name ('id' or 'en')
 */
export const formatDate = (dateString: string | null | undefined, lang: 'id' | 'en' = 'id'): string => {
  if (!dateString) return '-';
  
  try {
    let year: string, month: string, day: string;
    
    // Check if it's an ISO date string (contains T)
    if (dateString.includes('T')) {
      const date = new Date(dateString);
      year = date.getFullYear().toString();
      month = (date.getMonth() + 1).toString().padStart(2, '0');
      day = date.getDate().toString().padStart(2, '0');
    } else {
      // YYYY-MM-DD format
      [year, month, day] = dateString.split('-');
    }
    
    const months = lang === 'id' ? MONTHS_ID : MONTHS_EN;
    const monthName = months[parseInt(month, 10) - 1];
    
    return `${parseInt(day, 10)} ${monthName} ${year}`;
  } catch (error) {
    return dateString;
  }
};

/**
 * Format time to HH:MM
 * @param timeString - Time in HH:MM format
 */
export const formatTime = (timeString: string | null | undefined): string => {
  if (!timeString) return '-';
  return timeString;
};

/**
 * Get package name and price by ID
 */
const getPackageDetails = async (packageId: string | null): Promise<string> => {
  if (!packageId) return 'Makeup Service';
  
  try {
    const packages = await fetchPackages();
    const selectedPkg = packages.find(p => p.id === packageId);
    if (selectedPkg) {
      return `${selectedPkg.name} (Rp ${(selectedPkg.price / 1000).toLocaleString()}k)`;
    }
  } catch (error) {
    console.error('Error fetching package details:', error);
  }
  
  return 'Makeup Service';
};

/**
 * Send booking data to admin WhatsApp
 * This opens WhatsApp with pre-filled message containing all booking details
 */
export const sendBookingToAdmin = async (booking: any, lang: 'id' | 'en'): Promise<boolean> => {
  const serviceName = await getPackageDetails(booking.selectedPackage);
  
  // Format dates
  const bookingDate = formatDate(booking.date, lang);
  const eventDate = formatDate(booking.eventDate, lang);
  
  const message = lang === 'id' ? 
    // Indonesian message
    `*🔔 BOOKING BARU DARI WEBSITE*\n\n` +
    `*Data Client:*\n` +
    `👤 Nama: ${booking.clientName}\n` +
    `📱 No. HP: ${booking.clientPhone}\n` +
    `📍 Alamat: ${booking.address || '-'}\n` +
    `📷 Instagram: ${booking.socialMedia || '-'}\n\n` +
    `*Detail Booking:*\n` +
    `📅 Tgl Booking: ${bookingDate}\n` +
    `⏰ Jam: ${booking.time || '-'}\n` +
    `🎨 Paket: ${serviceName}\n\n` +
    `*Detail Acara:*\n` +
    `📅 Tgl Acara: ${eventDate}\n` +
    `⏰ Jam Akad: ${booking.akadTime || '-'}\n` +
    `🌿 Henna: ${booking.hennaBy === 'nj' ? 'Dari NJ Makeup' : 'Sudah Ada'}\n\n` +
    `📝 Catatan: ${booking.notes || '-'}`
    :
    // English message
    `*🔔 NEW BOOKING FROM WEBSITE*\n\n` +
    `*Client Data:*\n` +
    `👤 Name: ${booking.clientName}\n` +
    `📱 Phone: ${booking.clientPhone}\n` +
    `📍 Address: ${booking.address || '-'}\n` +
    `📷 Instagram: ${booking.socialMedia || '-'}\n\n` +
    `*Booking Details:*\n` +
    `📅 Booking Date: ${bookingDate}\n` +
    `⏰ Time: ${booking.time || '-'}\n` +
    `🎨 Package: ${serviceName}\n\n` +
    `*Event Details:*\n` +
    `📅 Event Date: ${eventDate}\n` +
    `⏰ Ceremony Time: ${booking.akadTime || '-'}\n` +
    `🌿 Henna: ${booking.hennaBy === 'nj' ? 'From NJ Makeup' : 'Already Have'}\n\n` +
    `📝 Notes: ${booking.notes || '-'}`;

  const whatsappUrl = `https://wa.me/${ADMIN_PHONE_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
  
  return true;
};
