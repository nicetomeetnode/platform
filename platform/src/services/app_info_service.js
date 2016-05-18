var dao=require("../dao/dao_mysql.js");
var co=require("co");
module.exports.getAppInfoById=function(id){
	return function(cb){
		co(
				function *(){
					var result=yield dao.execSql("select * from app_info where id=? and status=? limit 0,1",[id,1]);
					if(result && result.length){
						cb(null,result[0]);
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
};

module.exports.appExist=function(id){
	return function(cb){
		co(
				function *(){
					var result=yield dao.execSql("select id from app_info where id=? and status=? limit 0,1",[id,1]);
					if(result && result.length){
						cb(null,true);
						return;
					}else{
						cb(null,false);
						return;
					}
				}
			).catch(function(err){
				cb(err);
				return;
			});
	}
};