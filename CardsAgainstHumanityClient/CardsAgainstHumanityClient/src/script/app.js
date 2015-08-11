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
var Server = (function () {
    function Server() {
        var _this = this;
        Server.instance = this;
        this.socket = new WebSocket(GameSettings.Server);
        this.socket.onopen = function (evt) { _this.onOpen(evt); };
        this.socket.onclose = function (evt) { _this.onClose(evt); };
        this.socket.onmessage = function (evt) { _this.onMessage(evt); };
        this.socket.onerror = function (evt) { _this.onError(evt); };
    }
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
    Server.prototype.send = function (data) {
        if (GameSettings.debugMode)
            console.log('发送消息: ' + data);
        this.socket.send(data);
    };
    return Server;
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
    State[State["LOBBY"] = 1] = "LOBBY";
    State[State["PLAYING"] = 2] = "PLAYING";
})(State || (State = {}));
var Signal = (function () {
    function Signal() {
    }
    Signal.ServerInfo = "serverinfo";
    return Signal;
})();
var Main = (function () {
    function Main() {
    }
    Main.prototype.start = function () {
        this.loginState = new LoginState();
        this.loginState.start();
    };
    return Main;
})();
var LoginState = (function () {
    function LoginState() {
        this.ass = "ass";
    }
    LoginState.prototype.start = function () {
        this.bindEvents();
        Main.server = new Server();
        Main.state = State.CONNECTING;
        this.showLoginPage();
    };
    LoginState.prototype.bindEvents = function () {
        MyEvent.bind(Signal.ServerInfo, this.onCanLogin, this);
    };
    LoginState.prototype.showLoginPage = function () {
        jQuery("#loginPage").show();
    };
    LoginState.prototype.onCanLogin = function (data, thisObject) {
    };
    return LoginState;
})();
window.onload = function () {
    new Main().start();
};
//# sourceMappingURL=app.js.map