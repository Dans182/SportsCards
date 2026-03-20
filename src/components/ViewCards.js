import React, { useMemo, useState } from 'react';
import CardDetailModal from './CardDetailModal';
import EditCardModal from './EditCardModal';
import ConfirmModal from './ConfirmModal';

function ViewCards({
  cards,
  loading,
  error,
  onDelete,
  onEdit,
  readOnly = false,
  collections = [],
  title = 'Your catalog',
  subtitle = 'Search, review and clean up your baseball card inventory.',
  emptyTitle = 'No cards match this filter',
  emptyMessage = 'Try broadening your search or add your first baseball card in the intake panel.'
}) {
  const [query, setQuery] = useState('');
  const [sport, setSport] = useState('All');
  // const [gradedOnly, setGradedOnly] = useState(false);
  const [withImagesOnly, setWithImagesOnly] = useState(false);
  const [sortBy, setSortBy] = useState('updated');
  const [selectedCard, setSelectedCard] = useState(null);
  const [cardToDelete, setCardToDelete] = useState(null);
  const [cardToEdit, setCardToEdit] = useState(null);
  const [activeCollectionId, setActiveCollectionId] = useState('all');

  const filteredCards = useMemo(() => {
    const search = query.trim().toLowerCase();

    return [...cards]
      .filter((card) => {
        if (activeCollectionId !== 'all') {
          if (!Array.isArray(card.collectionIds) || !card.collectionIds.includes(activeCollectionId)) {
            return false;
          }
        }

        if (sport !== 'All' && card.sport !== sport) {
          return false;
        }

        // if (gradedOnly && card.graded !== 'Yes') {
        //   return false;
        // }

        if (withImagesOnly && !card.imageUrl) {
          return false;
        }

        if (!search) {
          return true;
        }

        return [card.player, card.year, card.manufacturer, card.set, card.cardNumber, card.notes]
          .filter(Boolean)
          .some((value) => value.toString().toLowerCase().includes(search));
      })
      .sort((left, right) => {
        if (sortBy === 'year') {
          return Number.parseInt(right.year, 10) - Number.parseInt(left.year, 10);
        }

        if (sortBy === 'player') {
          return left.player.localeCompare(right.player);
        }

        const leftTime = left.updatedAt?.seconds || left.createdAt?.seconds || 0;
        const rightTime = right.updatedAt?.seconds || right.createdAt?.seconds || 0;
        return rightTime - leftTime;
      });
  }, [cards, query, sortBy, sport, withImagesOnly, activeCollectionId]);
  // }, [cards, gradedOnly, query, sortBy, sport, withImagesOnly, activeCollectionId]);

  if (loading) {
    return <section className="rounded-[2rem] border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">Loading collection...</section>;
  }

  if (error) {
    return <section className="rounded-[2rem] border border-rose-200 bg-rose-50 p-8 text-sm text-rose-700 shadow-sm">{error}</section>;
  }

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70 sm:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-600">{readOnly ? 'Showcase' : 'Collection'}</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">{title}</h2>
          <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          {filteredCards.length} visible card{filteredCards.length === 1 ? '' : 's'}
        </div>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-[1.8fr_repeat(4,minmax(0,1fr))]">
        <input value={query} onChange={(event) => setQuery(event.target.value)} className="field" placeholder="Search player, set, notes or card number" />
        <select value={sport} onChange={(event) => setSport(event.target.value)} className="field">
          {['All', 'Baseball', 'Football', 'Basketball', 'WNBA', 'Hockey', 'Soccer', 'Other'].map((entry) => (
            <option key={entry} value={entry}>{entry}</option>
          ))}
        </select>
        <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="field">
          <option value="updated">Recently updated</option>
          <option value="year">Newest year</option>
          <option value="player">Player A-Z</option>
        </select>
        {/* <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600">
          <input type="checkbox" checked={gradedOnly} onChange={(event) => setGradedOnly(event.target.checked)} />
          Graded only
        </label> */}
        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600">
          <input type="checkbox" checked={withImagesOnly} onChange={(event) => setWithImagesOnly(event.target.checked)} />
          Images only
        </label>
      </div>

      {!readOnly && collections.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveCollectionId('all')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${activeCollectionId === 'all'
              ? 'bg-slate-900 text-white'
              : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
          >
            All collections
          </button>
          {collections.map((col) => (
            <button
              key={col.id}
              type="button"
              onClick={() => setActiveCollectionId(col.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${activeCollectionId === col.id
                ? 'bg-sky-600 text-white'
                : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
            >
              {col.name}
            </button>
          ))}
        </div>
      )}

      {filteredCards.length ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredCards.map((card) => (
            <article key={card.id} className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-50 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/80">
              <button type="button" onClick={() => setSelectedCard(card)} className="block w-full text-left">
                <div className="aspect-[4/5] overflow-hidden bg-slate-200">
                  {card.imageUrl ? (
                    <img src={card.imageUrl} alt={`${card.player} card`} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-slate-100 text-sm text-slate-500">No image</div>
                  )}
                </div>
                <div className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{card.player}</h3>
                      <p className="mt-1 text-sm text-slate-500">{card.year} • {card.manufacturer}</p>
                    </div>
                    <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">{card.sport}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-600">
                    {card.set ? <span className="rounded-full bg-white px-3 py-1">{card.set}</span> : null}
                    {card.cardNumber ? <span className="rounded-full bg-white px-3 py-1">#{card.cardNumber}</span> : null}
                    {/* {card.graded === 'Yes' ? <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">{card.gradingCompany} {card.gradeNumber}</span> : null} */}
                  </div>
                  {card.notes ? <p className="line-clamp-2 text-sm text-slate-500">{card.notes}</p> : null}
                </div>
              </button>
              <div className="flex gap-2 border-t border-slate-200 bg-white p-4">
                <button type="button" onClick={() => setSelectedCard(card)} className="flex-1 rounded-2xl border border-slate-200 px-2 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50" title="View">👁 View</button>
                {!readOnly && onEdit ? (
                  <button type="button" onClick={() => setCardToEdit(card)} className="flex-1 rounded-2xl bg-sky-600 px-2 py-2 text-sm font-semibold text-white transition hover:bg-sky-700" title="Edit">✏️ Edit</button>
                ) : null}
                {!readOnly ? (
                  <button type="button" onClick={() => setCardToDelete(card)} className="flex-1 rounded-2xl bg-rose-600 px-2 py-2 text-sm font-semibold text-white transition hover:bg-rose-700" title="Delete">🗑 Delete</button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
          <h3 className="text-lg font-semibold text-slate-900">{emptyTitle}</h3>
          <p className="mt-2 text-sm text-slate-500">{emptyMessage}</p>
        </div>
      )}

      <CardDetailModal isOpen={Boolean(selectedCard)} card={selectedCard} onClose={() => setSelectedCard(null)} />
      <EditCardModal
        isOpen={Boolean(cardToEdit)}
        card={cardToEdit}
        collections={collections}
        onSave={async (id, data) => { await onEdit(id, data); setCardToEdit(null); }}
        onClose={() => setCardToEdit(null)}
      />
      {!readOnly ? (
        <ConfirmModal
          isOpen={Boolean(cardToDelete)}
          title="Delete card"
          message={cardToDelete ? `Remove ${cardToDelete.player} from your collection?` : ''}
          confirmText="Delete"
          cancelText="Keep"
          onClose={() => setCardToDelete(null)}
          onConfirm={async () => {
            if (cardToDelete) {
              await onDelete(cardToDelete.id);
              setCardToDelete(null);
              if (selectedCard?.id === cardToDelete.id) {
                setSelectedCard(null);
              }
            }
          }}
        />
      ) : null}
    </section>
  );
}

export default ViewCards;