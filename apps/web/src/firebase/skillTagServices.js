import { db } from './config';
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';

export const createSkillTag = async (skillData) => {
  try {
    const skillRef = await addDoc(collection(db, 'skillTags'), {
      ...skillData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return skillRef.id;
  } catch (error) {
    console.error('Error creating skill tag:', error);
    throw error;
  }
};

export const getAllSkillTags = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'skillTags'));
    return querySnapshot.docs.map((snapshot) => ({
      id: snapshot.id,
      ...snapshot.data(),
    }));
  } catch (error) {
    console.error('Error getting skill tags:', error);
    throw error;
  }
};

export const getSkillTagsByCategory = async (category) => {
  try {
    const q = query(
      collection(db, 'skillTags'),
      where('category', '==', category),
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((snapshot) => ({
      id: snapshot.id,
      ...snapshot.data(),
    }));
  } catch (error) {
    console.error('Error getting skill tags by category:', error);
    throw error;
  }
};
