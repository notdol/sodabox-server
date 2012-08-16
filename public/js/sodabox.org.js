var SODABOX_defaultInfo = {
    
    _SODABOX_appurl     : 'http://sodabox.allypost.com:3300',
    _SODABOX_socketurl  : 'http://sodaboxsocket.allypost.com:3400',
    /*
    _SODABOX_appurl     : 'http://ec2-23-20-135-233.compute-1.amazonaws.com:8000',
    _SODABOX_socketurl  : 'http://ec2-23-20-135-233.compute-1.amazonaws.com:8001',
    */
    _SODABOX_channel    : 'CH001',
    _SODABOX_divName    : 'SODABOX_SCREEN',
    _SODABOX_range      : 'PAGE'

};


// If you would like to chat, login with Facebook or Twitter

var SODABOX_utils = {

     getHashCode : function(s){
        var hash = 0;
        if (s.length === 0) return hash;
        for (var i = 0; i < s.length; i++) {
                var char = s.charCodeAt(i);
                hash = ((hash<<5)-hash)+char;
                hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    },

    loadScript :  function(url, callback){
        var script = document.createElement("script");
        script.type = "text/javascript";
        if (script.readyState){  //IE
            script.onreadystatechange = function(){
                if (script.readyState == "loaded" ||
                        script.readyState == "complete"){
                    //script.onreadystatechange = null;
                    callback();
                }
            };
        } else {  //Others
            script.onload = function(){
                callback();
            };
        }
        script.src = url;
        document.getElementsByTagName("head")[0].appendChild(script);
    },

    loadJson : function(url, callbackStr){

        var script = document.createElement("script");
        // Add script object attributes
        script.type     = "text/javascript";
        script.charset  = "utf-8";
        script.id       = this.getHashCode(url);

        if (script.readyState){  //IE
            script.onreadystatechange = function(){
                if (script.readyState == "loaded" ||
                        script.readyState == "complete"){
                    //script.onreadystatechange = null;
                    // DO Something?
                }
            };
        } else {  //Others
            script.onload = function(){
               // DO Something?
            };
        }

        script.src = url + '?_callback='+callbackStr+'&_noCacheIE=' + (new Date()).getTime();

        //document.getElementsByTagName("head").item(0).removeChild(script);
        document.getElementsByTagName("head")[0].appendChild(script);

    },

    sendMessage : function(url){


        var script = document.createElement("script");
        // Add script object attributes
        script.type     = "text/javascript";
        script.charset  = "utf-8";
        script.id       = this.getHashCode(url);

        if (script.readyState){  //IE
            script.onreadystatechange = function(){
                if (script.readyState == "loaded" ||
                        script.readyState == "complete"){
                    //script.onreadystatechange = null;
                    //document.getElementsByTagName("head").item(0).removeChild(script);
                }
            };
        } else {  //Others
            script.onload = function(){
               //document.getElementsByTagName("head").item(0).removeChild(script);
            };
        }
        script.src = url + '&_noCacheIE=' + (new Date()).getTime();
        document.getElementsByTagName("head")[0].appendChild(script);

    }

};


var SODABOX_window = {
    
    rootDivName     : '',
    imageServer     : '',
    textareaHeight  : -1,

    isLogined       : false,
    cntNotLogined   : 0,
    cntLogined      : 0,
    
    hasClass : function(ele, cls) {
        return ele.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
    },
    addClass : function(ele, cls) {
        if (!this.hasClass(ele, cls)) ele.className += " " + cls;
    },
    removeClass : function(ele, cls) {
        if (this.hasClass(ele, cls)) {
            var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
            ele.className = ele.className.replace(reg, ' ');
        }
    },
    replaceClass : function(ele, oldClass, newClass){
        if(this.hasClass(ele, oldClass)){
            this.removeClass(ele, oldClass);
            this.addClass(ele, newClass);
        }
        return;
    },
    toggleClass : function(ele, cls1, cls2){
        if(this.hasClass(ele, cls1)){
            this.replaceClass(ele, cls1, cls2);
        }else if(this.hasClass(ele, cls2)){
            this.replaceClass(ele, cls2, cls1);
        }else{
            this.addClass(ele, cls1);
        }
    },
    
    initWin : function(rootDivName, imageServer){
        
        this.rootDivName = rootDivName;
        this.imageServer = imageServer;
        
        var div_root = document.getElementById(rootDivName);

        if(div_root === null){
            div_root = document.createElement('div');
            div_root.id = rootDivName;
            this.addClass(div_root, "sodabox");
            document.getElementsByTagName('body')[0].appendChild(div_root);
        }

        div_root.innerHTML = 
            '<div id="'+rootDivName+'_head" class="sodabox_head" onclick="javascript:return SODABOX_window.toggleChatBoxGrowth();" >'+
                '<div id="'+rootDivName+'_title" class="sodabox_title"></div>'+
                //'<div id="'+rootDivName+'_options" class="sodabox_options"><img src="'+this.imageServer+'/images/new-icon.png" ></div>'+
                //'<div id="'+rootDivName+'_options" class="sodabox_options"><a href="javascript:void(0)" onclick="javascript:return SODABOX_window.toggleChatBoxGrowth()">▣</a></div>'+
                //'<br clear="all"/>'+
            '</div>'+
            '<div id="'+rootDivName+'_content" class="sodabox_content"></div>'+
            '<div id="'+rootDivName+'_login" class="sodabox_input">&nbsp;&nbsp;Sign In with '+
                '<a href="#" alt="If you would like to chat, sign in with Facebook or Twitter" onclick="return !window.open(SODABOX.getOauthUrl(\'facebook\'),\'SODABOX_OAUTH\',\'menubar=no,location=no,resizable=yes,scrollbars=yes,status=yes,width=800,height=450\')" target="_blank"><img src="'+this.imageServer+'/images/facebook.png"  alt="If you would like to chat, sign in with Facebook or Twitter" style="cursor:pointer;" /></a>&nbsp;or&nbsp;'+
                '<a href="#" alt="If you would like to chat, sign in with Facebook or Twitter" onclick="return !window.open(SODABOX.getOauthUrl(\'twitter\'),\'SODABOX_OAUTH\',\'menubar=no,location=no,resizable=yes,scrollbars=yes,status=yes,width=800,height=450\')" target="_blank"><img src="'+this.imageServer+'/images/twitter.png"  alt="If you would like to chat, sign in with Facebook or Twitter" style="cursor:pointer;" /></a>&nbsp;to chat with each other'+
            '</div>' +
            '<div id="'+rootDivName+'_input" class="sodabox_input"><textarea id="'+rootDivName+'_textarea" class="sodabox_textarea" onkeydown="javascript:return SODABOX_window.inputChatMessage(event,this);" ></textarea></div>';
        div_root.style.bottom = '0px';
        div_root.style.right = '20px';

        textareaHeight = document.getElementById(rootDivName+'_textarea').style.height
        //var div_head = document.getElementById(rootDivName+'_head');
        var div_content = document.getElementById(rootDivName+'_content');
        var div_login = document.getElementById(rootDivName+'_login');
        var div_input = document.getElementById(rootDivName+'_input');
        
        div_content.style.display = 'none';
        div_login.style.display = 'none';
        div_input.style.display = 'none';
        
        div_root.onclick = function(){
            
            if(div_content.style.display != 'none'){
                
                if(div_input.style.display  != 'none'){

                    var div_textarea = document.getElementById(rootDivName+'_textarea');
                    div_textarea.focus();
                    div_textarea.value = div_textarea.value;
                }
            }
        }; 
        
        //div_root.style.display = 'block';
        div_root.style.display = 'none';

    },

    showRootDiv : function(isShow) {
        var div_root = document.getElementById(this.rootDivName);
        if(isShow){
            div_root.style.display = 'block';
        }else{
            div_root.style.display = 'none';
        }
    },
    
    inputChatMessage : function(event,chatboxtextarea) {
     
        if(event.keyCode == 13 && !event.shiftKey) {
            
            if(event.preventDefault) {
                event.preventDefault();   
            }else{
                event.returnValue = false;
            }

            var message = chatboxtextarea.value;
            message = message.replace(/^\s+|\s+$/g,"");
            
            if(message.length > 0){
                if(message == '#logout' || message == '/logout'){
                    SODABOX.logout();
                }else{
                    SODABOX.sendMessage(encodeURIComponent(message));
                }
                    
                chatboxtextarea.value = '';
                //chatboxtextarea.focus();
                chatboxtextarea.style.height = '30px';                    

	            return false;
        	}
        }
        
        var adjustedHeight = chatboxtextarea.clientHeight;
        var maxHeight = 94;
        
        if (maxHeight > adjustedHeight) {
        adjustedHeight = Math.max(chatboxtextarea.scrollHeight, adjustedHeight);
        if (maxHeight)
            adjustedHeight = Math.min(maxHeight, adjustedHeight);
        if (adjustedHeight > chatboxtextarea.clientHeight)
            chatboxtextarea.style.height = adjustedHeight+8 +'px';
        } else {
            chatboxtextarea.style.overflow = 'auto';
        }
    },


    
    setChatMessage : function(user, message){
        var div_content = document.getElementById(this.rootDivName+'_content');
        
        var chatDiv = document.createElement("div");
        this.addClass(chatDiv, 'sodabox_message');
        chatDiv.innerHTML = '<span class="sodabox_messagefrom"><a target="_blank" href="'+user.link+'" class="sodabox_userlink" alt="GO TO User Page!">'+user.name+'</a>:&nbsp;&nbsp;</span><span class="sodabox_messagecontent">'+message+'</span>&nbsp;&nbsp;&nbsp;<span class="sodabox_messagetime">'+this.getNowStr()+'</span>';
        
        div_content.appendChild(chatDiv);
        div_content.scrollTop = div_content.scrollHeight;

        if(document.getElementById(this.rootDivName+'_content').style.display != 'block'){
            document.getElementById(this.rootDivName+'_title').innerHTML = '<b>Online Users : '+(this.cntNotLogined + this.cntLogined)+'</b>&nbsp;&nbsp; < <i>new message</i> !! >';
        }

    },
    
    setSysMessage : function(message){
        
        var div_content = document.getElementById(this.rootDivName+'_content');
        
        var chatDiv = document.createElement("div");
        this.addClass(chatDiv, 'sodabox_message');
        chatDiv.innerHTML = '<span class="sodabox_systemcontent"> > '+message+'</span>';
        
        div_content.appendChild(chatDiv);
        div_content.scrollTop = div_content.scrollHeight;
        
    },
    
    toggleChatBoxGrowth : function() {

        var div_content = document.getElementById(this.rootDivName+'_content');

        if (div_content.style.display == 'none') {  

            div_content.style.display = 'block';
            if(this.isLogined){

                document.getElementById(this.rootDivName+'_login').style.display = 'none';
                document.getElementById(this.rootDivName+'_input').style.display = 'block';
            }else{

                document.getElementById(this.rootDivName+'_login').style.display = 'block';
                document.getElementById(this.rootDivName+'_input').style.display = 'none';
            }

        } else {

            div_content.style.display = 'none';
            document.getElementById(this.rootDivName+'_login').style.display = 'none';
            document.getElementById(this.rootDivName+'_input').style.display = 'none';
        }

        this.setTitleMessage();
       
    },

    setTitleMessage : function(){

        var str = '';

        if(document.getElementById(this.rootDivName+'_content').style.display == 'block'){
            str = 'Online Users : '+(this.cntNotLogined + this.cntLogined)+'&nbsp;&nbsp;&nbsp;( ' +this.cntLogined+' Logined )';
        }else{
            str = '<b>Online Users : '+(this.cntNotLogined + this.cntLogined)+'</b>';
        }

        var div_title = document.getElementById(this.rootDivName+'_title');
        div_title.innerHTML = str;
    },

    setTitleSysMessage : function(message){

        var div_title = document.getElementById(this.rootDivName+'_title');
        div_title.innerHTML = message;
    },
    
    logined : function(target){
        
        var div_login = document.getElementById(this.rootDivName+'_login');
        var div_input = document.getElementById(this.rootDivName+'_input');
        
        if(document.getElementById(this.rootDivName+'_content').style.display == 'block'){
            div_login.style.display = 'none';
            div_input.style.display = 'block';
        }else{
            div_login.style.display = 'none';
            div_input.style.display = 'none';    
        }
        
        this.isLogined = true;

        this.setSysMessage('You are just logined. Type "#logout" to logout');

    },

    logout : function(){
        
        var div_login = document.getElementById(this.rootDivName+'_login');
        var div_input = document.getElementById(this.rootDivName+'_input');
        
        if(document.getElementById(this.rootDivName+'_content').style.display == 'block'){
            div_login.style.display = 'block';
            div_input.style.display = 'none';
        }else{
            div_login.style.display = 'none';
            div_input.style.display = 'none';    
        }

        this.isLogined = false;

    },
    
    setUserUnfos : function(user, users){
        var str             = '';
        this.cntNotLogined   = 0;
        this.cntLogined      = 0;
        for(var cnt=0;cnt<users.length;cnt++){
            str = str +' '+ users[cnt].name;
            if(users[cnt].name == 'NONE'){
                this.cntNotLogined = this.cntNotLogined + 1;
            }else{
                this.cntLogined = this.cntLogined + 1;
            }
        }
        
        this.setTitleMessage();
    },

    getNowStr : function(){
        var currentTime = new Date();
        var hours = currentTime.getHours();
        var minutes = currentTime.getMinutes();

        if (minutes < 10){
            minutes = "0" + minutes;
        }
        var rtn = hours + ":" + minutes + " ";
        if(hours > 11){
            rtn = rtn + "PM";
        } else {
            rtn = rtn + "AM";
        }

        return rtn;
    }
    
    
};

////////////////////////////////////////////////////////////////////////////////
/////////////////// SODABOX Module /////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

var SODABOX = (function(DEF_VAR, UTILS, WIN) {

    /*** PRIAVTE AREA ***/

    // ########################## variables

    var _d      = {}; // urlApp / urlSocket / divName / isReady
    var _auth   = {}; // target / user(Object)
    var _socket;
    var _socketid;

    // ########################## Private functions

    /*
     * " OAuth " Processing
     * (public) SODABOX.openOAuthBox > SODABOX.callbackOAuthFacebook or SODABOX.callbackOAuthTwitter
     */

    var fn_tryOAuthProcess = function(strategy){
        UTILS.loadJson(_d.urlApp+'/user', 'SODABOX.callbackOAuth&_tryTarget='+strategy+'&SC='+_socketid+'&CN='+_d.channel);
    };

    var fn_callbackOAuth = function(data){

        if(data.isAuth){
            
            _auth.user = data.user;
            
            WIN.logined(data.user.target);
            
            _socket.emit('join', {
                UR : _auth.user,
                AU : _d.authkey,
                CN : _d.channel,
                MG : 'JOIN',
                r  : _d.range
            });

        }else{
            //window.open(_d.urlApp+'/auth/' + data.tryTarget,'SODABOX_OAUTH','menubar=no,location=no,resizable=yes,scrollbars=yes,status=yes,width=800,height=450');
            window.open(_d.urlApp+'/popupauth?_tryTarget='+data.tryTarget+'&SC='+_socketid+'&CN='+_d.channel,'SODABOX_OAUTH','menubar=no,location=no,resizable=yes,scrollbars=yes,status=yes,width=800,height=450');

        }

    };


    /*
     * " Init " Processing
     */
    var fn_init = function(){
    	//console.log(" # 1. init ");
        UTILS.loadJson(_d.urlApp+'/user', 'SODABOX.callbackInit');
    };

    var fn_callbackInit = function(data){

    	//console.log(" # 2. callbackInit \n\t"+JSON.stringify(data));
        
        WIN.initWin(_d.divName, _d.urlApp);
        
        if(data.isAuth){
            _auth.user = data.user;
            WIN.logined();
        }else{
            // is not logined !!!
        }
        
        // LS - socket.io
        
        WIN.setTitleSysMessage('now loading .....');
        UTILS.loadScript(_d.urlSocket+"/socket.io/socket.io.js", fn_callbackSocketCallback);
    };
    
    var fn_callbackSocketCallback = function(){

    	//console.log(" # 3. callbackSocketCallback \n\t"+_d.urlSocket);
        WIN.showRootDiv(true);

        WIN.setTitleSysMessage('connecting to Server.....');
        
        // setting socket connections !!!!

        _socket = io.connect(_d.urlSocket);

        _socket.on('connect', function () {

            //console.log(' > connected - '+JSON.stringify(_auth));

            WIN.setTitleSysMessage('connected');
            var u;
            if(_auth.user){
                u = _auth.user;
            }else{
                u = {
                    id : 'NONE',
                    name : 'NONE',
                    link : 'NONE'
                };
                
            }
            _socket.emit('join', {
                UR : u,
                AU : _d.authkey,
                CN : _d.channel,
                MG : 'JOIN',
                r  : _d.range
            });
        });

        _socket.on('join', function(msg) {
            _socketid = msg.socketId;
            WIN.setTitleSysMessage('');
        });
       
       
        _socket.on('S_MSG', function(msg) {
            //console.log(' [R] S_MSG : '+JSON.stringify(msg));
            if(msg.MG == 'IN'){
                
            }else if(msg.MG == 'OUT'){
                // WIN.setSysMessage('['+msg.UR.name+'] was exited');
            }else if(msg.MG == 'AUTH'){
	            _auth.user = msg._users;
                
                WIN.logined();
                
                _socket.emit('join', {
                    UR : _auth.user,
                    AU : _d.authkey,
                    CN : _d.channel,
                    MG : 'JOIN',
                    r  : _d.range
                });

            }
            
            WIN.setUserUnfos(msg.UR, msg._users);
            
        });
       
        _socket.on('M_MSG', function(msg) {
            //console.log(' [R] M_MSG : '+JSON.stringify(msg));
            WIN.setChatMessage(msg.UR, msg.MG);
        });

        _socket.on('extendMessage', function(data) {
            //console.log(' [R] extendMessage : '+data);
        });
       
    };


    var fn_sendMessage = function(message){
        UTILS.sendMessage(_d.urlApp+'/message?SC='+_socketid+'&r='+_d.range+'&MG='+message);
    };

    var fn_logout = function(){
        UTILS.loadJson(_d.urlApp+'/logoutAuth', 'SODABOX.callbackLogout');
    };

    var fn_callbackLogout = function(){
        WIN.logout();
    };

    /*** PUBLIC AREA (func) ***/
    return {

        // ## INIT ## //
        init: function(data) {

            if(_d.isReady) return false; // 무조건 하나만 생성될 수 있도록 한다.
            
            _d.isReady = true;

            _d.urlApp       = DEF_VAR._SODABOX_appurl;
            _d.urlSocket    = DEF_VAR._SODABOX_socketurl;
            _d.divName      = DEF_VAR._SODABOX_divName;
            _d.channel      = DEF_VAR._SODABOX_channel;
            _d.range        = DEF_VAR._SODABOX_range;

           if(data){
                if(data.appUrl)     _d.urlApp       = data.appUrl;
                if(data.socketUrl)  _d.urlSocket    = data.socketUrl;
                if(data.divName)    _d.divName      = data.divName;
                if(data.range)      _d.channel      = data.channel;
                if(data.appUrl)     _d.range        = data.range;
            }

            fn_init();
            

        },

        callbackInit : function(data){
            fn_callbackInit(data);
        },
        tryOAuth : function(target) {
            fn_tryOAuthProcess(target);
        },
        callbackOAuth : function(data){
            fn_callbackOAuth(data);
        },
        sendMessage : function(message){
            fn_sendMessage(message);
        },
        callbackSendMessage : function(data){
            
        },
        logout : function() {
            fn_logout();
        },
        callbackLogout : function() {
            fn_callbackLogout();
        },
        getOauthUrl : function(targetName){
            return _d.urlApp+'/popupauth?_tryTarget='+targetName+'&SC='+_socketid+'&CN='+_d.channel;
        }
      


    };

})(SODABOX_defaultInfo, SODABOX_utils, SODABOX_window); // 익명 함수를 바로 실행


