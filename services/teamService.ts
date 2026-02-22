
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query 
} from "firebase/firestore";
import { db } from "./firebase";
import { TeamMember } from "../types";

const COLLECTION_NAME = "team";

export const fetchTeam = async (): Promise<TeamMember[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as TeamMember));
  } catch (error) {
    console.error("Error fetching team:", error);
    return [];
  }
};

export const addTeamMember = async (member: Omit<TeamMember, 'id'>): Promise<string | null> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), member);
    return docRef.id;
  } catch (error) {
    console.error("Error adding team member:", error);
    return null;
  }
};

export const updateTeamMember = async (id: string, updates: Partial<TeamMember>): Promise<boolean> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, updates);
    return true;
  } catch (error) {
    console.error("Error updating team member:", error);
    return false;
  }
};

export const deleteTeamMember = async (id: string): Promise<boolean> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error deleting team member:", error);
    return false;
  }
};
