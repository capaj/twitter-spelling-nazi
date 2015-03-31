var spellcheck = require('../lib/spellcheck-tweet');
require('chai').should();
var Agregator = require('../lib/mispelled-tweets-agregator');
var events = require('events');
var sinon = require('sinon');

describe('twitter spelling shame ', function(){

    it('should spellcheck only text-urls and hashtags should be stripped', function(){
        var tweet = 'RT @HorryPuttor: soldierz playeng qwitich http://t.co/xpDFne0piU #harryPotter';
        var result = spellcheck(tweet);
        result.mispells[0].suggestion.should.eql([ 'soldiers', 'soldier' ]);
        result.mispells[1].suggestion.should.eql([ 'playing' ]);
        result.spellingScore.should.equal(-4);

    });

    it('should not spot a regular word with a first letter uppercase as a mistake', function(){
        var tweet = "@WickedTuna Would LOVE to fish on the @FVHardMerch Plus, I'm only 20 minutes away!! #WickedTBTSweeps";
        var result = spellcheck(tweet);
        result.mispells.length.should.equal(0);
        result.spellingScore.should.equal(7);

        var tweet = "RT @ddlovato: Get your #RDMA votes in heree 😜😜 http://t.co/aiRcu6zjG1 @radiodisney http://t.co/1cGbx1yy3";
        result = spellcheck(tweet);
        result.mispells[0].suggestion.should.eql([ 'heres', 'here' ]);
        result.mispells.length.should.equal(1);
        result.spellingScore.should.equal(2);
    });

    describe('aggregator', function(){
        var ag;
        var twitEventEmitter = new events.EventEmitter();
        var socketMock = new events.EventEmitter();
        var socketSpy = sinon.spy(socketMock, "emit");

        var twitMock = {
            stream: function() {
                return twitEventEmitter;
            }
        };

        var ioMock = new events.EventEmitter();

        before(function() {
            ag = new Agregator(twitMock, ioMock);
        });

        it('should persist mispelled tweets coming via twitter streaming api', function(){
            var ioSpy = sinon.spy(ioMock, "emit");
            twitEventEmitter.emit('tweet', {text: 'brwgw wede soldierz playeng qwitich witheout haryy'});
            twitEventEmitter.emit('tweet', {text:"RT @drewsdimple: I WENT FROM LAUGFAJING SO HARD AT JUSTIN'S JOKES TO SOBBING FROM HIS APOLOGY REAL QUICK, WHATD HTEHF UCN"});

            ioSpy.callCount.should.equal(3);

        });

        it('should emit an initial state to any new client', function(){

            ioMock.emit('connection', socketMock);
            socketSpy.callCount.should.equal(2);

        });

        it('should emit a new tweet to all connected clients', function(){
            twitEventEmitter.emit('tweet', {text: "Mane kj foo stfu & tweet bout yo shayy bihh dawg . I wasn't doin shii uu did ths shii cuz uu \"THOUGHT\" I wanted sum else . . Hell nawh"});

            ioMock.emit.callCount.should.equal(6);

        });

        it('should emit the worst spelled tweet when new highest score', function(){
            ioMock.emit.lastCall.args[0].should.equal('worstTweet');
        });
    });

});