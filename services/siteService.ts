
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import { SiteContent } from "../types";
import { INITIAL_CONTENT } from "../constants";

const COLLECTION_NAME = "settings";
const DOCUMENT_ID = "site_content";

export const fetchSiteContent = async (): Promise<SiteContent> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, DOCUMENT_ID);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { ...INITIAL_CONTENT, ...docSnap.data() } as SiteContent;
    } else {
      // Initialize with default content if it doesn't exist
      await setDoc(docRef, INITIAL_CONTENT);
      return INITIAL_CONTENT;
    }
  } catch (error) {
    console.error("Error fetching site content:", error);
    return INITIAL_CONTENT;
  }
};

export const updateSiteContent = async (content: Partial<SiteContent>): Promise<boolean> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, DOCUMENT_ID);
    await updateDoc(docRef, content);
    return true;
  } catch (error) {
    console.error("Error updating site content:", error);
    return false;
  }
};
