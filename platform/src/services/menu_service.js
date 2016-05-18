var request=require("../utils/request.js");
var co=require("co");
var dao=require("../dao/dao_mysql.js");
var app_info_service=require("./app_info_service.js");
var access_token_service=require("./access_token_service.js");
module.exports.create=function(appId){
	return function(cb){
		co(function*(){
			var appInfo=yield checkMenuConfig(appId);
			if(appInfo){
				var menuJson=yield buildJson(appInfo);
				var postContent=JSON.stringify(menuJson);
				var access_token=yield access_token_service.getAccessToken(appInfo.id);
				var url;
				if(access_token){
					if(appInfo.type==='y'){
						url="https://api.yixin.im/cgi-bin/menu/create?access_token="+access_token;
					}else{
						url="https://api.weixin.qq.com/cgi-bin/menu/create?access_token="+access_token;
					}
					var result=yield request.request(url, postContent);
					if(result && (typeof result==='string')){
						result=JSON.parse(result);
					}
					if(result && result.errcode){
						cb(new Error(result.errmsg));
						return;
					}
					cb(null,"success");
					return;
				}
				
			}
		}).catch(function(err){
			cb(err);
			return;
		});
	}
	
};

function checkServerLocalSame(appId) {
	return function(cb){
		co(function*(){
			if(appId){
				var appInfo=yield app_info_service.getAppInfoById(appId);
				if(appInfo){
					var result=yield getFromServer(appId);
					var sqls=[];
					var params=[];
					if(appInfo.type==='y'){
						for(var i in result["button"]){
							if(result["button"][i]["type"]){
								sqls.push("insert into menu (appId,name,type,_key,url,parentId,createTime,status) values (?,?,?,?,?,?,now(),?)");
								params.push([appId,result["button"][i]["name"],result["button"][i]["type"],result["button"][i]["key"]||null,result["button"][i]["url"]||null,null,2]);
							}else{
								sqls.push("insert into menu (appId,name,type,_key,url,parentId,createTime,status) values (?,?,?,?,?,?,now(),?)");
								params.push([appId,result["button"][i]["name"],null,null,null,null,2]);
								for(var j in result["button"][i]["sub_button"]){
									sqls.push("insert into menu (appId,name,type,_key,url,parentId,createTime,status) values (?,?,?,?,?, (select id from menu t2 where t2.appId =? and t2. name =? and t2.type is NULL and t2.parentId is NULL and t2. status =?), now() ,? )");
									params.push([appId,result["button"][i]["sub_button"][j]["name"]||null,result["button"][i]["sub_button"][j]["type"]||null,result["button"][i]["sub_button"][j]["key"]||null,result["button"][i]["sub_button"][j]["url"]||null,appId,result["button"][i]["name"],2,2]	);
								}
								sqls.push("update menu set status=? where appId=? and status=?");
								params.push([3,appId,2]);
							}
						}
					}else{
						for(var i in result["menu"]["button"]){
							if(result["menu"]["button"][i]["type"]){
								sqls.push("insert into menu (appId,name,type,_key,url,parentId,createTime,status) values (?,?,?,?,?,?,now(),?)");
								params.push([appId,result["menu"]["button"][i]["name"],result["menu"]["button"][i]["type"],result["menu"]["button"][i]["key"]||null,result["menu"]["button"][i]["url"]||null,null,2]);
							}else{
								sqls.push("insert into menu (appId,name,type,_key,url,parentId,createTime,status) values (?,?,?,?,?,?,now(),?)");
								params.push([appId,result["menu"]["button"][i]["name"],null,null,null,null,2]);
								for(var j in result["menu"]["button"][i]["sub_button"]){
									sqls.push("insert into menu (appId,name,type,_key,url,parentId,createTime,status) values (?,?,?,?,?, (select id from menu t2 where t2.appId =? and t2. name =? and t2.type is NULL and t2.parentId is NULL and t2. status =?), now() ,? )");
									params.push([appId,result["menu"]["button"][i]["sub_button"][j]["name"]||null,result["menu"]["button"][i]["sub_button"][j]["type"]||null,result["menu"]["button"][i]["sub_button"][j]["key"]||null,result["menu"]["button"][i]["sub_button"][j]["url"]||null,appId,result["menu"]["button"][i]["name"],2,2]	);
								}
								sqls.push("update menu set status=? where appId=? and status=?");
								params.push([3,appId,2]);
							}
						}
					}
					
					sqls.push("update menu set status=? where status=? and appId=?");
					params.push([0,1,appId]);
					sqls.push("update menu set status=? where status=? and appId=?");
					params.push([1,3,appId]);
					yield dao.execSqls(sqls, params);
					cb(null,"success");
					return;
				}else{
					cb(new Error("找不到id为："+appId+" 的公众号"));
					return;
				}
			}else{
				cb(new Error("传入的appId为空"));
				return;
			}
		}).catch(function(err){
			cb(err);
			return;
		});
	}
}
module.exports.get=function(appId){
	return function(cb){
		co(
				function *(){
					yield checkServerLocalSame(appId);
					var result=yield getLocal(appId);
					cb(null,result);
					return;
				}
		).catch(function(err){
			cb(err);
			return;
		});
	}
}
function getLocal(appId){
	return function(cb){
		co(function*(){
			if(appId){
				var appInfo=yield app_info_service.getAppInfoById(appId);
				if(appInfo){
					var result=yield buildJson(appInfo);
					cb(null,result);
					return;
				}else{
					cb(new Error("找不到id为："+appId+" 的公众号"));
					return;
				}
			}else{
				cb(new Error("传入的appId为空"));
				return;
			}
		}).catch(function(err){
			cb(err);
			return;
		});
	}
}
	
	
	
function getFromServer(appId){
	return function(cb){
		co(function*(){
			if(appId){
				var appInfo=yield app_info_service.getAppInfoById(appId);
				if(appInfo){
					var url;
					var access_token=yield access_token_service.getAccessToken(appInfo.id);
					if(appInfo.type==='y'){
						url="https://api.yixin.im/cgi-bin/menu/get?access_token="+access_token;
					}else{
						url="https://api.weixin.qq.com/cgi-bin/menu/get?access_token="+access_token;
					}
					var result=yield request.get(url);
					if(result && (typeof result==='string')){
						result=JSON.parse(result);
					}
//					console.log(result);
					if(result && result.errcode){
						if(result.errcode=='46003'){
							yield dao.execSql("update menu set status=? where appId=? and status=?",[0,appId,1]);
							cb(null,{"menu":{"button":[]}});
							return;
						}
						cb(new Error(result.errmsg));
						return;
					}
					cb(null,result);
					return;
				}else{
					cb(new Error("找不到id为："+appId+" 的公众号"));
					return;
				}
			}else{
				cb(new Error("传入的appId为空"));
				return;
			}
		}).catch(function(err){
			cb(err);
			return;
		});
	}
};
module.exports.remove=function(appId){
	return function(cb){
		co(function*(){
			if(appId){
				var appInfo=yield app_info_service.getAppInfoById(appId);
				if(appInfo){
					var url;
					var access_token=yield access_token_service.getAccessToken(appInfo.id);
					if(appInfo.type==='y'){
						url="https://api.yixin.im/cgi-bin/menu/delete?access_token="+access_token;
					}else{
						url="https://api.weixin.qq.com/cgi-bin/menu/delete?access_token="+access_token;
					}
					var result=yield request.get(url);
					if(result && (typeof result==='string')){
						result=JSON.parse(result);
					}
					if(result && result.errcode){
						cb(new Error(result.errmsg));
						return;
					}
					yield dao.execSql("update menu set status=? where appId=? and status=?",[0,appId,1]);
					cb(null,"success");
					return;
				}else{
					cb(new Error("找不到id为："+appId+" 的公众号"));
					return;
				}
			}else{
				cb(new Error("传入的appId为空"));
				return;
			}
		}).catch(function(err){
			cb(err);
			return;
		});
	}
};
function getChildMenus(id){
	return function(cb){
		co(function*(){
			var result=yield dao.execSql("select name,type,_key,url from menu where status=? and parentId=?  order by id asc",[1,id]);
			if(result && result.length){
				cb(null,result);
				return;
			}else{
				cb(null,null);
				return;
			}
		}).catch(function(err){
			cb(err);
			return;
		});
	}
}

function getMenu(id){
	return function(cb){
		co(function*(){
			var result=yield dao.execSql("select name,type,_key,url from menu where status=? and id=? limit 0,1",[1,id]);
			if(result && result.length){
				cb(null,result[0]);
				return;
			}else{
				cb(null,null);
				return;
			}
		}).catch(function(err){
			cb(err);
			return;
		});
	}
}
function  buildJson(appInfo){
	return function(cb){
		co(function*(){
			var result=yield dao.execSql("select * from menu where appId=? and status=? and parentId is null order by id asc",[appInfo.id,1]);
				var buttons=[];
				for(var i in result){
					if(result[i]["id"]){
						var result2=yield getChildMenus(result[i]["id"]);
						if(result2 && result2.length){
							var obj={"name":result[i]["name"],"sub_button":[]};
							buttons.push(obj)
							for(var j in result2){
								if(result2[j]["type"]==="view"){
									obj["sub_button"].push({"name":result2[j]["name"],"type":"view","url":result2[j]["url"]});
								}else if(result2[j]["type"]==="click"){
									obj["sub_button"].push({"name":result2[j]["name"],"type":"click","key":result2[j]["_key"]});
								}else if(result2[j]["type"]==="scan"){
									if(appInfo.type==="y"){
										obj["sub_button"].push({"name":result2[j]["name"],"type":"yixinscan","key":result2[j]["_key"]});
									}else{
										obj["sub_button"].push({"name":result2[j]["name"],"type":"scancode_push","key":result2[j]["_key"]});
									}
								}else{
									cb(new Error("id为："+result2[j]["id"]+" 的菜单type出错"));
									return;
								}
							}
							obj=null;
						}else{
							if(result[i]["type"]==="view"){
								buttons.push({"name":result[i]["name"],"type":"view","url":result[i]["url"]});
							}else if(result[i]["type"]==="click"){
								buttons.push({"name":result[i]["name"],"type":"click","key":result[i]["_key"]});
							}else if(result[i]["type"]==="scan"){
								if(appInfo.type==="y"){
									buttons.push({"name":result[i]["name"],"type":"yixinscan","key":result[i]["_key"]});
								}else{
									buttons.push({"name":result[i]["name"],"type":"scancode_push","key":result[i]["_key"]});
								}
							}else{
								cb(new Error("id为："+result[i]["id"]+" 的菜单type出错"));
								return;
							}
						}
					}
					
				}
				cb(null,{"button":buttons});
				return;
		}).catch(function(err){
			cb(err);
			return;
		});
	}
}

function checkMenuConfig(appId){
	return function(cb){
		co(
			function *(){
				if(appId){
					var appInfo=yield app_info_service.getAppInfoById(appId);
					if(appInfo){
						var result=yield dao.execSql("select id from menu where appId=? and status=? and parentId is null",[appInfo.id,1])
						if(result && result.length){
							if(appInfo.type==='y'){
								//易信最多包括4个一级菜单
								if(result.length>4){
									cb(new Error("最多包括4个一级菜单"));
									return;
								}
							}else{
								//微信自定义菜单最多包括3个一级菜单
								if(result.length>3){
									cb(new Error("最多包括3个一级菜单"));
									return;
								}
							}
//							每个一级菜单最多包含5个二级菜单
							for(var i in result){
								var result2=yield getChildMenus(result[i]["id"]);
								if(result2 && result2.length>5){
									cb(new Error("每个一级菜单最多包括5个二级菜单"));
									return;
								}
								result2=null;
							}
							cb(null,appInfo);
						}else{
							cb(new Error("未配置id为："+appInfo.id+" 的公众号的一级菜单"));
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
		
	};
	
}