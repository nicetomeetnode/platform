//虽然获取二维码时候传入的是字符串类型的scene_str来标志一个二维码，但是由于易信只支持通过scene_id的形式来获取二维码，因此在此处进行如下处理：
//1、接收到scene_str后，取出qr_code表中该公众号所对应的最大scene_id，然后自增后和scene_str一一对应保存入qr_code表中
//2、通过和该scene_str对应的scene_id来访问服务器生成相应的二维码
//因此在处理二维码事件时，只处理QR_SCENE和QR_LIMIT_SCENE类型的二维码，通过结合qr_code表来取得该scene_id所对应的scene_str
//若在生成临时二维码时同一公众号下已存在该scene_str所对应的二维码信息，则会对该二维码进行覆盖生成。若在生成永久二维码时同一公众号下已存在该scene_str所对应的二维码信息，则直接返回原二维码信息。
//不会出现同一公众号下同一关键字对应两个不同二维码，且这两个二维码同时为永久或同时为临时的，但允许对应同一scene_str字符串的一永久和一临时二维码同时存在
//生成二维码过程中，因为考虑到高并发的问题，会对scene_id的生成造成影响，进而会产生同样的scene_id，而又要求本地库中scene_str和微信易信服务器的scene_id一一对应，故设计逻辑如下。
//以下两句sql是实现的关键
//保证取到的sceneId是唯一的
//insert into qr_code (appId,expireSeconds,actionName,url,sceneStr,createTime,sceneId) values(?,?,?,?,?,now(),(select ifnull(max(sceneId), 0) + 1 from qr_code t2 where t2.appId = ? and t2.actionName = ?))
//保证同一sceneStr对应同一的sceneId(此处以永久二维码sql为例)
//update qr_code  set expireSeconds=-1,sceneId=-1 where id in(select a.id from (select id from qr_code where actionName=? and sceneStr=? and appId=?  and expireSeconds is null and id not in(select min(id) from qr_code  where actionName=? and sceneStr=? and appId=?  and expireSeconds is null) )a)
//现插入，再查询，因此可以保证本地库中scene_str和微信易信服务器的scene_id一一对应
//createOrCoverForever(appId,scene_str,scene_id)用于创建指定scene_str,scene_id的永久二维码，若该公众号下已存在scene_str所对应的永久二维码，则创建失败。

var app_info_service=require("./app_info_service.js");
var access_token_service=require("./access_token_service.js");
var string_util=require("../utils/string_util.js");
var request=require("../utils/request.js");
var dao=require("../dao/dao_mysql.js");
var co=require("co");
module.exports.createTmp=function(appId,scene_str,expire_seconds){
	//QR_SCENE
	return function(cb){
		co(
			function *(){
				scene_str=string_util.trim(scene_str);
				if(!scene_str){
					cb(new Error("传入的 scene_str 为空"));
					return;
				}
				if(appId){
					var appInfo=yield app_info_service.getAppInfoById(appId);
					if(appInfo){
						var result=yield getBySceneStrTmp(appId, scene_str);
						if(result){
							//已存在该scene_str所对应的有效临时二维码
							//此处做个假性删除，设置expireSeconds为-1,然后重新从微信易信服务器获取，以此来刷新该临时二维码的有效时间
							yield remove(result.id);
						}
						//此处还要做个该scene_str所对应的无效二维码(自然超时过期)remove的操作
						yield removeInvalid(appId,scene_str);
						
						
						
						var url;
						var url2;
						var access_token=yield access_token_service.getAccessToken(appId);
//						expire_seconds  易信为1800;   微信为2592000
						if(appInfo.type==="y"){
							if(!expire_seconds || expire_seconds>1800 || expire_seconds<0){
								expire_seconds=1800;
							}
							url="https://api.yixin.im/cgi-bin/qrcode/create?access_token="+access_token;
							url2="https://api.yixin.im/cgi-bin/qrcode/showqrcode?ticket=";
						}else{
							if(!expire_seconds || expire_seconds>2592000 || expire_seconds<0){
								expire_seconds=2592000;
							}
							url="https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token="+access_token;
							url2="https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=";
						}
						
						
						yield save(appId,expire_seconds,"",scene_str,0);
						yield removeDuplicateTmp(appId,scene_str);
						var result2=yield getBySceneStrTmp(appId, scene_str);
						var data={"expire_seconds": expire_seconds, "action_name": "QR_SCENE", "action_info": {"scene": {"scene_id": result2.sceneId}}};
						var result3=yield request.request(url, JSON.stringify(data));
						if(result3 && (typeof result3==='string')){
							result3=JSON.parse(result);
						}
						if(result3 && result3["ticket"]){
							url2+=result3["ticket"];
							yield updateUrlAndexpireSeconds(result2.id,url2,result3["expire_seconds"]);
							cb(null,{url:url2,expire_seconds:result3["expire_seconds"]});
							return;
						}else{
							if(result){
								yield rollback(result.id, result.expireSeconds);
							}
							yield remove(result2.id);
							cb(new Error("创建临时二维码失败,"+result3["errmsg"]));
							return;
						}
						
						
					}else{
						cb(new Error("找不到id为："+appId+" 的公众号"));
						return;
					}
				}else{
					cb(new Error("传入的appId为空"));
					return;
				}
			}
		).catch(function(err){
			cb(err);
			return;
		});
	}
};
module.exports.createForever=function(appId,scene_str){
	//QR_LIMIT_SCENE
	return function(cb){
		co(
			function *(){
				scene_str=string_util.trim(scene_str);
				if(!scene_str){
					cb(new Error("传入的 scene_str 为空"));
					return;
				}
				if(appId){
					var appInfo=yield app_info_service.getAppInfoById(appId);
					if(appInfo){
						var result=yield getBySceneStrForever(appId, scene_str);
						if(result){
							//已存在该scene_str所对应的有效永久二维码
							//直接返回
							cb(null,result["url"]);
							return;
						}
						
						var url;
						var url2;
						var access_token=yield access_token_service.getAccessToken(appId);
						
						
						yield save(appId,null,"",scene_str,1);
						yield removeDuplicateForever(appId,scene_str);
						
						
						var result2=yield getBySceneStrForever(appId, scene_str);
						if(appInfo.type==="y"){
							if(result2.sceneId>1000){
								yield remove(result2.id);
								cb(new Error("该公众号永久二维码的sceneId超过1000"));
								return;
								
							}
							url="https://api.yixin.im/cgi-bin/qrcode/create?access_token="+access_token;
							url2="https://api.yixin.im/cgi-bin/qrcode/showqrcode?ticket=";
						}else{
							if(result2.sceneId>100000){
								yield remove(result2.id);
								cb(new Error("该公众号永久二维码的sceneId超过100000"));
								return;
								
								
							}
							url="https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token="+access_token;
							url2="https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=";
						}
						var data={ "action_name": "QR_LIMIT_SCENE", "action_info": {"scene": {"scene_id": result2.sceneId}}};
						var result3=yield request.request(url,JSON.stringify(data));
						if(result3 && (typeof result3==='string')){
							result3=JSON.parse(result3);
						}
						if(result3 && result3["ticket"]){
							url2+=result3["ticket"];
							yield updateUrl(result2.id,url2);
							cb(null,{url:url2});
							return;
						}else{
							yield remove(result2.id);
							cb(new Error("创建临时二维码失败"));
							return;
						}
					}else{
						cb(new Error("找不到id为："+appId+" 的公众号"));
						return;
					}
				}else{
					cb(new Error("传入的appId为空"));
					return;
				}
			}
		).catch(function(err){
			cb(err);
			return;
		});
	}
};

module.exports.createOrCoverForever=function(appId,scene_str,scene_id){
	//QR_LIMIT_SCENE
	return function(cb){
		co(
			function *(){
				scene_str=string_util.trim(scene_str);
				if(!scene_str){
					cb(new Error("传入的 scene_str 为空"));
					return;
				}
				scene_id=string_util.trim(scene_id);
				if(!scene_id){
					cb(new Error("传入的 sceneId 为空"));
					return;
				}
				if(appId){
					var appInfo=yield app_info_service.getAppInfoById(appId);
					if(appInfo){
						if(appInfo.type==='y'){
							scene_id=parseInt(scene_id);
							if(scene_id>1000 ||scene_id<1){
								cb(new Error("传入的 sceneId 不符要求"));
								return;
							}
						}else{
							if(scene_id>100000 ||scene_id<1){
								cb(new Error("传入的 sceneId 不符要求"));
								return;
							}
							
						}
						
						var r=yield getBySceneStrForever(appId, scene_str);
						if(r){
							cb(new Error("创建失败，该公众号已存在scene_str为 "+scene_str+" 的二维码，且该二维码所对应的appId为 "+r.sceneId));
							return;
						}
						
						
						
						var result=yield getBySceneIdForever(appId, scene_id);
						if(result){
							//已存在该scene_id所对应的有效永久二维码
							//此处做个假性删除，设置expireSeconds为-1,然后新生成该scene_id所对应的二维码
							yield remove(result.id);
						}
						
						var url;
						var url2;
						var access_token=yield access_token_service.getAccessToken(appId);
						
						
						yield save2(appId,null,"",scene_str,1,scene_id);
						
						
						
						var result2=yield getBySceneIdForever(appId, scene_id);
						if(appInfo.type==="y"){
							url="https://api.yixin.im/cgi-bin/qrcode/create?access_token="+access_token;
							url2="https://api.yixin.im/cgi-bin/qrcode/showqrcode?ticket=";
						}else{
							url="https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token="+access_token;
							url2="https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=";
						}
						var data={ "action_name": "QR_LIMIT_SCENE", "action_info": {"scene": {"scene_id": result2.sceneId}}};
						var result3=yield request.request(url,JSON.stringify(data));
						if(result3 && (typeof result3==='string')){
							result3=JSON.parse(result3);
						}
						if(result3 && result3["ticket"]){
							url2+=result3["ticket"];
							yield updateUrl(result2.id,url2);
							cb(null,{url:url2});
							return;
						}else{
							if(result){
								yield rollback2(result.id, null);
							}
							yield remove(result2.id);
							cb(new Error("创建临时二维码失败"));
							return;
						}
					}else{
						cb(new Error("找不到id为："+appId+" 的公众号"));
						return;
					}
				}else{
					cb(new Error("传入的appId为空"));
					return;
				}
			}
		).catch(function(err){
			cb(err);
			return;
		});
	}
};
function getBySceneStrTmp(appId,scene_str){
	return function(cb){
		co(
			function *(){
				var result=yield dao.execSql("select * from qr_code where sceneStr =? and appId =? and UNIX_TIMESTAMP(now()) - UNIX_TIMESTAMP(createTime) < expireSeconds and actionName =? order by id limit 0,1", [scene_str,appId,0]);
				if(result && result.length){
					cb(null,result[0]);
				}else{
					cb(null,null);
				}
			}
		).catch(function(err){
			cb(err);
			return;
		});
	}
}
function getBySceneStrForever(appId,scene_str){
	return function(cb){
		co(
			function *(){
				var result=yield dao.execSql("select * from qr_code where sceneStr =? and appId =? and expireSeconds is null and actionName =? order by id  limit 0,1", [scene_str,appId,1]);
				if(result && result.length){
					cb(null,result[0]);
				}else{
					cb(null,null);
				}
			}
		).catch(function(err){
			cb(err);
			return;
		});
	}
}

function save(appId,expireSeconds,url,sceneStr,actionName){
	return function(cb){
		co(
			function *(){
				yield dao.execSql("insert into qr_code (appId,expireSeconds,actionName,url,sceneStr,createTime,sceneId) values(?,?,?,?,?,now(),(select ifnull(max(sceneId), 0) + 1 from qr_code t2 where t2.appId = ? and t2.actionName = ?))", [appId,expireSeconds,actionName,url,sceneStr,appId,actionName]);
				cb(null,"success");
			}
		).catch(function(err){
			cb(err);
			return;
		});
	}
}

function remove(id){
//	假性删除，设置expireSeconds为-1
	return function(cb){
		co(
			function *(){
				yield dao.execSql("update qr_code set expireSeconds=? where id= ?", [-1,id]);
				cb(null,"success");
			}
		).catch(function(err){
			cb(err);
			return;
		});
	}
}

function rollback(id,expireSeconds){
	return function(cb){
		co(
			function *(){
				yield dao.execSql("update qr_code set expireSeconds=? where id= ?", [expireSeconds,id]);
				cb(null,"success");
			}
		).catch(function(err){
			cb(err);
			return;
		});
	}
}

function updateUrlAndexpireSeconds(id,url,expire_seconds){
	return function(cb){
		co(
			function *(){
				yield dao.execSql("update qr_code set expireSeconds=?,url=? where id= ?", [expire_seconds,url,id]);
				cb(null,"success");
			}
		).catch(function(err){
			cb(err);
			return;
		});
	}
}
function updateUrl(id,url){
	return function(cb){
		co(
				function *(){
					yield dao.execSql("update qr_code set url=? where id= ?", [url,id]);
					cb(null,"success");
				}
		).catch(function(err){
			cb(err);
			return;
		});
	}
}

function removeInvalid(appId,scene_str){
	return function(cb){
		co(
				function *(){
					yield dao.execSql("update qr_code set expireSeconds=? where sceneStr =? and appId =? and UNIX_TIMESTAMP(now()) - UNIX_TIMESTAMP(createTime) > expireSeconds and actionName =?", [-1,scene_str,appId,0]);
					cb(null,"success");
				}
		).catch(function(err){
			cb(err);
			return;
		});
	}
}

function getBySceneIdForever(appId, scene_id){
	return function(cb){
		co(
			function *(){
				var result=yield dao.execSql("select * from qr_code where sceneId =? and appId =? and expireSeconds is null and actionName =? limit 0,1", [scene_id,appId,1]);
				if(result && result.length){
					cb(null,result[0]);
				}else{
					cb(null,null);
				}
			}
		).catch(function(err){
			cb(err);
			return;
		});
	}
	
}


function save2(appId,expireSeconds,url,sceneStr,actionName,sceneId){
	return function(cb){
		co(
			function *(){
				yield dao.execSql("insert into qr_code (appId,expireSeconds,actionName,url,sceneStr,createTime,sceneId) values(?,?,?,?,?,now(),?)", [appId,expireSeconds,actionName,url,sceneStr,sceneId]);
				cb(null,"success");
			}
		).catch(function(err){
			cb(err);
			return;
		});
	}
}


function removeDuplicateForever(appId,sceneStr){
	return function(cb){
		co(
			function *(){
				yield dao.execSql("update qr_code  set expireSeconds=-1,sceneId=-1 where id in(select a.id from (select id from qr_code where actionName=? and sceneStr=? and appId=?  and expireSeconds is null and id not in(select min(id) from qr_code  where actionName=? and sceneStr=? and appId=?  and expireSeconds is null) )a)", [1,sceneStr,appId,1,sceneStr,appId]);
				cb(null,"success");
			}
		).catch(function(err){
			cb(err);
			return;
		});
	}
}

function removeDuplicateTmp(appId,sceneStr){
	return function(cb){
		co(
			function *(){
				yield dao.execSql("update qr_code  set expireSeconds=-1,sceneId=-1 where id in(select a.id from (select id from qr_code where actionName=? and sceneStr=? and appId=?  and UNIX_TIMESTAMP(now()) - UNIX_TIMESTAMP(createTime) < expireSeconds and id not in(select min(id) from qr_code  where actionName=? and sceneStr=? and appId=?  and UNIX_TIMESTAMP(now()) - UNIX_TIMESTAMP(createTime) < expireSeconds) )a)", [1,sceneStr,appId,1,sceneStr,appId]);
				cb(null,"success");
			}
		).catch(function(err){
			cb(err);
			return;
		});
	}
}