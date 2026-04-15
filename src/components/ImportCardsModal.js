import React, { useState } from 'react';
import Papa from 'papaparse';
import { validateCardYear } from '../utils/cardValidation';
import Toast from './Toast';
import { prepareImageAsset } from '../utils/imageProcessing';

function ImportCardsModal({ isOpen, onClose, onSave, collections = [] }) {
  const [csvFile, setCsvFile] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [collectionId, setCollectionId] = useState(collections[0]?.id || '');

  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  if (!isOpen) return null;

  const showToast = (message, type = 'success') => setToast({ show: true, message, type });
  const hideToast = () => setToast({ show: false, message: '', type: 'success' });

  const downloadTemplate = () => {
    const headers = [
      'player', 'year', 'manufacturer', 'sport', 'set', 'cardNumber',
      'numbered', 'isParallel', 'isAutograph', 'isRelic',
      'isRookieCard', 'is1stBowman', 'isInsert', 'insertSet',
      'debut', 'notes', 'image_filename'
    ];
    const example1 = [
      'Shohei Ohtani', '2024', 'Topps', 'Baseball', 'Series 1', '1',
      '10/50', 'TRUE', 'FALSE', 'FALSE',
      'TRUE', 'FALSE', 'FALSE', '',
      '2018-03-29', 'Mint condition', 'ohtani_front.jpg'
    ];
    const example2 = [
      'Jackson Holliday', '2021', 'Bowman', 'Baseball', 'Bowman Chrome', '78',
      '', 'FALSE', 'FALSE', 'FALSE',
      'FALSE', 'TRUE', 'TRUE', 'Refractor',
      '', '', ''
    ];

    const csvContent = [
      headers.join(','),
      example1.join(','),
      example2.join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'sports_cards_template.csv';
    link.click();
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!csvFile) {
      showToast('Please select a CSV file.', 'warning');
      return;
    }
    if (!collectionId) {
      showToast('Please select a destination collection.', 'warning');
      return;
    }

    setImporting(true);
    setProgress(0);

    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data;
        setTotal(rows.length);

        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          setProgress(i + 1);

          try {
            const yearError = validateCardYear(row.year);
            if (yearError) {
              console.warn(`Fila ${i + 1}: ${yearError}`);
              errorCount++;
              continue;
            }
            // Build the card payload. Defaults to safe fallback if missing.
            const cardData = {
              player: row.player?.trim() || 'Unknown Player',
              year: row.year?.trim() || new Date().getFullYear().toString(),
              manufacturer: row.manufacturer?.trim() || 'Unknown',
              sport: row.sport?.trim() || 'Baseball',
              set: row.set?.trim() || '',
              cardNumber: row.cardNumber?.trim() || '',
              numbered: row.numbered?.trim() || '',
              isParallel: String(row.isParallel).toLowerCase() === 'true',
              isAutograph: String(row.isAutograph).toLowerCase() === 'true',
              isRelic: String(row.isRelic).toLowerCase() === 'true',
              isRookieCard: String(row.isRookieCard).toLowerCase() === 'true',
              is1stBowman: String(row.is1stBowman).toLowerCase() === 'true',
              isInsert: String(row.isInsert).toLowerCase() === 'true',
              insertSet: row.insertSet?.trim() || '',
              debut: row.debut?.trim() || '',
              notes: row.notes?.trim() || '',
              collectionIds: [collectionId],
              imageUrl: '',
            };

            // Process image if specified
            if (row.image_filename) {
              const matchedFile = Array.from(imageFiles).find(f => f.name === row.image_filename.trim());
              if (matchedFile) {
                const imgAsset = await prepareImageAsset(matchedFile);
                cardData.imageUrl = imgAsset.previewUrl;
              }
            }

            await onSave(cardData);
            successCount++;
          } catch (err) {
            console.error('Failed to import row', row, err);
            errorCount++;
          }
        }

        setImporting(false);
        showToast(`Import complete. ${successCount} imported, ${errorCount} failed.`, errorCount === 0 ? 'success' : 'warning');

        if (errorCount === 0) {
          setTimeout(() => {
            onClose();
            setCsvFile(null);
            setImageFiles([]);
          }, 2000);
        }
      },
      error: (err) => {
        setImporting(false);
        showToast('Failed to parse CSV.', 'error');
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-slate-200 bg-white shadow-2xl p-6 sm:p-8">
        
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-600">Bulk Import</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-900">Import CSV</h2>
            <p className="mt-1 text-sm text-slate-500">Upload multiple cards at once using a CSV spreadsheet.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={importing}
            className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-500 transition hover:border-slate-300 hover:text-slate-900 disabled:opacity-50"
          >
            Close
          </button>
        </div>

        <div className="mt-6 rounded-2xl bg-sky-50 border border-sky-100 p-4 mb-8">
          <h3 className="text-sm font-semibold text-sky-800">How to use this tool</h3>
          <ol className="mt-2 list-decimal list-inside text-sm text-sky-700 space-y-1">
            <li>Download the template file below.</li>
            <li>Fill the template in Excel or Google Sheets (keep headers unchanged).</li>
            <li>Export as `.csv` and select it here.</li>
            <li>If you have photos, put their filenames in the `image_filename` column exactly as they are on your computer.</li>
            <li>Select all those image files simultaneously in the second box.</li>
          </ol>
          <button type="button" onClick={downloadTemplate} className="mt-4 rounded-xl bg-white border border-sky-200 text-sky-700 px-4 py-2 text-sm font-semibold hover:bg-sky-50 transition">
            ↓ Download CSV Template
          </button>
        </div>

        <form onSubmit={handleImport} className="space-y-6">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">1. Destination Collection *</span>
            <select 
              value={collectionId} 
              onChange={(e) => setCollectionId(e.target.value)} 
              className="field w-full" 
              required
              disabled={importing}
            >
              <option value="">-- Choose collection --</option>
              {collections.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">2. Select `.csv` File *</span>
            <input 
              type="file" 
              accept=".csv" 
              onChange={(e) => setCsvFile(e.target.files[0])} 
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 cursor-pointer" 
              required
              disabled={importing}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">3. Select Image Files (Optional)</span>
            <p className="mb-2 text-xs text-slate-500">You can drag and select multiple photos at once. We will match them by name to the ones listed in your CSV.</p>
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              onChange={(e) => setImageFiles(e.target.files)} 
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
              disabled={importing}
            />
            {imageFiles.length > 0 && <p className="mt-2 text-xs font-semibold text-emerald-600">{imageFiles.length} images selected</p>}
          </label>

          {importing && (
            <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-200 p-4 text-center">
              <p className="text-sm font-medium text-slate-700 mb-2">Importing cards... please don't close this window.</p>
              <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div className="bg-sky-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${(progress / total) * 100}%` }}></div>
              </div>
              <p className="text-xs text-slate-500 mt-2">{progress} of {total} processed</p>
            </div>
          )}

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={importing || !csvFile || !collectionId}
              className="inline-flex items-center justify-center rounded-2xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:bg-slate-300"
            >
              {importing ? 'Processing...' : 'Start Import'}
            </button>
          </div>
        </form>

        <Toast message={toast.message} type={toast.type} isVisible={toast.show} onClose={hideToast} />
      </div>
    </div>
  );
}

export default ImportCardsModal;
