var 
/**** modules ****/  
    express   = require(__dirname+'/node_modules/express')
  , redis     = require(__dirname+'/node_modules/redis')
  , everyauth = require(__dirname+'/node_modules/everyauth')
  , url       = require('url')
    
/**** constants ****/  
  , V_STORAGE = require(__dirname+'/conf/storage')
  , V_OAHTH   = require(__dirname+'/conf/oauth')

/**** valiables ****/
  , port = (process.env.PORT || 3000)
  , redisClient
  , publishClient
  , haveToLoginSocketId = {};
;

process.argv.forEach(function (item, index){
    if(item == '--port'){
        port = process.argv[index+1];
    }   
});

/**** Redis Client ****/
if(V_STORAGE.redis.host === undefined || V_STORAGE.redis.port === undefined){

  redisClient = redis.createClient();
  publishClient = redis.createClient();
  console.log(' : REDIS - localhost');

}else{
  redisClient = redis.createClient(V_STORAGE.redis.port, V_STORAGE.redis.host, {no_ready_check: true});
  publishClient = redis.createClient(V_STORAGE.redis.port, V_STORAGE.redis.host, {no_ready_check: true});
            
  if (V_STORAGE.redis.password) {
    redisClient.auth(V_STORAGE.redis.password, function() {
      console.log('Redis client connected');
    });
  }

  if (V_STORAGE.redis.password) {
    publishClient.auth(V_STORAGE.redis.password, function() {
      console.log('Redis publish client connected');
    });
  }
}

/**** everyauth Process ****/

everyauth.debug = true;

var usersById = {};
var nextUserId = 0;

function addUser (source, sourceUser) {
  var user;
  user = usersById[++nextUserId] = {id: nextUserId};
  user[source] = sourceUser;
  return user;
}

var usersByFbId = {};
var usersByTwitId = {};

everyauth.everymodule.findUserById( function (id, callback) {
    callback(null, usersById[id]);
});

everyauth
  .facebook
    .appId(V_OAHTH.fb.appId)
    .appSecret(V_OAHTH.fb.appSecret)
    .findOrCreateUser( function (session, accessToken, accessTokenExtra, fbUserMetadata) {
      return usersByFbId[fbUserMetadata.id] ||
        (usersByFbId[fbUserMetadata.id] = addUser('facebook', fbUserMetadata));
    })
    .redirectPath('/authCallback');

everyauth
  .twitter
    .consumerKey(V_OAHTH.twit.consumerKey)
    .consumerSecret(V_OAHTH.twit.consumerSecret)
    .findOrCreateUser( function (sess, accessToken, accessSecret, twitUser) {
      return usersByTwitId[twitUser.id] || (usersByTwitId[twitUser.id] = addUser('twitter', twitUser));
    })
    .redirectPath('/authCallback');


/**  Express F/W  **/
var app = express.createServer(
    express.bodyParser()
  , express.static(__dirname + "/public")
  , express.favicon()
  , express.cookieParser()
  , express.session({ secret: 'rladygks'})
  , everyauth.middleware()
);

app.configure( function () {
  app.set('view engine', 'jade');
  app.set('views', __dirname+'/views');
});


app.get('/', function (req, res) {

  console.log(' > //////////// : SC['+req.session.auth._callbackSocketId+']');

});

app.get('/popupauth', function (req, res){

  var urlObj  = url.parse(req.url, true);
  var params  = urlObj.query;

  req.session.auth = {};
  
  req.session.auth._callbackSocketId = req.query["SC"];
  req.session.auth._channel = req.query["CN"];

  res.redirect('/auth/'+req.query["_tryTarget"]);

});


app.get('/authCallback', function (req, res) {

  console.log('aaaaa');
  console.log('JSON.stringify(req.session) : '+req.session.auth);

  console.log('aaaaa2');
  console.log(' > /authCallback ['+req.session.auth._callbackSocketId+']');

  console.log('aaaaa3');
  if(req.session.auth === undefined || !req.session.auth.loggedIn){
    res.end("<html><h1>Authentication failed :( </h1></html>")

  }else{

    var loginedUsr = {};

    if(req.session.auth.twitter !== undefined){
      loginedUsr = {
        target : 'twitter',
        id :    req.session.auth.twitter.user.id,
        name :  '@'+req.session.auth.twitter.user.screen_name,
        link :  'https://twitter.com/'+req.session.auth.twitter.user.screen_name
      };
    }else if(req.session.auth.facebook !== undefined){
      loginedUsr = {
        target : 'facebook',
        id :    req.session.auth.facebook.user.id,
        name :  req.session.auth.facebook.user.name,
        link :  req.session.auth.facebook.user.link
      };
    }


    publishClient.publish( req.session.auth._channel,  JSON.stringify({
        SC : req.session.auth._callbackSocketId,
        MG : 'AUTH',
        _users : loginedUsr,
        _type : 'S'
    }));

    console.log(' > /authCallback : SC['+req.session.auth._callbackSocketId+']');
    console.log('                   CN['+req.session.auth._channel+']');
    console.log('                   UR['+JSON.stringify(loginedUsr)+']');

    res.send("<html><p>You can now <a href='#' onclick='self.close();'>close this window</a> and follow or unfollow whomever you wish.</p>" +
             "<script type='text/javascript'>self.close();</script></html>");
  }

});

app.get('/user', function (req, res){


  if(req.session.auth === undefined || !req.session.auth.loggedIn){

    var urlObj  = url.parse(req.url, true);
    var params  = urlObj.query;

    req.session.auth = {};

    if(params.SC && params.CN){

      //req.session.auth._callbackSocketId = params.SC;
      //req.session.auth._channel = params.CN;

      //console.log(' > /user (ADD session!!)         : SC['+req.session.auth._callbackSocketId+']');
  
    }
    
    
    if(req.query["_callback"] === undefined || req.query["_callback"] == null){
      
      res.send('{isAuth:false}');
    }else{
      res.send(req.query["_callback"] + '({isAuth:false, tryTarget:"'+req.query["_tryTarget"]+'"});');
    }

  }else{

    var loginedUsr = {};

    if(req.session.auth.twitter !== undefined){

      loginedUsr = {
        target : 'twitter',
        id :    req.session.auth.twitter.user.id,
        name :  '@'+req.session.auth.twitter.user.screen_name,
        link :  'https://twitter.com/'+req.session.auth.twitter.user.screen_name
      };
    }else if(req.session.auth.facebook !== undefined){

      loginedUsr = {
        target : 'facebook',
        id :    req.session.auth.facebook.user.id,
        name :  req.session.auth.facebook.user.name,
        link :  req.session.auth.facebook.user.link
      };
    }

    console.log(' > /user         : UR['+JSON.stringify(loginedUsr)+']');

    res.writeHead(200, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    });

    if(req.query["_callback"] === undefined || req.query["_callback"] == null){
      res.end('{isAuth:true, user:'+JSON.stringify(loginedUsr)+'}');
    }else{
      res.end(req.query["_callback"] + '({isAuth:true, user:'+JSON.stringify(loginedUsr)+'});');  
    }

  }

});

app.get('/logoutAuth', function (req, res){

  delete req.session.auth;
    
  res.writeHead(200, { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
  });

  res.end(req.query["_callback"] + '();');  

});

app.get('/message', function (req, res){
    var urlObj  = url.parse(req.url, true);
    var referer = req.headers.referer;
    var params  = urlObj.query;

    if(params.r){
        if(params.r == 'HOMEURL'){
            referer = getHomeUrl(referer);
        }
    }

    referer = escape(referer);

    console.log(' > /message      : RF['+referer+']');
    console.log(' >                 SC['+params.SC+']');

    if(
        //!params.AU ||   // !params.CN || !params.UR || 
        !params.MG  || !params.SC // || !referer // @ TODO have to uncomment!!
    ){
    
        res.writeHead(500, { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        });
        res.end('Internal Error : uri parameters are not available.');
        
    }else{
        
        // 1. HSET
        //redisClient.hset(referer, params.SC, params.CN, redis.print);    
        var curUR;
        redisClient.hget(referer, params.SC, function(err, data) {

            if(err){
              console.error(err);
            }else{
              var c = JSON.parse(data);
              curUR = c.UR;  
            } // @ TODO !!!!!!!
        });
        
        // 2. HGET ALL
        redisClient.hgetall(referer, function (err, channels) {
            for (var socketId in channels) {

                //console.log(channels[socketId]+" ------- \n"+params.MG+" / "+socketId);
                
                var c = JSON.parse(channels[socketId]);
                
                publishClient.publish( c.CN,  JSON.stringify({
                    MG : params.MG,   // (MG - message)
                    SC : socketId,    // (SC - socket )
                    _type : 'M',      // M :chat message / S :system message
                    _from : curUR
                }));
                
            }   
        });
        
        //console.log(' ***************************************');
        
        res.writeHead(200, { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        });
        
        res.end(JSON.stringify(''));
        
    }

});


everyauth.helpExpress(app);

app.listen(port);

console.log('Express is started!!, port :%d', port);

module.exports = app;





//****************  Utils  *******************//

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


