var co=require("co");
var dao=require("../dao/dao_mysql.js");
var path=require("path");
module.exports.handle=function(appInfo,getParams,postParams){
	return function(cb){
		co(
			function *(){
				var result=yield dao.execSql("select handleFilePath,handleMethod from handle_message_event where status=? and appId=? limit 0,1",[1,appInfo.id]);
				if(result && result.length){
					//存在自定义的解决类和方法
					var handleFilePath=result[0]["handleFilePath"];
					var handleMethod=result[0]["handleMethod"];
					if(handleFilePath && handleMethod){
						handleFilePath=path.join(__dirname,"..","..",handleFilePath);
						var handleClassModule=require(handleFilePath);
						cb(null,null);
						yield filter([appInfo,getParams,postParams],handleClassModule[handleMethod]);
						return;
					}else{
						//不存在自定义的解决类和方法
						cb(new Error("未找到自定义的解决方法"));
						return;
					}
				}else{
					//不存在自定义的解决类和方法
					cb(new Error("未找到自定义的解决方法"));
					return;
				}
			}
		).catch(function(err){
			cb(err);
			return;
		});
	};
};
module.exports._handle=function(_this){
	return function(cb){
		co(
			function *(){
				var result=yield dao.execSql("select handleFilePath,handleMethod from handle_message_event where status=? and appId=? limit 0,1",[1,_this.appInfo.id]);
				if(result && result.length){
					//存在自定义的解决类和方法
					var handleFilePath=result[0]["handleFilePath"];
					var handleMethod=result[0]["handleMethod"];
					if(handleFilePath && handleMethod){
						handleFilePath=path.join(__dirname,"..","..",handleFilePath);
						var handleClassModule=require(handleFilePath);
						cb(null,null);
						yield filter(_this,handleClassModule[handleMethod]);
						return;
					}else{
						//不存在自定义的解决类和方法
						cb(new Error("未找到自定义的解决方法"));
						return;
					}
				}else{
					//不存在自定义的解决类和方法
					cb(new Error("未找到自定义的解决方法"));
					return;
				}
			}
		).catch(function(err){
			cb(err);
			return;
		});
	};
};

function filter(){
	var callParams=arguments ? Array.prototype.slice.call(arguments):[];
	var filterFun=callParams.pop();
	if(typeof filterFun !=='function'){
		return new Promise(function(resolve,reject){
			resolve();
		});
	}
	return new Promise(function(resolve,reject){
		callParams.push(function(){resolve(arguments);});
		filterFun.apply(this,callParams);
	})
}