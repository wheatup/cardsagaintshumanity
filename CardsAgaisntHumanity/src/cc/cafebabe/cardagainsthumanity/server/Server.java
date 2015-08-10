package cc.cafebabe.cardagainsthumanity.server;

import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

import cc.cafebabe.cardagainsthumanity.dao.ServerIniter;

@ServerEndpoint("/server")
public class Server
{
	static
	{
		ServerIniter.init();
	}
	
	@OnOpen
	public void onOpen(Session session)
	{
		
	}
	
	@OnError
	public void onError(Throwable e)
	{
		e.printStackTrace();
	}

	@OnClose
	public void onClose(Session session)
	{
		
	}

	@OnMessage
	public void onMessage(String message, Session session)
	{
		
	}
}
