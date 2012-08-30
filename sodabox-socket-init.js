
module.exports = function(zk, options) {
	
	var SOCKET_SERVER_PATH = '/SOCKET';

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
						
						options.initCallback(path);

						getSocketServerList();
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

					options.nodeCallback(result);
					
				}
			}
		);

	};


	return zk;

};


