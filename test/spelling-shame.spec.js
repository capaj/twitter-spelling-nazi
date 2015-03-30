var spellcheck = require('../lib/spellcheck-tweet');
require('chai').should();

describe('spelling shame', function(){

    it('should spellcheck only text-urls and hashtags should be stripped', function(){
        var tweet = 'RT @HorryPuttor: soldierz playeng qwitich http://t.co/xpDFne0piU #harryPotter';
        var suggestions = spellcheck(tweet);
        suggestions[0].suggestion.should.eql([ 'soldiers', 'soldier' ]);
        suggestions[1].suggestion.should.eql([ 'playing' ]);
    });

    describe('aggregator', function(){
        it('should persist mispelled tweets coming via twitter streaming api', function(){
            //TODO
        });

        it('should emit a initial state to any new client', function(){
            //TODO
        });

        it('should emit a new tweet to all connected clients', function(){
            //TODO
        });

        it('should count the overall number of mispelled tweets per author', function(){
            //TODO
        });
    });

});