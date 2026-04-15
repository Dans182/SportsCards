import { MIN_CARD_YEAR, validateCardForm, validateCardYear } from '../cardValidation';

// ─── validateCardYear ────────────────────────────────────────────────────────

describe('validateCardYear', () => {
  const CURRENT_YEAR = new Date().getFullYear();

  it('devuelve null para un año válido', () => {
    expect(validateCardYear('2024', CURRENT_YEAR)).toBeNull();
    expect(validateCardYear(2020, CURRENT_YEAR)).toBeNull();
    expect(validateCardYear('1995', CURRENT_YEAR)).toBeNull();
  });

  it('acepta el año actual', () => {
    expect(validateCardYear(String(CURRENT_YEAR), CURRENT_YEAR)).toBeNull();
  });

  it('acepta el año mínimo histórico (1860)', () => {
    expect(validateCardYear(String(MIN_CARD_YEAR), CURRENT_YEAR)).toBeNull();
  });

  it('rechaza año superior al actual', () => {
    const nextYear = CURRENT_YEAR + 1;
    const result = validateCardYear(String(nextYear), CURRENT_YEAR);
    expect(result).toMatch(new RegExp(`${CURRENT_YEAR}`));
    expect(result).not.toBeNull();
  });

  it('rechaza año anterior a 1860', () => {
    const result = validateCardYear('1859', CURRENT_YEAR);
    expect(result).toMatch(/1860/);
    expect(result).not.toBeNull();
  });

  it('rechaza cadena vacía', () => {
    expect(validateCardYear('', CURRENT_YEAR)).not.toBeNull();
    expect(validateCardYear('   ', CURRENT_YEAR)).not.toBeNull();
  });

  it('rechaza null o undefined', () => {
    expect(validateCardYear(null, CURRENT_YEAR)).not.toBeNull();
    expect(validateCardYear(undefined, CURRENT_YEAR)).not.toBeNull();
  });

  it('rechaza texto no numérico', () => {
    expect(validateCardYear('abc', CURRENT_YEAR)).not.toBeNull();
    expect(validateCardYear('20xx', CURRENT_YEAR)).not.toBeNull();
  });

  it('MIN_CARD_YEAR exportado es 1860', () => {
    expect(MIN_CARD_YEAR).toBe(1860);
  });
});

// ─── validateCardForm ─────────────────────────────────────────────────────────

describe('validateCardForm', () => {
  const CURRENT_YEAR = new Date().getFullYear();

  const validForm = {
    player: 'Shohei Ohtani',
    year: '2024',
    manufacturer: 'Topps',
  };

  it('devuelve null para un formulario completamente válido', () => {
    expect(validateCardForm(validForm, CURRENT_YEAR)).toBeNull();
  });

  it('rechaza si player está vacío', () => {
    expect(validateCardForm({ ...validForm, player: '' }, CURRENT_YEAR)).not.toBeNull();
    expect(validateCardForm({ ...validForm, player: '   ' }, CURRENT_YEAR)).not.toBeNull();
  });

  it('rechaza si year está vacío', () => {
    expect(validateCardForm({ ...validForm, year: '' }, CURRENT_YEAR)).not.toBeNull();
  });

  it('rechaza si manufacturer está vacío', () => {
    expect(validateCardForm({ ...validForm, manufacturer: '' }, CURRENT_YEAR)).not.toBeNull();
  });

  it('rechaza año inválido incluso con resto de campos correctos', () => {
    const nextYear = CURRENT_YEAR + 1;
    const result = validateCardForm({ ...validForm, year: String(nextYear) }, CURRENT_YEAR);
    expect(result).not.toBeNull();
    expect(result).toMatch(new RegExp(`${CURRENT_YEAR}`));
  });

  it('rechaza año anterior a 1860', () => {
    const result = validateCardForm({ ...validForm, year: '1800' }, CURRENT_YEAR);
    expect(result).not.toBeNull();
    expect(result).toMatch(/1860/);
  });

  it('no lanza si formData es null/undefined (valor defensivo)', () => {
    expect(() => validateCardForm(null, CURRENT_YEAR)).not.toThrow();
    expect(validateCardForm(null, CURRENT_YEAR)).not.toBeNull();
  });
});
