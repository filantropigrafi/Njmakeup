import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Booking } from '../types';

interface BookingCalendarProps {
  bookings: Booking[];
  selectedDate: string;
  onDateSelect: (date: string) => void;
  lang: 'id' | 'en';
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({ 
  bookings, 
  selectedDate, 
  onDateSelect, 
  lang 
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };
  
  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };
  
  const getDateStatus = (date: string) => {
    const dayBookings = bookings.filter(booking => booking.date === date);
    
    if (dayBookings.length === 0) return 'available';
    if (dayBookings.length >= 6) return 'full'; // Max 4 bookings per day
    return 'booked';
  };
  
  const isDateInPast = (date: string) => {
    return new Date(date) < new Date(new Date().setHours(0, 0, 0, 0));
  };
  
  const renderCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-12"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = formatDate(year, month, day);
      const status = getDateStatus(date);
      const isPast = isDateInPast(date);
      const isSelected = selectedDate === date;
      
      let statusColor = '';
      let statusDot = '';
      
      if (isPast) {
        statusColor = 'bg-gray-100 text-gray-400 cursor-not-allowed';
      } else if (isSelected) {
        statusColor = 'bg-[#D4AF37] text-white';
      } else {
        switch (status) {
          case 'available':
            statusColor = 'bg-white border-2 border-gray-200 text-gray-900 hover:border-[#D4AF37] cursor-pointer transition-all';
            break;
          case 'booked':
            statusColor = 'bg-blue-50 border-2 border-blue-200 text-blue-900 hover:border-blue-400 cursor-pointer transition-all';
            statusDot = '<div class="w-2 h-2 bg-blue-500 rounded-full mx-auto mt-1"></div>';
            break;
          case 'full':
            statusColor = 'bg-red-50 border-2 border-red-200 text-red-900 cursor-not-allowed';
            statusDot = '<div class="w-2 h-2 bg-red-500 rounded-full mx-auto mt-1"></div>';
            break;
        }
      }
      
      days.push(
        <div
          key={day}
          className={`h-12 rounded-lg flex flex-col items-center justify-center text-sm font-medium ${statusColor}`}
          onClick={() => !isPast && status !== 'full' && onDateSelect(date)}
        >
          <span>{day}</span>
          {statusDot && <div dangerouslySetInnerHTML={{ __html: statusDot }} />}
        </div>
      );
    }
    
    return days;
  };
  
  const monthNames = lang === 'id' 
    ? ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  const weekDays = lang === 'id'
    ? ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      return newMonth;
    });
  };
  
  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-2xl border border-zinc-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-100 text-[#D4AF37]">
            <CalendarIcon size={20} />
          </div>
          <h3 className="font-serif text-2xl text-zinc-900">
            {lang === 'id' ? 'Pilih Tanggal' : 'Select Date'}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="font-medium text-zinc-900 min-w-[150px] text-center">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </span>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-2 mb-4">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-bold text-zinc-500 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {renderCalendarDays()}
      </div>
      
      <div className="mt-6 pt-6 border-t border-zinc-100">
        <div className="flex items-center justify-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white border-2 border-gray-200 rounded"></div>
            <span className="text-zinc-600">{lang === 'id' ? 'Tersedia' : 'Available'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-50 border-2 border-blue-200 rounded"></div>
            <span className="text-zinc-600">{lang === 'id' ? 'Ada Booking' : 'Booked'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-50 border-2 border-red-200 rounded"></div>
            <span className="text-zinc-600">{lang === 'id' ? 'Penuh' : 'Full'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCalendar;
