var crypto = require('../utils/crypto');
module.exports.checkSignature=function (type,token,timestamp,nonce,signature){
	return function(cb){
		if(timestamp && nonce && signature && token){
			var arr=[];
			arr.push(token);
			arr.push(timestamp);
			arr.push(nonce);
			if(crypto.sha1(arr.sort().join(''))===signature){
				cb(null,true);
				return;
			}else{
				cb(null,false);
				return;
			}
		}else{
			cb(new Error("lack verification parameters"));
			return;
		}
		
	}
};

