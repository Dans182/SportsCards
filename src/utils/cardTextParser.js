import { getManufacturersForSport, manufacturersBySport } from '../data/manufacturers';
import { getSetsForManufacturer } from '../data/sets';

const KNOWN_GRADING = ['PSA', 'BGS', 'SGC', 'CGC', 'CSG'];
const SPORT_KEYWORDS = Object.keys(manufacturersBySport).map((item) => item.toUpperCase());

const normalize = (value = '') => value.replace(/[^A-Z0-9 ]/gi, ' ').replace(/\s+/g, ' ').trim();

const findManufacturer = (text, sport) => {
  const haystack = normalize(text).toUpperCase();
  const manufacturers = getManufacturersForSport(sport || 'Baseball');
  return manufacturers.find((manufacturer) => haystack.includes(manufacturer.toUpperCase())) || '';
};

const findSet = (text, manufacturer, sport) => {
  if (!manufacturer) {
    return '';
  }

  const haystack = normalize(text).toUpperCase();
  const sets = getSetsForManufacturer(manufacturer, sport || 'Baseball');
  return sets.find((entry) => haystack.includes(entry.toUpperCase())) || '';
};

const findPlayer = (text, manufacturer, matchedSet) => {
  const blockedTokens = new Set([
    ...(manufacturer ? [manufacturer.toUpperCase()] : []),
    ...(matchedSet ? [matchedSet.toUpperCase()] : []),
    ...KNOWN_GRADING,
    ...SPORT_KEYWORDS,
    'ROOKIE',
    'AUTHENTIC',
    'BASEBALL',
    'TRADING',
    'CARD',
    'TOPPS',
    'BOWMAN'
  ]);

  const candidates = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => normalize(line))
    .filter((line) => line.length >= 4 && line.length <= 30)
    .filter((line) => !/\d{2,}/.test(line))
    .filter((line) => !blockedTokens.has(line.toUpperCase()))
    .filter((line) => line.split(' ').length <= 3);

  return candidates[0]
    ? candidates[0].toLowerCase().replace(/(^|\s)\S/g, (match) => match.toUpperCase())
    : '';
};

export function parseCardText(text, preferredSport = 'Baseball') {
  const cleanText = text || '';
  const normalized = normalize(cleanText);
  const yearMatch = normalized.match(/(?:19|20)\d{2}/);
  const manufacturer = findManufacturer(cleanText, preferredSport);
  const matchedSet = findSet(cleanText, manufacturer, preferredSport);
  const gradeCompany = KNOWN_GRADING.find((company) => normalized.includes(company)) || '';
  const gradeMatch = normalized.match(/(?:GEM MINT|MINT|NM MT|EX MT)?\s?(10|9(?:\.5)?|8(?:\.5)?|7(?:\.5)?|6(?:\.5)?|5|4|3|2|1)\b/);
  const cardNumberMatch = cleanText.match(/(?:#|NO\.?|CARD NO\.?)[\s:]*([A-Z0-9-]+)/i);

  return {
    player: findPlayer(cleanText, manufacturer, matchedSet),
    year: yearMatch?.[0] || '',
    manufacturer,
    set: matchedSet,
    cardNumber: cardNumberMatch?.[1] || '',
    graded: gradeCompany ? 'Yes' : 'No',
    gradingCompany: gradeCompany,
    gradeNumber: gradeMatch?.[1] || '',
    ocrText: cleanText.trim(),
    notes: cleanText.trim() ? `OCR extracted text:\n${cleanText.trim()}` : ''
  };
}
