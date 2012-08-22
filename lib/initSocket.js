/**
options = {
	connect: 'localhost:2181',
	socketServer: {
		host: '',
		port: '',
		channel: '',
	},
	socketCallback: function(data){
	},
	
	msgqueServer: {
		host: '',
		port: ''
	},
	msgqueCallback: function(data){
	}
}
**/

module.exports = function(options) {
	
	var SOCKET_SERVER_PATH = '/SOCKET';
	var MSGQUE_SERVER_PATH = '/MSGQUE';
	console.log(__dirname);
	var ZooKeeper = require(__dirname+'/../node_modules/zookeeper');
	
	var zk = new ZooKeeper({
		connect: options.connect,
		timeout: 1000, // @ TODO 어느 정도까지 짧아야 하나?
		debug_level: ZooKeeper.ZOO_LOG_LEVEL_WARNING,
		host_order_deterministic: false
	});

	zk.connect(function (err) {
		
		if(err) throw err;
		
		console.log (" [CONNECT] id=%s", zk.client_id);

		// SOCKET_SERVER_PATH
		zk.a_exists(SOCKET_SERVER_PATH, null, function ( rc, error, stat ){

			console.log("  [EXISTS] "+rc+", "+error+", "+stat );

			if(rc != 0){ // 존재하지 않는다면, rootPath 생성 
				zk.a_create (SOCKET_SERVER_PATH, null, ZooKeeper.ZOO_PERSISTENT, function (rc, error, path)  {
					if (rc != 0) {
						// ERROR :: 존재하지 않아서 생성했는데 에러 난 경우
						console.error ("  **ERROR** ("+SOCKET_SERVER_PATH+") %d, error: '%s', path=%s", rc, error, path);
					} else {
						createSocketServerZNode();
					}
				});
			}else{
				createSocketServerZNode();
			}

		});

		// MSGQUE_SERVER_PATH
		zk.a_exists(MSGQUE_SERVER_PATH, null, function ( rc, error, stat ){

			console.log("  [EXISTS] "+rc+", "+error+", "+stat );

			if(rc != 0){ // 존재하지 않는다면, rootPath 생성 
				zk.a_create (MSGQUE_SERVER_PATH, null, ZooKeeper.ZOO_PERSISTENT, function (rc, error, path)  {
					if (rc != 0) {
						// ERROR :: 존재하지 않아서 생성했는데 에러 난 경우
						console.error ("  **ERROR** ("+MSGQUE_SERVER_PATH+") %d, error: '%s', path=%s", rc, error, path);
					} else {
						createMsgqueServerZNode();
					}
				});
			}else{
				createMsgqueServerZNode();
			}

		});
	});

	var createSocketServerZNode = function(){
		
		zk.a_exists(SOCKET_SERVER_PATH, null,
			function ( rc, error, stat ){
				console.log("---- "+rc+", "+error+", "+stat );


				// @ TODO 같은 SocketServer 가 존재하면 안된다 체크 필요!!

				var zNodePath = "/"+options.socketServer.channel+":"+options.socketServer.host+":"+options.socketServer.port;
				zk.a_create (SOCKET_SERVER_PATH+zNodePath, '', ZooKeeper.ZOO_EPHEMERAL, function (rc, error, path)  {
					if (rc != 0) {
						// ERROR :: 존재하지 않아서 생성했는데 에러 난 경우
						console.error ("  **ERROR** ("+pathName+zNodePath+") %d, error: '%s', path=%s", rc, error, path);
					} else {
						console.log ("  [CREATE] %s", path);
						getSocketServerList();
					}
			});
		});

	};

	var createMsgqueServerZNode = function(){
		
		zk.a_exists(MSGQUE_SERVER_PATH, null,
			function ( rc, error, stat ){
				console.log("---- "+rc+", "+error+", "+stat );

				// @ TODO 같은 Message Queue Server 가 존재하면 안된다 체크 필요!!

				var zNodePath = "/"+options.msgqueServer.host+":"+options.msgqueServer.port;
				zk.a_create (MSGQUE_SERVER_PATH+zNodePath, '', ZooKeeper.ZOO_EPHEMERAL, function (rc, error, path)  {
					if (rc != 0) {
						// ERROR :: 존재하지 않아서 생성했는데 에러 난 경우
						console.error ("  **ERROR** ("+pathName+zNodePath+") %d, error: '%s', path=%s", rc, error, path);
					} else {
						console.log ("  [CREATE] %s", path);
						getMsgqueServerList();
					}
			});
		});

	};


	var getSocketServerList = function(){
		zk.aw_get_children(
			SOCKET_SERVER_PATH,
			function ( type, state, path ){
				console.log('  [WATCH] '+type+','+state+','+path);
				getSocketServerList();
			},
			function(rc,error,children){
				var result=[];
				console.log(rc+','+error+','+children);
				if(rc==0){
					children.forEach(function(child){
						var info = child.split(':');
						result.push({
							channel: info[0],
							host: info[1],
							port: info[2]
						});
					});

					options.socketCallback(result);
					
				}
			}
		);

	};

	var getMsgqueServerList = function(){
		zk.aw_get_children(
			MSGQUE_SERVER_PATH,
			function ( type, state, path ){
				console.log('  [WATCH] '+type+','+state+','+path);
				getMsgqueServerList();
			},
			function(rc,error,children){
				var result=[];
				console.log(rc+','+error+','+children);
				if(rc==0){
					
					children.forEach(function(child){
						var info = child.split(':');
						result.push({
							host: info[0],
							port: info[1]
						});
					});

					options.msgqueCallback(result);
					
				}
			}
		);

	};


	return zk;

};


