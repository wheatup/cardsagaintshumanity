declare var jQuery;
declare var returnCitySN;

class GameSettings {
    public static Server: string = "ws://localhost:4849/CardsAgaisntHumanity/server";
    public static AllowMulti: boolean = true;
    public static debugMode: boolean = true;
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
        return 10 + Math.round(Math.pow((lvl - 1) * 1.3, 1.9) * 5);
    }
}

class Room {
    public id: number;
    public roomname: string;
    public password: string;
    public playerCount: number;
    public spectorCount: number;
    public cardPacks: Array<string>;
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

	public static safeString(text: string): string {
		text = text.replace(/"/g, "\\\"");
		text = text.replace(/'/g, "\\'");
		text = text.replace(/\\/g, "\\\\");
		text = text.replace(/"/g, "\\\"");
		text = text.replace(/'/g, "\\'");
		text = text.replace(/\\/g, "\\\\");
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
		if (this.antiFlush && isUser) {
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
    }
}

class PackageBuilder {
	public static buildLoginPackage(username: string, password: string): string {
		username = Util.safeString(username);
		var pack = '{"t":"login", "username":"' + username + '", "password":"' + password + '", "ip":"' + returnCitySN["cip"] + '"}';
		return pack;
	}

	public static buildTextPackage(text: string): string {
		text = Util.safeString(text);
		var pack = '{"t":"text", "text":"' + text + '"}';
		return pack;
	}

	public static buildQuitPackage(): string {
		var pack = '{"t":"quit"}';
		return pack;
    }

    public static buildCreateRoomPackage(): string {
        var pack = '{"t":"createroom"}';
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
}

class Main {
    public static server: Server;
    public static state: State;
    public static me: Player;

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
        MyEvent.bind(Signal.MyInfo, this.onShowLobbyPage, this);
		MyEvent.bind(Signal.LobbyInfo, this.onShowLobbyInfo, this);
        jQuery(".loginArea #submit").tapOrClick(this.onClickLogin);
    }

	public unbindEvents(): void {
        MyEvent.unbind(Signal.ServerInfo, this.onCanLogin);
		MyEvent.unbind(Signal.OnClickLogin, this.onLogin);
        MyEvent.unbind(Signal.LoginErr, this.onLoginErr);
        MyEvent.unbind(Signal.MyInfo, this.onShowLobbyPage);
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
		}
    }

    private onShowLobbyPage(data:any, thisObject: LoginState): void {
        jQuery("#loginPage").hide();
		Main.lobbyState.showLobbyPage(data);
    }

	private onShowLobbyInfo(data: any, thisObject: LoginState): void {
		Main.lobbyState.getLobbyInfo(data);
		thisObject.unbindEvents();
    }
}

class LobbyState {
    private players: Array<Player>;
    private room: Array<Room>;
    private canCreateRoom: boolean = false;

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

    public showLobbyPage(myinfo: any): void {
        //this.clearLobbyPage();
		this.bindEvents();
        jQuery("#lobbyPage").show();
		this.clearChatArea();
        this.getMyInfo(myinfo);
        this.canCreateRoom = true;
    }

	private bindEvents(): void {
		MyEvent.bind(Signal.PLAYERENTER, this.onPlayerEnter, this);
		MyEvent.bind(Signal.PLAYERLEAVE, this.onPlayerLeave, this);
		MyEvent.bind(Signal.TEXT, this.onReceiveText, this);
		MyEvent.bind(Signal.SendText, this.onSendText, this);
        jQuery('#lobbyPage #inputArea #inputbox').keypress(function (event) {
			var keycode = (event.keyCode ? event.keyCode : event.which);
			if (keycode == '13') {
				MyEvent.call(Signal.SendText);
			}
		});
        jQuery('#lobbyPage #inputArea #submit').tapOrClick(function (event) {
			MyEvent.call(Signal.SendText);
        });
        jQuery("#settingsArea #createRoom").tapOrClick(function () { MyEvent.call(Signal.ONCLICKCREATEROOM) });
        MyEvent.bind(Signal.ONCLICKCREATEROOM, this.onClickCreateRoom, this);
        MyEvent.bind(Signal.RoomInfo, this.onReceiveRoomInfo, this);
	}

	private unbindEvents(): void {
		MyEvent.unbind(Signal.PLAYERENTER, this.onPlayerEnter);
		MyEvent.unbind(Signal.PLAYERLEAVE, this.onPlayerLeave);
		MyEvent.unbind(Signal.TEXT, this.onReceiveText);
        MyEvent.unbind(Signal.SendText, this.onSendText);
        MyEvent.unbind(Signal.ONCLICKCREATEROOM, this.onClickCreateRoom);
	}

	public onSendText(): void {
		var $text: any = jQuery("#lobbyPage #inputArea #inputbox")[0];
		var text: string = $text.value.trim();
		if (text == null || text.length == 0 || text.length > 200) return;
		Server.instance.send(PackageBuilder.buildTextPackage(text), true, true);
		$text.value = "";
	}

    private getMyInfo(data: any): void {
        this.updateMyInfo(data);
    }

    private onClickCreateRoom(data: any, _this: LobbyState): void {
        if (!_this.canCreateRoom) {
            Util.showMessage("您现在不能创建房间！");
            return;
        }
        Server.instance.send(PackageBuilder.buildCreateRoomPackage(), true, true);
        _this.canCreateRoom = false;
    }

	public getLobbyInfo(data: any): void {
		this.players = new Array<Player>();
		Main.state = State.LOBBY;
		for (var i = 0; i < data.players.length; i++) {
			this.addOnePlayer(Util.convertPlayerData(data.players[i]));
		}
		this.updatePlayerList();
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
		if (pid == 0)
			jQuery("#chatArea #messages").append('<div id="entry"><label id="server">[' + speakerName + ']' + text + '</label></div>');
		else
			jQuery("#chatArea #messages").append('<div id="entry"><label id="name">[' + speakerName + ']</label><label id="content">' + text + '</label></div>');

		jQuery("#chatArea #messages")[0].scrollTop = jQuery("#chatArea #messages")[0].scrollHeight;
	}

	public clearChatArea(): void {
		jQuery("#chatArea #messages").empty();
	}

    public updateMyInfo(data: any): void{
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
}

class PlayState{
	private players: Array<Player>;
	private spectators: Array<Player>;

	public constructor() {
        this.players = new Array<Player>();
        this.spectators = new Array<Player>();
	}

    public showGamePage(data: any): void {
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
        for (var i: number = 0; i < data.players.length; i++) {
            var p: Player = Util.convertPlayerData(data.players[i]);
            this.addOnePlayer(p, false);
        }

        for (var i: number = 0; i < data.spectators.length; i++) {
            var p: Player = Util.convertPlayerData(data.spectators[i]);
            this.addOnePlayer(p, true);
        }
    }

    private bindEvents(): void {
        MyEvent.bind(Signal.PLAYERENTER, this.onPlayerEnter, this);
        MyEvent.bind(Signal.PLAYERLEAVE, this.onPlayerLeave, this);
        MyEvent.bind(Signal.TEXT, this.onReceiveText, this);
        MyEvent.bind(Signal.SendText, this.onSendText, this);
        jQuery('#gamePage #inputArea #inputbox').keypress(function (event) {
            var keycode = (event.keyCode ? event.keyCode : event.which);
            if (keycode == '13') {
                MyEvent.call(Signal.SendText);
            }
        });
        jQuery('#gamePage #inputArea #submit').tapOrClick(function (event) {
            MyEvent.call(Signal.SendText);
        });
    }

    private unbindEvents(): void {
        MyEvent.bind(Signal.PLAYERENTER, this.onPlayerEnter, this);
        MyEvent.bind(Signal.PLAYERLEAVE, this.onPlayerLeave, this);
        MyEvent.bind(Signal.TEXT, this.onReceiveText, this);
        MyEvent.bind(Signal.SendText, this.onSendText, this);
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
            for (var i = 0; i < this.players.length; i++) {
                if (this.players[i].pid == pid) {
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
                if (this.players[i].pid == pid) {
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
            ele.append('<div class="player" pid="' + p.pid + '"><div id= "name">' + p.name + '</div><div id= "level">Lv.' + p.getLevel() + '</div><div id= "score">' + 0 + '</div><div id= "title" class="czar"> 裁判 </div></div>');
        }

        for (var i = 0; i < this.spectators.length; i++) {
            var p: Player = this.spectators[i];
            ele.append('<div class="player" pid="' + p.pid + '"><div id= "name">' + p.name + '</div></div>');
        }
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
        if (pid == 0)
            jQuery("#chatArea #messages").append('<div id="entry"><label id="server">[' + speakerName + ']' + text + '</label></div>');
        else
            jQuery("#chatArea #messages").append('<div id="entry"><label id="name">[' + speakerName + ']</label><label id="content">' + text + '</label></div>');

        jQuery("#chatArea #messages")[0].scrollTop = jQuery("#chatArea #messages")[0].scrollHeight;
    }

    public onSendText(data: any, _this: PlayState): void {
        var $text: any = jQuery("#gamePage #inputArea #inputbox")[0];
        var text: string = $text.value.trim();
        if (text == null || text.length == 0 || text.length > 200) return;
        Server.instance.send(PackageBuilder.buildTextPackage(text), true, true);
        $text.value = "";
    }
}

window.onload = () => {
    new Main().start();
};