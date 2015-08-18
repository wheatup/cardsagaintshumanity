var GameSettings = (function () {
    function GameSettings() {
    }
    GameSettings.Server = "ws://localhost:4849/CardsAgaisntHumanity/server";
    GameSettings.AllowMulti = true;
    GameSettings.debugMode = true;
    GameSettings.help = "<br>/changepassword 更改密码<br>/where 查询玩家位置";
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
        return 5 + Math.round(Math.pow(lvl * 2.4, 1.7));
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
var WhiteCard = (function () {
    function WhiteCard() {
    }
    return WhiteCard;
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
    Util.convertWhiteCardData = function (data) {
        var card = new WhiteCard();
        card.cid = data.id;
        card.author = data.au;
        card.packName = Main.getPackName(data.cp);
        card.text = data.text;
        return card;
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
                    }
                }
            }
        }
        return r;
    };
    Util.safeString = function (text) {
        while (text.indexOf("\"") != -1) {
            text = text.replace('\"', "&quot;");
        }
        while (text.indexOf("<") != -1) {
            text = text.replace('<', "&lt;");
        }
        while (text.indexOf(">") != -1) {
            text = text.replace('>', "&gt;");
        }
        while (text.indexOf("\\") != -1) {
            text = text.replace('\\', "\\\\");
        }
        return text;
    };
    Util.convertChat = function (text) {
        if (text.match(/(https?:\/\/[\w\d%-_ /]*\.((jpg)|(png)|(bmp)|(gif)|(jpeg)))/))
            text = text.replace(/(https?:\/\/[\w\d%-_ /]*\.((jpg)|(png)|(bmp)|(gif)|(jpeg)))/, '<img src="$1" />');
        else if (text.match(/(https?:\/\/[\w\.\d%-_ /]+)/))
            text = text.replace(/(https?:\/\/[\w\d%-_ /]+)/, '<a href="$1" target="_blank">$1</a>');
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
        if ((this.antiFlush || Main.nextSendTime > new Date().getTime()) && isUser) {
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
        Main.nextSendTime = new Date().getTime() + 500;
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
        //if (text.substr(0,5) == "/help") {
        //    Util.showMessage(GameSettings.help);
        //    return;
        //}
        text = Util.safeString(text);
        var pack = '{"t":"text", "text":"' + text + '"}';
        return pack;
    };
    PackageBuilder.buildQuitPackage = function () {
        var pack = '{"t":"quit"}';
        return pack;
    };
    PackageBuilder.buildCreateRoomPackage = function (level, name, password, packs) {
        var pack = '{"t":"createroom","lv":"' + level + '","name":"' + name + '", "pw":"' + password + '","cp":"' + packs + '"}';
        return pack;
    };
    PackageBuilder.buildSetRoomPackage = function (level, name, password, packs) {
        var pack = '{"t":"setroom","lv":"' + level + '","name":"' + name + '", "pw":"' + password + '","cp":"' + packs + '"}';
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
    PackageBuilder.buildCreateCardPackage = function (cardType, cardPack, text) {
        text = Util.safeString(text);
        var pack = '{"t":"createcard", "cardType":"' + cardType + '", "cardPack":"' + cardPack + '", "text":"' + text + '"}';
        return pack;
    };
    PackageBuilder.buildCreateSugPackage = function (text) {
        text = Util.safeString(text);
        var pack = '{"t":"sug", "text":"' + text + '"}';
        return pack;
    };
    PackageBuilder.buildSendPendPackage = function (approve, reject) {
        var pack = '{"t":"pendover", "ap":"' + approve + '", "re":"' + reject + '"}';
        return pack;
    };
    PackageBuilder.buildKickPlayerPackage = function (pid) {
        var pack = '{"t":"hostkick", "pid":"' + pid + '"}';
        return pack;
    };
    PackageBuilder.buildStartGamePackage = function () {
        var pack = '{"t":"startgame"}';
        return pack;
    };
    PackageBuilder.buildPickCardPackage = function (card, round) {
        var pack = '{"t":"pick", "c":"' + card + '", "r":"' + round + '"}';
        return pack;
    };
    PackageBuilder.buildLetwinPackage = function (cid, round) {
        var pack = '{"t":"letwin", "cid":"' + cid + '", "r":"' + round + '"}';
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
    Signal.OnClickCloseSettings = "OnClickCloseSettings";
    Signal.OnClickCreateCard = "OnClickCreateCard";
    Signal.OnClickSendCard = "OnClickSendCard";
    Signal.OnClickSendSug = "OnClickSendSug";
    Signal.OnClickSendPend = "OnClickSendPend";
    Signal.OnSendCardCallback = "cardsended";
    Signal.PEND = "pend";
    Signal.HOST = "host";
    Signal.UNHOST = "unhost";
    Signal.OnClickRoomSetButton = "OnClickRoomSetButton";
    Signal.OnClickRoomSetButtonOK = "OnClickRoomSetButtonOK";
    Signal.KickPlayer = "KickPlayer";
    Signal.OnClickStartGame = "OnClickStartGame";
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
        MyEvent.bind(Signal.PEND, this.onReceivePendInfo, this);
        MyEvent.bind(Signal.INFO, this.onReceiveInfo, this);
        MyEvent.bind("uc", function (data, _this) { Util.showMessage("未知命令！"); }, this);
        MyEvent.bind("nc", function (data, _this) { Util.showMessage("您没有权限使用此命令！"); }, this);
        MyEvent.bind("ban", function (data, _this) { alert("您已被服务器Ban了!"); location.reload(true); }, this);
        MyEvent.bind("kick", function (data, _this) { alert("您已被请出游戏!"); location.reload(true); }, this);
        MyEvent.bind("quit", function (data, _this) { alert("服务器更新!"); location.reload(true); }, this);
        MyEvent.bind(Signal.MyInfo, this.onUpdateMyInfo, this);
        this.bindLocalEvent();
    };
    Main.prototype.bindLocalEvent = function () {
        MyEvent.bind(Signal.OnClickCloseSettings, Main.OnClickCloseSettings, this);
        MyEvent.bind(Signal.OnClickSendPend, Main.OnClickSendPend, this);
        jQuery(".settingsPage .title .closeButton").tapOrClick(function () { MyEvent.call(Signal.OnClickCloseSettings); });
        jQuery('#lobbyPage #inputArea #inputbox').keypress(function (event) {
            var keycode = (event.keyCode ? event.keyCode : event.which);
            if (keycode == '13') {
                MyEvent.call(Signal.SendText);
            }
        });
        jQuery('#lobbyPage #inputArea #submit').tapOrClick(function (event) {
            MyEvent.call(Signal.SendText);
        });
        jQuery('#gamePage #hostSettings #startGame').tapOrClick(function (event) {
            MyEvent.call(Signal.OnClickStartGame);
        });
        jQuery('#settingsArea #createRoom').tapOrClick(function (event) {
            jQuery("#createroom #roomtitle").val(Main.me.name + "的房间");
            jQuery("#createroom #roompassword").val("");
            jQuery("#createroom #cardpacks").empty();
            for (var i = 0; i < Main.cardpacks.length; i++) {
                if (Main.me.getLevel() >= Main.cardpacks[i].level)
                    jQuery("#createroom #cardpacks").append('<div><input type="checkbox" name="cp" value="' + Main.cardpacks[i].id + '" checked="checked" id="cp' + Main.cardpacks[i].id + '" /><label for="cp' + Main.cardpacks[i].id + '">' + Main.cardpacks[i].name + '</label></div>');
                else
                    jQuery("#createroom #cardpacks").append('<div><input type="checkbox" name="cp" title="将在' + Main.cardpacks[i].level + '级开放" value="' + Main.cardpacks[i].id + '" disabled="disabled" id="cp' + Main.cardpacks[i].id + '" /><label title="将在' + Main.cardpacks[i].level + '级开放" for="cp' + Main.cardpacks[i].id + '">' + Main.cardpacks[i].name + '</label></div>');
            }
            jQuery(".settingsPage[id=createroom]").show(0);
            jQuery("#wrapper").addClass("mask");
            jQuery("#mask").show();
        });
        jQuery("#settingsArea #createCard").tapOrClick(function () {
            jQuery(".settingsPage[id=createcard]").show(0);
            jQuery("#wrapper").addClass("mask");
            jQuery("#mask").show();
            jQuery("#createcard #cardpack").empty();
            for (var i = 0; i < Main.cardpacks.length; i++) {
                var cardPack = Main.cardpacks[i];
                if (i == 0)
                    jQuery("#createcard #cardpack").append('<option value="' + cardPack.id + '" selected="selected">' + cardPack.name + '</option>');
                else
                    jQuery("#createcard #cardpack").append('<option value="' + cardPack.id + '">' + cardPack.name + '</option>');
            }
        });
        jQuery("#settingsArea #suggest").tapOrClick(function () {
            jQuery(".settingsPage[id=sug]").show(0);
            jQuery("#wrapper").addClass("mask");
            jQuery("#mask").show();
        });
        jQuery("#setroom #submit").tapOrClick(function () {
            MyEvent.call(Signal.OnClickRoomSetButtonOK);
        });
        jQuery("#gamePage #settings").tapOrClick(function () {
            MyEvent.call(Signal.OnClickRoomSetButton);
        });
        jQuery("#createcard #submit").tapOrClick(function () { MyEvent.call(Signal.OnClickSendCard); });
        jQuery('#createroom #submit').tapOrClick(function (event) {
            MyEvent.call(Signal.ONCLICKCREATEROOM);
        });
        jQuery("#sug #submit").tapOrClick(function () { MyEvent.call(Signal.OnClickSendSug); });
        jQuery("#pend #submit").tapOrClick(function () { MyEvent.call(Signal.OnClickSendPend); });
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
    Main.sayByVoiceCard = function (text) {
        text = text.replace(new RegExp("(https?://[\w\.\d%-_/]+)"), "和谐");
        text = text.replace(new RegExp("((<.*>.*<.*/*.*>)|(<.*/*.*>))"), "和谐");
        var audio = document.getElementById("cardaudio");
        audio.src = 'http://tts.baidu.com/text2audio?lan=zh&pid=101&ie=UTF-8&text=' + encodeURI(text) + '&spd=6';
        audio.play();
    };
    Main.sayByVoicePlayer = function (text) {
        text = text.replace(new RegExp("(https?://[\w\.\d%-_/]+)"), "和谐");
        text = text.replace(new RegExp("((<.*>.*<.*/*.*>)|(<.*/*.*>))"), "和谐");
        var audio = document.getElementById("playeraudio");
        audio.src = 'http://tts.baidu.com/text2audio?lan=zh&pid=101&ie=UTF-8&text=' + encodeURI(text) + '&spd=6';
        audio.play();
    };
    Main.OnClickCloseSettings = function (data, _this) {
        jQuery(".settingsPage").hide();
        jQuery("#wrapper").removeClass("mask");
        jQuery("#mask").hide();
    };
    Main.OnClickSendPend = function (data, _this) {
        var approve = '';
        var reject = '';
        jQuery('#pend input:checkbox:checked').each(function (i) {
            if (0 == i) {
                approve = jQuery(this).val();
            }
            else {
                approve += ("," + jQuery(this).val());
            }
        });
        jQuery('#pend input:checkbox').not("input:checked").each(function (i) {
            if (0 == i) {
                reject = jQuery(this).val();
            }
            else {
                reject += ("," + jQuery(this).val());
            }
        });
        Server.instance.send(PackageBuilder.buildSendPendPackage(approve, reject), false, true);
        jQuery(".settingsPage").hide();
        jQuery("#wrapper").removeClass("mask");
        jQuery("#mask").hide();
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
                    cp.blackcount = data.cp[i].bc;
                    cp.whitecount = data.cp[i].wc;
                    Main.cardpacks.push(cp);
                }
                break;
        }
    };
    Main.getPackName = function (pid) {
        var name = '未知';
        for (var i = 0; i < Main.cardpacks.length; i++) {
            var cardPack = Main.cardpacks[i];
            if (pid == cardPack.id) {
                name = cardPack.name;
            }
        }
        return name;
    };
    Main.prototype.onReceivePendInfo = function (data, _this) {
        var datas = data.c;
        jQuery(".settingsPage[id=pend] #table").empty();
        jQuery(".settingsPage[id=pend]").show(0);
        jQuery("#wrapper").addClass("mask");
        jQuery("#mask").show();
        jQuery(".settingsPage[id=pend] #table").append('<tr><td>通过</td><td>作者</td><td>类型</td><td>卡包</td><td>内容</td></tr>');
        for (var i = 0; i < datas.length; i++) {
            var card = datas[i];
            jQuery(".settingsPage[id=pend] #table").append('<tr><td><input type="checkbox" value="' + card.id + '"/></td><td>' + card.pl + '</td><td>' + (card.ty == 0 ? "黑卡" : "白卡") + '</td><td>' + Main.getPackName(card.cp) + '</td><td>' + card.te + '</td></tr>');
        }
    };
    Main.prototype.onUpdateMyInfo = function (data, _this) {
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
    Main.isHost = false;
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
        MyEvent.bind(Signal.LobbyInfo, this.onShowLobbyInfo, this);
        jQuery(".loginArea #submit").tapOrClick(this.onClickLogin);
    };
    LoginState.prototype.unbindEvents = function () {
        MyEvent.unbind(Signal.ServerInfo, this.onCanLogin);
        MyEvent.unbind(Signal.OnClickLogin, this.onLogin);
        MyEvent.unbind(Signal.LoginErr, this.onLoginErr);
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
        else if (data == 104) {
            LoginState.setLoginTip('无法登录，该账号已被封禁！');
        }
        else if (data == 105) {
            LoginState.setLoginTip('无法登录，服务器已满！');
        }
    };
    LoginState.prototype.onShowLobbyInfo = function (data, thisObject) {
        jQuery("#loginPage").hide();
        Main.lobbyState.showLobbyPage(data);
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
    LobbyState.prototype.showLobbyPage = function (data) {
        this.clearLobbyPage();
        this.bindEvents();
        jQuery("#lobbyPage").show();
        this.clearChatArea();
        this.canCreateRoom = true;
        this.canEnterRoom = true;
        this.getLobbyInfo(data);
    };
    LobbyState.prototype.returnToLobbyPage = function (data) {
        this.clearLobbyPage();
        this.bindEvents();
        jQuery("#lobbyPage").show();
        this.clearChatArea();
        this.canCreateRoom = true;
        this.canEnterRoom = true;
        this.getLobbyInfo(data);
        Main.isHost = false;
    };
    LobbyState.prototype.bindEvents = function () {
        MyEvent.bind(Signal.PLAYERENTER, this.onPlayerEnter, this);
        MyEvent.bind(Signal.PLAYERLEAVE, this.onPlayerLeave, this);
        MyEvent.bind(Signal.TEXT, this.onReceiveText, this);
        MyEvent.bind(Signal.SendText, this.onSendText, this);
        MyEvent.bind(Signal.ONCLICKCREATEROOM, this.onClickCreateRoomConfirm, this);
        MyEvent.bind(Signal.RoomInfo, this.onReceiveRoomInfo, this);
        MyEvent.bind(Signal.DESTROYROOM, this.onDestroyRoom, this);
        MyEvent.bind(Signal.ADDROOM, this.onAddRoom, this);
        MyEvent.bind(Signal.ONCLICKROOM, this.onClickRoom, this);
        MyEvent.bind(Signal.OnClickSendCard, this.OnClickSendCard, this);
        MyEvent.bind(Signal.OnClickSendSug, this.OnClickSendSug, this);
        MyEvent.bind(Signal.OnSendCardCallback, this.onCardSended, this);
        MyEvent.bind("sri", this.onRoomChange, this);
    };
    LobbyState.prototype.unbindEvents = function () {
        MyEvent.unbindAll(Signal.PLAYERENTER, this.onPlayerEnter);
        MyEvent.unbindAll(Signal.PLAYERLEAVE, this.onPlayerLeave);
        MyEvent.unbindAll(Signal.TEXT, this.onReceiveText);
        MyEvent.unbindAll(Signal.SendText, this.onSendText);
        MyEvent.unbindAll(Signal.ONCLICKCREATEROOM, this.onClickCreateRoomConfirm);
        MyEvent.unbindAll(Signal.RoomInfo, this.onReceiveRoomInfo);
        MyEvent.unbindAll(Signal.DESTROYROOM, this.onDestroyRoom);
        MyEvent.unbindAll(Signal.ADDROOM, this.onAddRoom);
        MyEvent.unbindAll(Signal.ONCLICKROOM, this.onClickRoom);
        MyEvent.unbindAll(Signal.OnClickSendCard, this.OnClickSendCard);
        MyEvent.unbindAll(Signal.OnClickSendSug, this.OnClickSendSug);
        MyEvent.unbindAll(Signal.OnSendCardCallback, this.onCardSended);
        MyEvent.unbindAll("sri", this.onRoomChange);
    };
    LobbyState.prototype.onRoomChange = function (data, _this) {
        var room = Util.convertRoomData(data);
        for (var i = 0; i < _this.rooms.length; i++) {
            if (_this.rooms[i] != null) {
                if (_this.rooms[i].id == room.id) {
                    _this.rooms[i] = room;
                    break;
                }
            }
        }
        var state = (room.state == 0 ? "等待中" : "游戏中");
        if (room.password != null && room.password != "") {
            state += ",有密码";
        }
        var cp = "";
        for (var i = 0; i < room.cardPacks.length; i++) {
            cp = cp + '<div class="cardpack" id= "' + room.cardPacks[i].id + '">' + room.cardPacks[i].name + '</div>';
        }
        jQuery("#lobbyPage #roomArea .room[id=" + room.id + "] #desc").html(room.roomname);
        jQuery("#lobbyPage #roomArea .room[id=" + room.id + "] #players").html('玩家:' + room.playerCount + '/8');
        jQuery("#lobbyPage #roomArea .room[id=" + room.id + "] #spectors").html('观众:' + room.spectatorCount + '/16');
        jQuery("#lobbyPage #roomArea .room[id=" + room.id + "] #stat").html(state);
        jQuery("#lobbyPage #roomArea .room[id=" + room.id + "] #packsArea").html(cp);
    };
    LobbyState.prototype.onSendText = function () {
        var $text = jQuery("#lobbyPage #inputArea #inputbox")[0];
        var text = $text.value.trim();
        if (text == null || text.length == 0 || text.length > 200)
            return;
        Server.instance.send(PackageBuilder.buildTextPackage(text), true, true);
        $text.value = "";
    };
    LobbyState.prototype.onClickCreateRoomConfirm = function (data, _this) {
        if (!_this.canCreateRoom) {
            Util.showMessage("您现在不能创建房间！");
            return;
        }
        var name = jQuery("#createroom #roomtitle").val();
        var password = jQuery("#createroom #roompassword").val();
        var packs = "";
        var spCodesTemp = "";
        jQuery('#createroom input:checkbox[name=cp]:checked').each(function (i) {
            if (0 == i) {
                spCodesTemp = jQuery(this).val();
            }
            else {
                spCodesTemp += ("," + jQuery(this).val());
            }
        });
        Server.instance.send(PackageBuilder.buildCreateRoomPackage(Main.me.getLevel(), name, password, spCodesTemp), true, true);
        _this.canCreateRoom = false;
        jQuery(".settingsPage[id=createroom]").hide(0);
        jQuery("#wrapper").removeClass("mask");
        jQuery("#mask").hide();
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
        text = Util.convertChat(text);
        if (pid == 0)
            jQuery("#chatArea #messages").append('<div id="entry"><label id="server">[' + speakerName + ']' + text + '</label></div>');
        else
            jQuery("#chatArea #messages").append('<div id="entry"><label id="name">[' + speakerName + ']</label><label id="content">' + text + '</label></div>');
        jQuery("#chatArea #messages")[0].scrollTop = jQuery("#chatArea #messages")[0].scrollHeight;
    };
    LobbyState.prototype.clearChatArea = function () {
        jQuery("#chatArea #messages").empty();
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
        if (room.password != null && room.password != "") {
            var password = prompt("请输入房间密码", "");
            if (password != room.password) {
                Util.showMessage("密码错误");
                return;
            }
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
        if (room.password != null && room.password != "") {
            state += ",有密码";
        }
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
    LobbyState.prototype.OnClickSendSug = function (data, _this) {
        var time = new Date().getTime();
        if (time < parseInt(localStorage["lastSendTime"])) {
            Util.showMessage("技能冷却中，剩余时间:" + Math.round((parseInt(localStorage["lastSendTime"]) - time) / 1000) + "秒");
            Main.OnClickCloseSettings(null, null);
            return;
        }
        var text = jQuery("#sug #text").val();
        if (text == null || text.trim().length < 0) {
            alert("文字内容不能为空!");
            return;
        }
        Server.instance.send(PackageBuilder.buildCreateSugPackage(text), false, true);
        localStorage["lastSendTime"] = new Date().getTime() + 60000;
        Main.OnClickCloseSettings(null, null);
        jQuery("#sug #text").val("");
        Util.showMessage("您的意见已送出，感谢您的支持！");
    };
    LobbyState.prototype.OnClickSendCard = function (data, _this) {
        var time = new Date().getTime();
        if (time < parseInt(localStorage["lastSendTime"])) {
            Util.showMessage("技能冷却中，剩余时间:" + Math.round((parseInt(localStorage["lastSendTime"]) - time) / 1000) + "秒");
            Main.OnClickCloseSettings(null, null);
            return;
        }
        var cardType = jQuery('#createcard input[name="cardtype"]:checked').val();
        var cardPack = jQuery("#createcard #cardpack option:selected").val();
        var text = jQuery("#createcard #text").val();
        if (cardPack == 1 && Main.me.pid != 1) {
            Util.showMessage("您没有权限向此卡牌包添加卡牌，请选择其他卡牌包！");
            Main.OnClickCloseSettings(null, null);
            return;
        }
        if (text == null || text.trim().length < 0) {
            alert("卡牌内容不能为空!");
            return;
        }
        if (cardType == 1 && text.indexOf("%b") >= 0) {
            if (!confirm("您选择了提交白卡，但是内容却包含了黑卡横线占位符(%b)，确定继续提交吗？")) {
                return;
            }
        }
        Server.instance.send(PackageBuilder.buildCreateCardPackage(cardType, cardPack, text), true, true);
        localStorage["lastSendTime"] = new Date().getTime() + 60000;
        Main.OnClickCloseSettings(null, null);
        jQuery("#createcard #text").val("");
    };
    LobbyState.prototype.onCardSended = function (data, _this) {
        var total = data.to;
        var success = data.su;
        var repeat = data.re;
        var illegal = data.il;
        if (total == 0) {
            Util.showMessage("您的填写有误，此次提交作废！");
        }
        else if (success == 0) {
            Util.showMessage("您的卡牌提交失败，总数:" + total + "，成功:" + success + "，重复:" + repeat + "，失败:" + illegal + "。");
        }
        else {
            Util.showMessage("您的卡牌已提交审核，总数:" + total + "，成功:" + success + "，重复:" + repeat + "，失败:" + illegal + "，感谢您的支持！");
        }
    };
    return LobbyState;
})();
var PlayState = (function () {
    function PlayState() {
        this.isPlayer = false;
        this.canReturnToLobby = false;
        this.currentBlackCardBlanks = 1;
        this.selectedCards = [];
        this.currentRound = 0;
        this.czar = 0;
        this.isMeCzar = false;
        this.letwined = false;
        this.players = new Array();
        this.spectators = new Array();
    }
    PlayState.prototype.showGamePage = function (data) {
        this.clearTimer();
        this.clearHandCard();
        this.handCards = [];
        this.donePlayers = new Array();
        this.players = new Array();
        this.spectators = new Array();
        this.canReturnToLobby = true;
        this.bindEvents();
        this.clearGamePage();
        jQuery("#gamePage").show();
        this.showBlackCardArea();
        this.initRoomInfo(data);
        this.updateMyInfoDisplay();
        this.selectedCards = [];
        this.isMeCzar = false;
        jQuery("#czarmask").hide();
        //jQuery(".settingsPage[id=gamestart]").show();
    };
    PlayState.prototype.initRoomInfo = function (data) {
        jQuery("#gamePage #roomnum").html(data.id);
        jQuery("#gamePage #roomname").html(data.name);
        Main.currentRoom = Util.convertRoomData(data);
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
        this.checkGameStartButton();
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
        MyEvent.bind(Signal.OnClickRoomSetButton, this.onClickRoomSetButton, this);
        MyEvent.bind(Signal.OnClickRoomSetButtonOK, this.onClickRoomSetButtonOK, this);
        MyEvent.bind(Signal.HOST, this.setMeAsHost, this);
        MyEvent.bind(Signal.UNHOST, this.setMeAsNotHost, this);
        MyEvent.bind("sri", this.onRoomChange, this);
        MyEvent.bind("kicked", this.onKicked, this);
        MyEvent.bind(Signal.KickPlayer, this.onKickPlayer, this);
        MyEvent.bind(Signal.OnClickStartGame, this.onClickStartGame, this);
        MyEvent.bind("blackcard", this.onBlackCard, this);
        MyEvent.bind("whitecard", this.onWhiteCard, this);
        MyEvent.bind("pickcard", this.onPickCard, this);
        MyEvent.bind("preview", this.onPreview, this);
        MyEvent.bind("unpreview", this.onUnpreview, this);
        MyEvent.bind("czarpreview", this.onCzarPreview, this);
        MyEvent.bind("czarunpreview", this.onCzarUnpreview, this);
        MyEvent.bind("picked", this.onPlayerPicked, this);
        MyEvent.bind("judge", this.onJudge, this);
        MyEvent.bind("stop", this.onStopped, this);
        MyEvent.bind("letwin", this.onLetwin, this);
        MyEvent.bind("winner", this.onWinner, this);
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
        MyEvent.unbind(Signal.OnClickRoomSetButton, this.onClickRoomSetButton);
        MyEvent.unbind(Signal.OnClickRoomSetButtonOK, this.onClickRoomSetButtonOK);
        MyEvent.unbind(Signal.HOST, this.setMeAsHost);
        MyEvent.unbind(Signal.UNHOST, this.setMeAsNotHost);
        MyEvent.unbind("sri", this.onRoomChange);
        MyEvent.unbind("kicked", this.onKicked);
        MyEvent.unbind(Signal.KickPlayer, this.onKickPlayer);
        MyEvent.unbind(Signal.OnClickStartGame, this.onClickStartGame);
        MyEvent.unbind("blackcard", this.onBlackCard);
        MyEvent.unbind("whitecard", this.onWhiteCard);
        MyEvent.unbind("pickcard", this.onPickCard);
        MyEvent.unbind("preview", this.onPreview);
        MyEvent.unbind("unpreview", this.onUnpreview);
        MyEvent.unbind("czarpreview", this.onCzarPreview);
        MyEvent.unbind("czarunpreview", this.onCzarUnpreview);
        MyEvent.unbind("picked", this.onPlayerPicked);
        MyEvent.unbind("judge", this.onJudge);
        MyEvent.unbind("stop", this.onStopped);
        MyEvent.unbind("letwin", this.onLetwin);
        MyEvent.unbind("winner", this.onWinner);
    };
    PlayState.prototype.onClickStartGame = function (data, _this) {
        if (!Main.isHost) {
            Util.showMessage("只有房主才能这么做！");
            return;
        }
        if (Main.currentRoom.state != 0) {
            Util.showMessage("游戏已经开始了！");
            return;
        }
        Server.instance.send(PackageBuilder.buildStartGamePackage(), true, true);
    };
    PlayState.prototype.onKicked = function (data, _this) {
        if (data == "host") {
            _this.onClickReturnLobby(null, _this);
            Util.showMessage("您被房主踢出了房间！");
        }
        else {
            _this.onClickReturnLobby(null, _this);
            Util.showMessage("您由于连续3次没有被系统请出了房间！");
        }
    };
    PlayState.prototype.onKickPlayer = function (data, _this) {
        if (!Main.isHost)
            return;
        if (Main.me.pid == data) {
            return;
        }
        if (confirm("是否将该玩家踢出房间？")) {
            Server.instance.send(PackageBuilder.buildKickPlayerPackage(data), true, true);
        }
    };
    PlayState.prototype.onRoomChange = function (data, _this) {
        jQuery("#gamePage #roomnum").html(data.id);
        jQuery("#gamePage #roomname").html(data.name);
        Main.currentRoom = Util.convertRoomData(data);
    };
    PlayState.prototype.onClickRoomSetButton = function (data, _this) {
        jQuery(".settingsPage[id=setroom]").show(0);
        jQuery("#wrapper").addClass("mask");
        jQuery("#mask").show();
        if (Main.isHost) {
            if (Main.currentRoom.state == 0) {
                jQuery("#setroom #roomtitle").val(Main.currentRoom.roomname);
                jQuery("#setroom #roomtitle").removeAttr("disabled", "disabled");
                jQuery("#setroom #roompassword").val(Main.currentRoom.password);
                jQuery("#setroom #roompassword").removeAttr("disabled", "disabled");
                jQuery("#setroom #cardpacks").empty();
                for (var i = 0; i < Main.cardpacks.length; i++) {
                    var checked = false;
                    for (var j = 0; j < Main.currentRoom.cardPacks.length; j++) {
                        if (Main.cardpacks[i].id == Main.currentRoom.cardPacks[j].id) {
                            checked = true;
                            break;
                        }
                    }
                    if (Main.me.getLevel() >= Main.cardpacks[i].level)
                        jQuery("#setroom #cardpacks").append('<div><input type="checkbox" name="cp" value="' + Main.cardpacks[i].id + '" ' + (checked ? 'checked="checked"' : '') + ' id="cps' + Main.cardpacks[i].id + '" /><label for="cps' + Main.cardpacks[i].id + '">' + Main.cardpacks[i].name + '</label></div>');
                    else
                        jQuery("#setroom #cardpacks").append('<div><input type="checkbox" name="cp" title="将在' + Main.cardpacks[i].level + '级开放" value="' + Main.cardpacks[i].id + '" disabled="disabled" id="cps' + Main.cardpacks[i].id + '" /><label title="将在' + Main.cardpacks[i].level + '级开放" for="cps' + Main.cardpacks[i].id + '">' + Main.cardpacks[i].name + '</label></div>');
                }
            }
            else {
                jQuery("#setroom #roomtitle").val(Main.currentRoom.roomname);
                jQuery("#setroom #roomtitle").removeAttr("disabled", "disabled");
                jQuery("#setroom #roompassword").val(Main.currentRoom.password);
                jQuery("#setroom #roompassword").removeAttr("disabled", "disabled");
                jQuery("#setroom #cardpacks").empty();
                for (var i = 0; i < Main.cardpacks.length; i++) {
                    var checked = false;
                    for (var j = 0; j < Main.currentRoom.cardPacks.length; j++) {
                        if (Main.cardpacks[i].id == Main.currentRoom.cardPacks[j].id) {
                            checked = true;
                            break;
                        }
                    }
                    if (Main.me.getLevel() >= Main.cardpacks[i].level)
                        jQuery("#setroom #cardpacks").append('<div><input type="checkbox" name="cp" value="' + Main.cardpacks[i].id + '" ' + (checked ? 'checked="checked"' : '') + ' id="cps' + Main.cardpacks[i].id + '" disabled="disabled" /><label for="cp' + Main.cardpacks[i].id + '">' + Main.cardpacks[i].name + '</label></div>');
                    else
                        jQuery("#setroom #cardpacks").append('<div><input type="checkbox" name="cp" title="将在' + Main.cardpacks[i].level + '级开放" value="' + Main.cardpacks[i].id + '" disabled="disabled" id="cps' + Main.cardpacks[i].id + '" /><label title="将在' + Main.cardpacks[i].level + '级开放" for="cps' + Main.cardpacks[i].id + '">' + Main.cardpacks[i].name + '</label></div>');
                }
            }
        }
        else {
            jQuery("#setroom #roomtitle").val(Main.currentRoom.roomname);
            jQuery("#setroom #roomtitle").attr("disabled", "disabled");
            jQuery("#setroom #roompassword").val(Main.currentRoom.password);
            jQuery("#setroom #roompassword").attr("disabled", "disabled");
            jQuery("#setroom #cardpacks").empty();
            for (var i = 0; i < Main.cardpacks.length; i++) {
                var checked = false;
                for (var j = 0; j < Main.currentRoom.cardPacks.length; j++) {
                    if (Main.cardpacks[i].id == Main.currentRoom.cardPacks[j].id) {
                        checked = true;
                        break;
                    }
                }
                if (Main.me.getLevel() >= Main.cardpacks[i].level)
                    jQuery("#setroom #cardpacks").append('<div><input type="checkbox" name="cp" value="' + Main.cardpacks[i].id + '" ' + (checked ? 'checked="checked"' : '') + ' id="cps' + Main.cardpacks[i].id + '" disabled="disabled" /><label for="cps' + Main.cardpacks[i].id + '">' + Main.cardpacks[i].name + '</label></div>');
                else
                    jQuery("#setroom #cardpacks").append('<div><input type="checkbox" name="cp" title="将在' + Main.cardpacks[i].level + '级开放" value="' + Main.cardpacks[i].id + '" disabled="disabled" id="cps' + Main.cardpacks[i].id + '" /><label title="将在' + Main.cardpacks[i].level + '级开放" for="cps' + Main.cardpacks[i].id + '">' + Main.cardpacks[i].name + '</label></div>');
            }
        }
    };
    PlayState.prototype.onClickRoomSetButtonOK = function (data, _this) {
        jQuery(".settingsPage").hide();
        jQuery("#wrapper").removeClass("mask");
        jQuery("#mask").hide();
        var time = new Date().getTime();
        if (time < parseInt(localStorage["lastSendTime"])) {
            Util.showMessage("技能冷却中，剩余时间:" + Math.round((parseInt(localStorage["lastSendTime"]) - time) / 1000) + "秒");
            Main.OnClickCloseSettings(null, null);
            return;
        }
        if (!Main.isHost)
            return;
        var name = jQuery("#setroom #roomtitle").val();
        var password = jQuery("#setroom #roompassword").val();
        var spCodesTemp = "";
        var level = Main.me.getLevel();
        jQuery('#setroom input:checkbox[name=cp]:checked').each(function (i) {
            if (0 == i) {
                spCodesTemp = jQuery(this).val();
            }
            else {
                spCodesTemp += ("," + jQuery(this).val());
            }
        });
        Server.instance.send(PackageBuilder.buildSetRoomPackage(level, name, password, spCodesTemp), true, true);
        localStorage["lastSendTime"] = new Date().getTime() + 60000;
    };
    PlayState.prototype.clearGamePage = function () {
        this.clearTimer();
        this.clearHandCard();
        this.setMeAsNotCzar();
        this.handCards = [];
        this.canReturnToLobby = true;
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
    PlayState.prototype.setMeAsHost = function (data, _this) {
        Main.isHost = true;
        _this.checkGameStartButton();
    };
    PlayState.prototype.setMeAsNotHost = function (data, _this) {
        Main.isHost = false;
        _this.checkGameStartButton();
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
        p.score = 0;
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
            var done = false;
            for (var di = 0; di < this.donePlayers.length; di++) {
                if (this.donePlayers[di] == p.pid) {
                    done = true;
                    break;
                }
            }
            ele.append('<div class="player" pid="' + p.pid + '" pid="' + p.pid + '"><div id= "name" pid="' + p.pid + '">' + p.name + '</div><div id= "level" pid="' + p.pid + '">Lv.' + p.getLevel() + '</div><div id= "score" pid="' + p.pid + '">' + p.score + '</div>' + (this.czar == p.pid ? '<div id="title" class="czar" pid="' + p.pid + '">裁判</div>' : '') + ((done && Main.currentRoom.state == 2) ? '<div id="title" class="czar" pid="' + p.pid + '">完成</div>' : '') + '</div>');
            jQuery("#gamePage #playerArea .player[pid=" + p.pid + "]").tapOrClick(function (e) { MyEvent.call(Signal.KickPlayer, jQuery(e.target).attr("pid")); });
        }
        for (var i = 0; i < this.spectators.length; i++) {
            var p = this.spectators[i];
            elesp.append('<div class="player" pid="' + p.pid + '"><div id= "name">' + p.name + '</div></div>');
        }
        this.checkGameStartButton();
    };
    PlayState.prototype.checkGameStartButton = function () {
        if (Main.isHost && Main.currentRoom.state == 0) {
            if (this.players.length >= 3) {
                this.showGameStartButton();
            }
            else {
                this.hideGameStartButton();
            }
        }
    };
    PlayState.prototype.showGameStartButton = function () {
        jQuery("#gamePage #blackCard").hide();
        jQuery("#gamePage #hostSettings").show();
    };
    PlayState.prototype.hideGameStartButton = function () {
        jQuery("#gamePage #blackCard").show();
        jQuery("#gamePage #hostSettings").hide();
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
        text = Util.convertChat(text);
        if (pid == 0)
            jQuery("#chatArea #messages").append('<div id="entry"><label id="server">[' + speakerName + ']' + text + '</label></div>');
        else
            jQuery("#chatArea #messages").append('<div id="entry"><label id="name">[' + speakerName + ']</label><label id="content">' + text + '</label></div>');
        jQuery("#chatArea #messages")[1].scrollTop = jQuery("#chatArea #messages")[1].scrollHeight;
        if (pid != 0)
            Main.sayByVoicePlayer(text);
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
            _this.clearHandCard();
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
    PlayState.prototype.onBlackCard = function (data, _this) {
        Main.currentRoom.state = 1;
        _this.letwined = false;
        _this.hideGameStartButton();
        _this.currentBlackCardBlanks = parseInt(data.bl);
        _this.currentRound = parseInt(data.id);
        _this.czar = data.czar;
        Util.showMessage("第" + _this.currentRound + "轮游戏已开始，裁判是 " + _this.getPlayerByPid(data.czar).name);
        _this.setBlackCard(data.text, Main.getPackName(data.cp), data.au);
        _this.startTimer(20000 + _this.currentBlackCardBlanks * 5000);
        _this.updatePlayerList();
        _this.selectedCards = [];
        if (_this.czar == Main.me.pid) {
            _this.setMeAsCzar();
        }
        else {
            _this.setMeAsNotCzar();
        }
    };
    PlayState.prototype.clearBadges = function () {
        var ele = jQuery("#gamePage #playerArea");
        ele.empty();
        for (var i = 0; i < this.players.length; i++) {
            var p = this.players[i];
            ele.append('<div class="player" pid="' + p.pid + '" pid="' + p.pid + '"><div id= "name" pid="' + p.pid + '">' + p.name + '</div><div id= "level" pid="' + p.pid + '">Lv.' + p.getLevel() + '</div><div id= "score" pid="' + p.pid + '">' + p.score + '</div></div>');
            jQuery("#gamePage #playerArea .player[pid=" + p.pid + "]").tapOrClick(function (e) { MyEvent.call(Signal.KickPlayer, jQuery(e.target).attr("pid")); });
        }
    };
    PlayState.prototype.clearBadgesWithoutCzar = function () {
        var ele = jQuery("#gamePage #playerArea");
        ele.empty();
        for (var i = 0; i < this.players.length; i++) {
            var p = this.players[i];
            ele.append('<div class="player" pid="' + p.pid + '" pid="' + p.pid + '"><div id= "name" pid="' + p.pid + '">' + p.name + '</div><div id= "level" pid="' + p.pid + '">Lv.' + p.getLevel() + '</div><div id= "score" pid="' + p.pid + '">' + p.score + '</div>' + (this.czar == p.pid ? '<div id="title" class="czar" pid="' + p.pid + '">裁判</div>' : '') + '</div>');
            jQuery("#gamePage #playerArea .player[pid=" + p.pid + "]").tapOrClick(function (e) { MyEvent.call(Signal.KickPlayer, jQuery(e.target).attr("pid")); });
        }
    };
    PlayState.prototype.startTimer = function (time) {
        if (PlayState.interval != -1) {
            clearInterval(PlayState.interval);
        }
        PlayState.needTick = time / 50;
        PlayState.currentTick = 0;
        PlayState.interval = setInterval(this.tick, 50);
    };
    PlayState.prototype.clearTimer = function () {
        if (PlayState.interval != -1) {
            clearInterval(PlayState.interval);
        }
        jQuery("#gamePage #timerFill").css("width", "0%");
    };
    PlayState.prototype.tick = function () {
        PlayState.currentTick++;
        var per = (PlayState.currentTick / PlayState.needTick) * 100;
        per = 100 - per;
        if (per <= 0) {
            per = 0;
            clearInterval(PlayState.interval);
        }
        jQuery("#gamePage #timerFill").css("width", per + "%");
    };
    PlayState.prototype.setMeAsCzar = function () {
        this.isMeCzar = true;
        jQuery("#czarmask").show();
    };
    PlayState.prototype.setMeAsNotCzar = function () {
        this.isMeCzar = false;
        jQuery("#czarmask").hide();
    };
    PlayState.prototype.setBlackCard = function (text, pc, author) {
        this.currentBlackCardText = text;
        for (var i = 1; i <= 3; i++) {
            text = text.replace("%b", '<label class="blank" id="bc' + i + '">____</label>');
        }
        jQuery("#gamePage #blackCard").html('<div id="info">' + pc + ' 作者:' + author + '</div><div id="blackcardtext">' + Util.convertChat(text) + '</div>');
    };
    PlayState.prototype.setBlackCardText = function (text) {
        jQuery("#gamePage #blackcardtext").html(text);
    };
    PlayState.prototype.onWhiteCard = function (data, _this) {
        for (var i = 0; i < data.c.length; i++) {
            _this.handCards.push(Util.convertWhiteCardData(data.c[i]));
        }
        _this.updateHandCardDisplay();
    };
    PlayState.prototype.clearHandCard = function () {
        this.handCards = [];
        this.updateHandCardDisplay();
    };
    PlayState.prototype.updateHandCardDisplay = function () {
        jQuery("#gamePage #hand").empty();
        for (var i = 0; i < this.handCards.length; i++) {
            var card = this.handCards[i];
            jQuery("#gamePage #hand").append('<div title="卡牌包:' + card.packName + ' 作者:' + card.author + '" class="cards" cid="' + card.cid + '"><div id= "whitecard" cid="' + card.cid + '">' + Util.convertChat(card.text) + '</div></div>');
        }
        jQuery("#gamePage #hand .cards").tapOrClick(function (e) { MyEvent.call("pickcard", jQuery(e.target).attr("cid")); });
        jQuery("#gamePage #hand .cards").mouseover(function (e) { MyEvent.call("preview", jQuery(e.target).html()); });
        jQuery("#gamePage #hand .cards").mouseout(function (e) { MyEvent.call("unpreview", jQuery(e.target).html()); });
    };
    //currentBlackCardBlanks
    //selectedCards
    PlayState.prototype.onPickCard = function (data, _this) {
        if (_this.selectedCards.length >= _this.currentBlackCardBlanks) {
            return;
        }
        if (Main.currentRoom.state != 1) {
            Util.showMessage("您现在不能出牌！");
            return;
        }
        if (this.isMeCzar) {
            Util.showMessage("裁判不能出牌！");
            return;
        }
        _this.selectedCards[_this.selectedCards.length] = data;
        if (_this.selectedCards.length >= _this.currentBlackCardBlanks) {
            _this.sendPickCards();
        }
        jQuery("#gamePage #hand .cards[cid=" + data + "]").remove();
        jQuery("#gamePage .blank[id=bc" + _this.selectedCards.length + "]").html(jQuery("#gamePage #whitecard[cid=" + data + "]").html());
        jQuery("#gamePage .blank[id=bc" + _this.selectedCards.length + "]").addClass("preview");
    };
    PlayState.prototype.sendPickCards = function () {
        for (var i = 0; i < this.selectedCards.length; i++) {
            for (var j = 0; j < this.handCards.length; j++) {
                if (this.selectedCards[i] == this.handCards[j].cid) {
                    this.handCards.splice(j, 1);
                    break;
                }
            }
        }
        Server.instance.send(PackageBuilder.buildPickCardPackage(this.selectedCards, this.currentRound), true, true);
    };
    PlayState.prototype.onPreview = function (data, _this) {
        if (Main.currentRoom.state != 1)
            return;
        jQuery("#gamePage .blank[id=bc" + (_this.selectedCards.length + 1) + "]").html(data);
        jQuery("#gamePage .blank[id=bc" + (_this.selectedCards.length + 1) + "]").addClass("preview");
    };
    PlayState.prototype.onUnpreview = function (data, _this) {
        if (Main.currentRoom.state != 1)
            return;
        jQuery("#gamePage .blank[id=bc" + (_this.selectedCards.length + 1) + "]").html("____");
        jQuery("#gamePage .blank[id=bc" + (_this.selectedCards.length + 1) + "]").removeClass("preview");
    };
    PlayState.prototype.onCzarPreview = function (data, _this) {
        if (Main.currentRoom.state != 2)
            return;
        if (!_this.isMeCzar)
            return;
        var ids = data.split(",");
        var texts = [];
        for (var i = 0; i < ids.length; i++) {
            texts[i] = jQuery("#gamePage #table #whitecard[cnt=" + i + "]").html();
            jQuery("#gamePage .blank[id=bc" + (i + 1) + "]").html(texts[i]);
            jQuery("#gamePage .blank[id=bc" + (i + 1) + "]").addClass("preview");
        }
    };
    PlayState.prototype.onCzarUnpreview = function (data, _this) {
        if (Main.currentRoom.state != 2)
            return;
        if (!_this.isMeCzar)
            return;
        for (var i = 0; i < _this.currentBlackCardBlanks; i++) {
            jQuery("#gamePage .blank[id=bc" + (i + 1) + "]").html("____");
            jQuery("#gamePage .blank[id=bc" + (i + 1) + "]").removeClass("preview");
        }
    };
    PlayState.prototype.onPlayerPicked = function (data, _this) {
        _this.donePlayers.push(data);
        _this.updatePlayerList();
    };
    PlayState.prototype.onJudge = function (data, _this) {
        _this.startTimer(25000 + parseInt(data.bl) * 5000);
        _this.clearBadgesWithoutCzar();
        Main.currentRoom.state = 2;
        var ele = jQuery("#gamePage #table");
        ele.empty();
        var final = "";
        for (var i = 0; i < 7; i++) {
            console.log(i + ".");
            var cards = data["c" + i];
            if (cards == null || cards == undefined) {
                break;
            }
            console.log(i);
            var cid = "";
            for (var cnt = 0; cnt < parseInt(data.bl); cnt++) {
                if (cnt == data.bl - 1)
                    cid = cid + cards[cnt].id;
                else
                    cid = cid + cards[cnt].id + ",";
            }
            var cids = "";
            for (var cnt = 0; cnt < parseInt(data.bl); cnt++) {
                cids = cids + cards[cnt].id;
            }
            final = final + '<div id="pack' + data.bl + '" class="cards" cid="' + cid + '" cids="' + cids + '">';
            for (var j = 0; j < cards.length; j++) {
                final = final + '<div title="卡牌包：' + Main.getPackName(cards[j].cp) + ' 作者：' + cards[j].au + '" id="whitecard" cid="' + cid + '" cnt="' + j + '" cids="' + cids + '">' + Util.convertChat(cards[j].text) + '</div>';
            }
            final = final + '</div>';
        }
        ele.html(final);
        for (var i = 0; i < _this.currentBlackCardBlanks; i++) {
            jQuery("#gamePage .blank[id=bc" + (i + 1) + "]").html("____");
            jQuery("#gamePage .blank[id=bc" + (i + 1) + "]").removeClass("preview");
        }
        jQuery("#gamePage #table .cards").tapOrClick(function (e) { MyEvent.call("letwin", jQuery(e.target).attr("cid")); });
        jQuery("#gamePage #table .cards").mouseover(function (e) { MyEvent.call("czarpreview", jQuery(e.target).attr("cid")); });
        jQuery("#gamePage #table .cards").mouseout(function (e) { MyEvent.call("czarunpreview", jQuery(e.target).attr("cid")); });
    };
    PlayState.prototype.onLetwin = function (data, _this) {
        if (Main.currentRoom.state != 2)
            return;
        if (!_this.isMeCzar)
            return;
        if (_this.letwined)
            return;
        Server.instance.send(PackageBuilder.buildLetwinPackage(data, _this.currentRound), true, true);
        _this.letwined = true;
    };
    PlayState.prototype.onStopped = function (data, _this) {
        Main.currentRoom.state = 0;
        _this.clearGamePage();
        _this.updatePlayerList();
        _this.czar = 0;
    };
    PlayState.prototype.onWinner = function (data, _this) {
        Main.currentRoom.state = 3;
        var cids1 = "";
        var cids = data.cid.split(",");
        for (var i = 0; i < cids.length; i++) {
            cids1 = cids1 + cids[i];
        }
        _this.getPlayerByPid(data.pid).score += parseInt(data.add);
        _this.updatePlayerList();
        jQuery("#tableArea .cards[cids=" + cids1 + "] #whitecard").css("background-color", "#555");
        jQuery("#tableArea .cards[cids=" + cids1 + "] #whitecard").css("color", "white");
        jQuery("#tableArea .cards[cids=" + cids1 + "] #whitecard").css("border-color", "white");
        jQuery("#gamePage #playerArea .player[pid=" + data.pid + "]").append('<div id="title" class="czar" pid="' + data.pid + '">获胜</div>');
        if (data.combo == 1)
            Util.showMessage(_this.getPlayerByPid(data.pid).name + "获胜");
        else
            Util.showMessage(_this.getPlayerByPid(data.pid).name + " " + data.combo + "连胜，分数+" + data.add);
        var vocalText = _this.currentBlackCardText;
        var texts = [];
        for (var i = 0; i < cids.length; i++) {
            texts[i] = jQuery("#gamePage #table #whitecard[cnt=" + i + "]").html();
            jQuery("#gamePage .blank[id=bc" + (i + 1) + "]").html(texts[i]);
            jQuery("#gamePage .blank[id=bc" + (i + 1) + "]").addClass("preview");
            vocalText = vocalText.replace("%b", texts[i]);
        }
        Main.sayByVoiceCard(vocalText);
    };
    PlayState.needTick = 0;
    PlayState.currentTick = 0;
    PlayState.interval = -1;
    return PlayState;
})();
window.onload = function () {
    new Main().start();
};
//# sourceMappingURL=app.js.map