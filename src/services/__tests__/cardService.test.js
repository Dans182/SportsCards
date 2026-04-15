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
}));

import { normalizeCardPayload } from '../cardService';

describe('normalizeCardPayload', () => {
  const USER_ID = 'test-user-123';

  const fullCard = {
    player: '  Shohei Ohtani  ',
    year: 2024,
    manufacturer: '  Topps  ',
    sport: 'Baseball',
    set: '  Series 1  ',
    cardNumber: '  #1  ',
    gradingCompany: '  PSA  ',
    gradeNumber: 10,
    notes: '  Mint condition  ',
    debut: '2018-03-29',
    isParallel: true,
    isAutograph: false,
    isRelic: true,
    isRookieCard: true,
    is1stBowman: false,
    isInsert: true,
    insertSet: '  Chrome  ',
    numbered: '  45/99  ',
    imageUrl: 'data:image/jpeg;base64,abc',
    ocrText: '  some text  ',
    collectionIds: ['col1', 'col2'],
  };

  it('recorta espacios de todos los campos de texto', () => {
    const result = normalizeCardPayload(fullCard, USER_ID);
    expect(result.player).toBe('Shohei Ohtani');
    expect(result.manufacturer).toBe('Topps');
    expect(result.set).toBe('Series 1');
    expect(result.cardNumber).toBe('#1');
    expect(result.gradingCompany).toBe('PSA');
    expect(result.notes).toBe('Mint condition');
    expect(result.insertSet).toBe('Chrome');
    expect(result.numbered).toBe('45/99');
    expect(result.ocrText).toBe('some text');
  });

  it('convierte year a string', () => {
    const result = normalizeCardPayload(fullCard, USER_ID);
    expect(result.year).toBe('2024');
  });

  it('convierte gradeNumber a string', () => {
    const result = normalizeCardPayload(fullCard, USER_ID);
    expect(result.gradeNumber).toBe('10');
  });

  it('convierte campos booleanos correctamente', () => {
    const result = normalizeCardPayload(fullCard, USER_ID);
    expect(result.isParallel).toBe(true);
    expect(result.isAutograph).toBe(false);
    expect(result.isRelic).toBe(true);
    expect(result.isRookieCard).toBe(true);
    expect(result.is1stBowman).toBe(false);
    expect(result.isInsert).toBe(true);
  });

  it('incluye el userId en el payload', () => {
    const result = normalizeCardPayload(fullCard, USER_ID);
    expect(result.userId).toBe(USER_ID);
  });

  it('preserva collectionIds como array', () => {
    const result = normalizeCardPayload(fullCard, USER_ID);
    expect(result.collectionIds).toEqual(['col1', 'col2']);
  });

  it('usa array vacío para collectionIds si no es array', () => {
    const result = normalizeCardPayload({ ...fullCard, collectionIds: null }, USER_ID);
    expect(result.collectionIds).toEqual([]);
  });

  describe('valores por defecto para campos ausentes', () => {
    const emptyCard = {};

    it('todos los campos de texto devuelven cadena vacía', () => {
      const result = normalizeCardPayload(emptyCard, USER_ID);
      expect(result.player).toBe('');
      expect(result.year).toBe('');
      expect(result.manufacturer).toBe('');
      expect(result.sport).toBe('');
      expect(result.set).toBe('');
      expect(result.cardNumber).toBe('');
      expect(result.gradingCompany).toBe('');
      expect(result.gradeNumber).toBe('');
      expect(result.notes).toBe('');
      expect(result.debut).toBe('');
      expect(result.numbered).toBe('');
      expect(result.imageUrl).toBe('');
      expect(result.ocrText).toBe('');
      expect(result.insertSet).toBe('');
    });

    it('todos los booleanos devuelven false', () => {
      const result = normalizeCardPayload(emptyCard, USER_ID);
      expect(result.isParallel).toBe(false);
      expect(result.isAutograph).toBe(false);
      expect(result.isRelic).toBe(false);
      expect(result.isRookieCard).toBe(false);
      expect(result.is1stBowman).toBe(false);
      expect(result.isInsert).toBe(false);
    });

    it('collectionIds es array vacío', () => {
      const result = normalizeCardPayload(emptyCard, USER_ID);
      expect(result.collectionIds).toEqual([]);
    });
  });

  it('incluye updatedAt como Date', () => {
    const before = new Date();
    const result = normalizeCardPayload(fullCard, USER_ID);
    const after = new Date();
    expect(result.updatedAt).toBeInstanceOf(Date);
    expect(result.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(result.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
  });
});
