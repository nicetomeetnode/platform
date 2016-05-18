var access_token_service=require("../services/access_token_service.js");
var co=require("co");
module.exports.testMethod=function(appInfo,getParams,postParams){
	console.log("==============================");
	console.log(appInfo,getParams,postParams);
	console.log("==============================");
};
module.exports.testMethod2=function(_this){
		co(
			function *(){
				console.log("---------------------------------");
				var result=yield access_token_service.getAccessToken("1");
				console.log(_this.appInfo);
				console.log(_this.request.body);
				console.log(_this.request.query);
				console.log("------------------------------------");
				console.log(result);
			}
		).catch(function(err){
			console.error(err);
			return;
		});
		

};