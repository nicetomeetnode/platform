var mysql = require('mysql');
var options = {
	host : 'localhost',
	user : 'lww',
	password : 'a123',
	database : 'platform',
	port : 3306,
	charset:"utf8mb4"
};
module.exports.execSqls = function(sqls, paramsArr) {
	return function(cb) {
		if (sqls && sqls.length > 0 && paramsArr && sqls.length === paramsArr.length) {
			var results = [];
			var connection = mysql.createConnection(options);
			connection.connect();
			connection.beginTransaction();
			for (var i = 0; i < sqls.length; i++) {
				connection.query(sqls[i], paramsArr[i], function(err, result) {
					if (err) {
						console.log(err);
						connection.rollback();
						connection.end();
						results = [];
						cb(err);
						return;
					}
					results.push(result);
				});

			}
			connection.commit();
			connection.end();
			cb(null, results);
			return;
		} else {
			cb(new Error("sqls or paramsArr does not conform to the specification"));
			return;
		}
	};

};
module.exports.execSql = function(sql, params) {
	return function(cb) {
		if (sql) {
			if (!params || params.length === 0) {
				params = [];
			}
			var connection = mysql.createConnection(options);
			connection.connect();
			connection.query(sql, params, function(err, results) {
				if (err) {
					console.log(err);
					connection.rollback();
					connection.end();
					cb(err);
					return;
				}
				connection.commit();
				connection.end();
				cb(null, results);
				return;
			});
		} else {
			cb(new Error("sql is null"));
			return;
		}
	};
};