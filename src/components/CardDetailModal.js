import React from 'react';

function CardDetailModal({ isOpen, onClose, card }) {
  if (!isOpen || !card) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="grid max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl lg:grid-cols-[1.1fr_0.9fr]">
        <div className="bg-slate-950/95 p-4 lg:p-6">
          {card.imageUrl ? (
            <img src={card.imageUrl} alt={`${card.player} card`} className="h-full max-h-[78vh] w-full rounded-[1.5rem] object-contain" />
          ) : (
            <div className="flex h-full min-h-[420px] items-center justify-center rounded-[1.5rem] border border-dashed border-white/20 text-sm text-slate-300">
              No image available
            </div>
          )}
        </div>
        <div className="overflow-y-auto p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-600">Card detail</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-900">{card.player}</h2>
              <p className="mt-2 text-sm text-slate-500">{card.year} • {card.manufacturer}</p>
            </div>
            <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900">
              Close
            </button>
          </div>

          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              ['Sport', card.sport],
              ['Set', card.set || '—'],
              ['Card number', card.cardNumber || '—'],
              // ['Graded', card.graded === 'Yes' ? `${card.gradingCompany || ''} ${card.gradeNumber || ''}`.trim() : 'No'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</dt>
                <dd className="mt-2 text-sm font-medium text-slate-900">{value}</dd>
              </div>
            ))}
          </dl>

          {card.notes ? (
            <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Notes</p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{card.notes}</p>
            </div>
          ) : null}

          {card.ocrText ? (
            <div className="mt-6 rounded-3xl border border-sky-200 bg-sky-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">OCR transcript</p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{card.ocrText}</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default CardDetailModal;