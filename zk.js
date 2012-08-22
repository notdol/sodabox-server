/**
options = {
	connect: 'localhost:2181',
	host: '',
	port: '',
	channel: ''
}
**/

module.exports = function(options, cbFn) {
	
	var rootPath = '/SODABOX_SOCKETS';

	var ZooKeeper = require(__dirname+'/node_modules/zookeeper');
	
	var zk = new ZooKeeper({
		connect: options.connect,
		timeout: 200000,
		debug_level: ZooKeeper.ZOO_LOG_LEVEL_WARNING,
		host_order_deterministic: false
	});

	zk.connect(function (err) {
		
		if(err) throw err;
		
		console.log (" [CONNECT] id=%s", zk.client_id);

		zk.a_exists(rootPath, null, function ( rc, error, stat ){

			console.log("  [EXISTES] "+rc+", "+error+", "+stat );

			if(rc != 0){ // 존재하지 않는다면, rootPath 생성 
				zk.a_create (rootPath, null, ZooKeeper.ZOO_PERSISTENT, function (rc, error, path)  {
					if (rc != 0) {
						// ERROR :: 존재하지 않아서 생성했는데 에러 난 경우
						console.error ("  **ERROR** ("+rootPath+") %d, error: '%s', path=%s", rc, error, path);
					} else {
						createServerZNode();
					}
				});
			}else{
				createServerZNode();
			}

		});
	});

	var createServerZNode = function(){

		console.log('PATH - '+rootPath+"/"+options.host+":"+options.port);
		zk.aw_exists(rootPath, null,
			function ( rc, error, stat ){
				console.log("---- "+rc+", "+error+", "+stat );
				zk.a_create (rootPath+"/"+options.host+":"+options.port, options.channel, ZooKeeper.ZOO_EPHEMERAL, function (rc, error, path)  {
					if (rc != 0) {
						// ERROR :: 존재하지 않아서 생성했는데 에러 난 경우
						console.error ("  **ERROR** ("+rootPath+"/"+options.host+":"+options.port+") %d, error: '%s', path=%s", rc, error, path);
						// ERROR
					} else {
						console.log ("  [CREATE] %s", path);
						getSocketServers();
					}
			});
		});
	};

	var getSocketServers = function(){
		zk.aw_get_children(
			rootPath,
			function ( type, state, path ){
				console.log('  [WATCH] '+type+','+state+','+path);
				getSocketServers();
			},
			function(rc,error,children){
				var result=[];
				var ttt = '';
				console.log(rc+','+error+','+children);
				if(rc==0){
					cbFn(children);
					/*
					children.forEach(function(child){
						ttt = ttt + ' / '+child;
						console.log(' >>> '+child);
					});
					*/
				}
			}
		);

	};

	return false;

};


