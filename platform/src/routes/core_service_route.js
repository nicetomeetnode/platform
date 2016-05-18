var router = require("koa-router")();
var platform_access_service=require("../services/platform_access_service.js");
var key_word_service=require("../services/key_word_service.js");
var core_service=require("../services/core_service.js");

router.post("/platform/*", function* (next) {
//	yield core_service.handle(this.appInfo,this.request.query,this.request.body);
	if(this.appInfo && this.appInfo["keyWordFlag"]!=0){
		yield key_word_service.handle(this);
	}
	yield core_service._handle(this);
	yield next;
});
module.exports=router.routes();