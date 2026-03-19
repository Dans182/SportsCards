import { render, screen } from '@testing-library/react';
import Login from './components/Login';
import {
  buildPublicProfilePath,
  createProfileSlug,
  getPublicProfileSlugFromPath,
  slugifyProfileName
} from './utils/publicProfile';

jest.mock('./firebase', () => ({
  __esModule: true,
  auth: {},
  db: {}
}));

jest.mock('firebase/auth', () => ({
  __esModule: true,
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn()
}));

jest.mock('firebase/firestore', () => ({
  __esModule: true,
  doc: jest.fn(),
  setDoc: jest.fn()
}));

test('renders login CTA copy', () => {
  render(<Login />);
  expect(screen.getByText(/A faster, cleaner workflow/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
});

test('normalizes public profile slugs and paths', () => {
  expect(slugifyProfileName('  Álvaro Rookie PC  ')).toBe('alvaro-rookie-pc');
  expect(createProfileSlug('')).toBe('collector');
  expect(buildPublicProfilePath('juan-cards')).toBe('/collection/juan-cards');
  expect(getPublicProfileSlugFromPath('/collection/juan-cards')).toBe('juan-cards');
  expect(getPublicProfileSlugFromPath('/dashboard')).toBeNull();
});
