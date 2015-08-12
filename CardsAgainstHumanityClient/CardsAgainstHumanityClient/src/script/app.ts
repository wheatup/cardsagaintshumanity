declare var jQuery;

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
}

class Server {
    public static instance: Server;
    public socket: WebSocket;

    constructor() {
        Server.instance = this;
        this.socket = new WebSocket(GameSettings.Server);
        this.socket.onopen = (evt) => { this.onOpen(evt) };
        this.socket.onclose = (evt) => { this.onClose(evt) };
        this.socket.onmessage = (evt) => { this.onMessage(evt) };
        this.socket.onerror = (evt) => { this.onError(evt) };
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
    send(data, isVital): void {
		if (isVital && Main.isFrozen()) {
			console.log('网络被堵塞，请稍后再试！');
			MyEvent.call("msg", "网络被堵塞，请稍后再试！");
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
		username = username.replace(/"/g, "\\\"");
		username = username.replace(/'/g, "\\'");
		username = username.replace(/\\/g, "\\\\");
		password = password.replace(/"/g, "\\\"");
		password = password.replace(/'/g, "\\'");
		password = password.replace(/\\/g, "\\\\");
		var pack = '{"t":"login", "username":"' + username + '", "password":"' + password + '"}';
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

class Main {
    public static server: Server;
    public static state: State;
    public static me: Player;

    private static loginState: LoginState;
    private static lobbyState: LobbyState;

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
        Main.loginState.start();
    }
}

class LoginState {
    private ass: string = "ass";
	private loginable: boolean = false;
    public start(): void {
        this.bindEvents();
        Main.server = new Server();
        Main.state = State.CONNECTING;
        this.showLoginPage();
    }

    public bindEvents(): void {
        MyEvent.bind(Signal.ServerInfo, this.onCanLogin, this);
		MyEvent.bind(Signal.OnClickLogin, this.onLogin, this);
        MyEvent.bind(Signal.LoginErr, this.onLoginErr, this);
        MyEvent.bind(Signal.MyInfo, this.onShowLobbyPage, this);
        jQuery(".loginArea #submit").tapOrClick(this.onClickLogin);
    }

    public showLoginPage(): void {
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
			LoginState.setLoginTip("请登录，如果该用户名没有注册过，则将自动为您注册。");
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
		Server.instance.send(PackageBuilder.buildLoginPackage(username, password), true);
	}

	public static isUsernameLegal(name: string): boolean {
		return true;
	}

	private onLoginErr(data: any, _this: LoginState): void{
		if (data == 101) {
			LoginState.setLoginTip('用户名密码验证不通过，请检查输入。');
		} else if (data == 102) {
			LoginState.setLoginTip('密码错误，该用户已被注册！');
		}
    }

    private onShowLobbyPage(data:any, thisObject: LoginState): void {
        MyEvent.unbind(Signal.ServerInfo, this.onCanLogin);
        MyEvent.unbind(Signal.OnClickLogin, this.onLogin);
        MyEvent.unbind(Signal.LoginErr, this.onLoginErr);
        MyEvent.unbind(Signal.MyInfo, this.onShowLobbyPage);
        jQuery("#loginPage").hide();
    }
}

class LobbyState {
	public constructor() {
		this.bindEvents();
    }

    public showLobbyPage(): void {
        jQuery("#lobbyPage").show();
    }

	private bindEvents(): void {
		MyEvent.bind(Signal.MyInfo, this.OnGetMyInfo, this);
		MyEvent.bind(Signal.LobbyInfo, this.OnGetLobbyInfo, this);
	}

    private OnGetMyInfo(data: any, _this: LobbyState): void {
        _this.showLobbyPage();
        _this.updateMyInfo(data);
	}

	private OnGetLobbyInfo(data: any, _this: LobbyState): void {
		Main.state = State.LOBBY;
    }


    public updateMyInfo(data: any): void{
        Main.me.pid = data.info[0].pid;
        Main.me.exp = data.info[0].exp;
        Main.me.state = data.info[0].state;
        Main.me.credit = data.info[0].credit;
        Main.me.fish = data.info[0].fish;
        Main.me.name = data.info[0].name;

        var level: number = Main.me.getLevel();
        var remainExp: number = Main.me.getRemainExp();
        var needExp: number = Main.me.getNeedExp();

        jQuery("#statArea #nameTag").html(Main.me.name);
        jQuery("#statArea #level").html("Lv." + level);
        jQuery("#statArea #levelBarExp").html(remainExp + "/" + needExp);
        jQuery("#statArea #credit #content").html(Main.me.credit);
        jQuery("#statArea #fish #content").html(Main.me.fish);
        jQuery("#statArea #levelBarBack").css("width", (remainExp / needExp * 100) + "%");
    }
}

window.onload = () => {
    new Main().start();
};