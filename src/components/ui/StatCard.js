import React from 'react';

function StatCard({ label, value, accent, helper }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm shadow-slate-200/60 backdrop-blur">
      <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl ${accent}`}>
        <span className="text-sm font-semibold text-white">•</span>
      </div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-slate-900">{value}</p>
      {helper ? <p className="mt-2 text-sm text-slate-500">{helper}</p> : null}
    </div>
  );
}

export default StatCard;
