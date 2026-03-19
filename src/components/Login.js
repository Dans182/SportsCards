import React, { useMemo, useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import Toast from './Toast';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const screenTitle = useMemo(() => (
    isRegistering ? 'Create your collector account' : 'Manage your baseball card vault'
  ), [isRegistering]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => setToast({ show: false, message: '', type: 'success' });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const { user } = userCredential;

        await setDoc(doc(db, 'users', user.uid), {
          name: name.trim(),
          email: email.trim(),
          createdAt: new Date(),
          updatedAt: new Date()
        }, { merge: true });

        showToast('Account created. Welcome to your new collection workspace!', 'success');
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
        showToast('Welcome back!', 'success');
      }
    } catch (error) {
      showToast(error.message || 'Authentication failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-sky-500/20 via-slate-900 to-slate-950 p-8 shadow-2xl shadow-sky-950/40 lg:p-12">
          <span className="inline-flex rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-sky-200">
            SportsCards • Collector OS
          </span>
          <h1 className="mt-6 max-w-xl text-4xl font-semibold leading-tight sm:text-5xl">
            A faster, cleaner workflow for cataloging your baseball cards.
          </h1>
          <p className="mt-5 max-w-2xl text-base text-slate-300 sm:text-lg">
            Centralize your collection, store images securely in Firestore, review graded inventory and use OCR assistance to speed up new card intake.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              ['Cloud database', 'Firestore stores your collection instead of localStorage.'],
              ['Modern UI', 'Responsive dashboard with filters, stats and detail views.'],
              ['OCR ready', 'Open-source Tesseract.js helps prefill fields from scans.']
            ].map(([title, body]) => (
              <article key={title} className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <h2 className="text-sm font-semibold text-sky-100">{title}</h2>
                <p className="mt-2 text-sm text-slate-300">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 text-slate-900 shadow-2xl shadow-slate-950/10 lg:p-10">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">Access</p>
            <h2 className="mt-3 text-3xl font-semibold">{screenTitle}</h2>
            <p className="mt-2 text-sm text-slate-500">
              {isRegistering ? 'Create a secure profile to save your personal collection.' : 'Sign in to continue organizing and searching your inventory.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegistering ? (
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Name</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                  placeholder="Juan Coleccionista"
                  required
                />
              </label>
            ) : null}

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                placeholder="collector@example.com"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
              <input
                type="password"
                value={password}
                minLength={6}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                placeholder="At least 6 characters"
                required
              />
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {submitting ? 'Working...' : isRegistering ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setIsRegistering((previous) => !previous);
              hideToast();
            }}
            className="mt-6 text-sm font-medium text-sky-700 transition hover:text-sky-900"
          >
            {isRegistering ? 'Already have an account? Sign in instead.' : 'Need an account? Create one.'}
          </button>
        </section>
      </div>

      <Toast message={toast.message} type={toast.type} isVisible={toast.show} onClose={hideToast} />
    </div>
  );
}

export default Login;
