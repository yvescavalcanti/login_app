var mongoose = require('mongoose');
var User = require('./models').User;
var Q = require('q');

/**
 * Esta linha tem de estar no início da aplicação
 */
mongoose.Promise = Q.Promise;

/**
 * Função para cadastro de novo usuário
 * @param {*} data 
 */
function new_user(data){
    mongoose.connect("mongodb://localhost:27017/test", {useMongoClient:true});
    var user = new User(data);
    var d = Q.defer();
    user.save(function(err, data){
        if(err)
            d.reject(err);
        else
            d.resolve(data);
    }).done(function(){
        mongoose.connection.close();
    });
    return d.promise;
}

/**
 * Função para login de usuário
 * @param {*} data 
 */
function login(data){
    mongoose.connect("mongodb://localhost:27017/test");
    var d = Q.defer();
    User.findOne({username:data.username}).exec(function(err, user){
        if (err) throw new Error(err);
        if(user === null)
            d.resolve({ok:0, msg:"Usuário não encontrado"});
        else
            user.comparePassword(data.password, function(match){
                if(match)
                    d.resolve({ok:true});
                else
                    d.reject({ok:false});
            });
            
    }).done(function(){
        mongoose.connection.close();
    });
    return d.promise;
}


/**
 * Função para checagem da validade da token
 * @param {express.Request} req 
 * @param {*} res 
 * @param {*} next 
 */
function auth(req, res, next){
    var token = req.headers['x-access-token'];
    if(token){
        utils.check(token, function(err, result){
            if(err)
                res.status(403).json(err);
            else{
                req.decoded = result;
                next();
            }
        });
    }
    else{
        return res.status(403).json({msg:"Token é necessário"});
    }


}

function send_mail(){
    throw new Error("Not implemented yest");
}


/**
 * Função para solicitar redefinição de senha
 * @param {String} email 
 */
function retrieve_new_password(email){
    mongoose.connect("mongodb://localhost:27017/test");    
    var def = Q.defer();
    User.findOne({email:email}).exec(function(err, result){
        if(err)
            def.reject(err);
        else{
            if(result === null){
                def.resolve({ok:false, msg:"Email desconhecido"});
            }else{
                def.resolve(result);
            }
        }
    }).done(function(){
        mongoose.connection.close();
    });
    return def.promise;
}

function password_change(){
    throw new Error("Not implemented yest");
}
