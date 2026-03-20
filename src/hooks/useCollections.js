import { useCallback, useEffect, useState } from 'react';
import {
  fetchCollectionsByUser,
  createCollection,
  updateCollection,
  deleteCollection,
  ensureDefaultCollection
} from '../services/collectionService';

export default function useCollections(user) {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user?.uid) {
      setCollections([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await fetchCollectionsByUser(user.uid);
      setCollections(data);
    } catch (err) {
      // Log full error so we can diagnose
      console.error('useCollections fetch error:', err.code, err.message, err);
      setCollections([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addCollection = useCallback(
    async (name, description = '') => {
      const created = await createCollection(user.uid, name, description);
      setCollections((prev) => [...prev, created]);
      return created;
    },
    [user]
  );

  const editCollection = useCallback(
    async (id, name, description = '') => {
      await updateCollection(id, name, description);
      setCollections((prev) =>
        prev.map((c) => (c.id === id ? { ...c, name, description } : c))
      );
    },
    []
  );

  const removeCollection = useCallback(async (id) => {
    await deleteCollection(id);
    setCollections((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const ensureDefault = useCallback(async () => {
    if (!user?.uid) return [];
    const data = await ensureDefaultCollection(user.uid);
    setCollections(data);
    return data;
  }, [user]);

  return { collections, loading, refresh, addCollection, editCollection, removeCollection, ensureDefault };
}