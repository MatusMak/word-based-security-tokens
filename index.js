const fs = require('fs');
const prompt = require('prompt-sync')();
const dictionaryGenerator = require('./dictionary-generator');
const tokenGenerator = require('./token-generator');

/**
 * Maximum amount of attempts for entering verification code
 */
const maxAttempts = 5;
/**
 * Destination of passphrase dump for debug purposes
 */
const dumpFileName = 'passphrase_dump.txt';
/**
 * Current command arguments from the console
 */
const argv = require('minimist')(process.argv.slice(2));

/**
 * Dumps passphrase, secret & salt into temporary file.
 * This shouldn't be done in real application - you would
 * persist secret and salt, send passphrase to user and
 * then remove it from the memory.
 */
const dumpPassphrase = (tokenBundle) => {
  const dump = `Passphrase: ${tokenBundle.passPhrase}\nSecret: ${tokenBundle.secret}\nSalt: ${tokenBundle.salt}\n`;
  fs.writeFileSync(dumpFileName, dump);
};

if (argv.dictionary) {
  const language = argv.dictionary;
  dictionaryGenerator(language);
} else if (argv.token) {
  const language = argv.token;

  const tokenBundle = tokenGenerator.generate(language);
  dumpPassphrase(tokenBundle);

  /**
   * Humans do mistakes, so we allow several attempts
   * to enter the code.
   */
  var attemptCounts = 0;
  while (true) {
    const attempt = prompt('Please enter token: ').trim();

    if (tokenGenerator.verify(attempt, tokenBundle.secret, tokenBundle.salt)) {
      console.log('Token has been successfully verified');
      break;
    }

    attemptCounts++;
    if (attemptCounts >= maxAttempts) {
      console.log('Verification failed! Too many attempts!');
      break;
    }

    const remainingAttempts = maxAttempts - attemptCounts;
    console.log(`Incorrect token! Remaining attempts: ${remainingAttempts}.`);
  }
}
