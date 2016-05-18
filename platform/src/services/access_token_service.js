var request=require("../utils/request.js");
var co=require("co");
var dao=require("../dao/dao_mysql.js");
var app_info_service=require("./app_info_service.js");
function getAccessTokenFromServer(id){
	return function(cb){
		co(
				function *(){
					var result=yield app_info_service.getAppInfoById(id);
					if(!result){
						cb(new Error("平台未配置该公众号或者配置出错"));
						return;
					}
					var appSecret=result["appSecret"];
					var appId=result["appId"];
					var type=result["type"];
					var url;
					if(type==="y"){
						url="https://api.yixin.im/cgi-bin/token?grant_type=client_credential&appid="+appId+"&secret="+appSecret;
					}else{
						url="https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid="+appId+"&secret="+appSecret;
					}
					var result2=yield request.get(url);
					if(result2 && (typeof result2==='string')){
						result2=JSON.parse(result2);
					}
					if(result2 && result2.errcode){
						cb(new Error(result2.errmsg));
						return;
					}
					cb(null,result2);
					return;
				}
		).catch(function(err){
			cb(err);
			return;
		});
		
	}
}

function saveAccessToken(id,access_token,expires_in){
	return function(cb){
		co(
				function *(){
					var sql1 = "update access_token set status=0 where status=? and appId=?";
					var sql2 = "insert into access_token (appId,accessToken,expiresIn,createTime,status) values (?,?,?,?,?)";
					yield dao.execSqls([sql1,sql2],[["1",id],[id,access_token,expires_in,new Date(),"1"]]);
					cb(null,"success");
					return;
				}
			).catch(function(err){
				cb(err);
				return;
			});
	}
	
	
}

module.exports.getAccessToken=function(id){
	return function(cb){
		co(
			function *(){
				var sql="select accessToken from access_token where status=? and UNIX_TIMESTAMP(now())-UNIX_TIMESTAMP(createTime)<expiresIn and appId=?  limit 0,1";
				var results=yield dao.execSql(sql,[1,id]);
				if(results && results.length){
					cb(null,results[0]["accessToken"]);
					return;
				}else{
					var accessToken=yield getAccessTokenFromServer(id);
					//比服务器规定的有效时间提早十分钟更新，所以tmpO["expires_in"]-60*10
					yield saveAccessToken(id,accessToken["access_token"],accessToken["expires_in"]-60*10);
					cb(null,accessToken["access_token"]);
					return;
				}
			}	
		).catch(function(err){
			cb(err);
			return;
		});
		
	}
}
