var koa = require("koa");
var logger = require("koa-logger");
var serve = require("koa-static");
var bodyparser = require("koa-bodyparser");
var router = require("koa-router")();
var xmlParser = require('koa-xml-body').default; 
var app = koa();
//------------------route list start----------------
var platform_access_route=require("./src/routes/platform_access_route.js");
var core_service_route=require("./src/routes/core_service_route.js");
//------------------route list end----------------
app.keys = [ "node-platform-secret-key" ];
app.name = "node-platform";
app.env = process.env.NODE_ENV || "development";
if ("development" === app.env) {
	app.use(logger()); // Development style logging middleware
}
app.use(serve(__dirname + "/public")).use(xmlParser({xml2jsOptions:{
	explicitRoot : false,
	explicitArray : false
}})).use(bodyparser()).use(router.routes());

app.use(platform_access_route);
app.use(core_service_route);


app.on("error", function(err) {
	console.error("server error",	 err);
});

app.listen(5678, function() {
	console.log("app listening on port 5678");
});
