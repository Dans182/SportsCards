import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';

const collectionsRef = collection(db, 'collections');

export function normalizeCollection(docId, data = {}) {
  return {
    id: docId,
    name: data.name || 'Mi colección',
    description: data.description || '',
    userId: data.userId || '',
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null
  };
}

export async function fetchCollectionsByUser(userId) {
  // No compound query — fetch all readable docs and filter client-side
  // This avoids needing a Firestore composite index
  const snapshot = await getDocs(collectionsRef);
  return snapshot.docs
    .map((d) => normalizeCollection(d.id, d.data()))
    .filter((c) => c.userId === userId);
}

export async function createCollection(userId, name, description = '') {
  const payload = {
    name: name.trim(),
    description: description.trim(),
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  const ref = await addDoc(collectionsRef, payload);
  return { id: ref.id, ...payload };
}

export async function updateCollection(collectionId, name, description = '') {
  await updateDoc(doc(db, 'collections', collectionId), {
    name: name.trim(),
    description: description.trim(),
    updatedAt: serverTimestamp()
  });
}

export async function deleteCollection(collectionId) {
  await deleteDoc(doc(db, 'collections', collectionId));
}

export async function ensureDefaultCollection(userId) {
  const existing = await fetchCollectionsByUser(userId);
  if (existing.length > 0) return existing;
  const created = await createCollection(userId, 'Mi colección');
  return [created];
}