var ZkClient=require('./zk.js').ZkClient;

var zkclient = new ZkClient("localhost:2181");

console.log(zkclient.ZOOKEEPER.ZOO_EPHEMERAL+" / "+zkclient.ZOOKEEPER.ZOO_EPHEMERAL);
zkclient.zk.a_create ("/node.js1", "some value", zkclient.ZOOKEEPER.ZOO_SEQUENCE | zkclient.ZOOKEEPER.ZOO_EPHEMERAL, function (rc, error, path)  {
    if (rc != 0) {
        console.log ("zk node create result: %d, error: '%s', path=%s", rc, error, path);
    } else {
        console.log ("created zk node %s", path);
        //process.nextTick(function () {
        //   zk.close ();
        //});
    }
});


