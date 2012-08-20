/**
options = {
	connect: 'localhost:2181',
	host: '',
	port: '',
	channel: ''
}
**/

module.exports = function(options) {
	
	var rootPath = 'SODABOX_SOCKETS';

	var ZooKeeper = require(__dirname+'/node_modules/zookeeper');
	
	var zk = new ZooKeeper({
		connect: options.connect,
		timeout: 200000,
		debug_level: ZooKeeper.ZOO_LOG_LEVEL_WARNING,
		host_order_deterministic: false
	});

	zk.connect(function (err) {
		if(err) throw err;
		
		console.log ("zk session established, id=%s", zk.client_id);

		zk.a_exists(rootPath, null, function ( rc, error, stat ){

			console.log(rc+", "+error+", "+stat );

			if(rc != 0){ // 존재하지 않는다면, 
				zk.a_create (rootPath, null, ZooKeeper.ZOO_PERSISTENT, function (rc, error, path)  {
					if (rc != 0) {
						console.log ("zk node create result: %d, error: '%s', path=%s", rc, error, path);
						createServerZNode();
					} else {
						console.log ("created zk node %s", path);
					}
				});
			}else{
				createServerZNode();
			}

		});
	});

	var createServerZNode = function(){

		zk.a_create (rootPath+"/"+options.host+":"+options.port, options.channel, ZooKeeper.ZOO_EPHEMERAL, function (rc, error, path)  {
			if (rc != 0) {
				console.log ("zk node create result: %d, error: '%s', path=%s", rc, error, path);
			} else {
				console.log ("created zk node %s", path);
			}
		});
	};

	var close = function(){
		zk.clos();
	};

	var getSocketServers = function(){
		zk.a_get_children(rootPath,null,function(rc,error,children){
			var result=[];
			if(rc==0){
				children.forEach(function(child){
					console.log(' >>> '+child);
				}
			}
		}
	};

	return {
		getSocketServers : function(cb){
			return this.getSocketServers();
		}
	};

});


