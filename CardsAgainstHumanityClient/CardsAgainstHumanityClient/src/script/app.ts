declare var jQuery;
declare var returnCitySN;

class GameSettings {
    public static Server: string = "ws://localhost:4849/CardsAgaisntHumanity/server";
    public static AllowMulti: boolean = true;
    public static debugMode: boolean = true;

    public static help: string = "<br>/changepassword 更改密码<br>/where 查询玩家位置";
}

class MyEvent {

    public static arr: Array<EventObject>;

	/**
	 * 绑定事件到指定信号
	 */
    public static bind(triggerName: string, target: Function, thisObject: any): void {
        if (!MyEvent.arr) {
            MyEvent.arr = [];
        }
        var eo = new EventObject(triggerName, target, thisObject);
        MyEvent.arr.push(eo);
    }

	/**
	 * 解绑事件
	 */
    public static unbind(triggerName: string, target: Function = null): void {
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
        } else {
            for (var i = 0; i < MyEvent.arr.length; i++) {
                if (MyEvent.arr[i].triggerName == triggerName) {
                    MyEvent.arr.splice(i, 1);
                    break;
                }
            }
        }
    }

	/**
	 * 解绑信号所有事件
	 */
    public static unbindAll(triggerName: string, target: Function = null): void {
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
        } else {
            for (var i = 0; i < MyEvent.arr.length; i++) {
                if (MyEvent.arr[i].triggerName == triggerName) {
                    MyEvent.arr.splice(i, 1);
                    i--;
                }
            }
        }
    }

	/**
	 * 调用事件
	 */
    public static call(triggerName: string, data: any = null): void {
        for (var i = 0; i < MyEvent.arr.length; i++) {
            if (MyEvent.arr[i].triggerName == triggerName) {
                MyEvent.arr[i].target(data, MyEvent.arr[i].thisObject);
            }
        }
    }
}

class EventObject {
    public triggerName: string;
    public target: Function;
    public thisObject: any;

    constructor(triggerName: string, target: Function, thisObject: any) {
        this.triggerName = triggerName;
        this.target = target;
        this.thisObject = thisObject;
    }
}

class Player {
    public pid: number;
    public name: string;
    public exp: number;
    public credit: number;
    public state: number;
    public fish: number;

    public getLevel(): number {
        var lvl: number = 1;
        while (this.getLevelExp(lvl) < this.exp) {
            lvl++;
        }
        return lvl;
    }

    public getNeedExp(): number {
        return Math.max(this.getLevelExp(this.getLevel()) - this.getLevelExp(this.getLevel() - 1), 0);
    }

    public getRemainExp(): number {
        return Math.max(this.exp - this.getLevelExp(this.getLevel() - 1), 0);
    }

    public getLevelExp(lvl: number): number {
        if (lvl == 0)
            return 0;
        return 5 + Math.round(Math.pow(lvl * 2.4, 1.7));
    }
}

class Room {
    public id: number;
    public roomname: string;
    public password: string;
    public playerCount: number;
    public spectatorCount: number;
    public state: number;
    public cardPacks: Array<CardPack>;
}

class CardPack {
    public id: number;
    public name: string;
    public level: number;
    public whitecount: number;
    public blackcount: number;
}

class WhiteCard {
	public cid: number;
	public text: string;
	public author: string;
	public packName: string;
}

class Util {
	public static replaceAll(org:string, findStr:string, repStr:string) {
		var str: string = org;
		var index: number = 0;
		while (index <= str.length) {
			index = str.indexOf(findStr, index);
			if (index == -1) {
				break;
			}
			str = str.replace(findStr, repStr);
			index += repStr.length;
		}
		return str;
    }

    public static getStringLen(str: string): number {
        var i, len, code;
        if (str == null || str == "") return 0;
        len = str.length;
        for (i = 0; i < str.length; i++) {
            code = str.charCodeAt(i);
            if (code > 255) { len++; }
        }
        return len;
    }

	public static convertPlayerData(data: any): Player {
		var p: Player = new Player();
		p.pid = data.pid;
		p.name = data.name;
		p.exp = data.exp;
		p.state = data.state;
		p.credit = data.credit;
        p.fish = data.fish;
		return p;
    }

	public static convertWhiteCardData(data: any): WhiteCard {
		var card: WhiteCard = new WhiteCard();
		card.cid = data.id;
		card.author = data.au;
		card.packName = Main.getPackName(data.cp);
		card.text = data.text;
		return card;
	}

    public static convertRoomData(data: any): Room {
        var r: Room = new Room();
        r.id = data.id;
        r.roomname = data.name;
        r.playerCount = data.pc;
        r.spectatorCount = data.sc;
        r.password = data.pw;
        r.state = data.state;
        r.cardPacks = new Array<CardPack>();
        if (data.cp != null && data.cp != '') {
            var strs = data.cp.split(",");
            for (var i: number = 0; i < strs.length; i++) {
                var id: number = strs[i];
                for (var j: number = 0; j < Main.cardpacks.length; j++) {
                    if (Main.cardpacks[j].id == id) {
                        r.cardPacks.push(Main.cardpacks[j]);
                        //alert(Main.cardpacks[j].name);
                    }
                }
            }
        }
        return r;
    }

    public static safeString(text: string): string {
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
    }

    public static convertChat(text: string): string {
        if (text.match(/(https?:\/\/[\w\d%-_ /]*\.((jpg)|(png)|(bmp)|(gif)|(jpeg)))/))
            text = text.replace(/(https?:\/\/[\w\d%-_ /]*\.((jpg)|(png)|(bmp)|(gif)|(jpeg)))/, '<img src="$1" />');
        else if (text.match(/(https?:\/\/[\w\.\d%-_ /]+)/))
            text = text.replace(/(https?:\/\/[\w\d%-_ /]+)/, '<a href="$1" target="_blank">$1</a>');
        return text;
    }

    public static showMessage(text: string): void {
        MyEvent.call(Signal.TEXT, { text: text, pid: 0 });
    }
}

class Server {
    public static instance: Server;
    public socket: WebSocket;

	private antiFlush: boolean = false;

    constructor() {
        Server.instance = this;
        this.socket = new WebSocket(GameSettings.Server);
        this.socket.onopen = (evt) => { this.onOpen(evt) };
        this.socket.onclose = (evt) => { this.onClose(evt) };
        this.socket.onmessage = (evt) => { this.onMessage(evt) };
        this.socket.onerror = (evt) => { this.onError(evt) };
		setInterval(this.flush, 300, this);
    }

	private flush(_this1: Server ): void {
		_this1.antiFlush = false;
	}

	/**
		* 成功连接到服务器事件
		*/
    onOpen(evt): void {
        if (GameSettings.debugMode)
            console.log("成功连接到服务器.");
    }

	/**
		* 从服务器断开事件
		*/
    onClose(evt): void {
        if (GameSettings.debugMode)
            console.log("已从服务器断开：" + evt.data);
        MyEvent.call('connectionclose', evt.data);
    }

	/**
		* 收到服务器信息事件
		*/
    onMessage(evt): void {
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
    }

	/**
	* 发生错误事件
	*/
    onError(evt): void {
        console.log('发生错误: ' + evt.data);
        MyEvent.call('connectionerror', evt.data);
    }

	/**
	* 发送信息至服务器事件
	*/
    send(data, isVital, isUser): void {
        if ((this.antiFlush || Main.nextSendTime > new Date().getTime()) && isUser) {
			MyEvent.call("text", { pid: 0, text: "您操作太快了！" });
			return;
		}
		
		this.antiFlush = true;
		if (isVital && Main.isFrozen()) {
			console.log('网络被堵塞');
			MyEvent.call("text", { pid:0, text:"网络被堵塞，请稍后再试！"});
			return;
		}

		if (GameSettings.debugMode)
            console.log('发送消息: ' + data);

        this.socket.send(data);

		if (isVital)
            Main.freezeMe();

        Main.nextSendTime = new Date().getTime() + 500;
    }
}

class PackageBuilder {
	public static buildLoginPackage(username: string, password: string): string {
		username = Util.safeString(username);
		var pack = '{"t":"login", "username":"' + username + '", "password":"' + password + '", "ip":"' + returnCitySN["cip"] + '"}';
		return pack;
	}

    public static buildTextPackage(text: string): string {
        //if (text.substr(0,5) == "/help") {
        //    Util.showMessage(GameSettings.help);
        //    return;
        //}

		text = Util.safeString(text);
		var pack = '{"t":"text", "text":"' + text + '"}';
		return pack;
	}

	public static buildQuitPackage(): string {
		var pack = '{"t":"quit"}';
		return pack;
    }

    public static buildCreateRoomPackage(level: number, name:string, password:string, packs:string): string {
        var pack = '{"t":"createroom","lv":"' + level + '","name":"' + name + '", "pw":"' + password + '","cp":"' + packs + '"}';
        return pack;
    }

    public static buildSetRoomPackage(level: number, name: string, password: string, packs: string): string {
        var pack = '{"t":"setroom","lv":"' + level + '","name":"' + name + '", "pw":"' + password + '","cp":"' + packs + '"}';
        return pack;
    }

    public static buildEnterRoomPackage(id: number): string {
        var pack = '{"t":"enterroom", "id":"' + id + '"}';
        return pack;
    }

    public static buildReturnLobbyPackage(): string {
        var pack = '{"t":"returnlobby"}';
        return pack;
    }

    public static buildSwitchPlacePackage(place: number): string {
        var pack = '{"t":"switch", "place":"' + place + '"}';
        return pack;
    }

    public static buildCreateCardPackage(cardType: number, cardPack: number, text: string): string {
        text = Util.safeString(text);
        var pack = '{"t":"createcard", "cardType":"' + cardType + '", "cardPack":"' + cardPack + '", "text":"' + text + '"}';
        return pack;
    }

    public static buildCreateSugPackage(text: string): string {
        text = Util.safeString(text);
        var pack = '{"t":"sug", "text":"' + text + '"}';
        return pack;
    }

    public static buildSendPendPackage(approve: string, reject: string): string {
        var pack = '{"t":"pendover", "ap":"' + approve + '", "re":"' + reject + '"}';
        return pack;
    }

	public static buildKickPlayerPackage(pid:number): string {
		var pack = '{"t":"hostkick", "pid":"' + pid + '"}';
        return pack;
	}

	public static buildStartGamePackage(): string {
		var pack = '{"t":"startgame"}';
        return pack;
	}

	public static buildPickCardPackage(card: string): string {
		var pack = '{"t":"pick", "c":"' + card + '"}';
        return pack;
	}

	public static buildPickWinnerPackage(winner: string): string {
		var pack = '{"t":"pick", "w":"' + winner + '"}';
        return pack;
	}
}

class MessageAnalysis {
    public static parseMessage(data): any {
        return JSON.parse(data);
    }
}

enum State {
    CONNECTING,
	CONNECTED,
    LOBBY,
    PLAYING
}

class Signal {
    public static ServerInfo: string = "serverinfo";
	public static OnClickLogin: string = "OnClickLogin";
	public static LoginErr: string = "logerr";
	public static MyInfo: string = "myinfo";
	public static LobbyInfo: string = "lobbyinfo";
	public static PLAYERENTER: string = "playerenter";
	public static PLAYERLEAVE: string = "playerleave";
	public static TEXT: string = "text";
    public static SendText: string = "sendtext";
    public static RoomInfo: string = "roominfo";
    public static ONCLICKCREATEROOM: string = "ONCLICKCREATEROOM";
    public static ONCLICKROOM: string = "ONCLICKROOM";
    public static INFO: string = "info";
    public static DESTROYROOM: string = "destroyroom";
    public static ADDROOM: string = "addroom";
    public static OnClickLeave: string = "returnlobby";
    public static OnClickSwitchButton: string = "switchplace";
    public static OnPlayerSwitch: string = "onswitch";
    public static OnClickCloseSettings: string = "OnClickCloseSettings";
    public static OnClickCreateCard: string = "OnClickCreateCard";
    public static OnClickSendCard: string = "OnClickSendCard";
    public static OnClickSendSug: string = "OnClickSendSug";
    public static OnClickSendPend: string = "OnClickSendPend";
    public static OnSendCardCallback: string = "cardsended";
    public static PEND: string = "pend";
    public static HOST: string = "host";
    public static UNHOST: string = "unhost";
    public static OnClickRoomSetButton: string = "OnClickRoomSetButton";
    public static OnClickRoomSetButtonOK: string = "OnClickRoomSetButtonOK";
    public static KickPlayer: string = "KickPlayer";
	public static OnClickStartGame: string = "OnClickStartGame";
}

class Main {
    public static cardpacks: Array<CardPack>;

    public static nextSendTime: number;

    public static server: Server;
    public static state: State;
    public static me: Player;
    public static isHost: boolean = false;
    public static currentRoom: Room;

    public static loginState: LoginState;
    public static lobbyState: LobbyState;
	public static playState: PlayState;

	private static freeze: boolean = false;
	public static isFrozen(): boolean {
		return Main.freeze;
	}

	public static freezeMe(): void {
		Main.freeze = true;
	}

	public static unfreezeMe(): void {
		Main.freeze = false;
	}

    public start(): void {
        Main.me = new Player();
        Main.loginState = new LoginState();
        Main.lobbyState = new LobbyState();
		Main.playState = new PlayState();
        Main.loginState.start();

        MyEvent.bind(Signal.PEND, this.onReceivePendInfo, this);
        MyEvent.bind(Signal.INFO, this.onReceiveInfo, this);
        MyEvent.bind("uc", function (data: any, _this: Main) { Util.showMessage("未知命令！") }, this);
        MyEvent.bind("nc", function (data: any, _this: Main) { Util.showMessage("您没有权限使用此命令！") }, this);
        MyEvent.bind("ban", function (data: any, _this: Main) { alert("您已被服务器Ban了!"); location.reload(true); }, this);
        MyEvent.bind("kick", function (data: any, _this: Main) { alert("您已被请出游戏!"); location.reload(true); }, this);
        MyEvent.bind("quit", function (data: any, _this: Main) { alert("服务器更新!"); location.reload(true); }, this);
        MyEvent.bind(Signal.MyInfo, this.onUpdateMyInfo, this);
        this.bindLocalEvent();
    }

    private bindLocalEvent(): void {
        MyEvent.bind(Signal.OnClickCloseSettings, Main.OnClickCloseSettings, this);
        MyEvent.bind(Signal.OnClickSendPend, Main.OnClickSendPend, this);
        jQuery(".settingsPage .title .closeButton").tapOrClick(function () { MyEvent.call(Signal.OnClickCloseSettings) });

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
            for (var i: number = 0; i < Main.cardpacks.length; i++) {
                var cardPack: CardPack = Main.cardpacks[i];
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

        jQuery("#createcard #submit").tapOrClick(function () { MyEvent.call(Signal.OnClickSendCard) });
        jQuery('#createroom #submit').tapOrClick(function (event) {
            MyEvent.call(Signal.ONCLICKCREATEROOM);
        });
        jQuery("#sug #submit").tapOrClick(function () { MyEvent.call(Signal.OnClickSendSug) });
        jQuery("#pend #submit").tapOrClick(function () { MyEvent.call(Signal.OnClickSendPend) });

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
    }

    public static sayByVoiceCard(text: string): void {
        text = text.replace(new RegExp("(https?://[\w\.\d%-_/]+)"), "和谐");
        text = text.replace(new RegExp("((<.*>.*<.*/*.*>)|(<.*/*.*>))"), "和谐");

        var audio: any = document.getElementById("cardaudio");
        audio.src = 'http://tts.baidu.com/text2audio?lan=zh&pid=101&ie=UTF-8&text=' + encodeURI(text) + '&spd=6';
        audio.play();
    }

    public static sayByVoicePlayer(text: string): void {
        text = text.replace(new RegExp("(https?://[\w\.\d%-_/]+)"), "和谐");
        text = text.replace(new RegExp("((<.*>.*<.*/*.*>)|(<.*/*.*>))"), "和谐");

        var audio: any = document.getElementById("playeraudio");
        audio.src = 'http://tts.baidu.com/text2audio?lan=zh&pid=101&ie=UTF-8&text=' + encodeURI(text) + '&spd=6';
        audio.play();
    }

    public static OnClickCloseSettings(data: any, _this: Main): void {
        jQuery(".settingsPage").hide();
        jQuery("#wrapper").removeClass("mask");
        jQuery("#mask").hide();
    }

    public static OnClickSendPend(data: any, _this: Main): void {
        var approve: string = '';
        var reject: string = '';
        jQuery('#pend input:checkbox:checked').each(function (i) {
            if (0 == i) {
                approve = jQuery(this).val();
            } else {
                approve += ("," + jQuery(this).val());
            }
        });

        jQuery('#pend input:checkbox').not("input:checked").each(function (i) {
            if (0 == i) {
                reject = jQuery(this).val();
            } else {
                reject += ("," + jQuery(this).val());
            }
        });

        Server.instance.send(PackageBuilder.buildSendPendPackage(approve, reject), false, true);
        jQuery(".settingsPage").hide();
        jQuery("#wrapper").removeClass("mask");
        jQuery("#mask").hide();
    }

    private onReceiveInfo(data: any, _this: Main) {
        switch (data.k) {
            case "cp":
                Main.cardpacks = new Array<CardPack>();
                for (var i: number = 0; i < data.cp.length; i++) {
                    var cp: CardPack = new CardPack();
                    cp.id = data.cp[i].id;
                    cp.name = data.cp[i].name;
                    cp.level = data.cp[i].lv;
                    cp.blackcount = data.cp[i].bc;
                    cp.whitecount = data.cp[i].wc;
                    Main.cardpacks.push(cp);
                }
                break;
        }
    }

    public static getPackName(pid: number): string {
        var name: string = '未知';

        for (var i: number = 0; i < Main.cardpacks.length; i++) {
            var cardPack: CardPack = Main.cardpacks[i];
			if (pid == cardPack.id) {
				name = cardPack.name;
			}
        }

        return name;
    }

    private onReceivePendInfo(data: any, _this: Main) {
        var datas: any = data.c;
        jQuery(".settingsPage[id=pend] #table").empty();
        jQuery(".settingsPage[id=pend]").show(0);
        jQuery("#wrapper").addClass("mask");
        jQuery("#mask").show();
        jQuery(".settingsPage[id=pend] #table").append('<tr><td>通过</td><td>作者</td><td>类型</td><td>卡包</td><td>内容</td></tr>');

        for (var i: number = 0; i < datas.length; i++) {
            var card: any = datas[i];
            jQuery(".settingsPage[id=pend] #table").append('<tr><td><input type="checkbox" value="' + card.id + '"/></td><td>' + card.pl + '</td><td>' + (card.ty == 0 ? "黑卡" : "白卡") + '</td><td>' + Main.getPackName(card.cp) + '</td><td>' + card.te + '</td></tr>');
        }
    }

    public onUpdateMyInfo(data: any, _this: Main): void {
        Main.me = Util.convertPlayerData(data.info[0]);

        var level: number = Main.me.getLevel();
        var remainExp: number = Main.me.getRemainExp();
        var needExp: number = Main.me.getNeedExp();

        jQuery("#statArea #nameTag").html(Main.me.name);
        jQuery("#statArea #nameTag").attr("title", "pid:" + Main.me.pid);
        jQuery("#statArea #level").html("Lv." + level);
        jQuery("#statArea #levelBarExp").html(remainExp + "/" + needExp);
        jQuery("#statArea #credit #content").html(Main.me.credit);
        jQuery("#statArea #fish #content").html(Main.me.fish);
        jQuery("#statArea #levelBarBack").css("width", (remainExp / needExp * 100) + "%");
    }


}

class LoginState {
    private ass: string = "ass";
	private loginable: boolean = false;
    public start(): void {
        Main.server = new Server();
        Main.state = State.CONNECTING;
        this.showLoginPage();
    }

    public bindEvents(): void {
        MyEvent.bind(Signal.ServerInfo, this.onCanLogin, this);
		MyEvent.bind(Signal.OnClickLogin, this.onLogin, this);
        MyEvent.bind(Signal.LoginErr, this.onLoginErr, this);
		MyEvent.bind(Signal.LobbyInfo, this.onShowLobbyInfo, this);
        jQuery(".loginArea #submit").tapOrClick(this.onClickLogin);
    }

	public unbindEvents(): void {
        MyEvent.unbind(Signal.ServerInfo, this.onCanLogin);
		MyEvent.unbind(Signal.OnClickLogin, this.onLogin);
        MyEvent.unbind(Signal.LoginErr, this.onLoginErr);
		MyEvent.unbind(Signal.LobbyInfo, this.onShowLobbyInfo);
    }

    public showLoginPage(): void {
		this.bindEvents();
        jQuery("#loginPage").show();
		LoginState.setLoginTip("正在连接服务器...");
		this.activateLoginArea(false);
    }

	public static setLoginTip(tip: string): void {
		jQuery("#logintip").html(tip);
	}

	public activateLoginArea(activate: boolean): void {
		if (activate) {
			jQuery("#username").attr("disabled", false);
			jQuery("#password").attr("disabled", false);
		} else {
			jQuery("#username").attr("disabled", true);
			jQuery("#password").attr("disabled", true);
		}
	}

    public onCanLogin(data: any, thisObject: LoginState): void {
		Main.state = State.CONNECTED;
		var par = parseInt(data.players) / parseInt(data.max) * 100;
		jQuery("#onlineBar").css("width", par + "%");
		jQuery("#serverinfo").html(data.players + "/" + data.max);
        if (parseInt(data.players) < parseInt(data.max)) {
			LoginState.setLoginTip("请登录，如果该用户名没有注册过，则将自动为您注册(每个IP最多只能注册5个账号)。");
			thisObject.activateLoginArea(true);
			thisObject.loginable = true;
		}
    }

	public onClickLogin(): void {
		MyEvent.call(Signal.OnClickLogin);
	}

	public onLogin(data: any, thisObject: LoginState): void {
		if (!thisObject.loginable) return;
		var $username: any = document.getElementById("username");
		var $password: any = document.getElementById("password");
		var username: string = $username.value.trim();
        var password: string = $password.value.trim();

        if (Util.getStringLen(username) < 2) {
			LoginState.setLoginTip('您的用户名太短！请至少超过<s style="color:#999;">6cm</s>2个字符！');
			return;
        } else if (Util.getStringLen(username) > 20) {
			LoginState.setLoginTip('您的用户名太长！请确保用户名小于20个字符(中文算2个)');
			return;
		} else if (password.length < 4) {
			LoginState.setLoginTip('您的密码太短！请至少超过4个字符！');
			return;
		} else if (password.length > 20) {
			LoginState.setLoginTip('您的密码太长！');
			return;
		} else if (!LoginState.isUsernameLegal(username)) {
			LoginState.setLoginTip('您的用户名不合法！');
			return;
		}

		thisObject.sendLogin(username, password );
	}

	public sendLogin(username: string, password: string): void {
		if (Main.state != State.CONNECTED) return;
		LoginState.setLoginTip('正在登录...');
		Server.instance.send(PackageBuilder.buildLoginPackage(username, password), true, true);
	}

	public static isUsernameLegal(name: string): boolean {
		return true;
	}

	private onLoginErr(data: any, _this: LoginState): void{
		if (data == 101) {
			LoginState.setLoginTip('您的输入似乎有问题……');
		} else if (data == 102) {
			LoginState.setLoginTip('该用户已被注册且您的密码输入错误。或您的注册已达上限！');
		} else if (data == 103) {
			LoginState.setLoginTip('无法登录，该用户已经在线了！');
        } else if (data == 104) {
            LoginState.setLoginTip('无法登录，该账号已被封禁！');
        } else if (data == 105) {
            LoginState.setLoginTip('无法登录，服务器已满！');
        }
    }

    private onShowLobbyInfo(data: any, thisObject: LoginState): void {
        jQuery("#loginPage").hide();
        Main.lobbyState.showLobbyPage(data);
		thisObject.unbindEvents();
    }
}

class LobbyState {
    private players: Array<Player>;
    private rooms: Array<Room>;
    private canCreateRoom: boolean = false;
    private canEnterRoom: boolean = false;

	public constructor() {
		
    }

	public getPlayerByPid(pid: number): Player {
		var p: Player = null;
		for (var i = 0; i < this.players.length; i++) {
			if (this.players[i].pid == pid) {
				p = this.players[i];
				break;
			}
		}
		return p;
    }

    public clearLobbyPage(): void {
        jQuery("#roomArea").empty();
        jQuery("#chatArea #messages").empty();
        jQuery("#playersArea").empty();
    }

    public showLobbyPage(data: any): void {
        this.clearLobbyPage();
        this.bindEvents();
        jQuery("#lobbyPage").show();
		this.clearChatArea();
        this.canCreateRoom = true;
        this.canEnterRoom = true;
        this.getLobbyInfo(data);
    }

    public returnToLobbyPage(data: any): void {
        this.clearLobbyPage();
        this.bindEvents();
        jQuery("#lobbyPage").show();
        this.clearChatArea();
        this.canCreateRoom = true;
        this.canEnterRoom = true;
        this.getLobbyInfo(data);
        Main.isHost = false;
    }

	private bindEvents(): void {
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
	}

	private unbindEvents(): void {
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
    }

    public onRoomChange(data: any, _this: LobbyState) {



        var room: Room = Util.convertRoomData(data);
        for (var i: number = 0; i < _this.rooms.length; i++) {
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

        var cp: string = "";
        for (var i: number = 0; i < room.cardPacks.length; i++) {
            cp = cp + '<div class="cardpack" id= "' + room.cardPacks[i].id + '">' + room.cardPacks[i].name + '</div>';
        }

        jQuery("#lobbyPage #roomArea .room[id=" + room.id + "] #desc").html(room.roomname);
        jQuery("#lobbyPage #roomArea .room[id=" + room.id + "] #players").html('玩家:' + room.playerCount + '/8');
        jQuery("#lobbyPage #roomArea .room[id=" + room.id + "] #spectors").html('观众:' + room.spectatorCount + '/16');
        jQuery("#lobbyPage #roomArea .room[id=" + room.id + "] #stat").html(state);
        jQuery("#lobbyPage #roomArea .room[id=" + room.id + "] #packsArea").html(cp);
    }

	public onSendText(): void {
		var $text: any = jQuery("#lobbyPage #inputArea #inputbox")[0];
		var text: string = $text.value.trim();
		if (text == null || text.length == 0 || text.length > 200) return;
		Server.instance.send(PackageBuilder.buildTextPackage(text), true, true);
		$text.value = "";
	}

    private onClickCreateRoomConfirm(data: any, _this:LobbyState): void {
        if (!_this.canCreateRoom) {
            Util.showMessage("您现在不能创建房间！");
            return;
        }


        var name: string = jQuery("#createroom #roomtitle").val();
        var password: string = jQuery("#createroom #roompassword").val();
        var packs: string = "";

        var spCodesTemp: string = "";
        jQuery('#createroom input:checkbox[name=cp]:checked').each(function (i) {
            if (0 == i) {
                spCodesTemp = jQuery(this).val();
            } else {
                spCodesTemp += ("," + jQuery(this).val());
            }
        });
        Server.instance.send(PackageBuilder.buildCreateRoomPackage(Main.me.getLevel(), name, password, spCodesTemp), true, true);
        _this.canCreateRoom = false;
        jQuery(".settingsPage[id=createroom]").hide(0);
        jQuery("#wrapper").removeClass("mask");
        jQuery("#mask").hide();
    }

    public getLobbyInfo(data: any): void {
		this.players = new Array<Player>();
		Main.state = State.LOBBY;
		for (var i = 0; i < data.players.length; i++) {
			this.addOnePlayer(Util.convertPlayerData(data.players[i]));
		}
		this.updatePlayerList();

		this.rooms = new Array<Room>();
		for (var i = 0; i < data.rooms.length; i++) {
			this.addOneRoom(Util.convertRoomData(data.rooms[i]));
		}
    }

	public onReceiveText(data: any, _this: LobbyState): void {
		var pid: any = parseInt(data.pid);
		var speakerName: string = "Unknow";
		if (isNaN(data.pid)) {
			speakerName = data.pid;
		} else if (pid == 0) {
			speakerName = "系统";
		} else {
			var p: Player = _this.getPlayerByPid(pid);
			if (p != null)
				speakerName = p.name;
		}

        var text: string = data.text;

        text = Util.convertChat(text);

		if (pid == 0)
			jQuery("#chatArea #messages").append('<div id="entry"><label id="server">[' + speakerName + ']' + text + '</label></div>');
		else
			jQuery("#chatArea #messages").append('<div id="entry"><label id="name">[' + speakerName + ']</label><label id="content">' + text + '</label></div>');

        jQuery("#chatArea #messages")[0].scrollTop = jQuery("#chatArea #messages")[0].scrollHeight;
	}

	public clearChatArea(): void {
		jQuery("#chatArea #messages").empty();
	}

    public onClickRoom(data: any, _this: LobbyState) {
        if (!_this.canEnterRoom) {
            Util.showMessage("您现在不能进入房间！");
            return;
        }

        var room: Room = null;
        for (var i: number = 0; i < _this.rooms.length; i++) {
            if (_this.rooms[i].id == data) {
                room = _this.rooms[i];
            }
        }

        if (room == null) {
            Util.showMessage("房间不存在！");
            return;
        }

        if (room.password != null && room.password != "") {
            var password:string = prompt("请输入房间密码", "");
            if (password != room.password) {
                Util.showMessage("密码错误");
                return;
            }
        }

        if (room.playerCount < 8 || room.spectatorCount < 16) {
            this.canEnterRoom = false;
            Server.instance.send(PackageBuilder.buildEnterRoomPackage(data), true, true);
        } else {
            Util.showMessage("该房间已满！");
        }
    }

	public onPlayerEnter(data: any, _this: LobbyState): void{
		var p: Player = Util.convertPlayerData(data.player[0]);
		MyEvent.call(Signal.TEXT, {text:p.name + " 进入了大厅", pid:0});
		if (data.player[0].pid == Main.me.pid)
			return;
        _this.addOnePlayer(p);
	}

	public onPlayerLeave(data: any, _this: LobbyState): void {
		var p: Player = _this.getPlayerByPid(data.pid);
		if (p != null) {
			MyEvent.call(Signal.TEXT, { text: p.name + " 离开了大厅", pid: 0 });
			_this.removeOnePlayer(p.pid);
		}
    }

    public onAddRoom(data: any, _this: LobbyState): void {
        var room: Room = Util.convertRoomData(data.room[0]);
        _this.addOneRoom(room);
    }

	public addOnePlayer(player: Player): void {
		this.players.push(player);
        this.updatePlayerList();
	}

	public removeOnePlayer(pid: number): void {
		var index:number = -1;
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
    }

    public onDestroyRoom(data: any, _this: LobbyState): void {
        _this.removeOneRoom(data);
    }

    public addOneRoom(room: Room): void {
        var state = room.state == 0 ? "等待中" : "游戏中";
        if (room.password != null && room.password != "") {
            state += ",有密码";
        }
        var cp: string = "";
        for (var i: number = 0; i < room.cardPacks.length; i++) {
            cp = cp + '<div class="cardpack" id= "' + room.cardPacks[i].id + '">' + room.cardPacks[i].name + '</div>';
        }
        jQuery("#lobbyPage #roomArea").append('<div class="room" id="' + room.id + '"><div class="left"><div id="roomnum">' + (room.id < 10 ? '00' : (room.id < 100 ? '0' : '')) + room.id + '</div><div id= "desc">' + room.roomname + '</div></div><div class="middle"><div id="players">玩家:' + room.playerCount + '/8</div><div id= "spectors"> 观众:' + room.spectatorCount + '/16 </div><div id="stat">' + state + '</div></div><div id= "packsArea">' + cp + '</div></div>');
        jQuery("#lobbyPage .room[id=" + room.id + "]").tapOrClick(function () { MyEvent.call(Signal.ONCLICKROOM, room.id) });
        this.rooms.push(room);
    }

    public removeOneRoom(id: number): void {
        jQuery("#lobbyPage #roomArea .room[id=" + id + "]").remove();
        for (var i: number = 0; i < this.rooms.length; i++) {
            if (this.rooms[i].id == id) {
                this.rooms.splice(i, 1);
                break;
            }
        }
    }

	public updatePlayerList(): void {
		var ele: any = jQuery("#lobbyPage #playersArea");
		ele.empty();
		for (var i = 0; i < this.players.length; i++) {
			ele.append('<div class="player" title="pid:' + this.players[i].pid + '" id="' + this.players[i].pid + '"><span id="level">Lv.' + this.players[i].getLevel() + '</span><span id="name">' + this.players[i].name + '</span></div>');
		}
    }

    public onReceiveRoomInfo(data: any, _this: LobbyState): void {
        jQuery("#lobbyPage").hide();
        Main.playState.showGamePage(data);
        _this.unbindEvents();
    }

    public OnClickSendSug(data: any, _this: LobbyState): void {
        var time = new Date().getTime();
        if (time < parseInt(localStorage["lastSendTime"])) {
            Util.showMessage("技能冷却中，剩余时间:" + Math.round((parseInt(localStorage["lastSendTime"]) - time) / 1000) + "秒");
            Main.OnClickCloseSettings(null, null);
            return;
        }
        var text: string = jQuery("#sug #text").val();

        if (text == null || text.trim().length < 0) {
            alert("文字内容不能为空!");
            return
        }

        Server.instance.send(PackageBuilder.buildCreateSugPackage(text), false, true);
        localStorage["lastSendTime"] = new Date().getTime() + 60000;
        Main.OnClickCloseSettings(null, null);
        jQuery("#sug #text").val("");
        Util.showMessage("您的意见已送出，感谢您的支持！");
    }

    public OnClickSendCard(data: any, _this: LobbyState): void {
        var time = new Date().getTime();
        if (time < parseInt(localStorage["lastSendTime"])) {
            Util.showMessage("技能冷却中，剩余时间:" + Math.round((parseInt(localStorage["lastSendTime"]) - time) / 1000) + "秒");
            Main.OnClickCloseSettings(null, null);
            return;
        }

        var cardType: number = jQuery('#createcard input[name="cardtype"]:checked').val();
        var cardPack: number = jQuery("#createcard #cardpack option:selected").val();
        var text: string = jQuery("#createcard #text").val();

        if (cardPack == 1 && Main.me.pid != 1) {
            Util.showMessage("您没有权限向此卡牌包添加卡牌，请选择其他卡牌包！");
            Main.OnClickCloseSettings(null, null);
            return;
        }

        if (text == null || text.trim().length < 0) {
            alert("卡牌内容不能为空!");
            return
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
    }

    public onCardSended(data: any, _this: LobbyState): void {
        var total: number = data.to;
        var success: number = data.su;
        var repeat: number = data.re;
        var illegal: number = data.il;

        if (total == 0) {
            Util.showMessage("您的填写有误，此次提交作废！");
        } else if (success == 0) {
            Util.showMessage("您的卡牌提交失败，总数:" + total + "，成功:" + success + "，重复:" + repeat + "，失败:" + illegal + "。");
        } else {
            Util.showMessage("您的卡牌已提交审核，总数:" + total + "，成功:" + success + "，重复:" + repeat + "，失败:" + illegal + "，感谢您的支持！");
        }
    }
}

class PlayState{
    private isPlayer: boolean = false;
	private players: Array<Player>;
    private spectators: Array<Player>;
    private canReturnToLobby: boolean = false;
	private handCards: Array<WhiteCard>;
	private currentBlackCardText: string;
	private currentBlackCardBlanks: number = 1;
	private currentRound: number = 0;
	private czar: number = 0;
	private donePlayers: Array<number>;

	public constructor() {
        this.players = new Array<Player>();
        this.spectators = new Array<Player>();
	}

    public showGamePage(data: any): void {
		this.clearTimer();
		this.clearHandCard();
		this.donePlayers = new Array<number>();
        this.players = new Array<Player>();
        this.spectators = new Array<Player>();
        this.canReturnToLobby = true;
        this.bindEvents();
        this.clearGamePage();
        jQuery("#gamePage").show();
        this.showBlackCardArea();
        this.initRoomInfo(data);
        this.updateMyInfoDisplay();
        
        //jQuery(".settingsPage[id=gamestart]").show();
    }

    private initRoomInfo(data: any): void {
        jQuery("#gamePage #roomnum").html(data.id);
        jQuery("#gamePage #roomname").html(data.name);

        Main.currentRoom = Util.convertRoomData(data);

        for (var i: number = 0; i < data.players.length; i++) {
            var p: Player = Util.convertPlayerData(data.players[i]);
            this.addOnePlayer(p, false);
            if (p.pid == Main.me.pid)
                this.isPlayer = true;
        }

        for (var i: number = 0; i < data.spectators.length; i++) {
            var p: Player = Util.convertPlayerData(data.spectators[i]);
            this.addOnePlayer(p, true);
            if (p.pid == Main.me.pid)
                this.isPlayer = false;
        }

        if (this.isPlayer)
            jQuery("#settingsArea #spectate").html("观战");
        else
            jQuery("#settingsArea #spectate").html("加入");
		this.checkGameStartButton();
    }

    private bindEvents(): void {
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
    }

    private unbindEvents(): void {
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
		MyEvent.unbind("whiteCard", this.onWhiteCard);
		MyEvent.unbind("pickcard", this.onPickCard);
    }

	public onClickStartGame(data: any, _this: PlayState): void {
		if (!Main.isHost) {
			Util.showMessage("只有房主才能这么做！");
			return;
		}

		if (Main.currentRoom.state != 0) {
			Util.showMessage("游戏已经开始了！");
			return;
		}

		Server.instance.send(PackageBuilder.buildStartGamePackage(), true, true);
	}

	private onKicked(data: any, _this: PlayState): void {
		if (data == "host") {
			_this.onClickReturnLobby(null, _this);
			Util.showMessage("您被房主踢出了房间！");
		} else {
			_this.onClickReturnLobby(null, _this);
			Util.showMessage("您由于连续3次没有被系统请出了房间！");
		}
	}

    private onKickPlayer(data: any, _this: PlayState): void {
        if (!Main.isHost)
			return;
		if (Main.me.pid == data) {
			return;
		}

		if (confirm("是否将该玩家踢出房间？")) {
            Server.instance.send(PackageBuilder.buildKickPlayerPackage(data), true, true);
        }
    }

    public onRoomChange(data: any, _this: PlayState): void {
        jQuery("#gamePage #roomnum").html(data.id);
        jQuery("#gamePage #roomname").html(data.name);
        Main.currentRoom = Util.convertRoomData(data);
    }

    public onClickRoomSetButton(data: any, _this: PlayState): void{
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
                    var checked: boolean = false;
                    for (var j: number = 0; j < Main.currentRoom.cardPacks.length; j++) {
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
            } else {
                jQuery("#setroom #roomtitle").val(Main.currentRoom.roomname);
                jQuery("#setroom #roomtitle").removeAttr("disabled", "disabled");
                jQuery("#setroom #roompassword").val(Main.currentRoom.password);
                jQuery("#setroom #roompassword").removeAttr("disabled", "disabled");
                jQuery("#setroom #cardpacks").empty();
                for (var i = 0; i < Main.cardpacks.length; i++) {
                    var checked: boolean = false;
                    for (var j: number = 0; j < Main.currentRoom.cardPacks.length; j++) {
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
        } else {
            jQuery("#setroom #roomtitle").val(Main.currentRoom.roomname);
            jQuery("#setroom #roomtitle").attr("disabled", "disabled");
            jQuery("#setroom #roompassword").val(Main.currentRoom.password);
            jQuery("#setroom #roompassword").attr("disabled", "disabled");
            jQuery("#setroom #cardpacks").empty();
            for (var i = 0; i < Main.cardpacks.length; i++) {
                var checked: boolean = false;
                for (var j: number = 0; j < Main.currentRoom.cardPacks.length; j++) {
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
    }

    public onClickRoomSetButtonOK(data: any, _this: PlayState): void {
       

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

        var name: string = jQuery("#setroom #roomtitle").val();
        var password: string = jQuery("#setroom #roompassword").val();
        var spCodesTemp: string = "";
        var level: number = Main.me.getLevel();
        jQuery('#setroom input:checkbox[name=cp]:checked').each(function (i) {
            if (0 == i) {
                spCodesTemp = jQuery(this).val();
            } else {
                spCodesTemp += ("," + jQuery(this).val());
            }
        });

        Server.instance.send(PackageBuilder.buildSetRoomPackage(level, name, password, spCodesTemp), true, true);
        localStorage["lastSendTime"] = new Date().getTime() + 60000;
    }

    public clearGamePage(): void {
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
    }

    public showHostSettings(): void {
        jQuery("#blackCardArea #blackCard").hide();
        jQuery("#blackCardArea #hostSettings").show();
    }

    public showBlackCardArea(): void {
        jQuery("#blackCardArea #blackCard").show();
        jQuery("#blackCardArea #hostSettings").hide();
    }

    public setMeAsHost(): void {
        Main.isHost = true;
    }

    public setMeAsNotHost(): void {
        Main.isHost = false;
    }

    public updateMyInfoDisplay(): void {

        var level: number = Main.me.getLevel();
        var remainExp: number = Main.me.getRemainExp();
        var needExp: number = Main.me.getNeedExp();

        jQuery("#gamePage #statArea #nameTag").html(Main.me.name);
        jQuery("#gamePage #statArea #nameTag").attr("title", "pid:" + Main.me.pid);
        jQuery("#gamePage #statArea #level").html("Lv." + level);
        jQuery("#gamePage #statArea #levelBarExp").html(remainExp + "/" + needExp);
        jQuery("#gamePage #statArea #credit #content").html(Main.me.credit);
        jQuery("#gamePage #statArea #fish #content").html(Main.me.fish);
        jQuery("#gamePage #statArea #levelBarBack").css("width", (remainExp / needExp * 100) + "%");


    }

    public updateMyInfo(data: any): void {
        Main.me = Util.convertPlayerData(data.info[0]);
        this.updateMyInfoDisplay();
    }

    public getPlayerByPid(pid: number): Player {
        var p: Player = null;
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
    }

    public onPlayerEnter(data: any, _this: PlayState): void {
        var p: Player = Util.convertPlayerData(data.player[0]);
        if (data.spectate == true || data.spectate == "true")
            MyEvent.call(Signal.TEXT, { text: p.name + " 前来贴窗", pid: 0 });
        else
            MyEvent.call(Signal.TEXT, { text: p.name + " 进入了房间", pid: 0 });
        if (data.player[0].pid == Main.me.pid)
            return;
        _this.addOnePlayer(p, data.spectate);
    }

    public onPlayerLeave(data: any, _this: PlayState): void {
        var p: Player = _this.getPlayerByPid(data.pid);
        if (p != null) {
            MyEvent.call(Signal.TEXT, { text: p.name + " 离开了房间", pid: 0 });
            _this.removeOnePlayer(p.pid);
        }
    }

    public addOnePlayer(p: Player, isSpector: any): void {
        if (isSpector == true || isSpector == "true") {
            this.spectators.push(p);
        } else {
            this.players.push(p);
        }
        this.updatePlayerList();
    }

    public removeOnePlayer(pid: number): void {
        var index: number = -1;
        for (var i = 0; i < this.players.length; i++) {
            if (this.players[i].pid == pid) {
                index = i;
                break;
            }
        }

        if (index != -1) {
            this.players.splice(index, 1);
            this.updatePlayerList();
        } else {
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
    }

    public updatePlayerList(): void {
        var ele: any = jQuery("#gamePage #playerArea");
        var elesp: any = jQuery("#gamePage #spectateArea");
        ele.empty();
        elesp.empty();
		

        for (var i = 0; i < this.players.length; i++) {
            var p: Player = this.players[i];

			var done: boolean = false;
			for (var di: number = 0; di < this.donePlayers.length; i++) {
				if (this.donePlayers[di] == p.pid) {
					done = true;
					break;
				}
			}

            ele.append('<div class="player" pid="' + p.pid + '" pid="' + p.pid + '"><div id= "name" pid="' + p.pid + '">' + p.name + '</div><div id= "level" pid="' + p.pid + '">Lv.' + p.getLevel() + '</div><div id= "score" pid="' + p.pid + '">' + 0 + '</div>' + (this.czar == p.pid ? '<div id="title" class="czar" pid="' + p.pid + '">裁判</div>' : '') + (done ? '<div id="title" class="czar" pid="' + p.pid + '">完成</div>' : '') + '</div>');
            jQuery("#gamePage #playerArea .player[pid=" + p.pid + "]").tapOrClick(function (e) { MyEvent.call(Signal.KickPlayer, jQuery(e.target).attr("pid")); });
        }

        for (var i = 0; i < this.spectators.length; i++) {
            var p: Player = this.spectators[i];
            elesp.append('<div class="player" pid="' + p.pid + '"><div id= "name">' + p.name + '</div></div>');
        }
		this.checkGameStartButton();
    }

	public checkGameStartButton(): void {
		if (Main.isHost && Main.currentRoom.state == 0) {
			if (this.players.length >= 2) {
				this.showGameStartButton();
			} else {
				this.hideGameStartButton();
			}
		}
	}

	public showGameStartButton(): void {
		jQuery("#gamePage #blackCard").hide();
		jQuery("#gamePage #hostSettings").show();
	}

	public hideGameStartButton(): void {
		jQuery("#gamePage #blackCard").show();
		jQuery("#gamePage #hostSettings").hide();
	}

    public onReceiveText(data: any, _this: PlayState): void {
        var pid: any = parseInt(data.pid);
        var speakerName: string = "Unknow";
        if (isNaN(data.pid)) {
            speakerName = data.pid;
        } else if (pid == 0) {
            speakerName = "系统";
        } else {
            var p: Player = _this.getPlayerByPid(pid);
            if (p != null)
                speakerName = p.name;
        }

        var text: string = data.text;
        text = Util.convertChat(text);
        if (pid == 0)
            jQuery("#chatArea #messages").append('<div id="entry"><label id="server">[' + speakerName + ']' + text + '</label></div>');
        else
            jQuery("#chatArea #messages").append('<div id="entry"><label id="name">[' + speakerName + ']</label><label id="content">' + text + '</label></div>');

        jQuery("#chatArea #messages")[1].scrollTop = jQuery("#chatArea #messages")[1].scrollHeight;
        if (pid != 0)
            Main.sayByVoicePlayer(text);
    }

    public onSendText(data: any, _this: PlayState): void {
        var $text: any = jQuery("#gamePage #inputArea #inputbox")[0];
        var text: string = $text.value.trim();
        if (text == null || text.length == 0 || text.length > 200) return;
        Server.instance.send(PackageBuilder.buildTextPackage(text), true, true);
        $text.value = "";
    }

    public onClickSwitchButton(data: any, _this: PlayState): void {
        if (_this.isPlayer) {
            if (_this.spectators.length >= 16) {
                Util.showMessage("无法观战，观众已满！");
                return;
            }
        } else {
            if (_this.players.length >= 8) {
                Util.showMessage("无法加入，玩家已满！");
                return;
            }
        }
        Server.instance.send(PackageBuilder.buildSwitchPlacePackage(_this.isPlayer ? 1 : 0), true, true);
    }

    public onPlayerSwitch(data: any, _this: PlayState): void {
        var id: number = data.pid;
        var place: number = data.place;
        var p: Player = _this.getPlayerByPid(id);
        if (p == null) return;

        _this.removeOnePlayer(p.pid);
        _this.addOnePlayer(p, place == 1);
        if (place == 1) {
            Util.showMessage(p.name + "开始旁观");
        } else {
            Util.showMessage(p.name + "进入对局");
        }


        if (id == Main.me.pid) {
			this.clearHandCard();
            if (place == 0) {
                jQuery("#settingsArea #spectate").html("观战");
                _this.isPlayer = true;
            } else {
                jQuery("#settingsArea #spectate").html("加入");
                _this.isPlayer = false;
            }
        }
    }

    public onClickReturnLobby(data: any, _this: PlayState): void {
        if (!_this.canReturnToLobby) {
            Util.showMessage("无法退出");
            return;
        }
        Server.instance.send(PackageBuilder.buildReturnLobbyPackage(), true, true);
    }

    public onReturnToLobby(data: any, _this: PlayState): void {
        _this.unbindEvents();
        jQuery("#gamePage").hide();
        Main.lobbyState.returnToLobbyPage(data);
    }

	public onBlackCard(data: any, _this: PlayState): void {
		Main.currentRoom.state = 1;
		_this.hideGameStartButton();
		_this.currentBlackCardBlanks = parseInt(data.bl);
		_this.currentRound = parseInt(data.id);
		_this.czar = data.czar;
		Util.showMessage("第" + _this.currentRound + "轮游戏已开始，裁判是 " + _this.getPlayerByPid(data.czar).name);
		_this.setBlackCard(data.text, Main.getPackName(data.cp), data.au);
		_this.startTimer(20000 + _this.currentBlackCardBlanks * 5000);
		_this.updatePlayerList();
	}

	public clearBadges(): void {
		var ele: any = jQuery("#gamePage #playerArea");
        ele.empty();
		for (var i = 0; i < this.players.length; i++) {
            var p: Player = this.players[i];
            ele.append('<div class="player" pid="' + p.pid + '" pid="' + p.pid + '"><div id= "name" pid="' + p.pid + '">' + p.name + '</div><div id= "level" pid="' + p.pid + '">Lv.' + p.getLevel() + '</div><div id= "score" pid="' + p.pid + '">' + 0 + '</div></div>');
            jQuery("#gamePage #playerArea .player[pid=" + p.pid + "]").tapOrClick(function (e) { MyEvent.call(Signal.KickPlayer, jQuery(e.target).attr("pid")); });
        }
	}

	private static needTick: number = 0;
	private static currentTick: number = 0;
	private static interval: number = -1;
	public startTimer(time: number): void {
		if (PlayState.interval != -1) {
			clearInterval(PlayState.interval);
		}

		PlayState.needTick = time / 50;
		PlayState.currentTick = 0;
		PlayState.interval = setInterval(this.tick, 50);
	}

	public clearTimer(): void {
		if (PlayState.interval != -1) {
			clearInterval(PlayState.interval);
		}
	}

	public tick(): void {
		PlayState.currentTick++;
		var per: number = (PlayState.currentTick / PlayState.needTick) * 100;
		per = 100 - per;
		if (per <= 0) {
			per = 0;
			clearInterval(PlayState.interval);
		}
		jQuery("#gamePage #timerFill").css("width", per + "%");
		
	}

	public setBlackCard(text: string, pc: string, author: string): void {
		this.currentBlackCardText = text;
		for (var i: number = 1; i <= 3; i++) {
			text = text.replace("%b", '<label class="blank" id="bc' + i + '">____</label>');
		}
		jQuery("#gamePage #blackCard").html('<div id="info">' + pc + ' 作者:' + author + '</div>' + text);
	}

	public onWhiteCard(data: any, _this: PlayState): void {
		for (var i = 0; i < data.c.length; i++) {
			_this.handCards.push(Util.convertWhiteCardData(data.c[i]));
		}
		_this.updateHandCardDisplay();
	}

	public clearHandCard(): void {
		this.handCards = new Array<WhiteCard>();
		this.updateHandCardDisplay();
	}

	public updateHandCardDisplay(): void {
		for (var i: number = 0; i < this.handCards.length; i++) {
			var card: WhiteCard = this.handCards[i];
			jQuery("#gamePage #hand").append('<div title="卡牌包:' + card.packName + ' 作者:' + card.author + '" class="cards" cid="' + card.cid + '"><div id= "whitecard" cid="' + card.cid + '">' + card.text + '</div></div>');
			jQuery("#gamePage #hand .cards").tapOrClick(function (e) { MyEvent.call("pickcard", jQuery(e.target).attr("cid")); });
		}
	}

	public onPickCard(data: any, _this: PlayState): void {
		alert(data);
	}
}

window.onload = () => {
    new Main().start();
};