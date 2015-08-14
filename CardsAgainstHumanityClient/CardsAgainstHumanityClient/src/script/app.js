var GameSettings = (function () {
    function GameSettings() {
    }
    GameSettings.Server = "ws://localhost:4849/CardsAgaisntHumanity/server";
    GameSettings.AllowMulti = true;
    GameSettings.debugMode = true;
    return GameSettings;
})();
var MyEvent = (function () {
    function MyEvent() {
    }
    /**
     * 绑定事件到指定信号
     */
    MyEvent.bind = function (triggerName, target, thisObject) {
        if (!MyEvent.arr) {
            MyEvent.arr = [];
        }
        var eo = new EventObject(triggerName, target, thisObject);
        MyEvent.arr.push(eo);
    };
    /**
     * 解绑事件
     */
    MyEvent.unbind = function (triggerName, target) {
        if (target === void 0) { target = null; }
        if (!MyEvent.arr) {
            return;
        }
        if (target) {
            for (var i = 0; i < MyEvent.arr.length; i++) {
                if (MyEvent.arr[i].triggerName == triggerName && MyEvent.arr[i].target == target) {
                    MyEvent.arr.splice(i, 1);
                    break;
                }
            }
        }
        else {
            for (var i = 0; i < MyEvent.arr.length; i++) {
                if (MyEvent.arr[i].triggerName == triggerName) {
                    MyEvent.arr.splice(i, 1);
                    break;
                }
            }
        }
    };
    /**
     * 解绑信号所有事件
     */
    MyEvent.unbindAll = function (triggerName, target) {
        if (target === void 0) { target = null; }
        if (!MyEvent.arr) {
            return;
        }
        if (target) {
            for (var i = 0; i < MyEvent.arr.length; i++) {
                if (MyEvent.arr[i].triggerName == triggerName && MyEvent.arr[i].target == target) {
                    MyEvent.arr.splice(i, 1);
                    i--;
                }
            }
        }
        else {
            for (var i = 0; i < MyEvent.arr.length; i++) {
                if (MyEvent.arr[i].triggerName == triggerName) {
                    MyEvent.arr.splice(i, 1);
                    i--;
                }
            }
        }
    };
    /**
     * 调用事件
     */
    MyEvent.call = function (triggerName, data) {
        if (data === void 0) { data = null; }
        for (var i = 0; i < MyEvent.arr.length; i++) {
            if (MyEvent.arr[i].triggerName == triggerName) {
                MyEvent.arr[i].target(data, MyEvent.arr[i].thisObject);
            }
        }
    };
    return MyEvent;
})();
var EventObject = (function () {
    function EventObject(triggerName, target, thisObject) {
        this.triggerName = triggerName;
        this.target = target;
        this.thisObject = thisObject;
    }
    return EventObject;
})();
var Player = (function () {
    function Player() {
    }
    Player.prototype.getLevel = function () {
        var lvl = 1;
        while (this.getLevelExp(lvl) < this.exp) {
            lvl++;
        }
        return lvl;
    };
    Player.prototype.getNeedExp = function () {
        return Math.max(this.getLevelExp(this.getLevel()) - this.getLevelExp(this.getLevel() - 1), 0);
    };
    Player.prototype.getRemainExp = function () {
        return Math.max(this.exp - this.getLevelExp(this.getLevel() - 1), 0);
    };
    Player.prototype.getLevelExp = function (lvl) {
        if (lvl == 0)
            return 0;
        return 10 + Math.round(Math.pow((lvl - 1) * 1.3, 1.9) * 5);
    };
    return Player;
})();
var Room = (function () {
    function Room() {
    }
    return Room;
})();
var CardPack = (function () {
    function CardPack() {
    }
    return CardPack;
})();
var Util = (function () {
    function Util() {
    }
    Util.replaceAll = function (org, findStr, repStr) {
        var str = org;
        var index = 0;
        while (index <= str.length) {
            index = str.indexOf(findStr, index);
            if (index == -1) {
                break;
            }
            str = str.replace(findStr, repStr);
            index += repStr.length;
        }
        return str;
    };
    Util.getStringLen = function (str) {
        var i, len, code;
        if (str == null || str == "")
            return 0;
        len = str.length;
        for (i = 0; i < str.length; i++) {
            code = str.charCodeAt(i);
            if (code > 255) {
                len++;
            }
        }
        return len;
    };
    Util.convertPlayerData = function (data) {
        var p = new Player();
        p.pid = data.pid;
        p.name = data.name;
        p.exp = data.exp;
        p.state = data.state;
        p.credit = data.credit;
        p.fish = data.fish;
        return p;
    };
    Util.convertRoomData = function (data) {
        var r = new Room();
        r.id = data.id;
        r.roomname = data.name;
        r.playerCount = data.pc;
        r.spectatorCount = data.sc;
        r.password = data.pw;
        r.state = data.state;
        r.cardPacks = new Array();
        if (data.cp != null && data.cp != '') {
            var strs = data.cp.split(",");
            for (var i = 0; i < strs.length; i++) {
                var id = strs[i];
                for (var j = 0; j < Main.cardpacks.length; j++) {
                    if (Main.cardpacks[j].id == id) {
                        r.cardPacks.push(Main.cardpacks[j]);
                        alert(Main.cardpacks[j].name);
                    }
                }
            }
        }
        return r;
    };
    Util.safeString = function (text) {
        text = text.replace(/"/g, "\\\"");
        text = text.replace(/'/g, "\\'");
        text = text.replace(/\\/g, "\\\\");
        text = text.replace(/"/g, "\\\"");
        text = text.replace(/'/g, "\\'");
        text = text.replace(/\\/g, "\\\\");
        return text;
    };
    Util.showMessage = function (text) {
        MyEvent.call(Signal.TEXT, { text: text, pid: 0 });
    };
    return Util;
})();
var Server = (function () {
    function Server() {
        var _this = this;
        this.antiFlush = false;
        Server.instance = this;
        this.socket = new WebSocket(GameSettings.Server);
        this.socket.onopen = function (evt) { _this.onOpen(evt); };
        this.socket.onclose = function (evt) { _this.onClose(evt); };
        this.socket.onmessage = function (evt) { _this.onMessage(evt); };
        this.socket.onerror = function (evt) { _this.onError(evt); };
        setInterval(this.flush, 300, this);
    }
    Server.prototype.flush = function (_this1) {
        _this1.antiFlush = false;
    };
    /**
        * 成功连接到服务器事件
        */
    Server.prototype.onOpen = function (evt) {
        if (GameSettings.debugMode)
            console.log("成功连接到服务器.");
    };
    /**
        * 从服务器断开事件
        */
    Server.prototype.onClose = function (evt) {
        if (GameSettings.debugMode)
            console.log("已从服务器断开：" + evt.data);
        MyEvent.call('connectionclose', evt.data);
    };
    /**
        * 收到服务器信息事件
        */
    Server.prototype.onMessage = function (evt) {
        if (GameSettings.debugMode)
            console.log('接收到消息: ' + evt.data);
        Main.unfreezeMe();
        var data = MessageAnalysis.parseMessage(evt.data);
        switch (data.t) {
            case "flag":
                MyEvent.call(data.k);
                break;
            case "kv":
                MyEvent.call(data.k, data.v);
                break;
            default:
                MyEvent.call(data.t, data);
                break;
        }
    };
    /**
    * 发生错误事件
    */
    Server.prototype.onError = function (evt) {
        console.log('发生错误: ' + evt.data);
        MyEvent.call('connectionerror', evt.data);
    };
    /**
    * 发送信息至服务器事件
    */
    Server.prototype.send = function (data, isVital, isUser) {
        if (this.antiFlush && isUser) {
            MyEvent.call("text", { pid: 0, text: "您操作太快了！" });
            return;
        }
        this.antiFlush = true;
        if (isVital && Main.isFrozen()) {
            console.log('网络被堵塞');
            MyEvent.call("text", { pid: 0, text: "网络被堵塞，请稍后再试！" });
            return;
        }
        if (GameSettings.debugMode)
            console.log('发送消息: ' + data);
        this.socket.send(data);
        if (isVital)
            Main.freezeMe();
    };
    return Server;
})();
var PackageBuilder = (function () {
    function PackageBuilder() {
    }
    PackageBuilder.buildLoginPackage = function (username, password) {
        username = Util.safeString(username);
        var pack = '{"t":"login", "username":"' + username + '", "password":"' + password + '", "ip":"' + returnCitySN["cip"] + '"}';
        return pack;
    };
    PackageBuilder.buildTextPackage = function (text) {
        text = Util.safeString(text);
        var pack = '{"t":"text", "text":"' + text + '"}';
        return pack;
    };
    PackageBuilder.buildQuitPackage = function () {
        var pack = '{"t":"quit"}';
        return pack;
    };
    PackageBuilder.buildCreateRoomPackage = function () {
        var pack = '{"t":"createroom"}';
        return pack;
    };
    PackageBuilder.buildEnterRoomPackage = function (id) {
        var pack = '{"t":"enterroom", "id":"' + id + '"}';
        return pack;
    };
    PackageBuilder.buildReturnLobbyPackage = function () {
        var pack = '{"t":"returnlobby"}';
        return pack;
    };
    PackageBuilder.buildSwitchPlacePackage = function (place) {
        var pack = '{"t":"switch", "place":"' + place + '"}';
        return pack;
    };
    return PackageBuilder;
})();
var MessageAnalysis = (function () {
    function MessageAnalysis() {
    }
    MessageAnalysis.parseMessage = function (data) {
        return JSON.parse(data);
    };
    return MessageAnalysis;
})();
var State;
(function (State) {
    State[State["CONNECTING"] = 0] = "CONNECTING";
    State[State["CONNECTED"] = 1] = "CONNECTED";
    State[State["LOBBY"] = 2] = "LOBBY";
    State[State["PLAYING"] = 3] = "PLAYING";
})(State || (State = {}));
var Signal = (function () {
    function Signal() {
    }
    Signal.ServerInfo = "serverinfo";
    Signal.OnClickLogin = "OnClickLogin";
    Signal.LoginErr = "logerr";
    Signal.MyInfo = "myinfo";
    Signal.LobbyInfo = "lobbyinfo";
    Signal.PLAYERENTER = "playerenter";
    Signal.PLAYERLEAVE = "playerleave";
    Signal.TEXT = "text";
    Signal.SendText = "sendtext";
    Signal.RoomInfo = "roominfo";
    Signal.ONCLICKCREATEROOM = "ONCLICKCREATEROOM";
    Signal.ONCLICKROOM = "ONCLICKROOM";
    Signal.INFO = "info";
    Signal.DESTROYROOM = "destroyroom";
    Signal.ADDROOM = "addroom";
    Signal.OnClickLeave = "returnlobby";
    Signal.OnClickSwitchButton = "switchplace";
    Signal.OnPlayerSwitch = "onswitch";
    return Signal;
})();
var Main = (function () {
    function Main() {
    }
    Main.isFrozen = function () {
        return Main.freeze;
    };
    Main.freezeMe = function () {
        Main.freeze = true;
    };
    Main.unfreezeMe = function () {
        Main.freeze = false;
    };
    Main.prototype.start = function () {
        Main.me = new Player();
        Main.loginState = new LoginState();
        Main.lobbyState = new LobbyState();
        Main.playState = new PlayState();
        Main.loginState.start();
        MyEvent.bind(Signal.INFO, this.onReceiveInfo, this);
    };
    Main.prototype.onReceiveInfo = function (data, _this) {
        switch (data.k) {
            case "cp":
                Main.cardpacks = new Array();
                for (var i = 0; i < data.cp.length; i++) {
                    var cp = new CardPack();
                    cp.id = data.cp[i].id;
                    cp.name = data.cp[i].name;
                    cp.level = data.cp[i].lv;
                    Main.cardpacks.push(cp);
                }
                break;
        }
    };
    Main.freeze = false;
    return Main;
})();
var LoginState = (function () {
    function LoginState() {
        this.ass = "ass";
        this.loginable = false;
    }
    LoginState.prototype.start = function () {
        Main.server = new Server();
        Main.state = State.CONNECTING;
        this.showLoginPage();
    };
    LoginState.prototype.bindEvents = function () {
        MyEvent.bind(Signal.ServerInfo, this.onCanLogin, this);
        MyEvent.bind(Signal.OnClickLogin, this.onLogin, this);
        MyEvent.bind(Signal.LoginErr, this.onLoginErr, this);
        MyEvent.bind(Signal.MyInfo, this.onShowLobbyPage, this);
        MyEvent.bind(Signal.LobbyInfo, this.onShowLobbyInfo, this);
        jQuery(".loginArea #submit").tapOrClick(this.onClickLogin);
    };
    LoginState.prototype.unbindEvents = function () {
        MyEvent.unbind(Signal.ServerInfo, this.onCanLogin);
        MyEvent.unbind(Signal.OnClickLogin, this.onLogin);
        MyEvent.unbind(Signal.LoginErr, this.onLoginErr);
        MyEvent.unbind(Signal.MyInfo, this.onShowLobbyPage);
        MyEvent.unbind(Signal.LobbyInfo, this.onShowLobbyInfo);
    };
    LoginState.prototype.showLoginPage = function () {
        this.bindEvents();
        jQuery("#loginPage").show();
        LoginState.setLoginTip("正在连接服务器...");
        this.activateLoginArea(false);
    };
    LoginState.setLoginTip = function (tip) {
        jQuery("#logintip").html(tip);
    };
    LoginState.prototype.activateLoginArea = function (activate) {
        if (activate) {
            jQuery("#username").attr("disabled", false);
            jQuery("#password").attr("disabled", false);
        }
        else {
            jQuery("#username").attr("disabled", true);
            jQuery("#password").attr("disabled", true);
        }
    };
    LoginState.prototype.onCanLogin = function (data, thisObject) {
        Main.state = State.CONNECTED;
        var par = parseInt(data.players) / parseInt(data.max) * 100;
        jQuery("#onlineBar").css("width", par + "%");
        jQuery("#serverinfo").html(data.players + "/" + data.max);
        if (parseInt(data.players) < parseInt(data.max)) {
            LoginState.setLoginTip("请登录，如果该用户名没有注册过，则将自动为您注册(每个IP最多只能注册5个账号)。");
            thisObject.activateLoginArea(true);
            thisObject.loginable = true;
        }
    };
    LoginState.prototype.onClickLogin = function () {
        MyEvent.call(Signal.OnClickLogin);
    };
    LoginState.prototype.onLogin = function (data, thisObject) {
        if (!thisObject.loginable)
            return;
        var $username = document.getElementById("username");
        var $password = document.getElementById("password");
        var username = $username.value.trim();
        var password = $password.value.trim();
        if (Util.getStringLen(username) < 2) {
            LoginState.setLoginTip('您的用户名太短！请至少超过<s style="color:#999;">6cm</s>2个字符！');
            return;
        }
        else if (Util.getStringLen(username) > 20) {
            LoginState.setLoginTip('您的用户名太长！请确保用户名小于20个字符(中文算2个)');
            return;
        }
        else if (password.length < 4) {
            LoginState.setLoginTip('您的密码太短！请至少超过4个字符！');
            return;
        }
        else if (password.length > 20) {
            LoginState.setLoginTip('您的密码太长！');
            return;
        }
        else if (!LoginState.isUsernameLegal(username)) {
            LoginState.setLoginTip('您的用户名不合法！');
            return;
        }
        thisObject.sendLogin(username, password);
    };
    LoginState.prototype.sendLogin = function (username, password) {
        if (Main.state != State.CONNECTED)
            return;
        LoginState.setLoginTip('正在登录...');
        Server.instance.send(PackageBuilder.buildLoginPackage(username, password), true, true);
    };
    LoginState.isUsernameLegal = function (name) {
        return true;
    };
    LoginState.prototype.onLoginErr = function (data, _this) {
        if (data == 101) {
            LoginState.setLoginTip('您的输入似乎有问题……');
        }
        else if (data == 102) {
            LoginState.setLoginTip('该用户已被注册且您的密码输入错误。或您的注册已达上限！');
        }
        else if (data == 103) {
            LoginState.setLoginTip('无法登录，该用户已经在线了！');
        }
    };
    LoginState.prototype.onShowLobbyPage = function (data, thisObject) {
        jQuery("#loginPage").hide();
        Main.lobbyState.showLobbyPage(data);
    };
    LoginState.prototype.onShowLobbyInfo = function (data, thisObject) {
        Main.lobbyState.getLobbyInfo(data);
        thisObject.unbindEvents();
    };
    return LoginState;
})();
var LobbyState = (function () {
    function LobbyState() {
        this.canCreateRoom = false;
        this.canEnterRoom = false;
    }
    LobbyState.prototype.getPlayerByPid = function (pid) {
        var p = null;
        for (var i = 0; i < this.players.length; i++) {
            if (this.players[i].pid == pid) {
                p = this.players[i];
                break;
            }
        }
        return p;
    };
    LobbyState.prototype.clearLobbyPage = function () {
        jQuery("#roomArea").empty();
        jQuery("#chatArea #messages").empty();
        jQuery("#playersArea").empty();
    };
    LobbyState.prototype.showLobbyPage = function (myinfo) {
        this.clearLobbyPage();
        this.bindEvents();
        jQuery("#lobbyPage").show();
        this.clearChatArea();
        this.getMyInfo(myinfo);
        this.canCreateRoom = true;
        this.canEnterRoom = true;
    };
    LobbyState.prototype.returnToLobbyPage = function (data) {
        this.clearLobbyPage();
        this.bindEvents();
        jQuery("#lobbyPage").show();
        this.clearChatArea();
        this.canCreateRoom = true;
        this.canEnterRoom = true;
        this.getLobbyInfo(data);
    };
    LobbyState.prototype.bindEvents = function () {
        MyEvent.bind(Signal.PLAYERENTER, this.onPlayerEnter, this);
        MyEvent.bind(Signal.PLAYERLEAVE, this.onPlayerLeave, this);
        MyEvent.bind(Signal.TEXT, this.onReceiveText, this);
        MyEvent.bind(Signal.SendText, this.onSendText, this);
        MyEvent.bind(Signal.ONCLICKCREATEROOM, this.onClickCreateRoom, this);
        MyEvent.bind(Signal.RoomInfo, this.onReceiveRoomInfo, this);
        MyEvent.bind(Signal.DESTROYROOM, this.onDestroyRoom, this);
        MyEvent.bind(Signal.ADDROOM, this.onAddRoom, this);
        MyEvent.bind(Signal.ONCLICKROOM, this.onClickRoom, this);
        jQuery('#lobbyPage #inputArea #inputbox').keypress(function (event) {
            var keycode = (event.keyCode ? event.keyCode : event.which);
            if (keycode == '13') {
                MyEvent.call(Signal.SendText);
            }
        });
        jQuery('#lobbyPage #inputArea #submit').tapOrClick(function (event) {
            MyEvent.call(Signal.SendText);
        });
        jQuery("#settingsArea #createRoom").tapOrClick(function () { MyEvent.call(Signal.ONCLICKCREATEROOM); });
    };
    LobbyState.prototype.unbindEvents = function () {
        MyEvent.unbind(Signal.PLAYERENTER, this.onPlayerEnter);
        MyEvent.unbind(Signal.PLAYERLEAVE, this.onPlayerLeave);
        MyEvent.unbind(Signal.TEXT, this.onReceiveText);
        MyEvent.unbind(Signal.SendText, this.onSendText);
        MyEvent.unbind(Signal.ONCLICKCREATEROOM, this.onClickCreateRoom);
        MyEvent.unbind(Signal.RoomInfo, this.onReceiveRoomInfo);
        MyEvent.unbind(Signal.DESTROYROOM, this.onDestroyRoom);
        MyEvent.unbind(Signal.ADDROOM, this.onAddRoom);
        MyEvent.unbind(Signal.ONCLICKROOM, this.onClickRoom);
    };
    LobbyState.prototype.onSendText = function () {
        var $text = jQuery("#lobbyPage #inputArea #inputbox")[0];
        var text = $text.value.trim();
        if (text == null || text.length == 0 || text.length > 200)
            return;
        Server.instance.send(PackageBuilder.buildTextPackage(text), true, true);
        $text.value = "";
    };
    LobbyState.prototype.getMyInfo = function (data) {
        this.updateMyInfo(data);
    };
    LobbyState.prototype.onClickCreateRoom = function (data, _this) {
        if (!_this.canCreateRoom) {
            Util.showMessage("您现在不能创建房间！");
            return;
        }
        Server.instance.send(PackageBuilder.buildCreateRoomPackage(), true, true);
        _this.canCreateRoom = false;
    };
    LobbyState.prototype.getLobbyInfo = function (data) {
        this.players = new Array();
        Main.state = State.LOBBY;
        for (var i = 0; i < data.players.length; i++) {
            this.addOnePlayer(Util.convertPlayerData(data.players[i]));
        }
        this.updatePlayerList();
        this.rooms = new Array();
        for (var i = 0; i < data.rooms.length; i++) {
            this.addOneRoom(Util.convertRoomData(data.rooms[i]));
        }
    };
    LobbyState.prototype.onReceiveText = function (data, _this) {
        var pid = parseInt(data.pid);
        var speakerName = "Unknow";
        if (isNaN(data.pid)) {
            speakerName = data.pid;
        }
        else if (pid == 0) {
            speakerName = "系统";
        }
        else {
            var p = _this.getPlayerByPid(pid);
            if (p != null)
                speakerName = p.name;
        }
        var text = data.text;
        if (pid == 0)
            jQuery("#chatArea #messages").append('<div id="entry"><label id="server">[' + speakerName + ']' + text + '</label></div>');
        else
            jQuery("#chatArea #messages").append('<div id="entry"><label id="name">[' + speakerName + ']</label><label id="content">' + text + '</label></div>');
        jQuery("#chatArea #messages")[0].scrollTop = jQuery("#chatArea #messages")[0].scrollHeight;
    };
    LobbyState.prototype.clearChatArea = function () {
        jQuery("#chatArea #messages").empty();
    };
    LobbyState.prototype.updateMyInfo = function (data) {
        Main.me = Util.convertPlayerData(data.info[0]);
        var level = Main.me.getLevel();
        var remainExp = Main.me.getRemainExp();
        var needExp = Main.me.getNeedExp();
        jQuery("#statArea #nameTag").html(Main.me.name);
        jQuery("#statArea #nameTag").attr("title", "pid:" + Main.me.pid);
        jQuery("#statArea #level").html("Lv." + level);
        jQuery("#statArea #levelBarExp").html(remainExp + "/" + needExp);
        jQuery("#statArea #credit #content").html(Main.me.credit);
        jQuery("#statArea #fish #content").html(Main.me.fish);
        jQuery("#statArea #levelBarBack").css("width", (remainExp / needExp * 100) + "%");
    };
    LobbyState.prototype.onClickRoom = function (data, _this) {
        if (!_this.canEnterRoom) {
            Util.showMessage("您现在不能进入房间！");
            return;
        }
        var room = null;
        for (var i = 0; i < _this.rooms.length; i++) {
            if (_this.rooms[i].id == data) {
                room = _this.rooms[i];
            }
        }
        if (room == null) {
            Util.showMessage("房间不存在！");
            return;
        }
        if (room.playerCount < 8 || room.spectatorCount < 16) {
            this.canEnterRoom = false;
            Server.instance.send(PackageBuilder.buildEnterRoomPackage(data), true, true);
        }
        else {
            Util.showMessage("该房间已满！");
        }
    };
    LobbyState.prototype.onPlayerEnter = function (data, _this) {
        var p = Util.convertPlayerData(data.player[0]);
        MyEvent.call(Signal.TEXT, { text: p.name + " 进入了大厅", pid: 0 });
        if (data.player[0].pid == Main.me.pid)
            return;
        _this.addOnePlayer(p);
    };
    LobbyState.prototype.onPlayerLeave = function (data, _this) {
        var p = _this.getPlayerByPid(data.pid);
        if (p != null) {
            MyEvent.call(Signal.TEXT, { text: p.name + " 离开了大厅", pid: 0 });
            _this.removeOnePlayer(p.pid);
        }
    };
    LobbyState.prototype.onAddRoom = function (data, _this) {
        var room = Util.convertRoomData(data.room[0]);
        _this.addOneRoom(room);
    };
    LobbyState.prototype.addOnePlayer = function (player) {
        this.players.push(player);
        this.updatePlayerList();
    };
    LobbyState.prototype.removeOnePlayer = function (pid) {
        var index = -1;
        for (var i = 0; i < this.players.length; i++) {
            if (this.players[i].pid == pid) {
                index = i;
                break;
            }
        }
        if (index != -1) {
            this.players.splice(index, 1);
            this.updatePlayerList();
        }
    };
    LobbyState.prototype.onDestroyRoom = function (data, _this) {
        _this.removeOneRoom(data);
    };
    LobbyState.prototype.addOneRoom = function (room) {
        var state = room.state == 0 ? "等待中" : "游戏中";
        var cp = "";
        for (var i = 0; i < room.cardPacks.length; i++) {
            cp = cp + '<div class="cardpack" id= "' + room.cardPacks[i].id + '">' + room.cardPacks[i].name + '</div>';
        }
        jQuery("#lobbyPage #roomArea").append('<div class="room" id="' + room.id + '"><div class="left"><div id="roomnum">' + (room.id < 10 ? '00' : (room.id < 100 ? '0' : '')) + room.id + '</div><div id= "desc">' + room.roomname + '</div></div><div class="middle"><div id="players">玩家:' + room.playerCount + '/8</div><div id= "spectors"> 观众:' + room.spectatorCount + '/16 </div><div id="stat">' + state + '</div></div><div id= "packsArea">' + cp + '</div></div>');
        jQuery("#lobbyPage .room[id=" + room.id + "]").tapOrClick(function () { MyEvent.call(Signal.ONCLICKROOM, room.id); });
        this.rooms.push(room);
    };
    LobbyState.prototype.removeOneRoom = function (id) {
        jQuery("#lobbyPage #roomArea .room[id=" + id + "]").remove();
        for (var i = 0; i < this.rooms.length; i++) {
            if (this.rooms[i].id == id) {
                this.rooms.splice(i, 1);
                break;
            }
        }
    };
    LobbyState.prototype.updatePlayerList = function () {
        var ele = jQuery("#lobbyPage #playersArea");
        ele.empty();
        for (var i = 0; i < this.players.length; i++) {
            ele.append('<div class="player" title="pid:' + this.players[i].pid + '" id="' + this.players[i].pid + '"><span id="level">Lv.' + this.players[i].getLevel() + '</span><span id="name">' + this.players[i].name + '</span></div>');
        }
    };
    LobbyState.prototype.onReceiveRoomInfo = function (data, _this) {
        jQuery("#lobbyPage").hide();
        Main.playState.showGamePage(data);
        _this.unbindEvents();
    };
    return LobbyState;
})();
var PlayState = (function () {
    function PlayState() {
        this.isPlayer = false;
        this.canReturnToLobby = false;
        this.canSwitch = false;
        this.players = new Array();
        this.spectators = new Array();
    }
    PlayState.prototype.showGamePage = function (data) {
        this.players = new Array();
        this.spectators = new Array();
        this.canReturnToLobby = true;
        this.canSwitch = true;
        this.bindEvents();
        this.clearGamePage();
        jQuery("#gamePage").show();
        this.showBlackCardArea();
        this.initRoomInfo(data);
        this.updateMyInfoDisplay();
        //jQuery(".settingsPage[id=gamestart]").show();
    };
    PlayState.prototype.initRoomInfo = function (data) {
        jQuery("#gamePage #roomnum").html(data.id);
        jQuery("#gamePage #roomname").html(data.name);
        for (var i = 0; i < data.players.length; i++) {
            var p = Util.convertPlayerData(data.players[i]);
            this.addOnePlayer(p, false);
            if (p.pid == Main.me.pid)
                this.isPlayer = true;
        }
        for (var i = 0; i < data.spectators.length; i++) {
            var p = Util.convertPlayerData(data.spectators[i]);
            this.addOnePlayer(p, true);
            if (p.pid == Main.me.pid)
                this.isPlayer = false;
        }
        if (this.isPlayer)
            jQuery("#settingsArea #spectate").html("观战");
        else
            jQuery("#settingsArea #spectate").html("加入");
    };
    PlayState.prototype.bindEvents = function () {
        MyEvent.bind(Signal.PLAYERENTER, this.onPlayerEnter, this);
        MyEvent.bind(Signal.PLAYERLEAVE, this.onPlayerLeave, this);
        MyEvent.bind(Signal.TEXT, this.onReceiveText, this);
        MyEvent.bind(Signal.SendText, this.onSendText, this);
        MyEvent.bind(Signal.OnClickLeave, this.onClickReturnLobby, this);
        MyEvent.bind(Signal.LobbyInfo, this.onReturnToLobby, this);
        MyEvent.bind(Signal.OnClickSwitchButton, this.onClickSwitchButton, this);
        MyEvent.bind(Signal.OnPlayerSwitch, this.onPlayerSwitch, this);
        jQuery('#gamePage #inputArea #inputbox').keypress(function (event) {
            var keycode = (event.keyCode ? event.keyCode : event.which);
            if (keycode == '13') {
                MyEvent.call(Signal.SendText);
            }
        });
        jQuery('#gamePage #inputArea #submit').tapOrClick(function (event) {
            MyEvent.call(Signal.SendText);
        });
        jQuery('#gamePage #leave').tapOrClick(function (event) {
            MyEvent.call(Signal.OnClickLeave);
        });
        jQuery('#gamePage #spectate').tapOrClick(function (event) {
            MyEvent.call(Signal.OnClickSwitchButton);
        });
    };
    PlayState.prototype.unbindEvents = function () {
        MyEvent.unbind(Signal.PLAYERENTER, this.onPlayerEnter);
        MyEvent.unbind(Signal.PLAYERLEAVE, this.onPlayerLeave);
        MyEvent.unbind(Signal.TEXT, this.onReceiveText);
        MyEvent.unbind(Signal.SendText, this.onSendText);
        MyEvent.unbind(Signal.OnClickLeave, this.onClickReturnLobby);
        MyEvent.unbind(Signal.LobbyInfo, this.onReturnToLobby);
        MyEvent.unbind(Signal.OnClickSwitchButton, this.onClickSwitchButton);
        MyEvent.unbind(Signal.OnPlayerSwitch, this.onPlayerSwitch);
    };
    PlayState.prototype.clearGamePage = function () {
        jQuery("#roominfo #roomnum").empty();
        jQuery("#roominfo #roomname").empty();
        jQuery("#roominfo #roomname").empty();
        jQuery("#blackCardArea #blackCard").empty();
        jQuery("#timerArea #timerFill").css("width", "0%");
        jQuery("#chatArea #messages").empty();
        jQuery("#tableArea #table").empty();
        jQuery("#handArea #hand").empty();
        jQuery("#rightArea #playerArea").empty();
        jQuery("#rightArea #spectateArea").empty();
    };
    PlayState.prototype.showHostSettings = function () {
        jQuery("#blackCardArea #blackCard").hide();
        jQuery("#blackCardArea #hostSettings").show();
    };
    PlayState.prototype.showBlackCardArea = function () {
        jQuery("#blackCardArea #blackCard").show();
        jQuery("#blackCardArea #hostSettings").hide();
    };
    PlayState.prototype.updateMyInfoDisplay = function () {
        var level = Main.me.getLevel();
        var remainExp = Main.me.getRemainExp();
        var needExp = Main.me.getNeedExp();
        jQuery("#gamePage #statArea #nameTag").html(Main.me.name);
        jQuery("#gamePage #statArea #nameTag").attr("title", "pid:" + Main.me.pid);
        jQuery("#gamePage #statArea #level").html("Lv." + level);
        jQuery("#gamePage #statArea #levelBarExp").html(remainExp + "/" + needExp);
        jQuery("#gamePage #statArea #credit #content").html(Main.me.credit);
        jQuery("#gamePage #statArea #fish #content").html(Main.me.fish);
        jQuery("#gamePage #statArea #levelBarBack").css("width", (remainExp / needExp * 100) + "%");
    };
    PlayState.prototype.updateMyInfo = function (data) {
        Main.me = Util.convertPlayerData(data.info[0]);
        this.updateMyInfoDisplay();
    };
    PlayState.prototype.getPlayerByPid = function (pid) {
        var p = null;
        for (var i = 0; i < this.players.length; i++) {
            if (this.players[i].pid == pid) {
                p = this.players[i];
                break;
            }
        }
        if (p == null) {
            for (var i = 0; i < this.spectators.length; i++) {
                if (this.spectators[i].pid == pid) {
                    p = this.spectators[i];
                    break;
                }
            }
        }
        return p;
    };
    PlayState.prototype.onPlayerEnter = function (data, _this) {
        var p = Util.convertPlayerData(data.player[0]);
        if (data.spectate == true || data.spectate == "true")
            MyEvent.call(Signal.TEXT, { text: p.name + " 前来贴窗", pid: 0 });
        else
            MyEvent.call(Signal.TEXT, { text: p.name + " 进入了房间", pid: 0 });
        if (data.player[0].pid == Main.me.pid)
            return;
        _this.addOnePlayer(p, data.spectate);
    };
    PlayState.prototype.onPlayerLeave = function (data, _this) {
        var p = _this.getPlayerByPid(data.pid);
        if (p != null) {
            MyEvent.call(Signal.TEXT, { text: p.name + " 离开了房间", pid: 0 });
            _this.removeOnePlayer(p.pid);
        }
    };
    PlayState.prototype.addOnePlayer = function (p, isSpector) {
        if (isSpector == true || isSpector == "true") {
            this.spectators.push(p);
        }
        else {
            this.players.push(p);
        }
        this.updatePlayerList();
    };
    PlayState.prototype.removeOnePlayer = function (pid) {
        var index = -1;
        for (var i = 0; i < this.players.length; i++) {
            if (this.players[i].pid == pid) {
                index = i;
                break;
            }
        }
        if (index != -1) {
            this.players.splice(index, 1);
            this.updatePlayerList();
        }
        else {
            for (var i = 0; i < this.spectators.length; i++) {
                if (this.spectators[i].pid == pid) {
                    index = i;
                    break;
                }
            }
            if (index != -1) {
                this.spectators.splice(index, 1);
                this.updatePlayerList();
            }
        }
    };
    PlayState.prototype.updatePlayerList = function () {
        var ele = jQuery("#gamePage #playerArea");
        var elesp = jQuery("#gamePage #spectateArea");
        ele.empty();
        elesp.empty();
        for (var i = 0; i < this.players.length; i++) {
            var p = this.players[i];
            ele.append('<div class="player" pid="' + p.pid + '"><div id= "name">' + p.name + '</div><div id= "level">Lv.' + p.getLevel() + '</div><div id= "score">' + 0 + '</div><div id= "title" class="czar">裁判</div></div>');
        }
        for (var i = 0; i < this.spectators.length; i++) {
            var p = this.spectators[i];
            elesp.append('<div class="player" pid="' + p.pid + '"><div id= "name">' + p.name + '</div></div>');
        }
    };
    PlayState.prototype.onReceiveText = function (data, _this) {
        var pid = parseInt(data.pid);
        var speakerName = "Unknow";
        if (isNaN(data.pid)) {
            speakerName = data.pid;
        }
        else if (pid == 0) {
            speakerName = "系统";
        }
        else {
            var p = _this.getPlayerByPid(pid);
            if (p != null)
                speakerName = p.name;
        }
        var text = data.text;
        if (pid == 0)
            jQuery("#chatArea #messages").append('<div id="entry"><label id="server">[' + speakerName + ']' + text + '</label></div>');
        else
            jQuery("#chatArea #messages").append('<div id="entry"><label id="name">[' + speakerName + ']</label><label id="content">' + text + '</label></div>');
        jQuery("#chatArea #messages")[0].scrollTop = jQuery("#chatArea #messages")[0].scrollHeight;
    };
    PlayState.prototype.onSendText = function (data, _this) {
        var $text = jQuery("#gamePage #inputArea #inputbox")[0];
        var text = $text.value.trim();
        if (text == null || text.length == 0 || text.length > 200)
            return;
        Server.instance.send(PackageBuilder.buildTextPackage(text), true, true);
        $text.value = "";
    };
    PlayState.prototype.onClickSwitchButton = function (data, _this) {
        if (!_this.canSwitch) {
            Util.showMessage("您现在不能更换座位！");
            return;
        }
        if (_this.isPlayer) {
            if (_this.spectators.length >= 16) {
                Util.showMessage("无法观战，观众已满！");
                return;
            }
        }
        else {
            if (_this.players.length >= 8) {
                Util.showMessage("无法加入，玩家已满！");
                return;
            }
        }
        _this.canSwitch = false;
        Server.instance.send(PackageBuilder.buildSwitchPlacePackage(_this.isPlayer ? 1 : 0), true, true);
    };
    PlayState.prototype.onPlayerSwitch = function (data, _this) {
        var id = data.pid;
        var place = data.place;
        var p = _this.getPlayerByPid(id);
        if (p == null)
            return;
        _this.removeOnePlayer(p.pid);
        _this.addOnePlayer(p, place == 1);
        if (place == 1) {
            Util.showMessage(p.name + "开始旁观");
        }
        else {
            Util.showMessage(p.name + "进入对局");
        }
        if (id == Main.me.pid) {
            _this.canSwitch = true;
            if (place == 0) {
                jQuery("#settingsArea #spectate").html("观战");
                _this.isPlayer = true;
            }
            else {
                jQuery("#settingsArea #spectate").html("加入");
                _this.isPlayer = false;
            }
        }
    };
    PlayState.prototype.onClickReturnLobby = function (data, _this) {
        if (!_this.canReturnToLobby) {
            Util.showMessage("无法退出");
            return;
        }
        Server.instance.send(PackageBuilder.buildReturnLobbyPackage(), true, true);
    };
    PlayState.prototype.onReturnToLobby = function (data, _this) {
        _this.unbindEvents();
        jQuery("#gamePage").hide();
        Main.lobbyState.returnToLobbyPage(data);
    };
    return PlayState;
})();
window.onload = function () {
    new Main().start();
};
//# sourceMappingURL=app.js.map