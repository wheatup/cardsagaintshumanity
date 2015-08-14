package cc.cafebabe.cardagainsthumanity.util;

import java.io.IOException;
import java.util.Map;
import java.util.Queue;
import java.util.concurrent.ArrayBlockingQueue;

import javax.websocket.Session;

import cc.cafebabe.cardagainsthumanity.entities.Player;
import cc.cafebabe.cardagainsthumanity.game.PlayerContainer;
import cc.cafebabe.cardagainsthumanity.game.Room;
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
	
	//������Ϣ
	private void handleMessage(Session session, String message){
		System.out.println(message);
		if(session == null || !session.isOpen()){
			System.out.println("δ֪session");
			return;
		}
		
		Map<String, Object> map = Json2Map.readFromJson(message);
		if(map == null || map.size() == 0){
			System.out.println("δ֪��Ϣ: " + message);
			return;
		}
		
		String type = (String) map.get("t");
		if(type == null || type.length() == 0){
			System.out.println("δ֪����Ϣ����: " + message);
			return;
		}
		
		if(type.equals("login")){
			handleLoginMessage(session, (String)map.get("username"), (String)map.get("password"), (String)map.get("ip"));
		}else{
			Player player = Server.gameWorld.getPlayer(session);
			if(player != null){
				handlePlayerMessage(player, message);
			}
		}
	}
	
	private void handleLoginMessage(Session session, String username, String password, String ip){
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
		
		Player player = PlayerService.logOrRegPlayer(username, password, ip);
		
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
		}else if(Server.gameWorld.getPlayer(player.getPid()) != null){
			try
			{
				session.getBasicRemote().sendText(Json2Map.toJSONString(Json2Map.BuildKVMessage("logerr", 103)));
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
		if(player.getSession() == null || !player.getSession().isOpen()){
			System.out.println("δ֪session");
			return;
		}
		
		Map<String, Object> map = Json2Map.readFromJson(message);
		if(map == null || map.size() == 0 || !map.containsKey("t")){
			System.out.println("δ֪��Ϣ: " + message);
			return;
		}
		
		String key = (String) map.get("t");
		//���յ�������Ϣ
		if(key.equals("text")){
			String text = (String) map.get("text");
			if(text == null || text.length() == 0 || text.length() > 200) return;
			PlayerContainer container = player.getContainer();
			if(container == null) return;
			container.broadcastMessage(Json2Map.BuildTextMessage(player.getPid(), text));
		}
		//���յ�����������Ϣ
		else if(key.equals("createroom")){
			int code = Server.gameWorld.getLobby().createRoom();
			if(code == -1){
				player.sendMessage(Json2Map.BuildFlagMessage("toomanyroom"));
			}else{
				Room room = Server.gameWorld.getLobby().getRoom(code);
				if(room != null){
					int rcode = room.sendPlayerInRoom(player);
					if(rcode != 2){
						Server.gameWorld.getLobby().removePlayerFromLobby(player);
					}
				}
			}
		}
		//���յ����뷿����Ϣ
		else if(key.equals("enterroom")){
			String idraw = (String) map.get("id");
			int id = -1;
			try{id = Integer.parseInt(idraw);}catch(Exception e){}
			if(id == -1) return;
			Room room = Server.gameWorld.getLobby().getRoom(id);
			if(room != null){
				int rcode = room.sendPlayerInRoom(player);
				if(rcode != 2){
					Server.gameWorld.getLobby().removePlayerFromLobby(player);
				}
			}
		}
		//���յ����ش�����Ϣ
		else if(key.equals("returnlobby")){
			int roomid = player.getRoomNumber();
			if(player.getRoomNumber() > 0){
				Room room = Server.gameWorld.getLobby().getRoom(roomid);
				if(room != null){
					room.removePlayerFromRoom(player);
					Server.gameWorld.getLobby().sendPlayerInLobby(player);
				}
			}
		}
		//�����л���λ��Ϣ
		else if(key.equals("switch")){
			int roomid = player.getRoomNumber();
			if(player.getRoomNumber() > 0){
				Room room = Server.gameWorld.getLobby().getRoom(roomid);
				if(room != null){
					String idraw = (String) map.get("place");
					int id = -1;
					try{id = Integer.parseInt(idraw);}catch(Exception e){}
					if(id == -1) return;
					room.switchPlayerPlace(player, id);
				}
			}
		}
	}
	
	public void addTask(Task task){
		synchronized (tasks) {
			tasks.add(task);
		}
	}
}
