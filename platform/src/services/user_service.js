var app_info_service=require("./app_info_service.js");
var access_token_service=require("./access_token_service.js");
var request=require("../utils/request.js");
var dao=require("../dao/dao_mysql.js");
var co=require("co");
module.exports.createGroup=function(appId,groupName){
	return function(cb){
		co(
			function *(){
				if(appId){
					var appInfo=yield app_info_service.getAppInfoById(appId);
					if(appInfo){
						var url;
						var access_token=yield access_token_service.getAccessToken(id);
						var data;
						if(appInfo.type==='y'){
							url="https://api.yixin.im/cgi-bin/groups/create?access_token="+access_token;
							data={"group":{"name":groupName}};
						}else{
							url="https://api.weixin.qq.com/cgi-bin/tags/create?access_token="+access_token;
							data={"tag" :{"name" : groupName}}
						}
						var result=yield request.request(url, JSON.stringify(data));
						if(result && (typeof result==='string')){
							result=JSON.parse(result);
						}
						if(result && result.errcode){
							cb(new Error(result.errmsg));
							return;
						}
						var groupId;
						if(appInfo.type==='y'){
							groupId=result["group"]["id"];
						}else{
							groupId=result["tag"]["id"];
						}
						yield saveGroup(appId,groupId, groupName);
						cb(null,{"group":{"id":groupId,"name":groupName}});
						return;
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
};
module.exports.getGroups=function(appId){
	return function(cb){
		co(
			function *(){
				if(appId){
					var appInfo=yield app_info_service.getAppInfoById(appId);
					if(appInfo){
						var result=yield getGroupsLocal(appId);
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
			}
		).catch(function(err){
			cb(err);
			return;
		});
	};
};
module.exports.checkServerLocalGroupsSame=function(appId){
	return function(cb){
		co(
			function *(){
				if(appId){
					var appInfo=yield app_info_service.getAppInfoById(appId);
					if(appInfo){
						var result2=yield getGroupsFromServer(appId);
						var sqls=[];
						var params=[];
						if(result2){
							if(appInfo.type==='y'){
								for(var i in result2["groups"]){
									sqls.push("insert into user_group (groupId,appId,name,count,createTime,status) values(?,?,?,?,now(),?)");
									params.push([result2["groups"][i]["id"],appId,result2["groups"][i]["name"],result2["groups"][i]["count"],2]);
								}
								sqls.push("update user_group set status=? where appId=? and status=?");
								params.push([0,appId,1]);
								sqls.push("update user_group set status=? where appId=? and status=?");
								params.push([1,appId,2]);
								yield dao.execSqls(sqls,params);
								cb(null,"success");
								return;
							}else{
								for(var i in result2["tags"]){
									sqls.push("insert into user_group (groupId,appId,name,count,createTime,status) values(?,?,?,?,now(),?)");
									params.push([result2["tags"][i]["id"],appId,result2["tags"][i]["name"],result2["tags"][i]["count"],2]);
								}
								sqls.push("update user_group set status=? where appId=? and status=?");
								params.push([0,appId,1]);
								sqls.push("update user_group set status=? where appId=? and status=?");
								params.push([1,appId,2]);
								yield dao.execSqls(sqls,params);
								cb(null,"success");
								return;
							}
						}
						
						cb(new Error("未找到该公众号的分组信息"));
						return;
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
};
module.exports.updateGroup=function(appId,groupId,groupName){
	return function(cb){
		co(
			function *(){
				if(appId){
					var appInfo=yield app_info_service.getAppInfoById(appId);
					if(appInfo){
						var url;
						var access_token=yield access_token_service.getAccessToken(id);
						var data;
						if(appInfo.type==='y'){
							url="https://api.yixin.im/cgi-bin/groups/get?access_token="+access_token;
							data={"group":{"id":groupId,"name":groupName}}
						}else{
							url="https://api.weixin.qq.com/cgi-bin/tags/update?access_token="+access_token;
							data={
								  "tag" : {
								    "id" : groupId,
								    "name" : groupName
								  }
								}
						}
						var result=yield request.request(url,data);
						if(result && (typeof result==='string')){
							result=JSON.parse(result);
						}
						if(result && result.errcode){
							cb(new Error(result.errmsg));
							return;
						}
						yield updateGroup(appId, groupId, groupName);
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
			}
		).catch(function(err){
			cb(err);
			return;
		});
	};
};

module.exports.moveUser2Group_yx=function(appId,openId,groupId){
	return function(cb){
		co(
			function *(){
				if(appId){
					var appInfo=yield app_info_service.getAppInfoById(appId);
					if(appInfo){
						if(appInfo.type==='y'){
							var access_token=yield access_token_service.getAccessToken(appId);
							var url="https://api.yixin.im/cgi-bin/groups/members/update?access_token="+access_token;
							var data={"openid":openId,"to_groupid":groupId};
							var result=yield request.request(url,data);
							if(result && (typeof result==='string')){
								result=JSON.parse(result);
							}
							if(result && result.errcode){
								cb(new Error(result.errmsg));
								return;
							}
							var result2=yield findUserLocal(appId,openId);
							if(!result2){
								var result3=yield getUserFromServer(appInfo,openId);
								if(result3["subscribe"]){
									yield saveOrUpdateUser(appInfo,result3);
									cb(null,"success");
									return;
								}else{
									cb(new Error("该用户未关注公众号"));
									return;
								}
								
							}
							
							yield addUserGroup(appId,openId,groupId);
							cb(null,"success");
							return;
						}else{
							cb(new Error("此接口为易信公众号接口，请查看app_info表中公众号配置"));
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

module.exports.moveUser2Group_wx=function(appId,openidList,groupId){
	return function(cb){
		co(
			function *(){
				if(appId){
					var appInfo=yield app_info_service.getAppInfoById(appId);
					if(appInfo){
						if(appInfo.type==='y'){
							cb(new Error("此接口为微信公众号接口，请查看app_info表中公众号配置"));
							return;
						}
						
						

						var access_token=yield access_token_service.getAccessToken(appId);
						var url="https://api.weixin.qq.com/cgi-bin/tags/members/batchtagging?access_token="+access_token;
						var data={"openid_list":openidList,"tagid":groupId};
						var result=yield request.request(url,data);
						if(result && (typeof result==='string')){
							result=JSON.parse(result);
						}
						if(result && result.errcode){
							cb(new Error(result.errmsg));
							return;
						}
						
						for(var i in openidList){
							var result2=yield findUserLocal(appId,openidList[i]);
							if(!result2){
								var result3=yield getUserFromServer(appInfo,openidList[i]);
								if(result3["subscribe"]){
									yield saveOrUpdateUser(appInfo,result3);
								}else{
									cb(new Error("该用户未关注公众号"));
									return;
								}
							}else{
								yield addUserGroup(appId,openidList[i],groupId);
							}
						}
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
			}
		).catch(function(err){
			cb(err);
			return;
		});
	};
}
module.exports.getUserGroup=function(appId,openId){
	return function(cb){
		co(
			function *(){
				if(appId){
					var appInfo=yield app_info_service.getAppInfoById(appId);
					if(appInfo){
						var result=yield dao.execSql("select groupId from user where appId=? and status=? and openId=? limit 0,1",[appId,1,openId]);
						if(result && result.length){
							cb(null,result[0]["groupId"]);
						}else{
							var result2=yield getUserFromServer(appInfo, openId);
							yield saveOrUpdateUser(appInfo, result2);
							if(!result2["subscribe"]){
								cb(new Error("未找到关注该公众号且openid为"+openId+"的用户"));
								return;
							}
							if(appInfo.type==='y'){
								cb(null,result2["groupid"]);
								return;
							}else{
								cb(null,result2["tagid_list"].toString());
								return;
							}
							
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
module.exports.removeGroup_wx=function(appId,groupId){
	return function(cb){
		co(
			function *(){
				if(appId){
					var appInfo=yield app_info_service.getAppInfoById(appId);
					if(appInfo){
						if(appInfo.type==='y'){
							cb(new Error("此接口为微信公众号接口，请查看app_info表中公众号配置"));
							return;
						}
						var access_token=yield access_token_service.getAccessToken(appId);
						var url="https://api.weixin.qq.com/cgi-bin/tags/delete?access_token="+access_token;
						var data={
								  "tag":{
								       "id" : groupId
								  }
								};
						var result=yield request.request(url,data);
						if(result && (typeof result==='string')){
							result=JSON.parse(result);
						}
						if(result && result.errcode){
							cb(new Error(result.errmsg));
							return;
						}
						var result2=yield getUserByGroupId(appId, groupId);
						if(result2 && result2.length){
							for(var i in result2){
								yield removeUserGroup(appId, result2[i]["openId"], groupId);
							}
						}
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
			}
		).catch(function(err){
			cb(err);
			return;
		});
	};
}
module.exports.removeUsersFromGroup_wx=function(appId,groupId,openIds){
	return function(cb){
		co(
			function *(){
				if(appId){
					var appInfo=yield app_info_service.getAppInfoById(appId);
					if(appInfo){
						if(appInfo.type==='y'){
							cb(new Error("此接口为微信公众号接口，请查看app_info表中公众号配置"));
							return;
						}
						var access_token=yield access_token_service.getAccessToken(appId);
						var url="https://api.weixin.qq.com/cgi-bin/tags/members/batchuntagging?access_token="+access_token;
						var data={
								  "openid_list":openIds,
								  "tagid" : groupId
								};
						var result=request.request(url,JSON.stringify(data));
						if(result && (typeof result==='string')){
							result=JSON.parse(result);
						}
						if(result && result.errcode){
							cb(new Error(result.errmsg));
							return;
						}
						for(var i in openIds){
							yield removeUserGroup(appId, openIds[i], groupId);
						}
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
			}
		).catch(function(err){
			cb(err);
			return;
		});
	};
}


module.exports.getUserInfo=function(appId,openId){
	return function(cb){
		co(
			function *(){
				if(appId){
					var appInfo=yield app_info_service.getAppInfoById(appId);
					if(appInfo){
						var result=yield findUserLocal(appId, openId);
						if(result){
							cb(null,result);
							return;
						}else{
							var result2=yield getUserFromServer(appInfo, openId);
							if(result2 && result2["subscribe"]){
								saveOrUpdateUser(appInfo, result2);
								cb(null,result2);
								return;
							}
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

function getUserList(appId,nextOpenId){
	return function(cb){
		co(
			function *(){
				if(appId){
					var appInfo=yield app_info_service.getAppInfoById(appId);
					if(appInfo){
						var url;
						var access_token=yield access_token_service.getAccessToken(appId);
						if(appInfo.type==='y'){
							url="https://api.yixin.im/cgi-bin/user/get?access_token="+access_token;
							if(nextOpenId){
								url+="&next_openid="+nextOpenId;
							}
						}else{
							url="https://api.weixin.qq.com/cgi-bin/user/get?access_token="+access_token;
							if(nextOpenId){
								url+="&next_openid="+nextOpenId;
							}
						}
						var result=yield request.get(url);
						if(result && (typeof result==='string')){
							result=JSON.parse(result);
						}
						if(result && result.errcode){
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
			}
		).catch(function(err){
			cb(err);
			return;
		});
	};
}
module.exports.getUserList=getUserList;

module.exports.purviewCreate_yx=function(appId,mobiles,remarks){
	return function(cb){
		co(
			function *(){
				if(appId){
					var appInfo=yield app_info_service.getAppInfoById(appId);
					if(appInfo){
						if(appInfo.type==='y'){
							var access_token=access_token_service.getAccessToken(appId);
							var url="https://api.yixin.im/cgi-bin/follow/purview/create?access_token="+access_token;
							var data={
									   "mobiles": []
									};
							if(mobiles && remarks && mobiles.length && remarks.length){
								for(var i in mobiles){
									data.mobiles.push({
									       "mobile": mobiles[i],
									       "remark": remarks[i]
									   });
								}
								
								var result=request.request(url,JSON.stringify(data));
								if(result && (typeof result==='string')){
									result=JSON.parse(result);
								}
								if(result && result.errcode){
									cb(new Error(result.errmsg));
									return;
								}else if(result && result.err_mobile && result.err_mobile.length){
									cb(new Error(JSON.stringify(result.err_mobile)));
									return;
								}
								cb(null,"success");
								return;
							}else{
								cb(new Error("传入的mobiles数组和remarks数组必须一一对应"));
								return;
							}
							
						}else{
							cb(new Error("此接口为易信公众号接口，请查看app_info表中公众号配置"));
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

module.exports.purviewUpdate_yx=function(appId,mobiles,remarks){
	return function(cb){
		co(
			function *(){
				if(appId){
					var appInfo=yield app_info_service.getAppInfoById(appId);
					if(appInfo){
						if(appInfo.type==='y'){
							var access_token=access_token_service.getAccessToken(appId);
							var url="https://api.yixin.im/cgi-bin/follow/purview/update?access_token="+access_token;
							var data={
									   "mobiles": []
									};
							if(mobiles && remarks && mobiles.length && remarks.length){
								for(var i in mobiles){
									data.mobiles.push({
									       "mobile": mobiles[i],
									       "remark": remarks[i]
									   });
								}
								
								var result=request.request(url,JSON.stringify(data));
								if(result && (typeof result==='string')){
									result=JSON.parse(result);
								}
								if(result && result.errcode){
									cb(new Error(result.errmsg));
									return;
								}else if(result && result.err_mobile && result.err_mobile.length){
									cb(new Error(JSON.stringify(result.err_mobile)));
									return;
								}
								cb(null,"success");
								return;
							}else{
								cb(new Error("传入的mobiles数组和remarks数组必须一一对应"));
								return;
							}
							
						}else{
							cb(new Error("此接口为易信公众号接口，请查看app_info表中公众号配置"));
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


module.exports.purviewRemove_yx=function(appId,mobiles){
	return function(cb){
		co(
			function *(){
				if(appId){
					var appInfo=yield app_info_service.getAppInfoById(appId);
					if(appInfo){
						if(appInfo.type==='y'){
							var access_token=access_token_service.getAccessToken(appId);
							var url="https://api.yixin.im/cgi-bin/follow/purview/delete?access_token="+access_token;
							var data={
									   "mobiles": []
									}
							for(var i in mobiles){
								data.mobiles.push({
								       "mobile": mobiles[i]
								   });
							}
							var result=request.request(url,JSON.stringify(data));
							if(result && (typeof result==='string')){
								result=JSON.parse(result);
							}
							if(result && result.errcode){
								cb(new Error(result.errmsg));
								return;
							}
							cb(null,"success");
							return;
						}else{
							cb(new Error("此接口为易信公众号接口，请查看app_info表中公众号配置"));
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

function getUserByGroupId(appId,groupId){
	return function(cb){
		co(
			function *(){
				var result=yield dao.execSql("select * from user where groupId like ? and appId=? and status=?", ["%"+groupId+"%",appId,1]);
				var arr=[];
				if(result && result.length){
					for(var i in result){
						var tmpArr=(result[i]["groupId"]||"").split(",");
						for(var j in tmpArr){
							if(tmpArr[j]==groupId){
								arr.push(result[i]);
								break;
							}
						}
					
					}
					cb(null,arr);
					return;
				}else{
					cb(null,null);
					return;
				}
				
			}
		).catch(function(err){
			cb(err);
			return;
		});
	}
}

module.exports.getUsersInfo_wx=function(appId,openIds){
	return function(cb){
		co(
			function *(){
				if(appId){
					var appInfo=yield app_info_service.getAppInfoById(appId);
					if(appInfo){
						if(appInfo.type==='y'){
							cb(new Error("此接口为微信公众号接口，请查看app_info表中公众号配置"));
							return;
						}
						var access_token=yield access_token_service.getAccessToken(appId);
						var url="https://api.weixin.qq.com/cgi-bin/user/info/batchget?access_token="+access_token;
						var data={
								   "user_list": []
								          };
						for(var i in openIds){
							data.user_list.push({
						           "openid": openIds[i],
						           "lang": "zh-CN"
						       });
						}
						var result=request.request(url,JSON.stringify(data));
						if(result && (typeof result==='string')){
							result=JSON.parse(result);
						}
						if(result && result.errcode){
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
			}
		).catch(function(err){
			cb(err);
			return;
		});
	};
}


module.exports.checkUserServerLocalSame=function(appId){
	return function(cb){
		co(
			function *(){
				if(appId){
					var appInfo=yield app_info_service.getAppInfoById(appId);
					if(appInfo){
						var result=yield getUserList(appId);
						var sqls=[];
						var params=[];
						var openIds=[];
						if(result && result["count"]){
							openIds=openIds.concat(result["data"]["openid"]);
							while(result["next_openid"]){
								result=yield getUserList(appId,result["next_openid"]);
								if(result["count"]){
									openIds=openIds.concat(result["data"]["openid"]);
								}
							
							}
							for(var i in openIds){
								var user=yield getUserFromServer(appInfo, openIds[i]);
								if(user && user.subscribe){
									var date=new Date();
									date.setTime(user.subscribe_time*1000);
									user.subscribe_time=date;
									if(appInfo.type==='y'){
										sqls.push("insert into user (appId,subscribe,openId,nickName,sex,city,country,province,language,headImgUrl,subscribeTime,unionId,remark,groupId,status) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)");
										params.push([appInfo.id,user.subscribe,user.openid,user.nickname,user.sex,user.city,'','',user.language,'',user.subscribe_time,'',user.remark,user.groupid,2]);
									}else{
										sqls.push("insert into user (appId,subscribe,openId,nickName,sex,city,country,province,language,headImgUrl,subscribeTime,unionId,remark,groupId,status) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)");
										params.push([appInfo.id,user.subscribe,user.openid,user.nickname,user.sex,user.city,user.country,user.province,user.language,user.headimgurl,user.subscribe_time,user.unionid,user.remark,user.tagid_list.toString(),2]);
									}
								}
							}
							sqls.push("update user set status=?,subscribe=? where appId=? and status=?");
							params.push([0,0,appId,1]);
							sqls.push("update user set status=? where appId=? and status=?");
							params.push([1,appId,2]);
//							console.log(sqls);
//							console.log(params);
							yield dao.execSqls(sqls, params);
							cb(null,"success");
							return;
						}else{
							yield dao.execSql("update user set status=?,subscribe=? where appId=? and status=?",[0,0,appId,1]);
							cb(null,"success");
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




function removeGroup(appId,groupId){
	return function(cb){
		co(
			function *(){
				yield dao.execSql("update user_group set status=? where groupId=? and appId=? and status=?", [0,groupId,appId,1]);
				cb(null,"success");
				return;
			}
		).catch(function(err){
			cb(err);
			return;
		});
	}
}


function removeUserGroup(appId,openId,groupId){
	return function(cb){
		co(
			function *(){
				var result=yield findUserLocal(appId, openId);
				if(result){
					var groupIds=result["groupId"];
					var tmpGroupIds=[];
					if(groupIds){
						var arr=groupIds.split(",");
						for(var i in arr){
							if(arr[i]!==groupId){
								tmpGroupIds.push(arr[i]);
							}
						}
					}
					yield dao.execSql("update user set groupId=? where appId=? and openId=? and status=?",[tmpGroupIds.toString(),appId,openId,1]);
					cb(null,"success");
					return;
				}else{
					cb(new Error("找不到openid为"+openId+"的用户"));
					return;
				}
			}
		).catch(function(err){
			cb(err);
			return;
		});
	}
}

function addUserGroup(appId,openId,groupId){
	return function(cb){
		co(
			function *(){
				var result=yield findUserLocal(appId, openId);
				if(result){
					var groupIds=result["groupId"];
					if(groupIds){
						groupId=groupId+","+groupIds;
					}
					yield dao.execSql("update user set groupId=? where appId=? and openId=? and status=?",[groupId,appId,openId,1]);
					cb(null,"success");
					return;
				}else{
					cb(new Error("找不到openid为"+openId+"的用户"));
					return;
				}
			}
		).catch(function(err){
			cb(err);
			return;
		});
	}
}


function saveOrUpdateUser(appInfo,user){
	return function(cb){
		co(
				function *(){
					if(user.subscribe){
						var date=new Date();
						date.setTime(user.subscribe_time*1000);
						user.subscribe_time=date;
						var localUser=yield findUserLocal(appInfo.id, user.openid);
						if(localUser){
							yield removeUser(appInfo.id, user.openid);
						}
						if(appInfo.type==='y'){
							yield dao.execSql("insert into user (appId,subscribe,openId,nickName,sex,city,country,province,language,headImgUrl,subscribeTime,unionId,remark,groupId,status) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",[appInfo.id,user.subscribe,user.openid,user.nickname,user.sex,user.city,'','',user.language,'',user.subscribe_time,'',user.remark,user.groupid,1]);
							cb(null,"success");
							return;
						}else{
							yield dao.execSql("insert into user (appId,subscribe,openId,nickName,sex,city,country,province,language,headImgUrl,subscribeTime,unionId,remark,groupId,status) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",[appInfo.id,user.subscribe,user.openid,user.nickname,user.sex,user.city,user.country,user.province,user.language,user.headimgurl,user.subscribe_time,user.unionid,user.remark,user.tagid_list.toString(),1]);
							cb(null,"success");
							return;
						}
					}else{
						yield removeUser(appInfo.id, user.openid);
						cb(null,"success");
						return;
					}
					
					
				}
		).catch(function(err){
			cb(err);
			return;
		});
	};
}

function removeUser(appId,openId){
	return function(cb){
		co(
				function *(){
					yield dao.execSql("update user set subscribe=?,status=? where appId=? and openId=? and status=?",[0,0,appId,openId,1]);
					cb(null,"success");
					return;
				}
		).catch(function(err){
			cb(err);
			return;
		});
	}
}


function getUserFromServer(appInfo,openId){
	return function(cb){
		co(
			function *(){
				var url;
				var access_token=yield access_token_service.getAccessToken(appInfo.id)
				if(appInfo.type==='y'){
					url="https://api.yixin.im/cgi-bin/user/info?access_token="+access_token+"&openid="+openId;
				}else{
					url="https://api.weixin.qq.com/cgi-bin/user/info?access_token="+access_token+"&openid="+openId+"&lang=zh_CN";
				}
				var result=yield request.get(url);
				if(result && (typeof result==='string')){
					result=JSON.parse(result);
				}
				if(result && result.errcode){
					cb(new Error(result.errmsg));
					return;
				}
				cb(null,result);
				return;
			}
		).catch(function(err){
			cb(err);
			return;
		});
	};
}
function findUserLocal(appId,openId){
	return function(cb){
		co(
				function *(){
					var result=dao.execSql("select * from user where appId=? and status=? and openId=? limit 0,1",[appId,1,openId]);
					if(result && result.length){
						cb(null,result[0]);
						return;
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

function updateGroup(appId,groupId,name){
	return function(cb){
		co(
			function *(){
				var result=yield dao.execSql("update user_group set name=? where appId=? and groupId=? and status=?", [name,appId,groupId,1]);
				cb(null,"success");
				return;
			}
		).catch(function(err){
			cb(err);
			return;
		});
	}
}

function getGroupsFromServer(appId){
	return function(cb){
		co(
			function *(){
				if(appId){
					var appInfo=yield app_info_service.getAppInfoById(appId);
					if(appInfo){
						var url;
						var access_token=yield access_token_service.getAccessToken(appId);
						if(appInfo.type==='y'){
							url="https://api.yixin.im/cgi-bin/groups/get?access_token="+access_token;
						}else{
							url="https://api.weixin.qq.com/cgi-bin/tags/get?access_token="+access_token;
						}
						var result=yield request.get(url);
						if(result && (typeof result==='string')){
							result=JSON.parse(result);
						}
						if(result && result.errcode){
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
			}
		).catch(function(err){
			cb(err);
			return;
		});
	};
}
function getGroupsLocal(appId){
	return function(cb){
		co(
			function *(){
				if(appId){
					var appInfo=yield app_info_service.getAppInfoById(appId);
					if(appInfo){
						var result=yield dao.execSql("select groupId,name from user_group where appId=? and status=?", [appId,1]);
						if(result && result.length){
							cb(null,result);
							return;
						}
						cb(null,null);
						return;
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


function saveGroup(appId,groupId,name,count){
	return function(cb){
		co(
			function *(){
				count=count||0;
				yield dao.execSql("insert into user_group (appId,groupId,name,createTime,count,status)  values (?,?,now(),?)", [appId,groupId,name,count,1]);
				cb(null,"success");
				return;
			}
		).catch(function(err){
			cb(err);
			return;
		});
	}
}
