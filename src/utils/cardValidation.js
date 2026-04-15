/**
 * cardValidation.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Única fuente de verdad para las reglas de validación de cartas deportivas.
 * Todas las funciones son PURAS (sin efectos secundarios) para facilitar los tests.
 *
 * Usos:
 *   - AddCard.js       → validateCardForm(formData)
 *   - EditCardModal.js → validateCardForm(formData)
 *   - ImportCardsModal → validateCardYear(year)
 */

/** Año más antiguo permitido para una carta deportiva. */
export const MIN_CARD_YEAR = 1860;

/**
 * Valida el año de una carta.
 * @param {string|number} year  Valor del campo año.
 * @param {number} [currentYear]  Año actual (inyectable en tests).
 * @returns {string|null}  Mensaje de error, o null si es válido.
 */
export function validateCardYear(year, currentYear = new Date().getFullYear()) {
  const raw = String(year ?? '').trim();

  if (!raw) {
    return 'El año es obligatorio.';
  }

  const parsed = parseInt(raw, 10);

  if (!Number.isFinite(parsed)) {
    return 'El año debe ser un número válido.';
  }

  if (parsed < MIN_CARD_YEAR) {
    return `El año no puede ser anterior a ${MIN_CARD_YEAR}.`;
  }

  if (parsed > currentYear) {
    return `El año no puede ser superior a ${currentYear}.`;
  }

  return null;
}

/**
 * Valida los campos obligatorios de un formulario de carta.
 * @param {{ player?: string, year?: string|number, manufacturer?: string }} formData
 * @param {number} [currentYear]  Año actual (inyectable en tests).
 * @returns {string|null}  Primer error encontrado, o null si todo es válido.
 */
export function validateCardForm(formData, currentYear = new Date().getFullYear()) {
  const player = formData?.player?.trim() ?? '';
  const year = formData?.year?.toString().trim() ?? '';
  const manufacturer = formData?.manufacturer?.trim() ?? '';

  if (!player || !year || !manufacturer) {
    return 'Player, year and manufacturer are required.';
  }

  return validateCardYear(year, currentYear);
}
