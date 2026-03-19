import React from 'react';

function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel' }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-rose-100 text-rose-600">!</div>
        <h3 className="mt-5 text-xl font-semibold text-slate-900">{title}</h3>
        <p className="mt-3 text-sm leading-6 text-slate-500">{message}</p>
        <div className="mt-8 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
            {cancelText}
          </button>
          <button
            type="button"
            onClick={async () => {
              await onConfirm();
              onClose();
            }}
            className="flex-1 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
