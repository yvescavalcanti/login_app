var mongoose = require('mongoose');
var crypto = require('crypto');
/**
 * 
 * @param {String} val 
 */
function calc_hash(val){
    var hash = crypto.createHash('sha256');
    hash.update(val);
    return hash.digest('hex');
}

var retrievePassSchema = new mongoose.Schema(
    {
        key:{type:String, required:true},
        data_solicitacao:{type:Date, required:true},
        data_execucao:{type:Date}
    }
);


var userSchema = new mongoose.Schema(
    {
        
        username:{type:String, required : true, index:{unique:true}},
        password:{type:String, required : true},
        email:
        {
            type:String, required : true, 
            validate:
            {
                validator:function(v)
                {
                    var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
                    return emailRegex.test(v);
                },
                message: "formato de email inválido"
            }
        },
        new_pass_request : retrievePassSchema
    }
);

userSchema.pre('save', true, function(next, done){
    var user = this;
    if(!user.isModified('password')){
        next();
        done();
    }
    user.password = calc_hash(user.password);
    next();
    done();
});

userSchema.methods.comparePassword = function(candidate, cb){
    hash = calc_hash(candidate);
    cb(this.password === hash);    
};

var Usuario = mongoose.model('usuario', userSchema);



exports.User = Usuario;

/*var t = new Usuario({username:"yves", password:"asfdfa",email:"asdasd"});
t.save(function(){console.log(t);});
Usuario.create();*/