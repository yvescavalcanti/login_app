var assert = require('assert');
var utils = require('./../utils');

describe('Token Utils', function(){
    describe("Gen Token", function(){
        it('should return string', function(){
            assert.equal("string", (typeof utils.gen_token({nome:"yves"})));
        })
    });
    describe('Verify Token',function(){
        it('Should return nome:yves', function(){
            var tk = utils.gen_token({nome:"yves"});
            assert.equal("yves", utils.check(tk).nome);
        });
    });
});