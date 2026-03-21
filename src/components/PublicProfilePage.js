import React, { useEffect, useMemo, useState } from 'react';
import ViewCards from './ViewCards';
import StatCard from './ui/StatCard';
import { fetchCardsByUser } from '../services/cardService';
import { fetchPublicProfileBySlug } from '../services/profileService';

const emptyStats = {
  total: 0,
  withImages: 0,
  // graded: 0,
  baseball: 0,
  recentYear: '—'
};

function PublicProfilePage({ slug }) {
  const [profile, setProfile] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadPublicCollection = async () => {
      try {
        setLoading(true);
        setError('');
        const nextProfile = await fetchPublicProfileBySlug(slug);

        if (!nextProfile) {
          throw new Error('This public profile is unavailable or has sharing disabled.');
        }

        const nextCards = await fetchCardsByUser(nextProfile.id);

        if (!active) {
          return;
        }

        setProfile(nextProfile);
        setCards(nextCards);
      } catch (loadError) {
        if (active) {
          setProfile(null);
          setCards([]);
          setError(loadError.message || 'Unable to load this public collection.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadPublicCollection();

    return () => {
      active = false;
    };
  }, [slug]);

  const sharedCards = useMemo(() => {
    if (!profile?.publicCollectionId || profile.publicCollectionId === 'all') {
      return cards;
    }
    return cards.filter(c => c.collectionIds?.includes(profile.publicCollectionId));
  }, [cards, profile]);

  const stats = useMemo(() => {
    if (!sharedCards.length) {
      return emptyStats;
    }

    const numericYears = sharedCards
      .map((card) => Number.parseInt(card.year, 10))
      .filter((year) => Number.isFinite(year));

    return {
      total: sharedCards.length,
      withImages: sharedCards.filter((card) => Boolean(card.imageUrl)).length,
      // graded: sharedCards.filter((card) => card.graded === 'Yes').length,
      baseball: sharedCards.filter((card) => card.sport === 'Baseball').length,
      recentYear: numericYears.length ? Math.max(...numericYears).toString() : '—'
    };
  }, [sharedCards]);

  const statItems = useMemo(() => ([
    { label: 'Total cards', value: stats.total, helper: 'Publicly shared inventory', accent: 'bg-slate-950' },
    { label: 'Baseball', value: stats.baseball, helper: 'Baseball cards in this collection', accent: 'bg-sky-600' },
    { label: 'With images', value: stats.withImages, helper: 'Cards with a visible scan', accent: 'bg-emerald-600' },
    // { label: 'Graded cards', value: stats.graded, helper: 'Cards marked as graded', accent: 'bg-violet-600' },
    { label: 'Newest year', value: stats.recentYear, helper: 'Most recent release shared', accent: 'bg-amber-500' }
  ]), [stats]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">Public collection</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              {profile?.name || 'Collector'}'s card collection
            </h1>
            <p className="mt-3 max-w-3xl text-sm text-slate-500 sm:text-base">
              {profile?.shareDescription || 'Browse this shared showcase without signing in. The page is read-only and only lists cards the collector chose to publish.'}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statItems.map((item) => (
            <StatCard key={item.label} {...item} />
          ))}
        </section>

        <ViewCards
          key={profile?.id || 'loading'}
          cards={sharedCards}
          loading={loading}
          error={error}
          readOnly
          initialFilters={{
            sport: profile?.defaultPublicSport,
            sortBy: profile?.defaultPublicSort
          }}
          title="Shared inventory"
          subtitle="Filter, search and browse the cards this collector decided to make public."
          emptyTitle="No public cards available"
          emptyMessage="This collector has not published any cards yet, or the profile is still being prepared."
        />
      </main>
    </div>
  );
}

export default PublicProfilePage;
