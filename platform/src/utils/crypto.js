var crypto = require('crypto');
module.exports.sha1=function(data){
	return crypto.createHash('sha1').update(data, 'utf8').digest('hex');
};