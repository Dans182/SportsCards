import { collection, doc, getDoc, getDocs, limit, query, setDoc, where } from 'firebase/firestore';
import { db } from '../firebase';
import { createProfileSlug, slugifyProfileName } from '../utils/publicProfile';

const usersCollection = collection(db, 'users');

export function normalizeProfile(docId, data = {}) {
  return {
    id: docId,
    name: data.name || '',
    email: data.email || '',
    publicProfileEnabled: Boolean(data.publicProfileEnabled),
    publicSlug: data.publicSlug || '',
    shareDescription: data.shareDescription || '',
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null
  };
}

export async function fetchUserProfile(userId) {
  const snapshot = await getDoc(doc(db, 'users', userId));

  if (!snapshot.exists()) {
    return null;
  }

  return normalizeProfile(snapshot.id, snapshot.data());
}

export async function isPublicSlugAvailable(slug, currentUserId) {
  const normalizedSlug = slugifyProfileName(slug);

  if (!normalizedSlug) {
    return false;
  }

  const snapshot = await getDocs(query(usersCollection, where('publicSlug', '==', normalizedSlug), limit(1)));

  if (snapshot.empty) {
    return true;
  }

  return snapshot.docs[0].id === currentUserId;
}

export async function saveUserProfile(userId, profile) {
  const nextSlug = createProfileSlug(profile.publicSlug || profile.name || '', userId.slice(0, 8));
  const slugAvailable = await isPublicSlugAvailable(nextSlug, userId);

  if (!slugAvailable) {
    throw new Error('That public link is already in use. Choose a different slug.');
  }

  const payload = {
    name: profile.name.trim(),
    email: profile.email.trim(),
    publicProfileEnabled: Boolean(profile.publicProfileEnabled),
    publicSlug: nextSlug,
    shareDescription: profile.shareDescription?.trim() || '',
    updatedAt: new Date()
  };

  if (profile.createdAt) {
    payload.createdAt = profile.createdAt;
  }

  await setDoc(doc(db, 'users', userId), payload, { merge: true });
  return normalizeProfile(userId, payload);
}

export async function fetchPublicProfileBySlug(slug) {
  const normalizedSlug = slugifyProfileName(slug);

  if (!normalizedSlug) {
    return null;
  }

  const snapshot = await getDocs(query(
    usersCollection,
    where('publicSlug', '==', normalizedSlug),
    where('publicProfileEnabled', '==', true),
    limit(1)
  ));

  if (snapshot.empty) {
    return null;
  }

  return normalizeProfile(snapshot.docs[0].id, snapshot.docs[0].data());
}
