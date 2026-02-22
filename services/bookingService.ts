
import { 
  collection, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where,
  orderBy
} from "firebase/firestore";
import { db } from "./firebase";
import { Booking, Payment } from "../types";
import { sendBookingToAdmin } from "./whatsappService";

const COLLECTION_NAME = "bookings";

export const fetchBookings = async (): Promise<Booking[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy("date", "asc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Booking));
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return [];
  }
};

export const fetchConfirmedBookings = async (): Promise<Booking[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where("status", "==", "Confirmed"),
      orderBy("date", "asc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Booking));
  } catch (error) {
    console.error("Error fetching confirmed bookings:", error);
    return [];
  }
};

export const addBooking = async (booking: Omit<Booking, 'id'>, lang: 'id' | 'en' = 'id'): Promise<boolean> => {
  try {
    // Add booking to Firestore
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...booking,
      createdAt: new Date().toISOString()
    });

    // Send WhatsApp notification to admin only
    const bookingWithId = { ...booking, id: docRef.id };
    await sendBookingToAdmin(bookingWithId, lang);

    return true;
  } catch (error) {
    console.error("Error adding booking:", error);
    return false;
  }
};

export const updateBookingStatus = async (id: string, status: Booking['status'], lastUpdatedBy?: string): Promise<boolean> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const updateData: Partial<Booking> = { status };
    if (lastUpdatedBy) {
      updateData.lastUpdatedBy = lastUpdatedBy;
    }
    await updateDoc(docRef, updateData);
    return true;
  } catch (error) {
    console.error("Error updating booking status:", error);
    return false;
  }
};

export const deleteBooking = async (id: string): Promise<boolean> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error deleting booking:", error);
    return false;
  }
};

// New function to get bookings by date (for calendar)
export const getBookingsByDate = async (date: string): Promise<Booking[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where("date", "==", date),
      orderBy("time", "asc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Booking));
  } catch (error) {
    console.error("Error fetching bookings by date:", error);
    return [];
  }
};

// New function to check if date is fully booked
export const isDateFullyBooked = async (date: string, maxBookings: number = 4): Promise<boolean> => {
  try {
    const bookings = await getBookingsByDate(date);
    return bookings.length >= maxBookings;
  } catch (error) {
    console.error("Error checking if date is fully booked:", error);
    return false;
  }
};

// Get single booking by ID
export const fetchBookingById = async (id: string): Promise<Booking | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Booking;
    }
    return null;
  } catch (error) {
    console.error("Error fetching booking:", error);
    return null;
  }
};

// Update full booking (for editing all fields)
export const updateBooking = async (id: string, updates: Partial<Booking>): Promise<boolean> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error("Error updating booking:", error);
    return false;
  }
};

// Add payment to booking
export const addPaymentToBooking = async (bookingId: string, payment: Omit<Payment, 'id' | 'createdAt'>): Promise<boolean> => {
  try {
    const booking = await fetchBookingById(bookingId);
    if (!booking) return false;

    const newPayment: Payment = {
      ...payment,
      id: `pay_${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    const existingPayments = booking.payments || [];
    const updatedPayments = [...existingPayments, newPayment];

    const docRef = doc(db, COLLECTION_NAME, bookingId);
    await updateDoc(docRef, {
      payments: updatedPayments,
      updatedAt: new Date().toISOString()
    });

    return true;
  } catch (error) {
    console.error("Error adding payment:", error);
    return false;
  }
};

// Remove payment from booking
export const removePaymentFromBooking = async (bookingId: string, paymentId: string): Promise<boolean> => {
  try {
    const booking = await fetchBookingById(bookingId);
    if (!booking || !booking.payments) return false;

    const updatedPayments = booking.payments.filter(p => p.id !== paymentId);

    const docRef = doc(db, COLLECTION_NAME, bookingId);
    await updateDoc(docRef, {
      payments: updatedPayments,
      updatedAt: new Date().toISOString()
    });

    return true;
  } catch (error) {
    console.error("Error removing payment:", error);
    return false;
  }
};

// Add note to booking
export const addNoteToBooking = async (bookingId: string, note: string, userName?: string): Promise<boolean> => {
  try {
    const booking = await fetchBookingById(bookingId);
    if (!booking) return false;

    const timestamp = new Date().toLocaleString('id-ID');
    const existingNotes = booking.notes || '';
    const noteWithUser = userName 
      ? `[${timestamp}] - ${userName}\n${note}`
      : `[${timestamp}]\n${note}`;
    const updatedNotes = existingNotes 
      ? `${existingNotes}\n\n${noteWithUser}`
      : noteWithUser;

    const docRef = doc(db, COLLECTION_NAME, bookingId);
    const updateData: Record<string, unknown> = {
      notes: updatedNotes,
      updatedAt: new Date().toISOString()
    };
    if (userName) {
      updateData.lastUpdatedBy = userName;
    }
    await updateDoc(docRef, updateData);

    return true;
  } catch (error) {
    console.error("Error adding note:", error);
    return false;
  }
};

// Calculate total paid amount
export const calculateTotalPaid = (payments?: Payment[]): number => {
  if (!payments || payments.length === 0) return 0;
  return payments.reduce((total, payment) => total + payment.amount, 0);
};

// Get payment status based on package price and payments
export const getPaymentStatus = (packagePrice?: number, payments?: Payment[]): 'Unpaid' | 'Partial' | 'Paid' => {
  if (!packagePrice || packagePrice === 0) return 'Unpaid';
  const totalPaid = calculateTotalPaid(payments);
  if (totalPaid === 0) return 'Unpaid';
  if (totalPaid >= packagePrice) return 'Paid';
  return 'Partial';
};
