import React, { useEffect, useMemo, useState } from 'react';
import { getManufacturersForSport } from '../data/manufacturers';
import { getSetsForManufacturer } from '../data/sets';
import { prepareImageAsset } from '../utils/imageProcessing';
import Toast from './Toast';

function EditCardModal({ isOpen, card, collections = [], onSave, onClose }) {
  const [formData, setFormData] = useState(null);
  const [processingImage, setProcessingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Sync form when card changes
  useEffect(() => {
    if (card) {
      setFormData({
        player: card.player || '',
        year: card.year || '',
        manufacturer: card.manufacturer || '',
        sport: card.sport || 'Baseball',
        set: card.set || '',
        cardNumber: card.cardNumber || '',
        debut: card.debut || '',
        notes: card.notes || '',
        imageUrl: card.imageUrl || '',
        ocrText: card.ocrText || '',
        collectionIds: Array.isArray(card.collectionIds) ? card.collectionIds : []
      });
    }
  }, [card]);

  const manufacturers = useMemo(() => getManufacturersForSport(formData?.sport || 'Baseball'), [formData?.sport]);
  const sets = useMemo(() => getSetsForManufacturer(formData?.manufacturer || '', formData?.sport || 'Baseball'), [formData?.manufacturer, formData?.sport]);

  const showToast = (message, type = 'success') => setToast({ show: true, message, type });
  const hideToast = () => setToast({ show: false, message: '', type: 'success' });

  if (!isOpen || !card || !formData) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'sport') { next.manufacturer = ''; next.set = ''; }
      if (name === 'manufacturer') { next.set = ''; }
      return next;
    });
  };

  const handleImageSelection = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setProcessingImage(true);
      const { prepareImageAsset: prepare } = await import('../utils/imageProcessing');
      const asset = await prepare(file);
      setFormData((prev) => ({ ...prev, imageUrl: asset.previewUrl }));
      showToast('Image updated.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setProcessingImage(false);
    }
  };

  const toggleCollection = (id) => {
    setFormData((prev) => ({
      ...prev,
      collectionIds: prev.collectionIds.includes(id)
        ? prev.collectionIds.filter((x) => x !== id)
        : [...prev.collectionIds, id]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.player.trim() || !formData.year.trim() || !formData.manufacturer.trim()) {
      showToast('Player, year and manufacturer are required.', 'warning');
      return;
    }
    try {
      setSaving(true);
      await onSave(card.id, formData);
      showToast('Card updated.', 'success');
      setTimeout(onClose, 800);
    } catch (err) {
      showToast(err.message || 'Could not save changes.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="max-h-[95vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5 sm:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-600">Editing</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-900">{card.player}</h2>
            <p className="mt-1 text-sm text-slate-500">{card.year} · {card.manufacturer}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
          >
            Cancel
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
            {/* Image column */}
            <div className="space-y-4">
              <label className="flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-sky-400 hover:bg-sky-50/40">
                <input type="file" accept="image/*" onChange={handleImageSelection} className="hidden" />
                {formData.imageUrl ? (
                  <img src={formData.imageUrl} alt="Card preview" className="max-h-[380px] w-full rounded-[1.5rem] object-contain shadow-sm" />
                ) : (
                  <>
                    <p className="text-lg font-semibold text-slate-900">Click to change image</p>
                    <p className="mt-2 text-sm text-slate-500">Optional — leave empty to keep no image.</p>
                  </>
                )}
              </label>
              {processingImage && (
                <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600">Optimizing image...</div>
              )}
              {formData.imageUrl && (
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, imageUrl: '' }))}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Remove image
                </button>
              )}
            </div>

            {/* Fields column */}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="mb-2 block text-sm font-medium text-slate-700">Player *</span>
                <input name="player" value={formData.player} onChange={handleChange} className="field" placeholder="Shohei Ohtani" required />
              </label>
              <label>
                <span className="mb-2 block text-sm font-medium text-slate-700">Sport</span>
                <select name="sport" value={formData.sport} onChange={handleChange} className="field">
                  {['Baseball', 'Football', 'Basketball', 'WNBA', 'Hockey', 'Soccer', 'Other'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="mb-2 block text-sm font-medium text-slate-700">Year *</span>
                <input name="year" value={formData.year} onChange={handleChange} className="field" placeholder="2024" required />
              </label>
              <label>
                <span className="mb-2 block text-sm font-medium text-slate-700">Manufacturer *</span>
                <select name="manufacturer" value={formData.manufacturer} onChange={handleChange} className="field" required>
                  <option value="">Select manufacturer</option>
                  {manufacturers.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </label>
              <label>
                <span className="mb-2 block text-sm font-medium text-slate-700">Set</span>
                <select name="set" value={formData.set} onChange={handleChange} className="field">
                  <option value="">Select set</option>
                  {sets.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label>
                <span className="mb-2 block text-sm font-medium text-slate-700">Card number</span>
                <input name="cardNumber" value={formData.cardNumber} onChange={handleChange} className="field" placeholder="#123" />
              </label>
              <label>
                <span className="mb-2 block text-sm font-medium text-slate-700">Debut date</span>
                <input type="date" name="debut" value={formData.debut} onChange={handleChange} className="field" />
              </label>
              <label className="sm:col-span-2">
                <span className="mb-2 block text-sm font-medium text-slate-700">Notes</span>
                <textarea name="notes" value={formData.notes} onChange={handleChange} rows="4" className="field min-h-[120px]" placeholder="Condition, purchase info, etc." />
              </label>

              {/* Collections */}
              {collections.length > 0 && (
                <div className="sm:col-span-2 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 space-y-3">
                  <p className="text-sm font-semibold text-slate-900">Collections</p>
                  <div className="flex flex-wrap gap-2">
                    {collections.map((col) => {
                      const active = formData.collectionIds.includes(col.id);
                      return (
                        <button
                          key={col.id}
                          type="button"
                          onClick={() => toggleCollection(col.id)}
                          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                            active
                              ? 'bg-sky-600 text-white'
                              : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          {active ? '✓ ' : ''}{col.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || processingImage}
              className="inline-flex items-center justify-center rounded-2xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:bg-slate-300"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>

        <Toast message={toast.message} type={toast.type} isVisible={toast.show} onClose={hideToast} />
      </div>
    </div>
  );
}

export default EditCardModal;
