var Spellcheck = require('../node_modules/natural/lib/natural/spellcheck/spellcheck');
var fs = require('fs');
var natural = require('natural');

var corpus = fs.readFileSync('linuxwords.txt', 'utf8').split('\n');
var spellcheck = new Spellcheck(corpus);

var urlRegex = /\(?(?:(http|https|ftp):\/\/)?(?:((?:[^\W\s]|\.|-|[:]{1})+)@{1})?((?:www.)?(?:[^\W\s]|\.|-)+[\.][^\W\s]{2,4}|localhost(?=\/)|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::(\d*))?([\/]?[^\s\?]*[\/]{1})*(?:\/?([^\s\n\?\[\]\{\}\#]*(?:(?=\.)){1}|[^\s\n\?\[\]\{\}\.\#]*)?([\.]{1}[^\s\?\#]*)?)?(?:\?{1}([^\s\n\#\[\]]*))?([\#][^\s\n]*)?\)?/g;
var handleRegex = /\@[a-zA-Z0-9_]{1,}/g;
var hashtagRegex = /#(.+?)(?=[\s.,:,]|$)/;

/**
 * @param {String} tweet
 * @returns {Array<Object>} of has containing an original word and a suggestion
 */
module.exports = function check(tweet) {

	tweet = tweet
		.replace(urlRegex, '')	//remove URLs
		.replace(handleRegex, '')	//remove twitter handles
		.replace(hashtagRegex, '');	//remove hashtags

	var tokenizer = new natural.WordTokenizer();
	var tokenized = tokenizer.tokenize(tweet);
	var wrongWords = [];

	tokenized.forEach(function (word){
		if (!spellcheck.isCorrect(word)) {
			var corrections = spellcheck.getCorrections(word, 1);
			if (corrections.length > 0) {
				wrongWords.push({original: word, suggestion: corrections})
			}
		}
	});

	return wrongWords;

};