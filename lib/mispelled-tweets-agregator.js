var spellChecker = require('./spellcheck-tweet');
var _ = require('lodash');
/**
 * @param T twit instance
 * @param io socket.io server instance
 * @constructor
 */
function MispelledTweetsAgregator(T, io) {
	var self = this;
	this.count = 0;
	this.mispelledTweets = [];
	this.worstTweet = {spellingScore: 1000};
	this.io = io;
	var stream = T.stream('statuses/sample', { language: 'en' });
	stream.on('tweet', function (tweet) {
		self.count++;
		var result = spellChecker(tweet.text);
		console.log("count", self.count, 'score', result.spellingScore);

		if (result.spellingScore <= -8) {
			_.assign(tweet, result);
			self.addTweet(tweet);
		}

	});

	io.on('connection', function (socket) {
		self.mispelledTweets.forEach(function (tweet){
			socket.emit('addedTweet', tweet);
		});

	});

}

MispelledTweetsAgregator.prototype = {
	addTweet: function(tweet) {
		console.log('tweet', JSON.stringify(tweet));
		this.mispelledTweets.push(tweet);
		this.io.emit('addedTweet', tweet);
		if (tweet.spellingScore < this.worstTweet.spellingScore) {
			this.worstTweet = tweet;
			this.io.emit('worstTweet', tweet);
		}
		if (this.mispelledTweets.length > 200) {
			this.mispelledTweets.shift();
		}
	}
};

module.exports =  MispelledTweetsAgregator;