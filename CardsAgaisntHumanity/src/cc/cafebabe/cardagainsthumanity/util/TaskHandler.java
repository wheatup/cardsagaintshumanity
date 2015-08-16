package cc.cafebabe.cardagainsthumanity.util;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Queue;
import java.util.concurrent.ArrayBlockingQueue;

import javax.websocket.Session;

import cc.cafebabe.cardagainsthumanity.entities.BlackCard;
import cc.cafebabe.cardagainsthumanity.entities.Player;
import cc.cafebabe.cardagainsthumanity.game.GameWorld;
import cc.cafebabe.cardagainsthumanity.game.PlayerContainer;
import cc.cafebabe.cardagainsthumanity.game.Room;
import cc.cafebabe.cardagainsthumanity.game.Round;
import cc.cafebabe.cardagainsthumanity.server.Server;
import cc.cafebabe.cardagainsthumanity.service.CardsService;
import cc.cafebabe.cardagainsthumanity.service.PlayerService;
import cc.cafebabe.cardagainsthumanity.service.SugService;

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
		}else if(player.getState() == 1){
			try
			{
				session.getBasicRemote().sendText(Json2Map.toJSONString(Json2Map.BuildKVMessage("logerr", 104)));
			}
			catch(IOException e)
			{
				e.printStackTrace();
			}
			return;
		}else if(Server.gameWorld.getPlayerCount() >= GameWorld.MAX_PLAYER){
			if(player.getState() != 2){
				try
				{
					session.getBasicRemote().sendText(Json2Map.toJSONString(Json2Map.BuildKVMessage("logerr", 105)));
				}
				catch(IOException e)
				{
					e.printStackTrace();
				}
				return;
			}
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
			if(text.startsWith("/")){
				handlePlayerCommand(player, text.substring(1).split("\\s"));
			}else{
				container.broadcastMessage(Json2Map.BuildTextMessage(player.getPid(), text));
			}
		}
		//���յ�����������Ϣ
		else if(key.equals("createroom")){
			int level = 0;
			String name = "Ĭ�Ϸ���";
			String password = "";
			int[] packs = {1};
			
			try{
				level = Integer.parseInt((String)map.get("lv"));
				name = (String) map.get("name");
				password = (String) map.get("pw");
				String[] packsRaw = ((String) map.get("cp")).split(",");
				List<Integer> tempPacks = new ArrayList<Integer>();
				
				for(int i = 0; i < packsRaw.length; i++){
					int id = Integer.parseInt(packsRaw[i]);
					if(CardsService.cardpacks.get(id).getNeedLevel() <= level){
						tempPacks.add(id);
					}
				}
				
				packs = new int[tempPacks.size()];
				for(int i = 0; i < tempPacks.size(); i++){
					packs[i] = tempPacks.get(i);
				}
				
				System.out.println(tempPacks.size());
			}catch(Exception e){
				e.printStackTrace();
			}
			
			
			int code = Server.gameWorld.getLobby().createRoom(name, password, packs);
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
		//���ܴ���������Ϣ
		else if(key.equals("createcard")){
			String rawCardType = (String) map.get("cardType");
			String rawCardPack = (String) map.get("cardPack");
			String text = (String) map.get("text");
			int cardType = -1;
			int cardPack = -1;
			try{
				cardType = Integer.parseInt(rawCardType);
				cardPack = Integer.parseInt(rawCardPack);
			}catch(Exception e){}
			if((cardType != 0 && cardType != 1) || text == null || text.length() == 0 || text.length() > 200 || !CardsService.cardpacks.containsKey(cardPack)){
				player.sendMessage(Json2Map.buildCardSendedInfo(0, 0, 0, 0));
				return;
			}
			
			String[] cards = text.split("\\|");
			if(cards.length == 0){
				player.sendMessage(Json2Map.buildCardSendedInfo(0, 0, 0, 0));
				return;
			}
			
			int total = cards.length;
			int success = 0;
			int repeat = 0;
			int illegal = 0;
			
			if(cardType == 0){
				for(String s : cards){
					int blanks = Misc.getSubstringCount(s, BlackCard.BLANK_SUP);
					if(blanks == 0 || blanks > 3){
						illegal++;
						continue;
					}

					if(CardsService.addBlackCard(player.getPid(), s, cardPack)){
						success++;
					}else{
						repeat++;
					}
				}
			}else{
				for(String s : cards){
					if(CardsService.addWhiteCard(player.getPid(), s, cardPack)){
						success++;
					}else{
						repeat++;
					}
				}
			}
			
			player.sendMessage(Json2Map.buildCardSendedInfo(total, success, repeat, illegal));
		}
		//���ܽ�����Ϣ
		else if(key.equals("sug")){
			String text = (String) map.get("text");
			if(text != null && text.length() > 0){
				SugService.AddSug(player.getPid(), text);
			}
		}
		//���������Ͽ�����Ϣ
		else if(key.equals("pendover")){
			if(player.getState() != 2) return;
			
			String approve = (String) map.get("ap");
			String reject = (String) map.get("re");
			
			int[] apcids = {};
			int[] recids = {};
			
			try{
				String[] apcidsRaw = approve.split(",");
				String[] recidsRaw = reject.split(",");
				apcids = new int[apcidsRaw.length];
				for(int i = 0; i < apcidsRaw.length; i++){
					apcids[i] = Integer.parseInt(apcidsRaw[i]);
				}
				recids = new int[recidsRaw.length];
				for(int i = 0; i < recidsRaw.length; i++){
					recids[i] = Integer.parseInt(recidsRaw[i]);
				}
			}catch(Exception e){
				e.printStackTrace();
			}
			
			CardsService.approveCards(apcids);
			CardsService.rejectCards(recids);
			CardsService.loadAllCards();
		}
		//���ܸ��ķ���������Ϣ
		else if(key.equals("setroom")){
			if(player.getRoomNumber() <= 0){
				return;
			}
			
			Room room = Server.gameWorld.getLobby().getRoom(player.getRoomNumber());
			if(room == null){
				return;
			}
			
			int level = 0;
			String name = "Ĭ�Ϸ���";
			String password = "";
			int[] packs = {1};
			
			try{
				level = Integer.parseInt((String)map.get("lv"));
				name = (String) map.get("name");
				password = (String) map.get("pw");
				String[] packsRaw = ((String) map.get("cp")).split(",");
				List<Integer> tempPacks = new ArrayList<Integer>();
				
				for(int i = 0; i < packsRaw.length; i++){
					int id = Integer.parseInt(packsRaw[i]);
					if(CardsService.cardpacks.get(id).getNeedLevel() <= level){
						tempPacks.add(id);
					}
				}
				
				packs = new int[tempPacks.size()];
				for(int i = 0; i < tempPacks.size(); i++){
					packs[i] = tempPacks.get(i);
				}
				
				System.out.println(tempPacks.size());
			}catch(Exception e){
				e.printStackTrace();
			}
			
			
			room.setName(name);
			room.setPassword(password);
			if(room.getRound() == null || room.getRound().getState() == Round.STATE_IDLE){
				room.setCardpacks(packs);
			}
			
			room.broadcastMessage(room.buildRoomShortInfo());
			Server.gameWorld.getLobby().broadcastMessage(room.buildRoomShortInfo());
		}
	}
	
	public void addTask(Task task){
		synchronized (tasks) {
			tasks.add(task);
		}
	}
	
	public void handlePlayerCommand(Player player, String[] texts){
		if(texts == null || texts.length == 0){
			player.sendMessage(Json2Map.BuildFlagMessage("uc"));
		}
		
		String command = texts[0];
		if("changepassword".equals(command)){
			if(texts.length != 3){
				player.sendMessage(Json2Map.BuildTextMessage("�÷���/changepassword ������ ������"));
				return;
			}
			
			String oldPassword = texts[1];
			String newPassword = texts[2];
			
			if(!player.getPassword().equals(oldPassword)){
				player.sendMessage(Json2Map.BuildTextMessage("��������������������ʧ�ܣ�"));
			}else if(newPassword.length() < 4){
				player.sendMessage(Json2Map.BuildTextMessage("������̫�̣�����4λ��"));
			}else if(newPassword.length() > 20){
				player.sendMessage(Json2Map.BuildTextMessage("������̫�������20λ��"));
			}else{
				player.setPassword(newPassword);
				player.savePlayerData();
				player.sendMessage(Json2Map.BuildTextMessage("�����޸ĳɹ����´���ʹ���������¼��"));
			}
		}else if("ping".equals(command)){
			player.sendMessage(Json2Map.BuildTextMessage("pong"));
		}else if("help".equals(command)){
			player.sendMessage(Json2Map.BuildTextMessage("���ް�����~"));
		}else if("color".equals(command)){
			player.sendMessage(Json2Map.BuildTextMessage("����450���뻻��ɫ��"));
		}else if("suicide".equals(command)){
			player.sendMessage(Json2Map.BuildTextMessage("�Ҳ��Ц����"));
		}else if("where".equals(command)){
			if(texts.length != 2){
				player.sendMessage(Json2Map.BuildTextMessage("�÷���/where �����"));
				return;
			}
			String name = texts[1];
			Player p = Server.gameWorld.getPlayer(name);
			if(p == null){
				player.sendMessage(Json2Map.BuildTextMessage(name + " �����ߣ�"));
			}else if(p.getRoomNumber() == 0){
				player.sendMessage(Json2Map.BuildTextMessage(name + " ���ڴ�����"));
			}else{
				player.sendMessage(Json2Map.BuildTextMessage(name + " ��" + p.getRoomNumber() + "�ŷ���"));
			}
		}
		
		
		//����Ա����
		else if("pend".equals(command)){
			if(player.getState() != 2)
				player.sendMessage(Json2Map.BuildFlagMessage("nc"));
			else{
				player.sendMessage(Json2Map.buildPendingInfo());
			}
		}else if("op".equals(command)){
			if(player.getState() != 2)
				player.sendMessage(Json2Map.BuildFlagMessage("nc"));
			else{
				if(texts.length != 2 || texts[1].length() == 0){
					player.sendMessage(Json2Map.BuildTextMessage("�÷���/op �����"));
					return;
				}
				
				String name = texts[1];
				PlayerService.opPlayer(name);
				player.sendMessage(Json2Map.BuildTextMessage("�ѽ����������ΪOP��"));
				Player p = Server.gameWorld.getPlayer(name);
				if(p != null){
					p.setState(2);
					p.sendMessage(Json2Map.buildMyInfo(p));
					p.sendMessage(Json2Map.BuildTextMessage("���ѱ�" + player.getName() + "����ΪOP��"));
				}
			}
		}else if("deop".equals(command)){
			if(player.getState() != 2)
				player.sendMessage(Json2Map.BuildFlagMessage("nc"));
			else{
				if(texts.length != 2 || texts[1].length() == 0){
					player.sendMessage(Json2Map.BuildTextMessage("�÷���/deop �����"));
					return;
				}
				
				String name = texts[1];
				PlayerService.opPlayer(name);
				player.sendMessage(Json2Map.BuildTextMessage("��ȡ�������OP��"));
				Player p = Server.gameWorld.getPlayer(name);
				if(p != null){
					p.setState(0);
					p.sendMessage(Json2Map.buildMyInfo(p));
					p.sendMessage(Json2Map.BuildTextMessage("���ѱ�" + player.getName() + "ȡ��OP��"));
				}
			}
		}else if("ban".equals(command)){
			if(player.getState() != 2)
				player.sendMessage(Json2Map.BuildFlagMessage("nc"));
			else{
				if(texts.length != 2 || texts[1].length() == 0){
					player.sendMessage(Json2Map.BuildTextMessage("�÷���/ban �����"));
				}else{
					String name = texts[1];
					PlayerService.banPlayer(name);
					player.sendMessage(Json2Map.BuildTextMessage("��ban����ң�"));
					Player p = Server.gameWorld.getPlayer(name);
					if(p != null){
						p.setState(1);
						p.sendMessage(Json2Map.BuildFlagMessage("ban"));
					}
				}
			}
		}else if("unban".equals(command)){
			if(player.getState() != 2)
				player.sendMessage(Json2Map.BuildFlagMessage("nc"));
			else{
				String name = texts[1];
				PlayerService.unbanPlayer(name);
				player.sendMessage(Json2Map.BuildTextMessage("��ȡ��ban����ң�"));
			}
		}else if("kick".equals(command)){
			if(player.getState() != 2)
				player.sendMessage(Json2Map.BuildFlagMessage("nc"));
			else{
				if(texts.length != 2 || texts[1].length() == 0){
					player.sendMessage(Json2Map.BuildTextMessage("�÷���/kick �����"));
				}else{
					String name = texts[1];
					
					Player p = Server.gameWorld.getPlayer(name);
					if(p == null){
						player.sendMessage(Json2Map.BuildTextMessage("����Ҳ����ڻ����ߣ�"));
						return;
					}else{
						
						player.sendMessage(Json2Map.BuildTextMessage("�ѽ�������߳���Ϸ��"));
						p.sendMessage(Json2Map.BuildFlagMessage("kick"));
						Server.gameWorld.removePlayerFromWorld(p);
					}
				}
			}
		}else if("refresh".equals(command)){
			if(player.getState() != 2)
				player.sendMessage(Json2Map.BuildFlagMessage("nc"));
			else{
				Server.gameWorld.broadcastMessage(Json2Map.BuildFlagMessage("quit"));
			}
		}else if("addpack".equals(command)){
			if(player.getState() != 2)
				player.sendMessage(Json2Map.BuildFlagMessage("nc"));
			else{
				if(texts.length != 3 || texts[1].length() == 0){
					player.sendMessage(Json2Map.BuildTextMessage("�÷���/addpack ������ ����ȼ�"));
				}else{
					String name = texts[1];
					String levelRaw = texts[2];
					int level = 0;
					try{
						level = Integer.parseInt(levelRaw);
					}catch(Exception e){
						player.sendMessage(Json2Map.BuildTextMessage("�÷���/addpack ������ ����ȼ�"));
					}
					
					CardsService.addCardPack(name, level);
					CardsService.loadAllCards();
					player.sendMessage(Json2Map.BuildTextMessage("��ӿ����ɹ���"));
				}
			}
		}else if("delpack".equals(command)){
			if(player.getState() != 2)
				player.sendMessage(Json2Map.BuildFlagMessage("nc"));
			else{
				if(texts.length != 2 || texts[1].length() == 0){
					player.sendMessage(Json2Map.BuildTextMessage("�÷���/delpack ������"));
				}else{
					String name = texts[1];
					CardsService.delCardPack(name);
					CardsService.loadAllCards();
					player.sendMessage(Json2Map.BuildTextMessage("ɾ�������ɹ���"));
				}
			}
		}else if("setexp".equals(command)){
			if(player.getState() != 2)
				player.sendMessage(Json2Map.BuildFlagMessage("nc"));
			else{
				if(texts.length != 3 || texts[1].length() == 0){
					player.sendMessage(Json2Map.BuildTextMessage("�÷���/setexp ����� ����"));
				}else{
					String name = texts[1];
					String levelRaw = texts[2];
					int level = 0;
					try{
						level = Integer.parseInt(levelRaw);
					}catch(Exception e){
						player.sendMessage(Json2Map.BuildTextMessage("�÷���/setexp ����� ����"));
					}
					
					Player p = Server.gameWorld.getPlayer(name);
					if(p != null){
						p.getGameData().setExp(level);
						p.saveGameData();
						p.sendMessage(Json2Map.BuildTextMessage("���ľ��鱻����Ա " + player.getName() + " ����Ϊ:" + level));
						p.sendMessage(Json2Map.buildMyInfo(p));
						player.sendMessage(Json2Map.BuildTextMessage("���ѽ� " + name + " �ľ���ֵ����Ϊ:" + level));
					}else{
						player.sendMessage(Json2Map.BuildTextMessage("����Ҳ����ߣ�"));
					}
				}
			}
		}
		
		
		else{
			player.sendMessage(Json2Map.BuildFlagMessage("uc"));
		}
	}
}
