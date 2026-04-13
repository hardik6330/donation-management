const HALANT = '\u0ACD'; // ્

const CONSONANT_MAP = [
  ['chh', 'છ'], ['ch', 'ચ'],
  ['shh', 'ષ'], ['sh', 'શ'],
  ['kh', 'ખ'], ['gh', 'ઘ'],
  ['jh', 'ઝ'], ['th', 'થ'],
  ['dh', 'ધ'], ['ph', 'ફ'],
  ['bh', 'ભ'], ['nk', 'ંક'],
  ['ng', 'ંગ'],
  ['k', 'ક'], ['g', 'ગ'],
  ['j', 'જ'], ['t', 'ત'],
  ['d', 'દ'], ['n', 'ન'],
  ['p', 'પ'], ['b', 'બ'],
  ['m', 'મ'], ['y', 'ય'],
  ['r', 'ર'], ['l', 'લ'],
  ['v', 'વ'], ['w', 'વ'],
  ['s', 'સ'], ['h', 'હ'],
  ['f', 'ફ'], ['z', 'ઝ'],
  ['x', 'ક્ષ'], ['q', 'ક'],
  ['c', 'ક'],
];

const VOWEL_INDEPENDENT = [
  ['aa', 'આ'], ['ai', 'ઐ'], ['au', 'ઔ'],
  ['ee', 'ઈ'], ['oo', 'ઊ'],
  ['a', 'અ'], ['e', 'એ'], ['i', 'ઇ'],
  ['o', 'ઓ'], ['u', 'ઉ'],
];

const VOWEL_MATRA = [
  ['aa', '\u0ABE'], ['ai', '\u0AC8'], ['au', '\u0ACC'],
  ['ee', '\u0AC0'], ['oo', '\u0AC2'],
  ['a', ''], ['e', '\u0AC7'], ['i', '\u0ABF'],
  ['o', '\u0ACB'], ['u', '\u0AC1'],
];

const SPECIAL = {
  '.': '.', ',': ',', '?': '?', '!': '!',
  ' ': ' ', '\n': '\n',
};

function isVowelChar(ch) {
  return 'aeiou'.includes(ch);
}

function matchSequence(text, pos, map) {
  for (const [key, val] of map) {
    if (text.substring(pos, pos + key.length) === key) {
      return [key.length, val];
    }
  }
  return null;
}

export function transliterateToGujarati(text) {
  if (!text) return '';
  const lower = text.toLowerCase();
  let result = '';
  let i = 0;
  let lastWasConsonant = false;

  while (i < lower.length) {
    const ch = lower[i];

    // Numbers pass through
    if (ch >= '0' && ch <= '9') {
      result += ch;
      lastWasConsonant = false;
      i++;
      continue;
    }

    // Special/punctuation pass through
    if (SPECIAL[ch] !== undefined) {
      result += SPECIAL[ch];
      lastWasConsonant = false;
      i++;
      continue;
    }

    // Try consonant match
    const consonantMatch = matchSequence(lower, i, CONSONANT_MAP);
    if (consonantMatch && !isVowelChar(ch)) {
      if (lastWasConsonant) {
        result += HALANT;
      }
      result += consonantMatch[1];
      i += consonantMatch[0];
      lastWasConsonant = true;
      continue;
    }

    // Try vowel match
    if (isVowelChar(ch)) {
      const vowelMap = lastWasConsonant ? VOWEL_MATRA : VOWEL_INDEPENDENT;
      const vowelMatch = matchSequence(lower, i, vowelMap);
      if (vowelMatch) {
        result += vowelMatch[1];
        i += vowelMatch[0];
        lastWasConsonant = false;
        continue;
      }
    }

    // Unrecognized character pass through
    result += text[i];
    lastWasConsonant = false;
    i++;
  }

  return result;
}
