
import { 
  collection, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy 
} from "firebase/firestore";
import { db } from "./firebase";
import { Order } from "../types";

const COLLECTION_NAME = "orders";

export const fetchOrders = async (): Promise<Order[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Order));
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
};

export const addOrder = async (order: Omit<Order, 'id'>): Promise<string | null> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), order);
    return docRef.id;
  } catch (error) {
    console.error("Error adding order:", error);
    return null;
  }
};

export const updateOrderStatus = async (id: string, updates: Partial<Order>): Promise<boolean> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, updates);
    return true;
  } catch (error) {
    console.error("Error updating order:", error);
    return false;
  }
};

// Full update function for editing all order fields
export const updateOrder = async (id: string, order: Omit<Order, 'id' | 'createdAt'>): Promise<boolean> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...order,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error("Error updating order:", error);
    return false;
  }
};

// Get single order by ID
export const fetchOrderById = async (id: string): Promise<Order | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Order;
    }
    return null;
  } catch (error) {
    console.error("Error fetching order:", error);
    return null;
  }
};

export const deleteOrder = async (id: string): Promise<boolean> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error deleting order:", error);
    return false;
  }
};
