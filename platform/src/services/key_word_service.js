var co=require("co");
var app_info_service=require("./app_info_service.js");
var access_token_service=require("./access_token_service.js");
var send_data_to_user_service=require("./send_data_to_user_service.js");
var request=require("../utils/request.js");
var dao=require("../dao/dao_mysql.js");

module.exports.handle=function(_this){
	return function(cb){
		co(
			function *(){
					var appInfo=_this.appInfo;
					var content=_this.request.body.Content;
					var key_return;
					if(appInfo && appInfo["keyWordFlag"]){
						var result=yield dao.execSql("select * from key_word where appId=? and status=?",[appInfo.id,1]);
						if(result && result.length){
							for(var i in result){
								var keys=result[i]["keyWordList"].split(",");
								for(var j in keys){
									if(keys[j]===content){
										key_return=result[i];
										break;
									}
								}
								if(key_return){
									break;
								}
							}
							if(key_return){
								switch(key_return.type){
								case 'text':
									yield send_data_to_user_service.text(_this.appInfo.id, _this.request.body.FromUserName, key_return["text"]);
									break;
								case 'image':
									yield send_data_to_user_service.image(_this.appInfo.id,  _this.request.body.FromUserName, key_return["mediaId"]);
									break;
								case 'voice':
									yield send_data_to_user_service.voice(_this.appInfo.id,  _this.body.request.FromUserName, key_return["mediaId"]);
									break;
								case 'video':
									if(appInfo.type==='y'){
										yield send_data_to_user_service.video_yx(_this.appInfo.id,  _this.request.body.FromUserName, key_return["mediaId"]);
									}else{
										yield send_data_to_user_service.video_wx(_this.appInfo.id, _this.request.body.FromUserName, key_return["mediaId"], key_return["thumbMediaId"], key_return["title"], key_return["description"]);
									}
									break;
								case 'news':
									yield get_data_from_user_service.getVideo(req);
									break;
								}
							}
						}
					}
					cb(null,null);
					return;
			}
		).catch(function(err){
			cb(err);
			return;
		});
	};
}