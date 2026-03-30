// Transliteratsiya jadvali: Lotin -> Kirill va aksincha
const latinToCyrillic: Record<string, string> = {
  'a': 'а', 'b': 'б', 'v': 'в', 'g': 'г', 'd': 'д',
  'ye': 'е', 'yo': 'ё', 'j': 'ж', 'z': 'з', 'i': 'и',
  'y': 'й', 'k': 'к', 'l': 'л', 'm': 'м', 'n': 'н',
  'o': 'о', 'p': 'п', 'r': 'р', 's': 'с', 't': 'т',
  'u': 'у', 'f': 'ф', 'x': 'х', 'ts': 'ц', 'ch': 'ч',
  'sh': 'ш', "o'": 'ў', "g'": 'ғ', 'q': 'қ', 'h': 'ҳ',
  'e': 'э',
};

const cyrillicToLatin: Record<string, string> = {};
Object.entries(latinToCyrillic).forEach(([lat, cyr]) => {
  cyrillicToLatin[cyr] = lat;
});

export function transliterate(text: string): string {
  let result = text.toLowerCase();
  // Ikki harflilarni avval almashtirish
  const twoCharPairs = Object.entries(latinToCyrillic).filter(([k]) => k.length === 2);
  for (const [lat, cyr] of twoCharPairs) {
    result = result.replaceAll(lat, cyr);
  }
  for (const [lat, cyr] of Object.entries(latinToCyrillic)) {
    if (lat.length === 1) result = result.replaceAll(lat, cyr);
  }
  return result;
}

export function reverseTransliterate(text: string): string {
  let result = text.toLowerCase();
  for (const [cyr, lat] of Object.entries(cyrillicToLatin)) {
    result = result.replaceAll(cyr, lat);
  }
  return result;
}

// Levenshtein distance — loyqa qidiruv uchun
function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

export function fuzzyMatch(query: string, target: string, threshold = 3): boolean {
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  // To'g'ridan-to'g'ri tekshirish
  if (t.includes(q)) return true;
  // Transliteratsiya bilan tekshirish
  if (t.includes(transliterate(q))) return true;
  if (t.includes(reverseTransliterate(q))) return true;
  // Loyqa qidiruv (Levenshtein)
  const words = t.split(/\s+/);
  for (const word of words) {
    if (levenshtein(q, word) <= threshold) return true;
  }
  return false;
}

import { Product } from '@/types';

export function searchProducts(products: Product[], query: string): Product[] {
  if (!query.trim()) return products;
  return products.filter(p => {
    const catName = typeof p.category === 'string' ? p.category : p.category?.name || '';
    return (
      fuzzyMatch(query, p.name) ||
      fuzzyMatch(query, catName) ||
      fuzzyMatch(query, p.description)
    );
  });
}
