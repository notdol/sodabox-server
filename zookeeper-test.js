var ZK = require('./zk.js');


var zkClient = ZK({
	connect: 'localhost:2181',
	host: '123.456.789',
	port: '8080',
	channel: 'CH001'
},
function(data){
	console.log('   000 '+data);
}
);