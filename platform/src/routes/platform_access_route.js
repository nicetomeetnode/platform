var router = require('koa-router')();
var platform_access_service=require("../services/platform_access_service.js");
var app_info_service=require("../services/app_info_service.js");
router.all('/platform/*', function *(next) {
			var that=this;
			
			var id=that.query.id;
			if(!id){
				that.body="fail";
				throw new Error("id is null");
				return;
			}
			var appInfo=yield app_info_service.getAppInfoById(id);
			if(!appInfo){
				that.body="fail";
				throw new Error("平台未配置该公众号或者配置出错");
				return;
			}
			that.appInfo=appInfo;
			var type=appInfo.type;
			var token=appInfo.token;
			var signature=that.query.signature;
			var timestamp=that.query.timestamp;
			var nonce=that.query.nonce;
			var echostr=that.query.echostr;

			if(yield platform_access_service.checkSignature(type,token,timestamp,nonce,signature)){
					if("GET"===that.method){
						that.body=echostr;
					}else{
						that.body="";
						yield next;
					}
					
				}else{
					that.body="fail";
				}
});
module.exports=router.routes();