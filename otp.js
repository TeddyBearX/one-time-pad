/*
 * CMPT 335 Computer Security
 * Lab 14: One Time Pad
 * Tim Tripp
 */

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const 
	charLowerBound = 'A'.charCodeAt(0),
	charUpperBound = 'Z'.charCodeAt(0),
	charCount = charUpperBound - charLowerBound;

/**
 * Generates a random cipher key,
 * an array of random indexes in the subset of charCodes formed by the lower and upper bounds
 * @param {number} n Desired length of key (> 0)
 * @returns {number[]} The cipher key
 */
const genRandomKey = (n) => Array.from({length: n}, () => Math.floor(Math.random() * charCount));

/** 
 * @param {number} charCode  The real charCode of the character
 * @returns {boolean} True if the charCode is in the expected range, false if not
*/
const charCodeInRange = (charCode) => charCode >= charLowerBound && charCode <= charUpperBound;

/**
 * Encodes a single character using the cipher key
 * @param {number} charIndex The index of the character in the string (>= 0, < key.length)
 * @param {number} charCode  The index of the character's charCode in the subset formed by the lower and upper bounds
 * @param {number[]} key The cipher key
 * @returns {number} The index of the encoded character's charCode in the subset formed by the lower and upper bounds
 */
const encodeChar = (charIndex, charCode, key) => (charCode + key[charIndex]) % charCount;

/**
 * Decodes a single character using the cipher key
 * @param {number} charIndex The index of the character in the string (>= 0, < key.length)
 * @param {number} charCode  The index of the character's charCode in the subset formed by the lower and upper bounds
 * @param {number[]} key The cipher key
 * @returns {number} The index of the decoded character's charCode in the subset formed by the lower and upper bounds
 */
const decodeChar = (charIndex, charCode, key) => (charCode - key[charIndex] + charCount) % charCount;

/**
 * Generates a random cipher key and prints a confirmation message to the console
 * @param {number} n Desired length of key (> 0)
 * @returns {number[]} The cipher key
 */
function genRandomKeyAndPrint(n) {
	const key = genRandomKey(n);
	console.log('Random key of length ' + n + ' generated.')
	return key;
}

/**
 * Encodes or decodes a string
 * @param {string} inputStr The input string to process
 * @param {number} len The number of characters to process (<= originalStr.length)
 * @param {number[]} key The cipher key
 * @param {encodeChar | decodeChar} charProcessor The function to apply to each character (encodeChar or decodeChar)
 * @returns {string} The processed string
 */
function processString(inputStr, len, key, charProcessor) {
	let returnStr = '';
	for(let charIndex = 0; charIndex < len; charIndex++) {
		const inputCharCode = inputStr.charCodeAt(charIndex);
		if(charCodeInRange(inputCharCode)) {
			const outputCharCode = charProcessor(charIndex, inputCharCode - charLowerBound, key) + charLowerBound;
			returnStr += charCodeInRange(outputCharCode) ? String.fromCharCode(outputCharCode) : '?';
		} else returnStr += inputStr[charIndex];
	}
	return returnStr;
}

/**
 * Provides all the user prompts
 * @param {number[]} key The cipher key (will be null initially)
 */
function prompt(key) {
	rl.question('Enter: (1) Generate random key (2) Encrypt (3) Decrypt: ', function(choice){
		switch(parseInt(choice)) {
			case 1:
				rl.question('Enter the length of the key: ', function(keyLen) {
					const n = parseInt(keyLen);
					if(n > 0)
						key = genRandomKeyAndPrint(n);
					else console.log('Please enter a valid number that is greater than 0!');
					prompt(key);
				});
			break;
			case 2:
				rl.question('Enter the plaintext: ', function(plainText) {
					plainText = plainText.toUpperCase();
					const len = plainText.length;
					key = key || genRandomKeyAndPrint(len);
					console.log(len > key.length ?
						'Your plaintext cannot be longer than ' + key.length + ' characters. If you wish to enter more, please generate a new random key of length ' + len + ' or more.' :
						'`' + plainText + '` encrypted using the one-time pad is `' + processString(plainText, len, key, encodeChar) + '`');
					prompt(key);
				});
			break;
			case 3:
				if(key) {
					rl.question('Enter the ciphertext: ', function(encryptedText) {
						encryptedText = encryptedText.toUpperCase();
						const len = encryptedText.length;
						console.log(len > key.length ?
							'Your ciphertext cannot be longer than ' + key.length + ' characters.' :
							'`' + encryptedText + '` decrypted using the one-time pad is `' + processString(encryptedText, len, key, decodeChar) + '`');	
						prompt(key);
					});
				} else {
					console.log('Please generate a random key first!');
					prompt(key);
				}
			break;
			default: rl.close();
		}
	});
}

prompt(null);