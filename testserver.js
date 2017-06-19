var express = require("express");
var loginapp = require("./app.js").LoginApp;

var app = express();


app.use("/api/login", loginapp("consult","users","bencaosdeDeus"));


app.listen("3000",function(){
	console.log("listening...");
});
