import React, { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import AddCard from './components/AddCard';
import Login from './components/Login';
import ProfileSettings from './components/ProfileSettings';
import ViewCards from './components/ViewCards';
import StatCard from './components/ui/StatCard';
import useCards from './hooks/useCards';
import { auth, db } from './firebase';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [booting, setBooting] = useState(true);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const {
    cards = [],
    loading = true,
    error = '',
    stats = { total: 0, withImages: 0, graded: 0, baseball: 0, recentYear: '—' },
    addCard = async () => {},
    deleteCard = async () => {}
  } = useCards(user) || {};

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        setUserName('');
        setBooting(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        setUserName(userDoc.exists() ? userDoc.data().name || currentUser.email : currentUser.email);
      } catch (errorFetch) {
        setUserName(currentUser.email || 'Collector');
      } finally {
        setBooting(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const statItems = useMemo(() => ([
    { label: 'Total cards', value: stats.total, helper: 'Entire collection', accent: 'bg-slate-950' },
    { label: 'Baseball', value: stats.baseball, helper: 'Cards tagged as baseball', accent: 'bg-sky-600' },
    { label: 'With images', value: stats.withImages, helper: 'Visual inventory coverage', accent: 'bg-emerald-600' },
    { label: 'Graded cards', value: stats.graded, helper: 'Slabbed / graded inventory', accent: 'bg-violet-600' },
    { label: 'Newest year', value: stats.recentYear, helper: 'Most recent release in collection', accent: 'bg-amber-500' }
  ]), [stats]);

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

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">SportsCards</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Baseball card inventory dashboard</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-500 sm:text-base">
              Welcome back, <span className="font-semibold text-slate-800">{userName || 'Collector'}</span>. Your collection is stored in Firestore and now includes secure inline images plus OCR-assisted card entry.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={() => setShowProfileSettings(true)} className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
              Profile settings
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {statItems.map((item) => (
            <StatCard key={item.label} {...item} />
          ))}
        </section>

        <section className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
          <AddCard onSave={addCard} />
          <ViewCards cards={cards} loading={loading} error={error} onDelete={deleteCard} />
        </section>
      </main>

      <ProfileSettings
        isOpen={showProfileSettings}
        onClose={() => setShowProfileSettings(false)}
        userName={userName}
        userEmail={user.email}
        onNameUpdate={setUserName}
      />
    </div>
  );
}

export default App;
