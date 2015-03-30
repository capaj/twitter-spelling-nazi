var spellChecker = require('./spellcheck-tweet');

/**
 * @param T twit instance
 * @param io socket.io server instance
 * @constructor
 */
function MispelledTweetsAgregator(T, io) {
	var self = this;
	this.count = 0;
	this.mispelledTweets = [];
	this.io = io;
	var stream = T.stream('statuses/sample', { language: 'en' });
	stream.on('tweet', function (tweet) {
		self.count++;
		console.log("count", count);
		var result = spellChecker(tweet.text);
		if (result.length > 0) {
			tweet.mispells = result;
			self.addTweet(tweet);
		}
	});

}

MispelledTweetsAgregator.prototype = {
	addTweet: function(tweet) {
		this.mispelledTweets.push(tweet);
		self.io.emit('addedTweet', tweet);
	}
};

module.exports =  MispelledTweetsAgregator;