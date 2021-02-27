const crypto = require('crypto');

const dictionariesDir = './dictionaries/';

/**
 * Reads an array of available passphrase words
 */
const readDictionary = language => require(dictionariesDir + language + '.json');

/**
 * Computes cryptographically secure random number to be used
 * as a seeder for selecting pseudorandom word from dictionary.
 */
const computeRandomSeed = () => parseInt(crypto.randomBytes(32).toString('hex'), 16);
/**
 * Computes cryptographically secure salt that's meant to be
 * used for computing passphrase secret.
 */
const computeSalt = () => crypto.randomBytes(16).toString('base64');
/**
 * Computes cryptographically secure secret from passphrase
 * and salt in a form of irreversible hash, which is safe
 * for long term storage.
 */
const computeSecret = (string, salt) => crypto.scryptSync(string, salt, 64).toString('base64');

module.exports = {

  /**
   * Selects n cryptographically random words from dictionary,
   * returns it as a passphrase with its hash & salt.
   *
   * A word count can be specified, otherwise sensible
   * default is used, which, however, may not work for
   * all languages.
   */
  generate: (language, wordsCount = 4) => {
    const dictionary = readDictionary(language);
    const dictionarySize = dictionary.length;

    const passPhrase = [...Array(wordsCount)]
      .map(_ => computeRandomSeed() % dictionarySize)
      .map(index => dictionary[index])
      .join(' ');

    const salt = computeSalt();
    const secret = computeSecret(passPhrase, salt);

    return {
      passPhrase,
      secret,
      salt,
    };
  },

  /**
   * Verifies user's attempt at entering correct token
   * by comparing its hash to a stored one
   */
  verify: (attempt, secret, salt) => {
    const attemptSecret = computeSecret(attempt, salt);
    return attemptSecret === secret;
  },
};
