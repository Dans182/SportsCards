import { useCallback, useEffect, useMemo, useState } from 'react';
import { createCard, fetchCardsByUser, removeCard, saveCard } from '../services/cardService';

const emptyStats = {
  total: 0,
  withImages: 0,
  graded: 0,
  baseball: 0,
  recentYear: '—'
};

export default function useCards(user) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshCards = useCallback(async () => {
    if (!user?.uid) {
      setCards([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const nextCards = await fetchCardsByUser(user.uid);
      setCards(nextCards);
    } catch (fetchError) {
      setError(fetchError.message || 'Unable to load your collection.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCards();
  }, [refreshCards]);

  const addCard = useCallback(async (card) => {
    const created = await createCard(user.uid, card);
    setCards((previous) => [created, ...previous]);
    return created;
  }, [user]);

  const updateCard = useCallback(async (cardId, card) => {
    const updated = await saveCard(user.uid, cardId, card);
    setCards((previous) => previous.map((entry) => (
      entry.id === cardId ? { ...entry, ...updated } : entry
    )));
    return updated;
  }, [user]);

  const deleteCard = useCallback(async (cardId) => {
    await removeCard(cardId);
    setCards((previous) => previous.filter((entry) => entry.id !== cardId));
  }, []);

  const stats = useMemo(() => {
    if (!cards.length) {
      return emptyStats;
    }

    const numericYears = cards
      .map((card) => Number.parseInt(card.year, 10))
      .filter((year) => Number.isFinite(year));

    return {
      total: cards.length,
      withImages: cards.filter((card) => Boolean(card.imageUrl)).length,
      graded: cards.filter((card) => card.graded === 'Yes').length,
      baseball: cards.filter((card) => card.sport === 'Baseball').length,
      recentYear: numericYears.length ? Math.max(...numericYears).toString() : '—'
    };
  }, [cards]);

  return {
    cards,
    loading,
    error,
    stats,
    refreshCards,
    addCard,
    updateCard,
    deleteCard
  };
}
