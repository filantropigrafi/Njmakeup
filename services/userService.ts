
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { User } from "../types";

const COLLECTION_NAME = "users";

export const fetchUserProfile = async (uid: string): Promise<Partial<User> | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as User;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

export const updateUserProfile = async (uid: string, updates: Partial<User>): Promise<boolean> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, uid);
    // Use setDoc with merge: true in case the document doesn't exist yet
    await setDoc(docRef, updates, { merge: true });
    return true;
  } catch (error) {
    console.error("Error updating user profile:", error);
    return false;
  }
};
