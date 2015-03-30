var env = process.env.NODE_ENV || 'development';
var port = process.env.PORT || 8020;
var express = require('express');
var app = express();
var morgan = require('morgan');

var Twit = require('twit');
var T = new Twit(require('./secrets/twitter.json'));

var server = require('http').Server(app);
var io = require('socket.io')(server);
var mispelledTweetsAgregator = require('./lib/mispelled-tweets-agregator')(T, io);

if (env === 'development') {
	app.use(require('connect-livereload')({
		port: 35939
	}));

	app.use(morgan('dev'));
} else {
	app.use(morgan('combined'));
}

app.use(express.static('./public/'));

app.listen(port).on('listening', function() {
	console.log("server started in ", env);
});

module.exports = app;