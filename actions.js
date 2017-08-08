var mongoose = require('mongoose');
var User = require('./models').User;
var Q = require('q');
var utils = require('./utils');


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

/**
 * 
 * @param {String} dest 
 * @param {String} url 
 */
function send_mail(user){
    var def = Q.defer();
    var nodemailer = require('nodemailer');

    var transporter = nodemailer.createTransport({
        service:'gmail',
        auth:{
            user:'youremail@gmail.com',
            pass:'yourpass'
        }
    });

    var mailOptions = {
        from:'youremail@gmail.com',
        to:dest,
        subject:'Renew password!',
        text:'You asked for password update...'
    };

    transporter.sendMail(mailOptions, function(error, info){
        if(error)
            def.reject(err);
        else{
            def.resolve(info);
        }
    });

    return def.promise;
}


/**
 * Função para solicitar redefinição de senha
 * @param {String} email 
 */
function find_email(email){
    var def = Q.defer();
    
    User.findOne({email:email}).exec(function(err, user){
        if(err)
            def.reject(err);
        else{
            if(user === null){
                def.reject({ok:false, msg:"Email desconhecido"});
            }else{
                var agora = new Date();
                user.new_pass_request = {
                    key:utils.calc_hash(user.id+agora),
                    data_solicitacao:agora
                };
                def.resolve(user);
                user.save(function(err, data){
                    if(err){
                        console.log("erro:"+err);
                        def.reject(err);
                    }
                    else{
                        console.log("resolve");
                        def.resolve(data);
                    }
                });
            }
        }
    });
    return def.promise;
}

function retrieve_password(req, res){
    if(req.params.email){
        find_email(req.params.email).then(send_mail).then(
            function(result){
                res.status(200).json(result);
            }).catch(function(e){
                res.status(500).json(e);
            });
    }
    
}

function password_change(){
    throw new Error("Not implemented yest");
}

module.exports = {
    login: login,
    new_user: new_user,
    auth: auth,
    retrieve_password: retrieve_password
};

mongoose.connect("mongodb://localhost:27017/test");    
find_email('yves@yves.com').then(function(user){
    console.log("ULTIMO RESOLVE");
    console.log(user);
}).catch(function(e){
    console.log("Ultimo catch");
    console.log(e);
}).done(function(){
    mongoose.connection.close();
});