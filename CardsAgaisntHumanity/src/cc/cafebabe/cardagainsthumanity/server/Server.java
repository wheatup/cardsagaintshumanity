package cc.cafebabe.cardagainsthumanity.server;

import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

import cc.cafebabe.cardagainsthumanity.consts.TaskType;
import cc.cafebabe.cardagainsthumanity.dao.DAOIniter;
import cc.cafebabe.cardagainsthumanity.game.GameWorld;
import cc.cafebabe.cardagainsthumanity.util.Task;
import cc.cafebabe.cardagainsthumanity.util.TaskHandler;

@ServerEndpoint("/server")
public class Server
{
	public static TaskHandler handler;
	private static Thread handlerThread;
	public static GameWorld gameWorld;
	public static String version = "4";
	static
	{
		gameWorld = new GameWorld();
		DAOIniter.init();
		handler = new TaskHandler();
		handlerThread = new Thread(handler);
		handlerThread.start();
	}
	
	@OnOpen
	public void onOpen(Session session)
	{
		handler.addTask(new Task(session, TaskType.OPEN, null));
	}
	
	@OnError
	public void onError(Throwable e)
	{
		e.printStackTrace();
	}

	@OnClose
	public void onClose(Session session)
	{
		handler.addTask(new Task(session, TaskType.CLOSE, null));
	}

	@OnMessage
	public void onMessage(String message, Session session)
	{
		handler.addTask(new Task(session, TaskType.MESSAGE, message));
	}
}
