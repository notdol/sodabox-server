
var   redis     = require(__dirname+'/node_modules/redis')
    , io        = require(__dirname+'/node_modules/socket.io')
    , conf      = require(__dirname+'/conf/storage')
    , port      = process.env.PORT || 3000
    , fs        = require('fs')

// ## set process arguments ## //
    , CH_NAME
    , SERVER_URL
    , redisClient
    , subscribeClient
;

process.argv.forEach(function (item, index){
    if(item == '--channel'){
        CH_NAME = process.argv[index+1];
    }   
    if(item == '--server'){
        SERVER_URL = process.argv[index+1];
    }   
    if(item == '--port'){
        port = process.argv[index+1];
    }   
});

if(!CH_NAME || !SERVER_URL){
    console.log('arguments are not available !! ');
    process.exit(1);
}else{
    console.log(" > CH_NAME    : "+CH_NAME);
    console.log(" > SERVER_URL : "+SERVER_URL);
}

// ## connect Redis Servers ## //
if(conf.redis.host === undefined || conf.redis.port === undefined){

    redisClient = redis.createClient();
    subscribeClient = redis.createClient();
    console.log(' : REDIS - localhost');

}else{
    redisClient = redis.createClient(conf.redis.port, 
                                conf.redis.host, 
                                {no_ready_check: true});
                                
    if (conf.redis.password) {
        redisClient.auth(conf.redis.password, function() {
            console.log('Redis client connected');
            
            redisClient.hget('ENV_SOCKET_URL', SERVER_URL, function (err, obj) {
                console.log(err+" : "+obj);
                if(!obj){
                    redisClient.hset('ENV_SOCKET_URL', SERVER_URL, CH_NAME, redis.print);  
                }else{
                    console.log("somenthing is wrong!!!!! check your server argument RIGHT NOW !!!! ");
                    process.exit(1);
                }
            }); 
            
        
        });
    }

    subscribeClient = redis.createClient(conf.redis.port, 
                                conf.redis.host, 
                                {no_ready_check: true});
    if (conf.redis.password) {
        subscribeClient.auth(conf.redis.password, function() {
            console.log('Redis publish client connected');
        });
    }
}

// ## store and remove Socket Server Url info when server is started and stopped ## //

process.on('exit', function () {
    process.nextTick(function () {
        console.log('SODABOX > exit...');
    });
  
    redisClient.hdel('ENV_SOCKET_URL', SERVER_URL);  
    
    for (var socketId in io.sockets.sockets) {

        console.log(io.sockets.sockets[socketId]._REF +" : "+io.sockets.sockets[socketId]._SC);

        redisClient.hdel(io.sockets.sockets[socketId]._REF, io.sockets.sockets[socketId]._SC);
    }
    
    console.log('EXIT.............');
});

process.on('SIGINT', function() {
    console.log("\nGracefully shutting down from SIGINT (Ctrl+C)");
    process.exit();
});

process.on('SIGHUP', function () {
    console.log('Got SIGHUP signal.');
    process.exit();
});


process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err);
    process.exit();
});



// ## SOCKET EVENTS ## //
io = io.listen(Number(port));
io.enable('browser client minification');  // send minified client
io.enable('browser client etag');          // apply etag caching logic based on version number
io.enable('browser client gzip');          // gzip the file
io.set('log level', 1);    
io.set("origins = *");
io.set('transports', 
    [
        'websocket'
        , 'flashsocket'
        , 'htmlfile'
        , 'xhr-polling'
        , 'jsonp-polling'
    ]);
io.sockets.on('connection', function (socket) {
    
    socket.on('join', function(data){    
        
        socket._REF = socket.handshake.headers.referer;
        socket._AU  = data.AU;
        socket._CN  = data.CN;
        socket._UR  = data.UR;
        socket._MG  = data.MG;
        socket._SC  = socket.id;

        if(data.r){
            if(data.r == 'HOMEURL'){
                socket._REF = getHomeUrl(socket._REF);
            }
        }

        socket._REF = escape(socket._REF);

        console.log(' > socket._REF : '+socket._REF );
        
        console.log(' **** socket.io [JOIN('+socket.id+')] **** \n'+
                    '       from page  : '+JSON.stringify(data)+ '\n'+
                    '      socket._REF : ' + socket._REF+ '\n'+
                    '      socket._AU  : ' + socket._AU+ '\n'+
                    '      socket._CN  : ' + socket._CN+ '\n'+
                    '      socket._UR  : ' + socket._UR+ '\n'+
                    '      socket._MG  : ' + socket._MG+ '\n'+
                    '      socket._SC  : ' + socket._SC+ '\n'
        );
        
        // 1. HSET
        redisClient.hset(socket._REF, socket._SC, JSON.stringify({CN: socket._CN, UR: socket._UR}), redis.print);	
            
        // 2. HGET ALL
        redisClient.hgetall(socket._REF, function (err, channels) {
            sendSystemMessage('IN', channels);
        });
        
        io.sockets.sockets[socket._SC].emit('join', {socketId: io.sockets.sockets[socket._SC].id});
        
        console.log(' **** ');
        
    });
    
    socket.on('disconnect', function(){
        
        console.log(' **** socket.io [DISCONNECT('+socket.id+')] **** \n'+
                    '      socket._REF : ' + socket._REF+
                    '      socket._SC  : ' + socket._SC
        );
        
        try{
            // 1. HDEL
            redisClient.hdel(socket._REF, socket._SC);
            // 2. HGET ALL
            redisClient.hgetall(socket._REF, function (err, channels) {
                sendSystemMessage('OUT', channels);
            });
        } catch(e) {
            console.log(' **** ERROR **** : '+socket._REF+' / '+socket._SC);
        }
        console.log(' **** ');
    });

    socket.on('viewStatusCount', function(){
        io.sockets.sockets[socket.id].emit('viewStatusCount', {socketId: io.sockets.sockets.length});
    });
    socket.on('viewStatusSockets', function(){
        io.sockets.sockets[socket.id].emit('viewStatusSockets', {sockets: io.sockets.sockets});
    });
    socket.on('extendMessage', function(msg){

        var filename = __dirname+'/text/'+msg.name;
        fs.readFile(filename, function (err, data) {
            if (err) {
                io.sockets.sockets[socket.id].emit('extendMessage', {status: "ERROR", message: "File Error : "+msg.name});
            }else{

                for (var socketId in io.sockets.sockets) {
                    console.log(io.sockets.sockets[socketId]._REF +" : "+io.sockets.sockets[socketId]._SC);

                    if(io.sockets.sockets[socketId].id != socket.id){
                        io.sockets.sockets[socketId].emit('extendMessage', {status: "OK", message : data});
                    }
                }   
            }
        });
    });
    
});



// ## REDIS Server SUB EVENTS ## //

subscribeClient.on('subscribe', function (channel, count){
    console.log(' **** subscribeClient [MESSAGE('+channel+')] **** '+count);
});
subscribeClient.on('message', function (channel, msg){
    var data = JSON.parse(msg);
    
    console.log(' **** subscribeClient [MESSAGE('+channel+')] **** \n'+JSON.stringify(data));
        
    if(data._type == 'S'){
        emitMessage(data._type, data.SC, data.MG, data._users);
    }else{
        emitMessage(data._type, data.SC, data.MG, data._from);
    }
});

subscribeClient.subscribe(CH_NAME);








// ## message functions, sending to client ## //

function sendSystemMessage(msgType, channels){
    
    var users = [];
    for (var s in channels) {
        var t = JSON.parse(channels[s]);
        users.push(t.UR);
    }
    
    for (var socketId in channels) {
        
        var c = JSON.parse(channels[socketId]);
        if( c.CN == CH_NAME ){
            emitMessage('S', socketId, msgType, users);
            
        }else{
            
            // ** MG, SC ** //
            
            redisClient.publish( c.CN,   JSON.stringify({
                MG : msgType,   // (MG - message)
                SC : socketId,  // (SC - socket )
                _type : 'S',     // S : system message
                _users : users
            }));
        }
    }   
}

function emitMessage(argType, argSocketId, argMessage, user){
    
    try{        
        
        if(argType == 'S'){
            var params = {
                UR : io.sockets.sockets[argSocketId]._UR,
                MG : argMessage,
                _type : argType,
                _users : user
            };
            io.sockets.sockets[argSocketId].emit(argType+'_MSG', params);

        }else{
            var params = {
                UR : user,
                MG : argMessage,
                _type : argType
            };
            io.sockets.sockets[argSocketId].emit(argType+'_MSG', params);
            
        }
       
        
        console.log(' **** socket.io [EMIT('+argType+'_MSG'+')] **** \n'+
                    '       from page  : '+JSON.stringify(params)
        );
        
        
        
    } catch(e) {
        console.log(' **** ERROR **** : '+io.sockets.sockets[argSocketId]);
        if(io.sockets.sockets[argSocketId]){
            console.log('           exec redisClient.hdel > '+argSocketId);
            redisClient.hdel(io.sockets.sockets[argSocketId]._REF, argSocketId);
        }
    }
}


function getHomeUrl(str){


    if(str.indexOf('https://') >= 0){
        if(str.substring(8).indexOf('/') >= 0){
            return str.substring(0, 8+str.substring(8).indexOf('/'));
        }else{
            return str;
        }
    } else if(str.indexOf('http://') >= 0){
        if(str.substring(7).indexOf('/') >= 0){
            return str.substring(0, 7+str.substring(7).indexOf('/'));
        }else{
            return str;
        }
    } else {
        if(str.indexOf('/') >= 0){
            return str.substring(0, str.indexOf('/'));
        }else{
            return str;
        }
    }

}
