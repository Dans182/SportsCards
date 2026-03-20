import React, { useState } from 'react';

function CollectionsManager({ collections, onAdd, onEdit, onDelete }) {
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setBusy(true);
    setError('');
    try {
      await onAdd(newName.trim(), newDesc.trim());
      setNewName('');
      setNewDesc('');
      setAdding(false);
    } catch (err) {
      setError(err.message || 'Error al crear la colección.');
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (col) => {
    setEditingId(col.id);
    setEditName(col.name);
    setEditDesc(col.description || '');
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return;
    setBusy(true);
    setError('');
    try {
      await onEdit(editingId, editName.trim(), editDesc.trim());
      setEditingId(null);
    } catch (err) {
      setError(err.message || 'Error al guardar.');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (col) => {
    if (!window.confirm(`¿Eliminar la colección "${col.name}"? Las cartas no se borrarán.`)) return;
    setBusy(true);
    try {
      await onDelete(col.id);
    } catch (err) {
      setError(err.message || 'Error al eliminar.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Mis colecciones</h3>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="rounded-2xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
          >
            + Nueva
          </button>
        )}
      </div>

      {error && (
        <p className="rounded-2xl bg-rose-50 px-4 py-2 text-sm text-rose-600">{error}</p>
      )}

      {adding && (
        <form onSubmit={handleAdd} className="rounded-[1.75rem] border border-sky-200 bg-sky-50 p-4 space-y-3">
          <p className="text-sm font-semibold text-sky-700">Nueva colección</p>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nombre *"
            required
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
          <input
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Descripción opcional"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={busy}
              className="rounded-2xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-50"
            >
              {busy ? 'Guardando…' : 'Crear'}
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {collections.length === 0 && !adding && (
        <p className="text-sm text-slate-500">No tienes colecciones todavía. Se creará una automáticamente al añadir tu primera carta.</p>
      )}

      <ul className="space-y-2">
        {collections.map((col) =>
          editingId === col.id ? (
            <li key={col.id}>
              <form onSubmit={handleEdit} className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-4 space-y-3">
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-sky-500"
                />
                <input
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="Descripción"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-sky-500"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={busy}
                    className="rounded-2xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
                  >
                    {busy ? 'Guardando…' : 'Guardar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </li>
          ) : (
            <li
              key={col.id}
              className="flex items-center justify-between rounded-[1.75rem] border border-slate-200 bg-white px-5 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">{col.name}</p>
                {col.description && (
                  <p className="mt-0.5 text-xs text-slate-500">{col.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(col)}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(col)}
                  disabled={busy}
                  className="rounded-xl bg-rose-50 border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-100 disabled:opacity-50"
                >
                  Eliminar
                </button>
              </div>
            </li>
          )
        )}
      </ul>
    </div>
  );
}

export default CollectionsManager;
