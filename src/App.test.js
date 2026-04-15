import { render, screen } from '@testing-library/react';
import Login from './components/Login';

// ─── Firebase mocks ──────────────────────────────────────────────────────────
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

// ─── Login component smoke test ──────────────────────────────────────────────
describe('Login', () => {
  it('renderiza el CTA principal y el botón de Sign In', () => {
    render(<Login />);
    expect(screen.getByText(/A faster, cleaner workflow/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });
});

// Nota: los tests de publicProfile están en src/utils/__tests__/publicProfile.test.js
// los tests de cardValidation en     src/utils/__tests__/cardValidation.test.js
// los tests de cardTextParser en     src/utils/__tests__/cardTextParser.test.js
// los tests de cardService en        src/services/__tests__/cardService.test.js
// los tests de collectionService en  src/services/__tests__/collectionService.test.js
