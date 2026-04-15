// Mock Firebase antes de importar el service
jest.mock('../../firebase', () => ({ db: {} }));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(() => ({})),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  doc: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  serverTimestamp: jest.fn(() => ({ _type: 'serverTimestamp' })),
}));

import { normalizeCollection } from '../collectionService';

describe('normalizeCollection', () => {
  it('devuelve todos los campos con datos completos', () => {
    const data = {
      name: 'Mi colección',
      description: 'Béisbol vintage',
      userId: 'user-abc',
      createdAt: { seconds: 1700000000 },
      updatedAt: { seconds: 1700100000 },
    };

    const result = normalizeCollection('col-123', data);

    expect(result.id).toBe('col-123');
    expect(result.name).toBe('Mi colección');
    expect(result.description).toBe('Béisbol vintage');
    expect(result.userId).toBe('user-abc');
    expect(result.createdAt).toEqual({ seconds: 1700000000 });
    expect(result.updatedAt).toEqual({ seconds: 1700100000 });
  });

  it('usa valores por defecto para datos vacíos', () => {
    const result = normalizeCollection('col-empty', {});

    expect(result.id).toBe('col-empty');
    expect(result.name).toBe('Mi colección'); // fallback
    expect(result.description).toBe('');
    expect(result.userId).toBe('');
    expect(result.createdAt).toBeNull();
    expect(result.updatedAt).toBeNull();
  });

  it('usa valores por defecto si data es undefined', () => {
    const result = normalizeCollection('col-undef', undefined);

    expect(result.id).toBe('col-undef');
    expect(result.name).toBe('Mi colección');
    expect(result.description).toBe('');
    expect(result.userId).toBe('');
  });

  it('preserva el id del documento', () => {
    const result = normalizeCollection('my-special-id', { name: 'Test' });
    expect(result.id).toBe('my-special-id');
  });
});
