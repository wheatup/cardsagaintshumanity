package cc.cafebabe.cardagainsthumanity.util;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Queue;
import java.util.Set;
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
	private static final int QUEUE_SIZE = 8192;
	
	public TaskHandler(){
		this.tasks = new ArrayBlockingQueue<Task>(QUEUE_SIZE);
	}
	
	@Override
	public void run() {
		this.running = true;
		while(running){
			while(!tasks.isEmpty()){
				try{
				handleTask(tasks.poll());
				}catch(Exception e){e.printStackTrace();}
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
		case TIMER:
			handleTimer(task.getMessage());
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
			System.out.println("未知session");
			return;
		}
		
		Map<String, Object> map = Json2Map.readFromJson(message);
		if(map == null || map.size() == 0 || !map.containsKey("t")){
			System.out.println("未知消息: " + message);
			return;
		}
		
		String key = (String) map.get("t");
		//接收到文字消息
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
		//接收到创建房间消息
		else if(key.equals("createroom")){
			int level = 0;
			String name = "默认房间";
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
		//接收到进入房间消息
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
		//接收到返回大厅消息
		else if(key.equals("returnlobby")){
			int roomid = player.getRoomNumber();
			if(player.getRoomNumber() > 0){
				Room room = Server.gameWorld.getLobby().getRoom(roomid);
				if(room != null){
					room.removePlayerFromRoom(player);
					Server.gameWorld.getLobby().sendPlayerInLobby(player);
				}
			}else{
				Server.gameWorld.getLobby().sendPlayerInLobby(player);
			}
		}
		//接收切换座位消息
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
		//接受创建卡牌消息
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
		//接受建议消息
		else if(key.equals("sug")){
			String text = (String) map.get("text");
			if(text != null && text.length() > 0){
				SugService.AddSug(player.getPid(), text);
			}
		}
		//接受审核完毕卡牌消息
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
		//接受更改房间设置消息
		else if(key.equals("setroom")){
			if(player.getRoomNumber() <= 0){
				return;
			}
			
			Room room = Server.gameWorld.getLobby().getRoom(player.getRoomNumber());
			if(room == null){
				return;
			}
			
			int level = 0;
			String name = "默认房间";
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
		//接受房主踢出玩家消息
		else if(key.equals("hostkick")){
			if(player.getRoomNumber() <= 0){
				player.sendMessage(Json2Map.BuildTextMessage("获取房间错误！"));
				return;
			}
			Room r = Server.gameWorld.getLobby().getRoom(player.getRoomNumber());
			if(r == null){
				player.sendMessage(Json2Map.BuildTextMessage("获取房间错误！"));
				return;
			}
			
			if(r.getHost() != player){
				player.sendMessage(Json2Map.BuildTextMessage("只有房主才可以踢人！"));
				return;
			}
			
			int pid = -1;
			try{
				pid = Integer.parseInt((String)map.get("pid"));
			}catch(Exception e){
				e.printStackTrace();
			}
			
			if(pid == -1){
				player.sendMessage(Json2Map.BuildTextMessage("错误的玩家！"));
				return;
			}
			
			Player target = Server.gameWorld.getPlayer(pid);
			if(target == null){
				player.sendMessage(Json2Map.BuildTextMessage("该玩家不在线！"));
				return;
			}
			
			if(target.getRoomNumber() != player.getRoomNumber()){
				player.sendMessage(Json2Map.BuildTextMessage("该玩家与你不在同一个房间！"));
				return;
			}
			
			r.removePlayerFromRoom(target);
			Server.gameWorld.getLobby().sendPlayerInLobby(target);
			target.sendMessage(Json2Map.BuildKVMessage("kicked", "host"));
		}
		//接受房主开始游戏消息
		else if(key.equals("startgame")){
			if(player.getRoomNumber() <= 0){
				return;
			}
			
			Room room = Server.gameWorld.getLobby().getRoom(player.getRoomNumber());
			if(room == null){
				return;
			}
			
			if(room.getHost() != player){
				return;
			}
			
			if(room.getRound() != null && room.getRound().getState() != Round.STATE_IDLE){
				player.sendMessage(Json2Map.BuildTextMessage("游戏已经开始了！"));
				return;
			}
			
			room.startGame();
		}
		//接受出牌消息
		else if(key.equals("pick")){
			if(player.getRoomNumber() <= 0){
				return;
			}
			
			Room room = Server.gameWorld.getLobby().getRoom(player.getRoomNumber());
			if(room == null){
				return;
			}
			
			if(room.getRound() == null || room.getRound().getState() != Round.STATE_PICKING){
				return;
			}
			
			if(room.getRound().getCzar() == player){
				return;
			}
			
			int round = 0;
			try{
				round = Integer.parseInt((String)map.get("r"));
			}catch(Exception e){
				e.printStackTrace();
			}
			
			if(room.getRound().getId() != round){
				player.sendMessage(Json2Map.BuildTextMessage("操作已失效！"));
				return;
			}
			
			int[] cards = new int[0];
			try{
				String[] rawids = ((String)map.get("c")).split(",");
				cards = new int[rawids.length];
				for(int i = 0; i < cards.length; i++){
					cards[i] = Integer.parseInt(rawids[i]);
				}
			}catch(Exception e){e.printStackTrace();}
			
			room.getRound().playerPick(player, cards);
		}
		//接受让玩家获胜消息
		else if(key.equals("letwin")){
			if(player.getRoomNumber() <= 0){
				return;
			}
			
			Room room = Server.gameWorld.getLobby().getRoom(player.getRoomNumber());
			if(room == null){
				return;
			}
			
			if(room.getRound() == null || room.getRound().getState() != Round.STATE_JUDGING){
				return;
			}
			
			if(room.getRound().getCzar() != player){
				return;
			}
			
			int round = 0;
			int[] cids = {0};
			String cidsraw = "";
			
			try{
				round = Integer.parseInt((String)map.get("r"));
				cidsraw = (String)map.get("cid");
				String[] cidsraws = cidsraw.split(",");
				cids = new int[cidsraws.length];
				for(int i = 0; i < cids.length; i++){
					cids[i] = Integer.parseInt(cidsraws[i]);
				}
			}catch(Exception e){e.printStackTrace();}
			
			if(room.getRound().getId() != round){
				player.sendMessage(Json2Map.BuildTextMessage("操作已失效！"));
				return;
			}
			
			room.getRound().letwin(cids, cidsraw);
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
				player.sendMessage(Json2Map.BuildTextMessage("用法：/changepassword 旧密码 新密码"));
				return;
			}
			
			String oldPassword = texts[1];
			String newPassword = texts[2];
			
			if(!player.getPassword().equals(oldPassword)){
				player.sendMessage(Json2Map.BuildTextMessage("旧密码输入错误，密码更改失败！"));
			}else if(newPassword.length() < 4){
				player.sendMessage(Json2Map.BuildTextMessage("新密码太短，至少4位！"));
			}else if(newPassword.length() > 20){
				player.sendMessage(Json2Map.BuildTextMessage("新密码太长，最多20位！"));
			}else{
				player.setPassword(newPassword);
				player.savePlayerData();
				player.sendMessage(Json2Map.BuildTextMessage("密码修改成功！下次请使用新密码登录！"));
			}
		}else if("ping".equals(command)){
			player.sendMessage(Json2Map.BuildTextMessage("pong"));
		}else if("help".equals(command)){
			player.sendMessage(Json2Map.BuildTextMessage("暂无帮助喵~"));
		}else if("color".equals(command)){
			player.sendMessage(Json2Map.BuildTextMessage("不交450还想换颜色？"));
		}else if("suicide".equals(command)){
			player.sendMessage(Json2Map.BuildTextMessage("我差点笑出声"));
		}else if("where".equals(command)){
			if(texts.length != 2){
				player.sendMessage(Json2Map.BuildTextMessage("用法：/where 玩家名"));
				return;
			}
			String name = texts[1];
			Player p = Server.gameWorld.getPlayer(name);
			if(p == null){
				player.sendMessage(Json2Map.BuildTextMessage(name + " 不在线！"));
			}else if(p.getRoomNumber() == 0){
				player.sendMessage(Json2Map.BuildTextMessage(name + " 正在大厅。"));
			}else{
				player.sendMessage(Json2Map.BuildTextMessage(name + " 在" + p.getRoomNumber() + "号房。"));
			}
		}
		
		
		//管理员命令
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
					player.sendMessage(Json2Map.BuildTextMessage("用法：/op 玩家名"));
					return;
				}
				
				String name = texts[1];
				PlayerService.opPlayer(name);
				player.sendMessage(Json2Map.BuildTextMessage("已将该玩家设置为OP！"));
				Player p = Server.gameWorld.getPlayer(name);
				if(p != null){
					p.setState(2);
					p.sendMessage(Json2Map.buildMyInfo(p));
					p.sendMessage(Json2Map.BuildTextMessage("您已被" + player.getName() + "设置为OP！"));
				}
			}
		}else if("deop".equals(command)){
			if(player.getState() != 2)
				player.sendMessage(Json2Map.BuildFlagMessage("nc"));
			else{
				if(texts.length != 2 || texts[1].length() == 0){
					player.sendMessage(Json2Map.BuildTextMessage("用法：/deop 玩家名"));
					return;
				}
				
				String name = texts[1];
				PlayerService.opPlayer(name);
				player.sendMessage(Json2Map.BuildTextMessage("已取消该玩家OP！"));
				Player p = Server.gameWorld.getPlayer(name);
				if(p != null){
					p.setState(0);
					p.sendMessage(Json2Map.buildMyInfo(p));
					p.sendMessage(Json2Map.BuildTextMessage("您已被" + player.getName() + "取消OP！"));
				}
			}
		}else if("ban".equals(command)){
			if(player.getState() != 2)
				player.sendMessage(Json2Map.BuildFlagMessage("nc"));
			else{
				if(texts.length != 2 || texts[1].length() == 0){
					player.sendMessage(Json2Map.BuildTextMessage("用法：/ban 玩家名"));
				}else{
					String name = texts[1];
					PlayerService.banPlayer(name);
					player.sendMessage(Json2Map.BuildTextMessage("已ban该玩家！"));
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
				player.sendMessage(Json2Map.BuildTextMessage("已取消ban该玩家！"));
			}
		}else if("kick".equals(command)){
			if(player.getState() != 2)
				player.sendMessage(Json2Map.BuildFlagMessage("nc"));
			else{
				if(texts.length != 2 || texts[1].length() == 0){
					player.sendMessage(Json2Map.BuildTextMessage("用法：/kick 玩家名"));
				}else{
					String name = texts[1];
					
					Player p = Server.gameWorld.getPlayer(name);
					if(p == null){
						player.sendMessage(Json2Map.BuildTextMessage("该玩家不存在或不在线！"));
						return;
					}else{
						
						player.sendMessage(Json2Map.BuildTextMessage("已将该玩家踢出游戏！"));
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
					player.sendMessage(Json2Map.BuildTextMessage("用法：/addpack 卡包名 需求等级"));
				}else{
					String name = texts[1];
					String levelRaw = texts[2];
					int level = 0;
					try{
						level = Integer.parseInt(levelRaw);
					}catch(Exception e){
						player.sendMessage(Json2Map.BuildTextMessage("用法：/addpack 卡包名 需求等级"));
					}
					
					CardsService.addCardPack(name, level);
					CardsService.loadAllCards();
					player.sendMessage(Json2Map.BuildTextMessage("添加卡包成功！"));
				}
			}
		}else if("delpack".equals(command)){
			if(player.getState() != 2)
				player.sendMessage(Json2Map.BuildFlagMessage("nc"));
			else{
				if(texts.length != 2 || texts[1].length() == 0){
					player.sendMessage(Json2Map.BuildTextMessage("用法：/delpack 卡包名"));
				}else{
					String name = texts[1];
					CardsService.delCardPack(name);
					CardsService.loadAllCards();
					player.sendMessage(Json2Map.BuildTextMessage("删除卡包成功！"));
				}
			}
		}else if("setexp".equals(command)){
			if(player.getState() != 2)
				player.sendMessage(Json2Map.BuildFlagMessage("nc"));
			else{
				if(texts.length != 3 || texts[1].length() == 0){
					player.sendMessage(Json2Map.BuildTextMessage("用法：/setexp 玩家名 经验"));
				}else{
					String name = texts[1];
					String levelRaw = texts[2];
					int level = 0;
					try{
						level = Integer.parseInt(levelRaw);
					}catch(Exception e){
						player.sendMessage(Json2Map.BuildTextMessage("用法：/setexp 玩家名 经验"));
					}
					
					Player p = Server.gameWorld.getPlayer(name);
					if(p != null){
						p.getGameData().setExp(level);
						p.saveGameData();
						p.sendMessage(Json2Map.BuildTextMessage("您的经验被管理员 " + player.getName() + " 设置为:" + level));
						p.sendMessage(Json2Map.buildMyInfo(p));
						player.sendMessage(Json2Map.BuildTextMessage("您已将 " + name + " 的经验值设置为:" + level));
					}else{
	     					player.sendMessage(Json2Map.BuildTextMessage("该玩家不在线！"));
					}
				}
			}
		}else if("br".equals(command)){
			if(player.getState() != 2)
				player.sendMessage(Json2Map.BuildFlagMessage("nc"));
			else{
				if(texts.length != 2 || texts[1].length() == 0){
					player.sendMessage(Json2Map.BuildTextMessage("用法：/br 公告"));
				}else{
					String text = texts[1];
					Server.gameWorld.broadcastMessage(Json2Map.buildWinnerBroadCast(text));
				}
			}
		}
		
		
		else{
			player.sendMessage(Json2Map.BuildFlagMessage("uc"));
		}
	}
	
	private void handleTimer(String message){
		Map<String, Object> map = Json2Map.readFromJson(message);
		if(map == null || map.size() == 0){
			System.out.println("未知消息: " + message);
			return;
		}
		
		String type = (String) map.get("t");
		
		if(type.equals("check")){
			Set<Player> players = new HashSet<Player>();
			for(Player p : Server.gameWorld.getPlayers().values()){
				if(!p.getSession().isOpen()){
					players.add(p);
				}
			}
			
			int i = 0;
			for(Player p: players){
				i++;
				Server.gameWorld.removePlayerFromWorld(p);
			}
			System.out.println("清理了" + i + "个用户。");
			return;
		}
		
		int roomid = 0;
		int rnd = 0;
		int gid = 0;
		
		try{
			roomid = Integer.parseInt((String) map.get("room"));
			rnd = Integer.parseInt((String) map.get("rnd"));
			gid = Integer.parseInt((String) map.get("gid"));
		}catch(Exception e){}
		
		Room r = Server.gameWorld.getLobby().getRoom(roomid);
		
		if(r == null)
			return;
		
		if(r.getRound() == null)
			return;
		
		if(r.getRound().getState() == Round.STATE_IDLE){
			return;
		}
		
		if(type.equals("judge")){
			r.getRound().rushToJudge(rnd, gid);
		}else if(type.equals("rank")){
			r.getRound().rushToRank(rnd, gid);
		}else if(type.equals("pick")){
			r.getRound().rushToPick(rnd, gid);
		}
	}
}
