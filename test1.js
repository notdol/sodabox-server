var initSocket = require('./lib/initSocket.js');

var socketServerList = [];
var msgqueServerList = [];


var zk = initSocket(
    {
        connect: 'localhost:2181',
        socketServer: {
            host: 'SOCKET1',
            port: '4001',
            channel: '',
        },
        socketCallback: function(data){
            socketServerList = data;
            console.log('socketServerList : '+socketServerList);
        },
        
        msgqueServer: {
            host: 'MSGQUE',
            port: '4002'
        },
        msgqueCallback: function(data){
            msgqueServerList = data;
            console.log(msgqueServerList.length+' msgqueServerList : '+msgqueServerList);
        }
    }
);