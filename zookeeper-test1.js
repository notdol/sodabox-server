var ZK = require('./zk.js');


var zkClient = ZK({
    connect: 'localhost:2181',
    host: '255.255.255.255',
    port: '8080',
    channel: 'CH002'
},
function(data){
    console.log('   000 '+data);
}
);
