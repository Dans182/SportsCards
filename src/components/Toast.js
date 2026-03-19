import React, { useEffect } from 'react';

const palette = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  error: 'border-rose-200 bg-rose-50 text-rose-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  info: 'border-sky-200 bg-sky-50 text-sky-700'
};

function Toast({ message, type = 'success', isVisible, onClose }) {
  useEffect(() => {
    if (!isVisible) {
      return undefined;
    }

    const timer = window.setTimeout(onClose, 4000);
    return () => window.clearTimeout(timer);
  }, [isVisible, onClose]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-[60] animate-slide-in">
      <div className={`max-w-sm rounded-2xl border px-4 py-3 text-sm font-medium shadow-lg ${palette[type] || palette.success}`}>
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/70 text-xs font-bold">i</span>
          <p className="flex-1 leading-5">{message}</p>
          <button type="button" onClick={onClose} className="text-current/70 transition hover:text-current">×</button>
        </div>
      </div>
    </div>
  );
}

export default Toast;
