import React, { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

function ProfileSettings({ isOpen, onClose, userName, userEmail, onNameUpdate }) {
  const [newName, setNewName] = useState(userName || '');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNewName(userName || '');
  }, [userName]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const user = auth.currentUser;
      await setDoc(doc(db, 'users', user.uid), {
        name: newName.trim(),
        email: user.email,
        updatedAt: new Date()
      }, { merge: true });
      onNameUpdate(newName.trim());
      setMessage('Profile updated successfully.');
    } catch (error) {
      setMessage(error.message || 'Unable to update your profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-600">Profile</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Collector preferences</h2>
            <p className="mt-2 text-sm text-slate-500">Update the name shown across your dashboard and manage your session.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-500 transition hover:border-slate-300 hover:text-slate-900">
            Close
          </button>
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Signed in as</p>
          <p className="mt-2 text-sm font-medium text-slate-900">{userEmail}</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Display name</span>
            <input
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
              placeholder="Your collector name"
              required
            />
          </label>

          {message ? (
            <div className={`rounded-2xl px-4 py-3 text-sm ${message.toLowerCase().includes('unable') ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
              {message}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="submit" disabled={saving} className="inline-flex flex-1 items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:bg-slate-400">
              {saving ? 'Saving...' : 'Save changes'}
            </button>
            <button type="button" onClick={handleLogout} className="inline-flex flex-1 items-center justify-center rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700">
              Sign out
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileSettings;
