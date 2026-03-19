import { db } from './config';
import { collection, doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

export const DEFAULT_USER_MEMBERSHIP = Object.freeze({
  tier: 'free',
  startDate: null,
  endDate: null,
  isAdmin: false,
});

const buildDefaultUserDocument = ({ name, email }) => ({
  name,
  email,
  createdAt: new Date().toISOString(),
  examResults: [],
  membershipTier: 'free',
  membershipStartDate: new Date().toISOString(),
  membershipEndDate: null,
});

export const normalizeUserMembership = (userData = {}) => {
  const membership = {
    tier: userData.membershipTier || DEFAULT_USER_MEMBERSHIP.tier,
    startDate: userData.membershipStartDate || DEFAULT_USER_MEMBERSHIP.startDate,
    endDate: userData.membershipEndDate || DEFAULT_USER_MEMBERSHIP.endDate,
    isAdmin: !!userData.isAdmin,
  };

  if (membership.tier !== 'free' && membership.endDate) {
    const endDate = new Date(membership.endDate);
    if (new Date() > endDate) {
      console.warn('Membership is expired; treating user as free until backend state is refreshed');
      return {
        ...DEFAULT_USER_MEMBERSHIP,
        isAdmin: membership.isAdmin,
      };
    }
  }

  return membership;
};

export const createUserProfile = async (userId, { name, email }) => {
  await setDoc(doc(db, 'users', userId), buildDefaultUserDocument({ name, email }));
};

export const createDefaultFlashcardDeck = async (userId) => {
  const defaultDeckRef = doc(collection(db, 'users', userId, 'flashcardDecks'));
  await setDoc(defaultDeckRef, {
    name: 'Deck 1',
    description: 'Default flashcard deck',
    createdAt: serverTimestamp(),
    wordCount: 0,
    lastStudiedAt: null,
  });

  console.log(`Created default "Deck 1" for user ${userId}`);
};

export const initializeUserAccount = async (userId, profile) => {
  await createUserProfile(userId, profile);

  try {
    await createDefaultFlashcardDeck(userId);
  } catch (deckError) {
    console.error('Error creating default flashcard deck:', deckError);
  }
};

export const ensureUserAccount = async ({ uid, displayName, email }) => {
  const userDocRef = doc(db, 'users', uid);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists()) {
    return { created: false, userData: userDoc.data() };
  }

  await initializeUserAccount(uid, {
    name: displayName || email || 'Student',
    email,
  });

  return { created: true };
};

export const getUserMembershipProfile = async (userId) => {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    return { ...DEFAULT_USER_MEMBERSHIP };
  }

  return normalizeUserMembership(userDoc.data());
};
