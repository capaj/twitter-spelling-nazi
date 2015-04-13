import io from 'socket.io/socket.io.js';
import * as bootstrap from 'bootstrap';

export class twitterSpellingWall{
	constructor(){
		this.recentTweets = [{}];

		var socket = io.connect('http://localhost:8020');
		socket.on('addedTweet', tweet => {
			//console.log("tweet", tweet);
			if (tweet.user.profile_background_color === tweet.user.profile_text_color) {
				tweet.user.profile_background_color = "888666"
			}
			tweet.styleObject = {
				color: '#' + tweet.user.profile_text_color,
				'background-color': '#' + tweet.user.profile_background_color
			};
			this.recentTweets.unshift(tweet);
			if (this.recentTweets.length > 200) {
				this.recentTweets.pop();
			}
		});

	}
	get worstTweet(){
		var worstScore = Math.min.apply(Math, this.recentTweets.map(function(o){return o.spellingScore;}))
		return this.recentTweets.find(x => x.spellingScore === worstScore);
	}
}