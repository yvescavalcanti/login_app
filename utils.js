var jwt = require('jsonwebtoken');
function check(tk, cb){
    jwt.verify(tk, "bencaosDeDeus", function(err, decoded){
    if(err)
        cb(err, null);
    else
        cb(null, decoded);
    });
}

function gen_token(seed, time="15m"){
    var token = jwt.sign(seed, "bencaosDeDeus", {expiresIn:time});
    return token;
}

function jwt_middleware(next){
    throw new Error("Not implemented yet");
}

module.exports = {
    gen_token:gen_token,
    check:check
};

var tk = gen_token({nome:"yves"});

check(tk);