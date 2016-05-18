module.exports.randomString=function (len) {
	len = len || 32;
	var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
	/** **默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1*** */
	var maxPos = $chars.length;
	var str = '';
	for (i = 0; i < len; i++) {
		str += $chars.charAt(Math.floor(Math.random() * maxPos));
	}
	return str;
}

//手机号码判断
module.exports.isPhone=function (val) {
	var rez = /^1[3458]\d{9}$/;
	var rezSec = /^((0\d{2,3})-)?(\d{7,8})(-(\d{3,}))?$/;
	if (rez.test(val) || rezSec.test(val)) {
		return true;
	}
	return false;
}


module.exports.isEmpty=function (val) {
	if (val != "" && val != null && val != undefined && trim(val) != "") {
		return false;
	}
	return true;
}
function trim(str) {
	return (""+str).replace(/(^\s*)|(\s*$)/g, "");
};
module.exports.trim=trim;