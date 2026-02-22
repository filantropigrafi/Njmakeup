
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc 
} from "firebase/firestore";
import { db } from "./firebase";
import { Package } from "../types";

const COLLECTION_NAME = "packages";

export const fetchPackages = async (): Promise<Package[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Package));
  } catch (error) {
    console.error("Error fetching packages:", error);
    return [];
  }
};

export const addPackage = async (pkg: Omit<Package, 'id'>): Promise<string | null> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), pkg);
    return docRef.id;
  } catch (error) {
    console.error("Error adding package:", error);
    return null;
  }
};

export const updatePackage = async (id: string, updates: Partial<Package>): Promise<boolean> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, updates);
    return true;
  } catch (error) {
    console.error("Error updating package:", error);
    return false;
  }
};

export const deletePackage = async (id: string): Promise<boolean> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error deleting package:", error);
    return false;
  }
};
