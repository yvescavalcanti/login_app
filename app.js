#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
var jwt = require('jsonwebtoken');
var MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser');
var Q = require('q');
var crypto = require("crypto");
/*
* CONFIGURAÇÕES
*/

var LoginApp = (function(){
	function routeGuardian()
		{
			return function(request, response, next)
			{
				var token = req.headers['x-access-token'];
				if(token){
                	jwt.verify(token, secret, function(err, decoded) {
                    	if(err){
                        	return res.status(403).json({ success: false, message: 'Failed to authenticate token.' });
                    	} else{
                        	req.decoded = decoded;
                        	next();
                    	}
                	});
                
                }else{
                	res.status(403).json({
                    	success:false,
                    	msg:"Acesso não autorizado!"
                	});
            	}

			};
	}
	
	
	function loginApp(database, logindoc, secret){
	
		var app = express();
		app.use(bodyParser.json());
		app.use(bodyParser.urlencoded({extended:true}));

		/*
			Função para guardar rotas
		*/
		


		/*
			Função auxiliar para gerar tokens
		*/
		function generateToken(){}
		/*
			Início sessão de rotas
		*/
		function requestAccess(query){
			var def = Q.defer();
			console.log("database:"+database);
			MongoClient.connect("mongodb://127.0.0.1:27017/"+database, function(err, db){
				if(err) def.reject(err);
				else
				{
					db.collection(logindoc).findOne(query).then(
						function(result){
							result.token = jwt.sign({data:query.username,expiresIn:15},secret);
							console.log(result.token);
							def.resolve(result);

						},function(err){
							def.reject(err);
						});
				}
			});
				
		
			return def.promise;
		};

		app.post("/login", function(request, response){
			var hash = crypto.createHash('md5');
			hash.update(request.body.password);
			var hashpass = hash.digest("hex");
			var query = {
				username:request.body.username,
				password:hashpass
			};
			requestAccess(query).then(function(result)
			{
				response.status(200).json(result);
			},function(err)
			{
				response.status(403).json(err);
			});
		});
		
		app.get("/teste",function(req,res){
			res.status(200).json({
				status:'ok',
				token:jwt.sign({data:"ok",expiresIn:1},secret)
			});
		});

		return app;
	}

	return {LoginApp:loginApp, RouteGuardian:routeGuardian};
})();

module.exports = LoginApp;
