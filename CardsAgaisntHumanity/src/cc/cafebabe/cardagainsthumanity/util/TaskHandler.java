package cc.cafebabe.cardagainsthumanity.util;

import java.io.IOException;
import java.util.Map;
import java.util.Queue;
import java.util.concurrent.ArrayBlockingQueue;

import javax.websocket.Session;

import cc.cafebabe.cardagainsthumanity.entities.Player;
import cc.cafebabe.cardagainsthumanity.server.Server;
import cc.cafebabe.cardagainsthumanity.service.PlayerService;

public class TaskHandler implements Runnable {
	private boolean running = false;
	private Queue<Task> tasks;
	private static final int QUEUE_SIZE = 4096;
	
	public TaskHandler(){
		this.tasks = new ArrayBlockingQueue<Task>(QUEUE_SIZE);
	}

	@Override
	public void run() {
		this.running = true;
		while(running){
			while(!tasks.isEmpty()){
				handleTask(tasks.poll());
			}
			try {
				Thread.sleep(1);
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
		}
	}
	
	public void shutdown(){
		running = false;
	}
	
	private void handleTask(Task task){
		switch(task.getTaskType()){
		case OPEN:
			try {
				task.getSession().getBasicRemote().sendText(Json2Map.toJSONString(Json2Map.BuildServerInfo()));
			} catch (IOException e) {
				e.printStackTrace();
			}
			break;
		case CLOSE:
			Player player = Server.gameWorld.getPlayer(task.getSession());
			if(player != null){
				Server.gameWorld.removePlayerFromWorld(player);
			}
			break;
		case MESSAGE:
			handleMessage(task.getSession(), task.getMessage());
			break;
		}
	}
	
	//处理消息
	private void handleMessage(Session session, String message){
		System.out.println(message);
		if(session == null || !session.isOpen()){
			System.out.println("未知session");
			return;
		}
		
		Map<String, Object> map = Json2Map.readFromJson(message);
		if(map == null || map.size() == 0){
			System.out.println("未知消息: " + message);
			return;
		}
		
		String type = (String) map.get("t");
		if(type == null || type.length() == 0){
			System.out.println("未知的消息类型: " + message);
			return;
		}
		
		if(type.equals("login")){
			handleLoginMessage(session, (String)map.get("username"), (String)map.get("password"));
		}else{
			Player player = Server.gameWorld.getPlayer(session);
			if(player != null){
				handlePlayerMessage(player, message);
			}
		}
	}
	
	private void handleLoginMessage(Session session, String username, String password){
		if(username == null || Misc.getStringLen(username) < 2 || Misc.getStringLen(username) > 20 ||
				password == null || password.length() < 4 || password.length() > 20){
			try
			{
				session.getBasicRemote().sendText(Json2Map.toJSONString(Json2Map.BuildKVMessage("logerr", 101)));
			}
			catch(IOException e)
			{
				e.printStackTrace();
			}
			return;
		}
		
		Player player = PlayerService.logOrRegPlayer(username, password);
		
		if(player == null){
			try
			{
				session.getBasicRemote().sendText(Json2Map.toJSONString(Json2Map.BuildKVMessage("logerr", 102)));
			}
			catch(IOException e)
			{
				e.printStackTrace();
			}
			return;
		}
		player.setSession(session);
		Server.gameWorld.sendPlayerInWorld(player);
	}
	
	private void handlePlayerMessage(Player player, String message){
		
	}
	
	public void addTask(Task task){
		synchronized (tasks) {
			tasks.add(task);
		}
	}
}
