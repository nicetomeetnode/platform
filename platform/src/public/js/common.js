// 判断是否为空
function is_empty(id) {
	var val = document.getElementById(id).value;
	if (val != "" && val != null && val != undefined) {
		return false;
	}
	return true;
}
// 手机号码判断
function is_phone(id) {
	var val = document.getElementById(id).value;
	var rez = /^1[3458]\d{9}$/;
	var rezSec = /^((0\d{2,3})-)?(\d{7,8})(-(\d{3,}))?$/;
	if (rez.test(val) || rezSec.test(val)) {
		return true;
	}
	return false;
}
/**
 * 去两边空格
 */
function trim(str) {
	return str.replace(/(^\s*)|(\s*$)/g, "");
};

/*--获取网页传递的参数--*/
function request(paras) {
	var url = location.href;
	var paraString = url.substring(url.indexOf("?") + 1, url.length).split("&");
	var paraObj = {};
	for (i = 0; j = paraString[i]; i++) {
		paraObj[j.substring(0, j.indexOf("=")).toLowerCase()] = j.substring(j
						.indexOf("=")
						+ 1, j.length);
	}
	var returnValue = paraObj[paras.toLowerCase()];
	if (typeof(returnValue) == "undefined") {
		return "";
	} else {
		return returnValue;
	}
}

// 判断是否为空
function isEmpty(val) {
	if (val != "" && val != null && val != undefined && trim(val) != "") {
		return false;
	}
	return true;
}

// js判断上传文件的大小,单位字节
function getFileSize(id) {
	var file = document.getElementById(id).files[0];
	if (file) {
		/*
		 * var fileSize = 0; if (file.size > 1024 * 1024) { fileSize =
		 * (Math.round(file.size * 100 / (1024 * 1024)) / 100) .toString() +
		 * 'MB'; } else { fileSize = (Math.round(file.size * 100 / 1024) /
		 * 100).toString() + 'KB'; }
		 */
		// alert('文件名: ' + file.name);
		return file.size;
		// alert('类型: ' + file.type);
	}
	return 0;
}

// js日期比较(yyyy-mm-dd)

function dateCompare(start, end) {  
   var arr = start.split("-");  
   var starttime = new Date(arr[0], arr[1], arr[2]);  
   var starttimes = starttime.getTime();  
 
   var arrs = end.split("-");  
   var lktime = new Date(arrs[0], arrs[1], arrs[2]);  
   var lktimes = lktime.getTime();  
 
   if (starttimes >= lktimes) {  
 
      // alert('开始时间大于离开时间，请检查');
       return false;  
   }  
   else {
	   return true;  
   } 
       
 
}  