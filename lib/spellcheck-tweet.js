var Spellcheck = require('../node_modules/natural/lib/natural/spellcheck/spellcheck');
var fs = require('fs');
var natural = require('natural');

/**
 * @param {String} str
 * @returns {boolean}
 */
function isUpperCase(str) {
	return (str === str.toUpperCase());
}

var corpus = fs.readFileSync('linuxwords.txt', 'utf8').split('\n');
var spellcheck = new Spellcheck(corpus);

var urlRegex = /\(?(?:(http|https|ftp):\/\/)?(?:((?:[^\W\s]|\.|-|[:]{1})+)@{1})?((?:www.)?(?:[^\W\s]|\.|-)+[\.][^\W\s]{2,4}|localhost(?=\/)|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::(\d*))?([\/]?[^\s\?]*[\/]{1})*(?:\/?([^\s\n\?\[\]\{\}\#]*(?:(?=\.)){1}|[^\s\n\?\[\]\{\}\.\#]*)?([\.]{1}[^\s\?\#]*)?)?(?:\?{1}([^\s\n\#\[\]]*))?([\#][^\s\n]*)?\)?/g;
var handleRegex = /\@[a-zA-Z0-9_]{1,}/g;
var hashtagRegex = /#(.+?)(?=[\s.,:,]|$)/;

/**
 * @param {String} tweet
 * @returns {Object} of has containing an original word and a suggestion
 */
module.exports = function check(tweet) {

	tweet = tweet
		.replace(urlRegex, '')	//remove URLs
		.replace(handleRegex, '')	//remove twitter handles
		.replace(hashtagRegex, '');	//remove hashtags

	var tokenizer = new natural.TreebankWordTokenizer();
	var tokenized = tokenizer.tokenize(tweet);
	var wrongWords = [];
	var spellingScore = 0;	//the more points, the worse the tweet is

	tokenized.forEach(function (word){
		var isCorrect = spellcheck.isCorrect(word);
		if (isCorrect) {
			spellingScore += 1;
		}
		if (word.length > 2 && !isCorrect) {
			//spellchecker doesn't like mismatching letter casing
			var normalizedWord = word.substring(0,1) + word.substring(1).toLowerCase();
			var corrections = spellcheck.getCorrections(normalizedWord, 1);
			var index = corrections.length;
			console.log("corrections for", normalizedWord, index);

			if (index > 0) {
				while (index--) {
					var correction = corrections[index];
					if (correction.toUpperCase() === word.toUpperCase()) {
						return;	//we don't want to spellcheck letter casing unless the first letter should be uppercase and isn't
					}
				}
				spellingScore -= 1; //still can be corrected, so remove 1

			} else {
				spellingScore -= 2;	//cannot be corrected, remove 2
			}
			wrongWords.push({original: word, suggestion: corrections});
		}
	});

	return {mispells: wrongWords, spellingScore: spellingScore};

};