import React, { useEffect, useMemo, useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { saveUserProfile } from '../services/profileService';
import { buildPublicProfileUrl, createProfileSlug } from '../utils/publicProfile';

function ProfileSettings({ isOpen, onClose, profile, onProfileUpdate, collections = [] }) {
  const [formState, setFormState] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    publicProfileEnabled: profile?.publicProfileEnabled || false,
    publicSlug: profile?.publicSlug || '',
    shareDescription: profile?.shareDescription || '',
    publicCollectionId: profile?.publicCollectionId || 'all',
    defaultPublicSport: profile?.defaultPublicSport || 'All',
    defaultPublicSort: profile?.defaultPublicSort || 'updated'
  });
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormState({
      name: profile?.name || '',
      email: profile?.email || auth.currentUser?.email || '',
      publicProfileEnabled: profile?.publicProfileEnabled || false,
      publicSlug: profile?.publicSlug || '',
      shareDescription: profile?.shareDescription || '',
      publicCollectionId: profile?.publicCollectionId || 'all',
      defaultPublicSport: profile?.defaultPublicSport || 'All',
      defaultPublicSort: profile?.defaultPublicSort || 'updated'
    });
  }, [profile]);

  const previewSlug = useMemo(() => (
    createProfileSlug(formState.publicSlug || formState.name || '', auth.currentUser?.uid?.slice(0, 8) || 'collector')
  ), [formState.name, formState.publicSlug]);

  const publicUrl = useMemo(() => buildPublicProfileUrl(previewSlug), [previewSlug]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormState((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const user = auth.currentUser;
      const nextProfile = await saveUserProfile(user.uid, {
        ...profile,
        ...formState,
        email: user.email || formState.email,
        createdAt: profile?.createdAt || new Date()
      });
      onProfileUpdate(nextProfile);
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

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setMessage('Public collection link copied to clipboard.');
    } catch (error) {
      setMessage('Could not copy automatically. You can still copy the URL manually.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-600">Profile</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Collector preferences</h2>
            <p className="mt-2 text-sm text-slate-500">Update your display name, control public sharing and manage your session.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-500 transition hover:border-slate-300 hover:text-slate-900">
            Close
          </button>
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Signed in as</p>
          <p className="mt-2 text-sm font-medium text-slate-900">{auth.currentUser?.email || formState.email}</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Display name</span>
            <input
              name="name"
              value={formState.name}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
              placeholder="Your collector name"
              required
            />
          </label>

          <section className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Public collection</h3>
                <p className="mt-1 text-sm text-slate-500">Create a read-only public page so friends can browse your collection without signing in.</p>
              </div>
              <label className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  name="publicProfileEnabled"
                  checked={formState.publicProfileEnabled}
                  onChange={handleChange}
                />
                Share publicly
              </label>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label>
                <span className="mb-2 block text-sm font-medium text-slate-700">Public slug</span>
                <input
                  name="publicSlug"
                  value={formState.publicSlug}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                  placeholder="juan-cards"
                />
                <span className="mt-2 block text-xs text-slate-500">Only letters, numbers and hyphens are kept in the final URL.</span>
              </label>

              <label>
                <span className="mb-2 block text-sm font-medium text-slate-700">Short intro</span>
                <textarea
                  name="shareDescription"
                  value={formState.shareDescription}
                  onChange={handleChange}
                  rows="4"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                  placeholder="Vintage baseball focus, graded rookies and modern parallels."
                />
              </label>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3 border-t border-slate-200 pt-5">
              <label>
                <span className="mb-2 block text-sm font-medium text-slate-700">Collection to share</span>
                <select name="publicCollectionId" value={formState.publicCollectionId} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 text-sm">
                  <option value="all">All collections</option>
                  {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
              <label>
                <span className="mb-2 block text-sm font-medium text-slate-700">Default sport</span>
                <select name="defaultPublicSport" value={formState.defaultPublicSport} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 text-sm">
                  {['All', 'Baseball', 'Football', 'Basketball', 'WNBA', 'Hockey', 'Soccer', 'Other'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="mb-2 block text-sm font-medium text-slate-700">Default sort</span>
                <select name="defaultPublicSort" value={formState.defaultPublicSort} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 text-sm">
                  <option value="updated">Recently updated</option>
                  <option value="year">Newest year</option>
                  <option value="player">Player A-Z</option>
                  <option value="debut_asc">Debut: Oldest to newest</option>
                  <option value="debut_desc">Debut: Newest to oldest</option>
                </select>
              </label>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Preview link</p>
              <p className="mt-2 break-all text-sm font-medium text-slate-900">{publicUrl}</p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Copy link
                </button>
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Open public page
                </a>
              </div>
            </div>
          </section>

          {message ? (
            <div className={`rounded-2xl px-4 py-3 text-sm ${message.toLowerCase().includes('unable') || message.toLowerCase().includes('could not') || message.toLowerCase().includes('already in use') ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
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
