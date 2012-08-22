var init = require('./lib/initSocket.js');

var socketServerList = [];
var msgqueServerList = [];


var zk = init(
    {
        connect: 'localhost:2181',
        socketServer: {
            host: 'SOCKET2',
            port: '4003',
            channel: '',
        },
        socketCallback: function(data){
            socketServerList = data;
            console.log('socketServerList : '+socketServerList);
        },
        
        msgqueServer: {
            host: 'MSGQUE2',
            port: '4004'
        },
        msgqueCallback: function(data){
            msgqueServerList = data;
            console.log(msgqueServerList.length+' msgqueServerList : '+msgqueServerList);
        }
    }
);