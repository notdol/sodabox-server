var ZK = require('./zk.js');

var socketServerList = [];


var zkClient = ZK(
	{
		connect: 	'localhost:2181',
		host: 		'123.456.789',
		port: 		'8080',
		channel: 	'CH001'
	},
	function(datas){
		socketServerList.length = 0;
		console.log('callback Socket ServerList : '+datas);
		datas.forEach(function(data){
			console.log(' >>> '+data);
			socketServerList.push(data);
		});
	}
);