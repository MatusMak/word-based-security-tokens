const fs = require('fs');

/**
 * Where are raw unprocessed dictionaries located?
 */
const sourceDir = './dictionaries/raw/';
/**
 * Where should resulting JSON be saved?
 */
const destinationDir = './dictionaries/';
/**
 * How ofter should script report its progress on processing words?
 */
const REPORT_INTERVAL = 10_000;
/**
 * List of characters that can be repeated twice in a word.
 * Used during filtering of valid words from raw dictionary.
 */
const repeatableChars = ['s', 'e', 't', 'f', 'l', 'm', 'o'];

/**
 * Reads raw dictionary of a given language as an array of words.
 */
const readDictionary = language => fs.readFileSync(sourceDir + language + '.txt').toString().split('\n');
/**
 * Persists processed dictionary as a JSON array.
 */
const writeDictionary = (language, dictionary) => fs.writeFileSync(destinationDir + language + '.json', JSON.stringify(dictionary));

/**
 * Checks whether word has acceptable size.
 */
const hasCorrectLength = (word, min, max) => word.length >= min && word.length <= max;
/**
 * Checks whether word is meaningful enough.
 *
 * Right now there is only one simple check - whether word doesn't
 * have any repeating characters. This effectively filters out
 * useless words like 'aah' but keeps interesting ones like 'mammal'
 * or 'tooth'.
 *
 * More subchecks here can improve resulting dictionary even more.
 */
const isMeaningful = (word) => {
  // The first and only verification for repeating characters.
  var lastChar = '';
  for (const char of word) {
    if (char === lastChar && ! repeatableChars.includes(char)) {
      return false;
    }
    lastChar = char;
  }

  // If no violation has been found, word is meaningful
  return true;
};


/**
 * Utility function to inform of the current processing status.
 *
 * Final flag is here so that we can display message at the end
 * of processing even outside of the report interval.
 */
const report = (processedWords, validWords, final = false) => {
  if (final || (processedWords % REPORT_INTERVAL === 0)) {
    console.log(`Processed: ${processedWords}. Valid: ${validWords}.`);
  }
};


/**
 * Dictionary generation function. Transforms raw dictionary into
 * usable JSON array. Expected to be used only when origin dictionary
 * or rules for valid rule change.
 *
 * Along with processed language, minimum and maximum length of
 * valid words can be specified. Otherwise, function uses sensible
 * predetermined defaults. These may not work for all languages.
 */
module.exports = (language, minLength = 3, maxLength = 6) => {
  const languageWords = readDictionary(language);

  console.log(`Dictionary for language "${language}" contains ${languageWords.length} words.`);
  console.log('Processing...');

  var processedWords = 0;
  var validWords = 0;

  const dictionary = [];

  for (const word of languageWords) {
    if (hasCorrectLength(word, minLength, maxLength) && isMeaningful(word)) {
      dictionary.push(word);
      validWords++;
    }

    processedWords++;
    report(processedWords, validWords);
  }

  report(processedWords, validWords, true);
  console.log('Generation complete!');

  console.log('Saving...');
  writeDictionary(language, dictionary);
  console.log('Dictionary saved!');
};
