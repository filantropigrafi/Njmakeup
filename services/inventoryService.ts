
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where,
  orderBy
} from "firebase/firestore";
import { db } from "./firebase";
import { CatalogItem, Category } from "../types";

const COLLECTION_NAME = "catalog";
const CATEGORY_COLLECTION = "categories";

// Catalog CRUD
export const fetchCatalog = async (): Promise<CatalogItem[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as CatalogItem));
  } catch (error) {
    console.error("Error fetching catalog:", error);
    return [];
  }
};

export const addCatalogItem = async (item: Omit<CatalogItem, 'id'>): Promise<string | null> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), item);
    return docRef.id;
  } catch (error) {
    console.error("Error adding item:", error);
    return null;
  }
};

export const updateCatalogItem = async (id: string, updates: Partial<CatalogItem>): Promise<boolean> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, updates);
    return true;
  } catch (error) {
    console.error("Error updating item:", error);
    return false;
  }
};

export const deleteCatalogItem = async (id: string): Promise<boolean> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error deleting item:", error);
    return false;
  }
};

// Categories CRUD
export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, CATEGORY_COLLECTION));
    return querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Category))
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

export const addCategory = async (name: string, order: number): Promise<string | null> => {
  try {
    const docRef = await addDoc(collection(db, CATEGORY_COLLECTION), { name, order });
    return docRef.id;
  } catch (error) {
    console.error("Error adding category:", error);
    return null;
  }
};

export const updateCategoryOrder = async (id: string, newOrder: number): Promise<boolean> => {
  try {
    const docRef = doc(db, CATEGORY_COLLECTION, id);
    await updateDoc(docRef, { order: newOrder });
    return true;
  } catch (error) {
    console.error("Error updating category order:", error);
    return false;
  }
};

export const deleteCategory = async (id: string): Promise<boolean> => {
  try {
    const docRef = doc(db, CATEGORY_COLLECTION, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error deleting category:", error);
    return false;
  }
};
