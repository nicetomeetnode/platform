var app_info_service=require("./app_info_service.js");
var access_token_service=require("./access_token_service.js");
var string_util=require("../utils/string_util.js");
var request=require("../utils/request.js");
var co=require("co");
module.exports.text=function(appId,touser,content){
	return function(cb){
		co(
			function *(){
				if(string_util.isEmpty(touser)|| string_util.isEmpty(content) || string_util.isEmpty(appId)){
					cb(new Error("appId or touser or content is null"));
					return;
				}
				var appInfo=yield app_info_service.getAppInfoById(appId);
				if(appInfo){
					var url;
					var access_token=yield access_token_service.getAccessToken(appInfo.id);
					if(appInfo.type==='y'){
						url="https://api.yixin.im/cgi-bin/message/custom/send?access_token="+access_token;
					}else{
						url="https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token="+access_token;
					}
					var data=JSON.stringify({
						    "touser":touser,
						    "msgtype":"text",
						    "text":
						    {
						         "content":content
						    }
						});
					var result=yield request.request(url,data);
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
					cb(new Error("找不到id为："+appId+" 的公众号"));
					return;
				}
			}
		).catch(function(err){
			cb(err);
			return;
		});
	}
};
module.exports.image=function(appId,touser,media_id){
	return function(cb){
		co(
			function *(){
				if(string_util.isEmpty(touser) || string_util.isEmpty(media_id) || string_util.isEmpty(appId)){
					cb(new Error("appId or touser or media_id is null"));
					return;
				}
					var appInfo=yield app_info_service.getAppInfoById(appId);
					if(appInfo){
						var url;
						var access_token=yield access_token_service.getAccessToken(appInfo.id);
						if(appInfo.type==='y'){
							url="https://api.yixin.im/cgi-bin/message/custom/send?access_token="+access_token;
						}else{
							url="https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token="+access_token;
						}
						var data=JSON.stringify({
						    "touser":touser,
						    "msgtype":"image",
						    "image":
						    {
						      "media_id":media_id
						    }
						});
						var result=yield request.request(url,data);
						
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
						cb(new Error("找不到id为："+appId+" 的公众号"));
						return;
					}
			}
		).catch(function(err){
			cb(err);
			return;
		});
	}
};
module.exports.voice=function(appId,touser,media_id){
	return function(cb){
		co(
			function *(){
				if(string_util.isEmpty(touser) || string_util.isEmpty(media_id) || string_util.isEmpty(appId)){
					cb(new Error("appId or touser or media_id is null"));
					return;
				}
				var appInfo=yield app_info_service.getAppInfoById(appId);
				if(appInfo){
					var url;
					var access_token=yield access_token_service.getAccessToken(appInfo.id);
					if(appInfo.type==='y'){
						url="https://api.yixin.im/cgi-bin/message/custom/send?access_token="+access_token;
					}else{
						url="https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token="+access_token;
					}
					var data=JSON.stringify({
						   "touser": touser, 
						   "msgtype": "voice", 
						   "voice": {
						   "media_id":media_id
						   }
						});
					var result=yield request.request(url,data);
					
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
					cb(new Error("找不到id为："+appId+" 的公众号"));
					return;
				}
			}
		).catch(function(err){
			cb(err);
			return;
		});
	}
};
module.exports.video_yx=function(appId,touser,media_id){
	return function(cb){
		co(
			function *(){
				if(string_util.isEmpty(touser) || string_util.isEmpty(media_id) || string_util.isEmpty(appId)){
					cb(new Error("appId or touser or media_id is null"));
					return;
				}
				var appInfo=yield app_info_service.getAppInfoById(appId);
				if(appInfo){
					var url;
					var data;
					var access_token=yield access_token_service.getAccessToken(appInfo.id);
					if(appInfo.type==='y'){
						url="https://api.yixin.im/cgi-bin/message/custom/send?access_token="+access_token;
						data=JSON.stringify({
							   "touser": touser, 
							   "msgtype": "voice", 
							   "voice": {
							   "media_id": media_id
							   }
							});
					}else{
						cb(new Error("该appId:"+appId+"所对应的公众号不为易信公众号"));
						return;
					}
					
					var result=yield request.request(url,data);
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
					cb(new Error("找不到id为："+appId+" 的公众号"));
					return;
				}
			}
		).catch(function(err){
			cb(err);
			return;
		});
	}
};
module.exports.video_wx=function(appId,touser,media_id,thumb_media_id,title,description){
	return function(cb){
		co(
			function *(){
				if(string_util.isEmpty(touser) || string_util.isEmpty(media_id) || string_util.isEmpty(appId) || string_util.isEmpty(thumb_media_id) ){
					cb(new Error("appId or touser or media_id or thumb_media_id  is null"));
					return;
				}
				var appInfo=yield app_info_service.getAppInfoById(appId);
				if(appInfo){
					var url;
					var data;
					var access_token=yield access_token_service.getAccessToken(appInfo.id);
					if(appInfo.type==='w'){
						url="https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token="+access_token;
						data=JSON.stringify({
						    "touser":touser,
						    "msgtype":"video",
						    "video":
						    {
						      "media_id":media_id,
						      "thumb_media_id":thumb_media_id,
						      "title":title||"",
						      "description":description||""
						    }
						});
					}else{
						cb(new Error("该appId:"+appId+"所对应的公众号不为微信公众号"));
						return;
					}
					
					var result=yield request.request(url,data);
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
					cb(new Error("找不到id为："+appId+" 的公众号"));
					return;
				}
			}
		).catch(function(err){
			cb(err);
			return;
		});
	}
};
module.exports.link_yx=function(appId,touser,title,url){
	return function(cb){
		co(
			function *(){
				if(string_util.isEmpty(touser)  || string_util.isEmpty(appId)|| string_util.isEmpty(title) || string_util.isEmpty(url)){
					cb(new Error("appId or touser or url or title is null"));
					return;
				}
				var appInfo=yield app_info_service.getAppInfoById(appId);
				if(appInfo){
					var url;
					var access_token=yield access_token_service.getAccessToken(appInfo.id);
					if(appInfo.type==='y'){
						url="https://api.yixin.im/cgi-bin/message/custom/send?access_token="+access_token;
					}else{
						cb(new Error("该appId:"+appId+"所对应的公众号不为易信公众号"));
						return;
					}
					var data=JSON.stringify({
						   "touser": touser, 
						   "msgtype": "link", 
						   "link": {
						   "title": title, 
						   "url": url
						   }
						});
					var result=yield request.request(url,data);
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
					cb(new Error("找不到id为："+appId+" 的公众号"));
					return;
				}
			}
		).catch(function(err){
			cb(err);
			return;
		});
	}
};
module.exports.news=function(appId,touser,articles){
	return function(cb){
		co(
			function *(){
				if(string_util.isEmpty(touser) || string_util.isEmpty(articles) || string_util.isEmpty(appId)){
					cb(new Error("appId or touser or articles is null"));
					return;
				}
				if(yield checkArticles(articles)){
					
				}else{
					cb(new Error("articles格式不满足要求"));
					return;
				}
				var appInfo=yield app_info_service.getAppInfoById(appId);
				if(appInfo){
					var url;
					var access_token=yield access_token_service.getAccessToken(appInfo.id);
					if(appInfo.type==='y'){
						//易信多图文的title,description为必须字段，因此在此检查该字段
						for(var i in articles){
							if(string_util.isEmpty(articles[i]["title"]) || string_util.isEmpty(articles[i]["description"])){
								cb(new Error("article格式不满足要求,title或description字段为空"));
								return;
							}
						}
						url="https://api.yixin.im/cgi-bin/message/custom/send?access_token="+access_token;
					}else{
						url="https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token="+access_token;
					}
					var data=JSON.stringify({
						   "touser": touser, 
						   "msgtype": "news", 
						   "news": {
						   "articles": articles
						   }
						});
					var result=yield request.request(url,data);
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
					cb(new Error("找不到id为："+appId+" 的公众号"));
					return;
				}
			}
		).catch(function(err){
			cb(err);
			return;
		});
	}
};

function checkArticles(articles){
	return function(cb){
		if(Array.isArray(articles)){
			if(articles.length){
				for(var i in articles){
					if(!articles[i]){
						cb(null,false);
						return;
					}
				}
				cb(null,true);
				return;
			}else{
				cb(new Error("articles的长度为0"));
				return;
			}
		}else{
			cb(new Error("articles 必须是一个数组"));
			return;
		}
	}
}
/////////////////////////////////////////////以下为群发接口(易信)////////////////////////////////////////////////////////////
module.exports.massText_yx=function(appId,content,groupName){
	return function(cb){
		co(
			function *(){
				var appInfo=yield app_info_service.getAppInfoById(appId);
				if(appInfo){
					var url;
					var access_token=yield access_token_service.getAccessToken(appInfo.id);
					if(appInfo.type==='y'){
						url="https://api.yixin.im/cgi-bin/message/group/send?access_token="+access_token;
					}else{
						cb(new Error("该appId:"+appId+"所对应的公众号不为易信公众号"));
						return;
					}
					var data;
					if(groupName){
						data=JSON.stringify({
							   "group": groupName,
							   "msgtype": "text", 
							   "text": {
							       "content": content
							   }
							});
					}else{
						data=JSON.stringify({
							   "msgtype": "text", 
							   "text": {
							       "content": content
							   }
							});
					}
					
					var result=yield request.request(url,data);
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
					cb(new Error("找不到id为："+appId+" 的公众号"));
					return;
				}
			}
		).catch(function(err){
			cb(err);
			return;
		});
	};
};
module.exports.massNews_yx=function(appId,articles,groupName){
	return function(cb){
		co(
			function *(){
				if(!Array.isArray(articles)||articles.length==0){
					cb(new Error("articles 不符合要求"));
					return;
				}
				var appInfo=yield app_info_service.getAppInfoById(appId);
				
				if(appInfo){
					var url;
					var access_token=yield access_token_service.getAccessToken(appInfo.id);
					if(appInfo.type==='y'){
						url="https://api.yixin.im/cgi-bin/message/group/send?access_token="+access_token;
					}else{
						cb(new Error("该appId:"+appId+"所对应的公众号不为易信公众号"));
						return;
					}
					var data;
					if(groupName){
						data=JSON.stringify({
							   "group": groupName,
							   "msgtype": "news", 
							   "news": {
							       "articles": articles
							   }
							});
					}else{
						data=JSON.stringify({
							   "msgtype": "news", 
							   "news": {
							       "articles": articles
							   }
							});
					}
					
					var result=yield request.request(url,data);
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
					cb(new Error("找不到id为："+appId+" 的公众号"));
					return;
				}
			}
		).catch(function(err){
			cb(err);
			return;
		});
	};
};
module.exports.massOthers_yx=function(appId,type,materialId,groupName){
	return function(cb){
		co(
			function *(){
				var appInfo=yield app_info_service.getAppInfoById(appId);
				if(appInfo){
					var url;
					var access_token=yield access_token_service.getAccessToken(appInfo.id);
					if(appInfo.type==='y'){
						url="https://api.yixin.im/cgi-bin/message/group/send?access_token="+access_token;
					}else{
						cb(new Error("该appId:"+appId+"所对应的公众号不为易信公众号"));
						return;
					}
					var data;
					if(groupName){
						data={
								"group": groupName,
								"msgtype":type,
								
								};
						data[type]={
						      "material_id":materialId
					       };
						data=JSON.stringify(data);
					}else{
						data={
								"msgtype":type,
								};
						data[type]={
							      "material_id":materialId
					       }
						data=JSON.stringify(data);
					}
					var result=yield request.request(url,data);
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
					cb(new Error("找不到id为："+appId+" 的公众号"));
					return;
				}
			}
		).catch(function(err){
			cb(err);
			return;
		});
	};
};
/////////////////////////////////////////////以下为群发接口(微信)根据标签进行群发////////////////////////////////////////////////////////////
module.exports.mass_wx=function(obj){
	return function(cb){
		co(
			function *(){
				if(!obj){
					cb(new Error("传入的obj对象为空"));
					return;
				}
				var appId=obj["appId"];
				var type=obj["type"];
				var idOrText=obj["idOrText"];
				var title=obj["title"];
				var description=obj["description"];
				var isToAll=obj["isToAll"];
				var tagId=obj["tagId"];
				var appInfo=yield app_info_service.getAppInfoById(appId);
				if(appInfo){
					var url;
					var access_token=yield access_token_service.getAccessToken(appInfo.id);
					if(appInfo.type==='y'){
						cb(new Error("该appId:"+appId+"所对应的公众号不为微信公众号"));
						return;
						
					}else{
						url="https://api.weixin.qq.com/cgi-bin/message/mass/sendall?access_token="+access_token;
					}
					var data={};
					if(isToAll){
						data["filter"]={
							      "is_to_all":true
							   };
					}else{
						if(!tagId){
							cb(new Error("tagId在isToAll为false时不能为null"));
							return;
						}
						data["filter"]={
							      "is_to_all":false,
							      "tag_id":tagId
							   };
					}
					switch(type){
					case "wxcard":
						data["wxcard"]={"card_id":idOrText};
						data["msgtype"]="wxcard";
						break;
					case "text":
						data["text"]={
									      "content":idOrText
									   };
						data["msgtype"]="text";
						break;
					case "mpnews":
						data["mpnews"]={
						      "media_id":idOrText
						   };
						data["msgtype"]="mpnews";
						break;
					case "voice":
						data["voice"]={
							      "media_id":idOrText
						   };
						data["msgtype"]="voice";
						break;
					case "image":
						data["image"]={
							      "media_id":idOrText
						   };
						data["msgtype"]="image";
						break;
					case "video": 
						var result2=yield request.request("https://file.api.weixin.qq.com/cgi-bin/media/uploadvideo?access_token="+access_token, JSON.stringify({
							  "media_id": idOrText,
							  "title": title,
							  "description": description
							}));
						if(result2 && (typeof result2==='string')){
							result2=JSON.parse(result2);
						}
						if(result2 && result2.errcode){
							cb(new Error(result2.errmsg));
							return;
						}
						data["msgtype"]="mpvideo";
						data["mpvideo"]={
						      "media_id":result2["media_id"]
						   };
						break;
					default:
						cb(new Error("群发消息的类型未知，为"+type));
						return;
						
					}
					var result=yield request.request(url,JSON.stringify(data));
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
			}
		).catch(function(err){
			cb(err);
			return;
		});
	};
};
/////////////////////////////////////////////以下为群发接口(微信)根据OpenID列表群发////////////////////////////////////////////////////////////
module.exports.mass2_wx=function(obj){
	return function(cb){
		co(
			function *(){
				if(!obj){
					cb(new Error("传入的obj对象为空"));
					return;
				}
				var appId=obj["appId"];
				var type=obj["type"];
				var idOrText=obj["idOrText"];
				var title=obj["title"];
				var description=obj["description"];
				var touser=obj["touser"];
				if(!touser || !Array.isArray(touser) || !(touser.length>0)){
					cb(new Error("请传入正确的touser"));
					return;
				}
				var appInfo=yield app_info_service.getAppInfoById(appId);
				if(appInfo){
					var url;
					var access_token=yield access_token_service.getAccessToken(appInfo.id);
					if(appInfo.type==='y'){
						cb(new Error("该appId:"+appId+"所对应的公众号不为微信公众号"));
						return;
						
					}else{
						url="https://api.weixin.qq.com/cgi-bin/message/mass/send?access_token="+access_token;
					}
					var data={};
					data["touser"]=touser;
					switch(type){
					case "wxcard":
						data["wxcard"]={"card_id":idOrText};
						data["msgtype"]="wxcard";
						break;
					case "text":
						data["text"]={
									      "content":idOrText
									   };
						data["msgtype"]="text";
						break;
					case "mpnews":
						data["mpnews"]={
						      "media_id":idOrText
						   };
						data["msgtype"]="mpnews";
						break;
					case "voice":
						data["voice"]={
							      "media_id":idOrText
						   };
						data["msgtype"]="voice";
						break;
					case "image":
						data["image"]={
							      "media_id":idOrText
						   };
						data["msgtype"]="image";
						break;
					case "video": 
						var result2=yield request.request("https://api.weixin.qq.com/cgi-bin/media/uploadvideo?access_token="+access_token, JSON.stringify({
							  "media_id": idOrText,
							  "title": title,
							  "description": description
							}));
						if(result2 && (typeof result2==='string')){
							result2=JSON.parse(result2);
						}
						if(result2 && result2.errcode){
							cb(new Error(result2.errmsg));
							return;
						}
						data["msgtype"]="mpvideo";
						data["mpvideo"]={
						      "media_id":result2["media_id"]
						   };
						break;
					default:
						cb(new Error("群发消息的类型未知，为"+type));
						return;
						
					}
					var result=yield request.request(url,JSON.stringify(data));
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
			}
		).catch(function(err){
			cb(err);
			return;
		});
	};
};

//删除群发
module.exports.remove_mass_wx=function(appId,msgId){
	return function(cb){
		co(
			function *(){
				if(!msgId){
					cb(new Error("msgId 为空"));
					return;
				}
				var appInfo=yield app_info_service.getAppInfoById(appId);
				if(appInfo){
					var url;
					var access_token=yield access_token_service.getAccessToken(appInfo.id);
					if(appInfo.type==='y'){
						cb(new Error("该appId:"+appId+"所对应的公众号不为微信公众号"));
						return;
						
					}else{
						url="https://api.weixin.qq.com/cgi-bin/message/mass/delete?access_token="+access_token;
					}
					var data={
							   "msg_id":msgId
					};
					var result=yield request.request(url,JSON.stringify(data));
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
					cb(new Error("找不到id为："+appId+" 的公众号"));
					return;
				}
			}
		).catch(function(err){
			cb(err);
			return;
		});
	};
};	
//预览接口
module.exports.preview_mass_wx=function(obj){
	return function(cb){
		co(
			function *(){
				if(!obj){
					cb(new Error("传入的obj对象为空"));
					return;
				}
				var appId=obj["appId"];
				var type=obj["type"];
				var idOrText=obj["idOrText"];
				var title=obj["title"];
				var description=obj["description"];
				var touser=obj["touser"];
				if(!touser){
					cb(new Error("请传入正确的touser"));
					return;
				}
				var appInfo=yield app_info_service.getAppInfoById(appId);
				if(appInfo){
					var url;
					var access_token=yield access_token_service.getAccessToken(appInfo.id);
					if(appInfo.type==='y'){
						cb(new Error("该appId:"+appId+"所对应的公众号不为微信公众号"));
						return;
						
					}else{
						url="https://api.weixin.qq.com/cgi-bin/message/mass/preview?access_token="+access_token;
					}
					var data={};
					data["touser"]=touser;
					switch(type){
					case "wxcard":
						data["wxcard"]={"card_id":idOrText};
						data["msgtype"]="wxcard";
						break;
					case "text":
						data["text"]={
									      "content":idOrText
									   };
						data["msgtype"]="text";
						break;
					case "mpnews":
						data["mpnews"]={
						      "media_id":idOrText
						   };
						data["msgtype"]="mpnews";
						break;
					case "voice":
						data["voice"]={
							      "media_id":idOrText
						   };
						data["msgtype"]="voice";
						break;
					case "image":
						data["image"]={
							      "media_id":idOrText
						   };
						data["msgtype"]="image";
						break;
					case "video": 
						var result2=yield request.request("https://api.weixin.qq.com/cgi-bin/media/uploadvideo?access_token="+access_token, JSON.stringify({
							  "media_id": idOrText,
							  "title": title,
							  "description": description
							}));
						if(result2 && (typeof result2==='string')){
							result2=JSON.parse(result2);
						}
						if(result2 && result2.errcode){
							cb(new Error(result2.errmsg));
							return;
						}
						data["msgtype"]="mpvideo";
						data["mpvideo"]={
						      "media_id":result2["media_id"]
						   };
						break;
					default:
						cb(new Error("群发消息的类型未知，为"+type));
						return;
						
					}
					var result=yield request.request(url,JSON.stringify(data));
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
			}
		).catch(function(err){
			cb(err);
			return;
		});
	};
};	
//查询群发消息发送状态
module.exports.status_mass_wx=function(appId,msgId){
	return function(cb){
		co(
			function *(){
				if(!msgId){
					cb(new Error("msgId 为空"));
					return;
				}
				var appInfo=yield app_info_service.getAppInfoById(appId);
				if(appInfo){
					var url;
					var access_token=yield access_token_service.getAccessToken(appInfo.id);
					if(appInfo.type==='y'){
						cb(new Error("该appId:"+appId+"所对应的公众号不为微信公众号"));
						return;
						
					}else{
						url="https://api.weixin.qq.com/cgi-bin/message/mass/get?access_token="+access_token;
					}
					var data={
							   "msg_id":msgId
					};
					var result=yield request.request(url,JSON.stringify(data));
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
			}
		).catch(function(err){
			cb(err);
			return;
		});
	};
};	
//事件推送群发结果
/**
由于群发任务提交后，群发任务可能在一定时间后才完成，因此，群发接口调用时，仅会给出群发任务是否提交成功的提示，若群发任务提交成功，则在群发任务结束时，会向开发者在公众平台填写的开发者URL（callback URL）推送事件。

 * 需要注意，由于群发任务彻底完成需要较长时间，将会在群发任务即将完成的时候，就推送群发结果，此时的推送人数数据将会与实际情形存在一定误差

		推送的XML结构如下（发送成功时）：
		
		<xml>
		<ToUserName><![CDATA[gh_3e8adccde292]]></ToUserName>
		<FromUserName><![CDATA[oR5Gjjl_eiZoUpGozMo7dbBJ362A]]></FromUserName>
		<CreateTime>1394524295</CreateTime>
		<MsgType><![CDATA[event]]></MsgType>
		<Event><![CDATA[MASSSENDJOBFINISH]]></Event>
		<MsgID>1988</MsgID>
		<Status><![CDATA[sendsuccess]]></Status>
		<TotalCount>100</TotalCount>
		<FilterCount>80</FilterCount>
		<SentCount>75</SentCount>
		<ErrorCount>5</ErrorCount>
		</xml>
 */
//此接口建议在自行定义的消息处理类中处理该事件
//此接口还未具体实现，只是打印了参数内容。

module.exports.result_mass_wx=function(appId,msgId,status,totalCount,filterCount,sentCount,errorCount){
	return function(cb){
		co(
			function *(){
				var appInfo=yield app_info_service.getAppInfoById(appId);
				if(appInfo){
					console.log("appId:",appId,"msgId:",msgId,"status:",status,"totalCount:",totalCount,"filterCount:",filterCount,"sentCount:",sentCount,"errorCount",errorCount);
					cb(null,"success");
					return;
				}else{
					cb(new Error("找不到id为："+appId+" 的公众号"));
					return;
				}
			}
		).catch(function(err){
			cb(err);
			return;
		});
	};
};	
