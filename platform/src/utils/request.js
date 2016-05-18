var request = require('request');
var fs = require('fs');
var xml2js = require('xml2js');

module.exports = {
	raw : request,
	/**
	 * For normal requests
	 * 
	 * @param url
	 */
	get : function(url) {
		return function(cb) {
			request.get({
				url : url,
			}, function(error, response, body) {
				if (!error && response.statusCode === 200) {
					cb(null, body);
					return;
				} else {
					cb(error);
					return;
				}
			});
			
			
		};
	},

	/**
	 * For normal requests
	 * 
	 * @param url
	 * @param data
	 */
	request :function(url, data){
		return function(cb){
			request.post({
				url : url,
				json : true,
				form : data
			}, function(error, response, body) {
				if (!error && response.statusCode === 200) {
					cb(null, body);
					return;
				} else {
					cb(error);
					return;
				}
			});
		};
	},
		
		

	/**
	 * For json data posting
	 * 
	 * @param url
	 * @param data
	 */
	json :function(url,data){
		return function(cb){
			request.post({
				url : url,
				body : data,
				json : true
			}, function(error, response, body) {
				if (!error && response.statusCode === 200) {
					cb(null, body);
					return;
				} else {
					cb(error);
					return;
				}
			});
		};
	},
		
		

	/**
	 * For xml data posting
	 * 
	 * @param url
	 * @param data
	 */
	xml :function(url,xml){
		return function(cb){
			request.post({
				url : url,
				body : xml,
				headers : {
					'Content-Type' : 'text/xml'
				}
			}, function(error, response, body) {
				if (!error && response.statusCode === 200) {
					xml2js.parseString(body, {
						explicitArray : false,
						ignoreAttrs : true
					}, function(error, json) {
						if (error) {
							cb(error);
							return;
						}else{
							cb(null, json.xml);
							return;
						}
						
					});
				} else {
					cb(error);
					return;
				}
			});
		};
	}, 
		

	/**
	 * For xml data posting with ssl
	 * 
	 * @param url
	 * @param xml
	 * @param ssl
	 * 			//ssl format 1
				var ssl = {
				  pfx: new Buffer('p12文件二进制数据'),
				  pfxKey: 'sodosodf'
				};
				
				//ssl format 2
				var ssl = {
				  pfx: 'p12文件的base64',
				  pfxKey: 'sodosodf'
				};
	 * 
	 */
	xmlssl :function(url, xml, ssl){
		return function(cb){

			var options = {
				securityOptions : 'SSL_OP_NO_SSLv3'
			};
			if (ssl.pfx && ssl.pfxKey) {
				if (typeof ssl.pfx === 'string') {
					options.pfx = new Buffer(ssl.pfx, 'base64');
				} else {
					options.pfx = ssl.pfx;
				}
				options.passphrase = ssl.pfxKey;
			} else {
				options.pfx = fs.readFileSync(ssl.pfx || ssl.pkcs12);
				options.passphrase = ssl.key;
			}
			request.post({
				url : url,
				body : xml,
				headers : {
					'Content-Type' : 'text/xml'
				},
				agentOptions : options
			}, function(error, response, body) {
				if (!error && response.statusCode === 200) {
					xml2js.parseString(body, {
						explicitArray : false,
						ignoreAttrs : true
					}, function(error, json) {
						if (error) {
							cb(error);
							return;
						}else{
							cb(false, json.xml);
							return;
						}
						
					});
				} else {
					cb(error);
					return;
				}
			});
		};
	},

	/**
	 * For file uploading
	 * 
	 * @param url
	 * @param file
	 */
	file :function(url, file,params){
		return function(cb){
			fs.stat(file, function(err) {
				if (err) {
					cb(err);
					return;
				}
				var media = fs.createReadStream(file);
				var obj= {
						media : media,
						nonce : ''
					};
				for(var i in params){
					obj[i]=JSON.stringify(params[i]);
				}
				request.post({
					url : url,
					json : true,
					formData :obj
				}, function(error, response, body) {
					if (!error && response.statusCode === 200) {
						cb(null, body);
						return;
					} else {
						cb(error);
						return;
					}
				});
			});
		};
	},
		
		

	/**
	 * For file downloading
	 * 
	 * @param url
	 * @param data
	 * @param file
	 */
	download :function(url, data, file){
		return function(cb){
			request.get({
				url : url,
				form : data
			}).pipe(fs.createWriteStream(file).on('finish',function(){
				cb(null);
				return;
			}).on("unpipe", function(src) {
				cb(new Error("something has stopped piping into the writer"));
				return;
			}));
		};
	},
};