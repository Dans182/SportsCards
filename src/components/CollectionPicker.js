import React, { useState } from 'react';

/**
 * Lets the user pick one or more collections for a new card.
 * If only one collection exists it is pre-selected and the picker is hidden.
 */
function CollectionPicker({ collections, selectedIds, onChange }) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const toggle = (id) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  // Single collection → hidden (auto-selected upstream)
  if (collections.length <= 1) return null;

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 space-y-3">
      <p className="text-sm font-semibold text-slate-700">
        Añadir a colección(es)
        <span className="ml-1 text-xs font-normal text-slate-400">(puedes elegir más de una)</span>
      </p>

      <div className="flex flex-wrap gap-2">
        {collections.map((col) => {
          const active = selectedIds.includes(col.id);
          return (
            <button
              key={col.id}
              type="button"
              onClick={() => toggle(col.id)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition
                ${active
                  ? 'border-sky-500 bg-sky-500 text-white shadow-sm'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:text-sky-700'
                }`}
            >
              {active && <span className="mr-1">✓</span>}
              {col.name}
            </button>
          );
        })}
      </div>

      {selectedIds.length === 0 && (
        <p className="text-xs text-rose-500">Selecciona al menos una colección.</p>
      )}
    </div>
  );
}

export default CollectionPicker;
