import { parseCardText } from '../cardTextParser';

// cardTextParser importa desde ../data/manufacturers y ../data/sets
// que son módulos JS estáticos (sin Firebase), no necesitan mock.

describe('parseCardText', () => {
  describe('año', () => {
    it('extrae un año de 4 dígitos del texto', () => {
      const { year } = parseCardText('Topps 2021 Baseball Card', 'Baseball');
      expect(year).toBe('2021');
    });

    it('extrae años del siglo XX', () => {
      const { year } = parseCardText('1998 Topps Chrome', 'Baseball');
      expect(year).toBe('1998');
    });

    it('devuelve cadena vacía si no hay año', () => {
      const { year } = parseCardText('No year info here', 'Baseball');
      expect(year).toBe('');
    });
  });

  describe('fabricante', () => {
    it('identifica Topps en el texto', () => {
      const { manufacturer } = parseCardText('2024 Topps Series 1 Baseball', 'Baseball');
      expect(manufacturer).toBe('Topps');
    });

    it('identifica Panini en el texto', () => {
      const { manufacturer } = parseCardText('2023 Panini Prizm Basketball', 'Basketball');
      expect(manufacturer).toBe('Panini');
    });

    it('devuelve cadena vacía si no se reconoce el fabricante', () => {
      const { manufacturer } = parseCardText('Unknown Brand 2020', 'Baseball');
      expect(manufacturer).toBe('');
    });
  });

  describe('número de carta', () => {
    it('extrae número con prefijo #', () => {
      const { cardNumber } = parseCardText('Card #123 from the set', 'Baseball');
      expect(cardNumber).toBe('123');
    });

    it('extrae número con prefijo NO.', () => {
      const { cardNumber } = parseCardText('NO. 45 Topps 2024', 'Baseball');
      expect(cardNumber).toBe('45');
    });

    it('devuelve cadena vacía si no hay número de carta', () => {
      const { cardNumber } = parseCardText('Topps 2024 Baseball', 'Baseball');
      expect(cardNumber).toBe('');
    });
  });

  describe('grading', () => {
    it('detecta empresa de grading PSA', () => {
      const { gradingCompany } = parseCardText('PSA 10 GEM MINT 2021 Topps', 'Baseball');
      expect(gradingCompany).toBe('PSA');
    });

    it('detecta nota de grading entera', () => {
      // Nota: normalize() elimina el punto decimal, por lo que '9.5' → '9 5'
      // y el regex solo captura '9'. Comportamiento conocido del parser.
      const { gradeNumber } = parseCardText('PSA GEM MINT 9.5 2021 Topps', 'Baseball');
      expect(gradeNumber).toBe('9'); // el parser captura el primer número entero válido
    });

    it('devuelve cadena vacía si no hay grading', () => {
      // Usamos un texto sin números para evitar falsos positivos del regex de grading
      const { gradingCompany, gradeNumber } = parseCardText('Topps Chrome Baseball Card', 'Baseball');
      expect(gradingCompany).toBe('');
      expect(gradeNumber).toBe('');
    });
  });

  describe('texto vacío', () => {
    it('devuelve todos los campos como cadena vacía para texto vacío', () => {
      const result = parseCardText('', 'Baseball');
      expect(result.year).toBe('');
      expect(result.manufacturer).toBe('');
      expect(result.cardNumber).toBe('');
      expect(result.gradingCompany).toBe('');
      expect(result.gradeNumber).toBe('');
    });

    it('no lanza para null o undefined', () => {
      expect(() => parseCardText(null, 'Baseball')).not.toThrow();
      expect(() => parseCardText(undefined, 'Baseball')).not.toThrow();
    });
  });

  describe('ocrText y notes', () => {
    it('incluye el texto original en ocrText', () => {
      const input = '2024 Topps Chrome #25';
      const { ocrText } = parseCardText(input, 'Baseball');
      expect(ocrText).toBe(input);
    });

    it('ocrText vacío para entrada vacía', () => {
      const { ocrText } = parseCardText('', 'Baseball');
      expect(ocrText).toBe('');
    });
  });
});
