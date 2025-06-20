
// A collection of functions that transform a string in various chaotic ways.

const STRANGE_SYMBOLS = [
  '✧', '✦', '✥', '☄', '☠', '☢', '☣', '⛧', '♆', '⚙', '⚛', '⚜', '✨', '⚡', '⚠', '⁉', '〰', '※', '⁂', '⁑', '◉', '◈', '◊', '◎', '●', '◯', '★', '☆', '☑', '☒', '☞', '☜', '☝', '☟', '☹', '☺', '☻', '☃', '☂', '☕', '☘', '✌', '✍', '✎', '✓', '✔', '✗', '✘', '✝', '✡', '☪', '☮', '☯', '☸', '☹', '☺', '☻', '❤', '♡', '♨', '♩', '♪', '♫', '♬', '♭', '♮', '♯',
  ' dialed ', ' disconnected ', ' ERROR ', ' NULL ', ' VOID ', ' GLITCH ',
  // Adding Cyrillic characters
  'А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ё', 'Ж', 'З', 'И', 'Й', 'К', 'Л', 'М', 'Н', 'О', 'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Ъ', 'Ы', 'Ь', 'Э', 'Ю', 'Я',
  'а', 'б', 'в', 'г', 'д', 'е', 'ё', 'ж', 'з', 'и', 'й', 'к', 'л', 'м', 'н', 'о', 'п', 'р', 'с', 'т', 'у', 'ф', 'х', 'ц', 'ч', 'ш', 'щ', 'ъ', 'ы', 'ь', 'э', 'ю', 'я',
  'Ѣ', 'ѣ', 'Ѳ', 'ѳ', 'Ѵ', 'ѵ' // Some old Cyrillic letters for extra chaos
];
const GIBBERISH_WORDS = ['fnord', 'zork', 'blarg', 'kwyjibo', 'eep', 'glarble', 'snarf', 'thwack', 'bazinga', 'floopy', 'wibble', 'wabble'];

const CYRILLIC_UPPER_CASE = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ".split('');
const CYRILLIC_LOWER_CASE = "абвгдеёжзийклмнопрстуфхцчшщъыьэюя".split('');

const getRandomInt = (max: number): number => Math.floor(Math.random() * max);
const getRandomItem = <T,>(arr: T[]): T => arr[getRandomInt(arr.length)];

const insertRandomSymbol = (text: string): string => {
  if (text.length > 1000 && Math.random() < 0.5) return text; // Less frequent on very long texts
  const position = getRandomInt(text.length + 1);
  const symbol = getRandomItem(STRANGE_SYMBOLS);
  // Ensure symbols that are meant to be words have spaces, others don't unless they are single chars.
  const spacedSymbol = symbol.trim().length > 1 && !STRANGE_SYMBOLS.some(s => s.trim() === symbol && s.length === 1) ? ` ${symbol.trim()} ` : symbol;
  return `${text.slice(0, position)}${spacedSymbol}${text.slice(position)}`;
};

const deleteRandomCharacter = (text: string): string => {
  if (text.length === 0) return '';
  if (text.length > 500 && Math.random() < 0.7) return text; // Less destructive on long texts often
  const position = getRandomInt(text.length);
  return `${text.slice(0, position)}${text.slice(position + 1)}`;
};

const changeCaseOfRandomCharacter = (text: string): string => {
  if (text.length === 0) return '';
  const position = getRandomInt(text.length);
  const char = text[position];
  const newChar = char === char.toLowerCase() ? char.toUpperCase() : char.toLowerCase();
  return `${text.slice(0, position)}${newChar}${text.slice(position + 1)}`;
};

const swapAdjacentCharacters = (text: string): string => {
  if (text.length < 2) return text;
  const position = getRandomInt(text.length - 1);
  return `${text.slice(0, position)}${text[position + 1]}${text[position]}${text.slice(position + 2)}`;
};

const duplicateRandomCharacter = (text: string): string => {
  if (text.length === 0) return '';
  if (text.length > 1000 && Math.random() < 0.5) return text;
  const position = getRandomInt(text.length);
  const char = text[position];
  return `${text.slice(0, position)}${char}${char}${text.slice(position + 1)}`;
};

const replaceWordWithGibberish = (text: string): string => {
    if (text.length < 5) return text; // Need some text to work with
    const words = text.split(/(\s+)/); // Split by space, keeping delimiters
    if (words.length < 2) return text; // Need at least one word

    const wordIndices: number[] = [];
    words.forEach((word, index) => {
        if (word.trim().length > 2) { // Consider words longer than 2 chars
            wordIndices.push(index);
        }
    });

    if (wordIndices.length === 0) return text;

    const wordToReplaceIndex = getRandomItem(wordIndices);
    words[wordToReplaceIndex] = getRandomItem(GIBBERISH_WORDS);
    
    return words.join('');
};

const scrambleWordInternal = (word: string): string => {
    if (word.length <= 2) return word;
    const chars = word.split('');
    for (let i = 0; i < chars.length; i++) {
        const j = getRandomInt(chars.length);
        [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    // Keep first and last letter same for some "readability" amidst chaos
    if (word.length > 3 && Math.random() > 0.5) {
        const first = word[0];
        const last = word[word.length-1];
        let middleChars = chars.slice(1, -1);
        // Ensure middle part is actually scrambled if it's short
        if (middleChars.length > 1 && middleChars.join('') === word.substring(1, word.length -1)) {
            const k = getRandomInt(middleChars.length);
            let l = getRandomInt(middleChars.length);
            while (l === k && middleChars.length > 1) { // ensure different indices for swap
                 l = getRandomInt(middleChars.length);
            }
            [middleChars[k], middleChars[l]] = [middleChars[l], middleChars[k]];
        }
        return first + middleChars.join('') + last;
    }
    return chars.join('');
}


const scrambleRandomWord = (text: string): string => {
    if (text.length < 3) return text;
    const words = text.split(/(\s+)/); // Keep spaces
    const wordIndices: number[] = [];
    words.forEach((w, i) => { if (w.trim().length > 2) wordIndices.push(i); });

    if (wordIndices.length === 0) return text;
    
    const idxToScramble = getRandomItem(wordIndices);
    words[idxToScramble] = scrambleWordInternal(words[idxToScramble]);
    return words.join('');
};


const transformations: ((text: string) => string)[] = [
  insertRandomSymbol,
  deleteRandomCharacter,
  changeCaseOfRandomCharacter,
  swapAdjacentCharacters,
  duplicateRandomCharacter,
  replaceWordWithGibberish,
  scrambleRandomWord,
  insertRandomSymbol, // Add some common ones more frequently
  changeCaseOfRandomCharacter,
];

// More destructive transformations should be less frequent overall
const destructiveTransformations: ((text: string) => string)[] = [
    deleteRandomCharacter, 
];

export const applyRandomStringTransformation = (text: string): string => {
  if (text.length === 0 && Math.random() > 0.2) { 
    let symbol = getRandomItem(STRANGE_SYMBOLS);
    // Avoid leading/trailing spaces for single symbols inserted into empty text
    return symbol.trim();
  }
  
  let currentText = text;
  const numTransformations = Math.random() < 0.3 ? (Math.random() < 0.7 ? 1 : 2) : 1; 

  for (let i = 0; i < numTransformations; i++) {
    let randomTransformation = getRandomItem(transformations);
    
    if (currentText.length < 10 && destructiveTransformations.includes(randomTransformation) && Math.random() < 0.5) {
        const nonDestructive = transformations.filter(t => !destructiveTransformations.includes(t) && t !== insertRandomSymbol); // Also avoid inserting if too short and trying to be non-destructive
        if (nonDestructive.length > 0) {
            randomTransformation = getRandomItem(nonDestructive);
        }
    }
     // Prevent deletion if text is very short and it's the only transformation
    if (currentText.length < 5 && randomTransformation === deleteRandomCharacter && numTransformations === 1) {
        const otherTransformations = transformations.filter(t => t !== deleteRandomCharacter);
        if (otherTransformations.length > 0) {
            randomTransformation = getRandomItem(otherTransformations);
        }
    }

    currentText = randomTransformation(currentText);
  }
  return currentText;
};

export const animateHeadline = (headline: string): string => {
  return headline.split('').map(char => {
    const charCode = char.charCodeAt(0);
    // Cyrillic Unicode blocks:
    // Uppercase: U+0410 (А) to U+042F (Я), plus U+0401 (Ё)
    // Lowercase: U+0430 (а) to U+044F (я), plus U+0451 (ё)
    if ((charCode >= 0x0410 && charCode <= 0x042F) || charCode === 0x0401) { // Cyrillic Uppercase
        return getRandomItem(CYRILLIC_UPPER_CASE);
    } else if ((charCode >= 0x0430 && charCode <= 0x044F) || charCode === 0x0451) { // Cyrillic Lowercase
        return getRandomItem(CYRILLIC_LOWER_CASE);
    }
    return char; // Non-Cyrillic character (e.g., '-', space)
  }).join('');
};
