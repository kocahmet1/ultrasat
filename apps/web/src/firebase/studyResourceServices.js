import { db } from './config';
import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';

export const createStudyResource = async (resourceData) => {
  try {
    const resourceRef = await addDoc(collection(db, 'studyResources'), {
      ...resourceData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return resourceRef.id;
  } catch (error) {
    console.error('Error creating study resource:', error);
    throw error;
  }
};

export const getResourcesBySkillTag = async (skillTagId) => {
  try {
    const q = query(
      collection(db, 'studyResources'),
      where('skillTags', 'array-contains', skillTagId),
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((snapshot) => ({
      id: snapshot.id,
      ...snapshot.data(),
    }));
  } catch (error) {
    console.error('Error getting resources by skill tag:', error);
    throw error;
  }
};

export const getResourcesByMainCategory = async (mainCategory) => {
  try {
    const q = query(
      collection(db, 'studyResources'),
      where('mainSkillCategory', '==', mainCategory),
      orderBy('qualityRating', 'desc'),
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((snapshot) => ({
      id: snapshot.id,
      ...snapshot.data(),
    }));
  } catch (error) {
    console.error('Error getting resources by main category:', error);
    return [];
  }
};

export const getResourcesBySubcategory = async (subcategory) => {
  try {
    const q = query(
      collection(db, 'studyResources'),
      where('subSkillCategory', '==', subcategory),
      orderBy('qualityRating', 'desc'),
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((snapshot) => ({
      id: snapshot.id,
      ...snapshot.data(),
    }));
  } catch (error) {
    console.error('Error getting resources by subcategory:', error);
    return [];
  }
};
