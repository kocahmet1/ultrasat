import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "./config";

const IN_PROGRESS_EXAMS_COLLECTION = "inProgressExams";

export const saveInProgressExam = async (userId, examData) => {
  const docRef = doc(db, IN_PROGRESS_EXAMS_COLLECTION, userId);
  await setDoc(docRef, examData);
};

export const getInProgressExam = async (userId) => {
  const docRef = doc(db, IN_PROGRESS_EXAMS_COLLECTION, userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data();
  }
  return null;
};

export const deleteInProgressExam = async (userId) => {
  const docRef = doc(db, IN_PROGRESS_EXAMS_COLLECTION, userId);
  await deleteDoc(docRef);
};
