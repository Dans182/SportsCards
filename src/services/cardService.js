import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../firebase';

const cardsCollection = collection(db, 'cards');

const getCardTimestamp = (card) => card.updatedAt?.seconds || card.createdAt?.seconds || 0;

const sortCardsByRecentUpdate = (cards) => cards.sort((a, b) => getCardTimestamp(b) - getCardTimestamp(a));

const normalizeCardPayload = (card, userId) => ({
  player: card.player?.trim() || '',
  year: card.year?.toString().trim() || '',
  manufacturer: card.manufacturer?.trim() || '',
  sport: card.sport?.trim() || '',
  set: card.set?.trim() || '',
  cardNumber: card.cardNumber?.trim() || '',
  // graded: card.graded || 'No',
  gradingCompany: card.gradingCompany?.trim() || '',
  gradeNumber: card.gradeNumber?.toString().trim() || '',
  notes: card.notes?.trim() || '',
  debut: card.debut?.toString().trim() || '',
  isParallel: Boolean(card.isParallel),
  isAutograph: Boolean(card.isAutograph),
  isRelic: Boolean(card.isRelic),
  // Rookie / 1st Bowman (mutuamente excluyentes por lógica de UI)
  isRookieCard: Boolean(card.isRookieCard),
  is1stBowman: Boolean(card.is1stBowman),
  // Insert
  isInsert: Boolean(card.isInsert),
  insertSet: card.insertSet?.trim() || '',
  numbered: card.numbered?.trim() || '',
  imageUrl: card.imageUrl || '',
  ocrText: card.ocrText?.trim() || '',
  // many-to-many: array of collection IDs this card belongs to
  collectionIds: Array.isArray(card.collectionIds) ? card.collectionIds : [],
  updatedAt: new Date(),
  userId
});

export async function fetchCardsByUser(userId) {
  const q = query(cardsCollection, where('userId', '==', userId));
  const snapshot = await getDocs(q);

  return sortCardsByRecentUpdate(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() })));
}

export async function fetchCardsByCollection(userId, collectionId) {
  const q = query(
    cardsCollection,
    where('userId', '==', userId),
    where('collectionIds', 'array-contains', collectionId)
  );
  const snapshot = await getDocs(q);
  return sortCardsByRecentUpdate(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() })));
}

export async function createCard(userId, card) {
  const payload = {
    ...normalizeCardPayload(card, userId),
    createdAt: new Date()
  };

  const created = await addDoc(cardsCollection, payload);
  return { id: created.id, ...payload };
}

export async function saveCard(userId, cardId, card) {
  const payload = normalizeCardPayload(card, userId);
  await updateDoc(doc(db, 'cards', cardId), payload);
  return { id: cardId, ...payload, createdAt: card.createdAt || null };
}

export async function removeCard(cardId) {
  await deleteDoc(doc(db, 'cards', cardId));
}
