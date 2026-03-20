import React, { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import AddCard from './components/AddCard';
import Login from './components/Login';
import ProfileSettings from './components/ProfileSettings';
import PublicProfilePage from './components/PublicProfilePage';
import ViewCards from './components/ViewCards';
import StatCard from './components/ui/StatCard';
import CollectionsManager from './components/CollectionsManager';
import useCards from './hooks/useCards';
import useCollections from './hooks/useCollections';
import { auth } from './firebase';
import { fetchUserProfile } from './services/profileService';
import { getPublicProfileSlugFromPath } from './utils/publicProfile';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [booting, setBooting] = useState(true);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showCollectionsManager, setShowCollectionsManager] = useState(false);
  const [activeCollectionId, setActiveCollectionId] = useState(null); // null = "All"

  const publicProfileSlug = useMemo(() => getPublicProfileSlugFromPath(window.location.pathname), []);

  const {
    cards = [],
    loading = true,
    error = '',
    stats = { total: 0, withImages: 0, graded: 0, baseball: 0, recentYear: '—' },
    addCard = async () => { },
    updateCard = async () => { },
    deleteCard = async () => { }
  } = useCards(user) || {};

  const {
    collections,
    loading: collectionsLoading,
    addCollection,
    editCollection,
    removeCollection,
    ensureDefault
  } = useCollections(user);

  useEffect(() => {
    if (publicProfileSlug) {
      setBooting(false);
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        setProfile(null);
        setBooting(false);
        return;
      }

      try {
        const userProfile = await fetchUserProfile(currentUser.uid);
        setProfile(userProfile || {
          id: currentUser.uid,
          name: currentUser.email || 'Collector',
          email: currentUser.email || '',
          publicProfileEnabled: false,
          publicSlug: '',
          shareDescription: ''
        });
      } catch {
        setProfile({
          id: currentUser.uid,
          name: currentUser.email || 'Collector',
          email: currentUser.email || '',
          publicProfileEnabled: false,
          publicSlug: '',
          shareDescription: ''
        });
      } finally {
        setBooting(false);
      }
    });

    return () => unsubscribe();
  }, [publicProfileSlug]);

  // Cards filtered by active collection tab
  const visibleCards = useMemo(() => {
    if (!activeCollectionId) return cards;
    return cards.filter((c) =>
      Array.isArray(c.collectionIds) && c.collectionIds.includes(activeCollectionId)
    );
  }, [cards, activeCollectionId]);

  const statItems = useMemo(() => ([
    { label: 'Total cards', value: stats.total, helper: 'Entire collection', accent: 'bg-slate-950' },
    { label: 'Baseball', value: stats.baseball, helper: 'Cards tagged as baseball', accent: 'bg-sky-600' },
    { label: 'With images', value: stats.withImages, helper: 'Visual inventory coverage', accent: 'bg-emerald-600' },
    // { label: 'Graded cards', value: stats.graded, helper: 'Slabbed / graded inventory', accent: 'bg-violet-600' },
    { label: 'Newest year', value: stats.recentYear, helper: 'Most recent release in collection', accent: 'bg-amber-500' }
  ]), [stats]);

  if (publicProfileSlug) {
    return <PublicProfilePage slug={publicProfileSlug} />;
  }

  if (booting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white" />
          <p className="mt-4 text-sm text-slate-300">Loading your collection workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  // Active collection label for ViewCards subtitle
  const activeCollection = collections.find((c) => c.id === activeCollectionId);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">SportsCards</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Baseball card inventory dashboard</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-500 sm:text-base">
              Welcome back, <span className="font-semibold text-slate-800">{profile?.name || 'Collector'}</span>.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setShowCollectionsManager(true)}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Mis colecciones
            </button>
            <button
              type="button"
              onClick={() => setShowProfileSettings(true)}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Profile settings
            </button>
          </div>
        </div>

        {/* Collection tab bar */}
        {!collectionsLoading && collections.length > 0 && (
          <div className="mx-auto max-w-7xl px-4 pb-0 sm:px-6 lg:px-8">
            <div className="flex gap-1 overflow-x-auto pb-0 scrollbar-hide">
              {/* "All" tab */}
              <button
                type="button"
                onClick={() => setActiveCollectionId(null)}
                className={`whitespace-nowrap rounded-t-2xl border-b-2 px-5 py-3 text-sm font-semibold transition
                  ${!activeCollectionId
                    ? 'border-sky-600 bg-sky-50 text-sky-700'
                    : 'border-transparent bg-white text-slate-500 hover:text-slate-700'
                  }`}
              >
                Todas las cartas
                <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-600">
                  {cards.length}
                </span>
              </button>

              {collections.map((col) => {
                const count = cards.filter(
                  (c) => Array.isArray(c.collectionIds) && c.collectionIds.includes(col.id)
                ).length;
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => setActiveCollectionId(col.id)}
                    className={`whitespace-nowrap rounded-t-2xl border-b-2 px-5 py-3 text-sm font-semibold transition
                      ${activeCollectionId === col.id
                        ? 'border-sky-600 bg-sky-50 text-sky-700'
                        : 'border-transparent bg-white text-slate-500 hover:text-slate-700'
                      }`}
                  >
                    {col.name}
                    <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-600">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {statItems.map((item) => (
            <StatCard key={item.label} {...item} />
          ))}
        </section>

        <AddCard
          onSave={addCard}
          collections={collections}
          onEnsureCollections={ensureDefault}
        />


        <ViewCards
          cards={cards}
          loading={loading}
          error={error}
          onDelete={deleteCard}
          onEdit={updateCard}
          collections={collections}
          title={activeCollection ? activeCollection.name : 'Tu catálogo completo'}
          subtitle={
            activeCollection
              ? activeCollection.description || `Cartas en "${activeCollection.name}".`
              : 'Search, review and clean up your baseball card inventory.'
          } emptyTitle="No public cards available"
        />
      </main>





      {/* Collections Manager Modal */}
      {showCollectionsManager && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-600">Organización</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Mis colecciones</h2>
                <p className="mt-1 text-sm text-slate-500">Crea y gestiona grupos para organizar tus cartas.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCollectionsManager(false)}
                className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-500 hover:border-slate-300 hover:text-slate-900"
              >
                Cerrar
              </button>
            </div>
            <CollectionsManager
              collections={collections}
              onAdd={addCollection}
              onEdit={editCollection}
              onDelete={removeCollection}
            />
          </div>
        </div>
      )}

      <ProfileSettings
        isOpen={showProfileSettings}
        onClose={() => setShowProfileSettings(false)}
        profile={profile}
        onProfileUpdate={setProfile}
        collections={collections}
      />
    </div>
  );
}

export default App;