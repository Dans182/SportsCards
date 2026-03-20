import React, { useMemo, useState } from 'react';
import { getManufacturersForSport } from '../data/manufacturers';
import { getSetsForManufacturer } from '../data/sets';
import { prepareImageAsset } from '../utils/imageProcessing';
import { parseCardText } from '../utils/cardTextParser';
import { recognizeCardText } from '../utils/ocr';
import CollectionPicker from './CollectionPicker';
import Toast from './Toast';

const emptyCard = {
  player: '',
  year: '',
  manufacturer: '',
  sport: 'Baseball',
  set: '',
  cardNumber: '',
  debut: '',
  notes: '',
  imageUrl: '',
  ocrText: '',
  collectionIds: []
};

function AddCard({ onSave, collections = [], onEnsureCollections }) {
  const [formData, setFormData] = useState(emptyCard);
  const [processingImage, setProcessingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [ocrRunning, setOcrRunning] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const manufacturers = useMemo(() => getManufacturersForSport(formData.sport), [formData.sport]);
  const sets = useMemo(() => getSetsForManufacturer(formData.manufacturer, formData.sport), [formData.manufacturer, formData.sport]);

  const hideToast = () => setToast({ show: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => setToast({ show: true, message, type });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => {
      const nextState = { ...previous, [name]: value };

      if (name === 'sport') {
        nextState.manufacturer = '';
        nextState.set = '';
      }

      if (name === 'manufacturer') {
        nextState.set = '';
      }

      // if (name === 'graded' && value === 'No') {
      //   nextState.gradingCompany = '';
      //   nextState.gradeNumber = '';
      // }

      return nextState;
    });
  };

  const handleImageSelection = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setProcessingImage(true);
      const imageAsset = await prepareImageAsset(file);
      setFormData((previous) => ({ ...previous, imageUrl: imageAsset.previewUrl }));
      showToast('Image optimized and ready.', 'success');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setProcessingImage(false);
    }
  };

  const applyOcr = async () => {
    if (!formData.imageUrl) {
      showToast('Add an image first to run OCR.', 'warning');
      return;
    }
    try {
      setOcrRunning(true);
      setOcrProgress(0);
      const text = await recognizeCardText(formData.imageUrl, setOcrProgress);
      const parsed = parseCardText(text, formData.sport);
      setFormData((previous) => ({
        ...previous,
        ...Object.fromEntries(Object.entries(parsed).filter(([, value]) => value)),
        notes: previous.notes || parsed.notes
      }));
      showToast('OCR completed. Review the suggested fields before saving.', 'success');
    } catch (error) {
      showToast(error.message || 'OCR failed to process this image.', 'error');
    } finally {
      setOcrRunning(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.player.trim() || !formData.year.trim() || !formData.manufacturer.trim()) {
      showToast('Player, year and manufacturer are required.', 'warning');
      return;
    }

    try {
      setSaving(true);

      // Resolve collection assignment
      let resolvedCollections = collections;

      // Case 1: no collections yet → auto-create "Mi colección"
      if (resolvedCollections.length === 0) {
        resolvedCollections = await onEnsureCollections();
      }

      let collectionIds = formData.collectionIds;

      // Case 1 & 2: zero or one collection → auto-assign
      if (resolvedCollections.length <= 1) {
        collectionIds = resolvedCollections.map((c) => c.id);
      }

      // Case 3: multiple collections → user must pick at least one
      if (resolvedCollections.length > 1 && collectionIds.length === 0) {
        showToast('Selecciona al menos una colección.', 'warning');
        setSaving(false);
        return;
      }

      await onSave({ ...formData, collectionIds });
      setFormData(emptyCard);
      setOcrProgress(0);
      showToast('Card saved successfully.', 'success');
    } catch (error) {
      showToast(error.message || 'Unable to save the card.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70 sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-600">Intake</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Add a new card</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">Upload a scan or photo, let OCR suggest values, then save the card to Firestore.</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Database in use: <span className="font-semibold">Firebase Firestore</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-4">
            <label className="flex min-h-[360px] cursor-pointer flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-sky-400 hover:bg-sky-50/40">
              <input type="file" accept="image/*" onChange={handleImageSelection} className="hidden" />
              {formData.imageUrl ? (
                <img src={formData.imageUrl} alt="Card preview" className="max-h-[420px] w-full rounded-[1.5rem] object-contain shadow-sm" />
              ) : (
                <>
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-900 text-white">OCR</div>
                  <p className="text-lg font-semibold text-slate-900">Upload front image</p>
                  <p className="mt-2 max-w-sm text-sm text-slate-500">The image is compressed in-browser and stored inline with the card document.</p>
                </>
              )}
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={applyOcr} disabled={!formData.imageUrl || ocrRunning || processingImage} className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300">
                {ocrRunning ? `OCR ${ocrProgress}%` : 'Run OCR assist'}
              </button>
              <button type="button" onClick={() => setFormData((p) => ({ ...p, imageUrl: '', ocrText: '' }))} className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
                Remove image
              </button>
            </div>

            {processingImage && (
              <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600">Optimizing image...</div>
            )}

            {formData.ocrText && (
              <div className="rounded-3xl border border-sky-200 bg-sky-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">OCR extracted text</p>
                <p className="mt-3 max-h-32 overflow-auto whitespace-pre-wrap text-sm text-slate-700">{formData.ocrText}</p>
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-700">Player *</span>
              <input name="player" value={formData.player} onChange={handleChange} className="field" placeholder="Shohei Ohtani" required />
            </label>
            <label>
              <span className="mb-2 block text-sm font-medium text-slate-700">Sport</span>
              <select name="sport" value={formData.sport} onChange={handleChange} className="field">
                {['Baseball', 'Football', 'Basketball', 'WNBA', 'Hockey', 'Soccer', 'Other'].map((sport) => (
                  <option key={sport} value={sport}>{sport}</option>
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
            {/* <label>
              <span className="mb-2 block text-sm font-medium text-slate-700">Graded?</span>
              <select name="graded" value={formData.graded} onChange={handleChange} className="field">
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </label>
            {formData.graded === 'Yes' && (
              <>
                <label>
                  <span className="mb-2 block text-sm font-medium text-slate-700">Grading company</span>
                  <input name="gradingCompany" value={formData.gradingCompany} onChange={handleChange} className="field" placeholder="PSA" />
                </label>
                <label>
                  <span className="mb-2 block text-sm font-medium text-slate-700">Grade</span>
                  <input name="gradeNumber" value={formData.gradeNumber} onChange={handleChange} className="field" placeholder="10" />
                </label>
              </>
            )} */}
            <label className="sm:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-700">Notes</span>
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows="5" className="field min-h-[140px]" placeholder="Condition, parallels, purchase info, etc." />
            </label>

            {/* Collection picker – only visible when 2+ collections exist */}
            <div className="sm:col-span-2">
              <CollectionPicker
                collections={collections}
                selectedIds={formData.collectionIds}
                onChange={(ids) => setFormData((p) => ({ ...p, collectionIds: ids }))}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
          <button type="button" onClick={() => setFormData(emptyCard)} className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
            Reset form
          </button>
          <button type="submit" disabled={saving || processingImage} className="inline-flex items-center justify-center rounded-2xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300">
            {saving ? 'Saving...' : 'Save card'}
          </button>
        </div>
      </form>

      <Toast message={toast.message} type={toast.type} isVisible={toast.show} onClose={hideToast} />
    </section>
  );
}

export default AddCard;