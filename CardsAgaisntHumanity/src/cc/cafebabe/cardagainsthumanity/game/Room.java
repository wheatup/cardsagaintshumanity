package cc.cafebabe.cardagainsthumanity.game;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import cc.cafebabe.cardagainsthumanity.entities.Player;
import cc.cafebabe.cardagainsthumanity.server.Server;
import cc.cafebabe.cardagainsthumanity.service.CardsService;
import cc.cafebabe.cardagainsthumanity.util.HashMapArray;
import cc.cafebabe.cardagainsthumanity.util.Json2Map;

public class Room extends PlayerContainer{
	public static final int MAX_PLAYER = 8;
	public static final int MAX_SPECTATOR = 16;
	
	private List<Player> orderedPlayer;
	
	private int id;
	private static int gameid = 0;
	private String name;
	private String password;
	private Round round;
	private SpectateArea spectateArea;
	private Player host;
	private int[] cardpacks;
	
	public Room(int id){
		spectateArea = new SpectateArea(this);
		this.id = id;
		this.name = "默认房间";
		this.orderedPlayer = new ArrayList<Player>();
		this.password = "";
	}
	
	public Room(int id, String name, String password, int[] cardpacks){
		spectateArea = new SpectateArea(this);
		this.id = id;
		this.name = name;
		this.password = password;
		this.cardpacks = cardpacks;
		this.orderedPlayer = new ArrayList<Player>();
	}
	
	public int getId() {return id;}
	public void setId(int id) {this.id = id;}
	public String getPassword(){return password;}
	public void setPassword(String password){this.password = password;}
	public Round getRound(){return round;}
	public void setRound(Round round){this.round = round;}
	public String getName() {return name;}
	public void setName(String name) {this.name = name;}
	public Player getHost() {return host;}
	public void setHost(Player host) {
		if(this.host != null){
			this.host.sendMessage(Json2Map.BuildFlagMessage("unhost"));
		}
		
		this.host = host;
		if(host != null){
			host.sendMessage(Json2Map.BuildFlagMessage("host"));
		}
	}
	public int[] getCardpacks() {return cardpacks;}
	public void setCardpacks(int[] cardpacks) {this.cardpacks = cardpacks;}
	
	public void broadcastMessage(String message){
		super.broadcastMessage(message);
		spectateArea.broadcastMessage(message);
	}
	
	public void broadcastMessage(Map<String , Object> message){
		super.broadcastMessage(message);
		//spectateArea.broadcastMessage(message);
	}
	
	public void broadcastMessageExceptSomeone(Map<String, Object> message, Player player){
		super.broadcastMessageExceptSomeone(message, player);
		spectateArea.broadcastMessageExceptSomeone(message, player);
	}
	
	public void broadcastMessageExceptSomeone(String message, Player player){
		super.broadcastMessageExceptSomeone(message, player);
		spectateArea.broadcastMessageExceptSomeone(message, player);
	}
	
	public void broadcastMessageToRound(String message){
		if(round != null)
			round.broadcastMessage(message);
	}
	
	public void broadcastMessageToRound(Map<String, Object> message){
		if(round != null)
			round.broadcastMessage(message);
	}
	
	/**
	 * 
	 * @param player
	 * @return 0:进入玩家 1:进入旁观 2:房间人满
	 */
	public int sendPlayerInRoom(Player player){
		if(players.size() < MAX_PLAYER){
			player.setContainer(this);
			addPlayer(player);
			this.orderedPlayer.add(player);
			player.sendMessage(Json2Map.buildRoomInfo(this));
			player.setRoomNumber(id);
			broadcastMessage(Json2Map.buildPlayerEnterInfo(player, false));
			if(players.size() == 1){
				setHost(player);
			}
			Server.gameWorld.getLobby().broadcastMessage(buildRoomShortInfo());
			return 0;
		} else if(spectateArea.players.size() < MAX_SPECTATOR){
			player.setContainer(this);
			spectateArea.addPlayer(player);
			player.sendMessage(Json2Map.buildRoomInfo(this));
			player.setRoomNumber(id);
			broadcastMessage(Json2Map.buildPlayerEnterInfo(player, true));
			Server.gameWorld.getLobby().broadcastMessage(buildRoomShortInfo());
			return 1;
		} else {
			return 2;
		}
	}
	
	public HashMapArray buildSpectatorsInfo(){
		return spectateArea.buildPlayersInfo();
	}
	
	public void removePlayerFromRoom(Player player){
		removePlayer(player);
		broadcastMessage(Json2Map.buildPlayerLeaveInfo(player.getPid()));
		orderedPlayer.remove(player);
		spectateArea.removePlayerFromSpectator(player);
		if(round != null)
			round.removeOnePlayer(player);
		
		if(player == host){
			if(orderedPlayer.size() > 0)
				setHost(orderedPlayer.get(0));
			else
				setHost(null);
		}
		
		if(this.players.size() == 0 && this.spectateArea.players.size() == 0){
			Server.gameWorld.getLobby().destroyRoom(id);
		}else{
			Server.gameWorld.getLobby().broadcastMessage(buildRoomShortInfo());
		}
	}
	
	public void switchPlayerPlace(Player player, int place){
		if(place == 0){
			if(!spectateArea.players.containsValue(player) || players.containsValue(player)){
				return;
			}
			if(players.size() < MAX_PLAYER){
				spectateArea.removePlayer(player);
				addPlayer(player);
				orderedPlayer.add(player);
				if(host == null)
					setHost(player);
				broadcastMessage(Json2Map.buildPlayerSwitchInfo(player.getPid(), place));
			}
		}else if(place == 1){
			if(!players.containsValue(player) || spectateArea.players.containsValue(player)){
				return;
			}
			
			if(spectateArea.players.size() < MAX_SPECTATOR){
				broadcastMessage(Json2Map.buildPlayerSwitchInfo(player.getPid(), place));
				removePlayer(player);
				orderedPlayer.remove(player);
				spectateArea.addPlayer(player);
				if(getRound() != null){
					getRound().removeOnePlayer(player);
				}
				if(host == player){
					if(orderedPlayer.size() > 0)
						setHost(orderedPlayer.get(0));
					else
						setHost(null);
				}
				player.setContainer(this);
			}
		}
		
		Server.gameWorld.getLobby().broadcastMessage(buildRoomShortInfo());
	}
	
	public HashMapArray buildPlayersInfo(){
		HashMapArray arr = new HashMapArray();
		int len = orderedPlayer.size();
		for(int i = 0; i < len; i++){
			Player p = orderedPlayer.get(i);
			if(p != null)
				arr.addMap(p.buildPlayerInfo());
		}
		return arr;
	}
	
	public Map<String, Object> buildRoomShortInfo(){
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("t", "sri");
		map.put("id", id);
		map.put("name", name);
		map.put("pw", password);
		map.put("pc", players.size());
		map.put("sc", spectateArea.players.size());
		map.put("state", getRound() == null ? 0 : getRound().getState());
		String cardpacks = "";
		if(getCardpacks() != null){
			for(int i : getCardpacks()){
				cardpacks+=CardsService.cardpacks.get(i).getPackid() + ",";
			}
			cardpacks = cardpacks.substring(0, cardpacks.length() - 1);
		}
		map.put("cp", cardpacks);
		return map;
	}
	
	public void startGame(){
		gameid++;
		this.round = new Round(this, this.cardpacks, gameid);
		for(int i = 0; i < orderedPlayer.size(); i++){
			this.round.addOnePlayer(orderedPlayer.get(i));
		}
		this.round.start();
	}
}
