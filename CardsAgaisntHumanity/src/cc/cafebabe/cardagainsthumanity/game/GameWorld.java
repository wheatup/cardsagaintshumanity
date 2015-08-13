package cc.cafebabe.cardagainsthumanity.game;

import cc.cafebabe.cardagainsthumanity.entities.Player;
import cc.cafebabe.cardagainsthumanity.util.Json2Map;

public class GameWorld extends PlayerContainer{
	public static final int MAX_PLAYER = 200;
	private Lobby lobby;
	public Lobby getLobby() {
		return lobby;
	}
	public void setLobby(Lobby lobby) {
		this.lobby = lobby;
	}
	
	public GameWorld(){
		lobby = new Lobby();
	}
	
	public void sendPlayerInWorld(Player player){
		addPlayer(player);
		player.sendMessage(Json2Map.toJSONString(Json2Map.buildMyInfo(player)));
		getLobby().sendPlayerInLobby(player);
	}
	
	public void removePlayerFromWorld(Player player){
		if(player.getRoomNumber() == 0){
			lobby.removePlayerFromLobby(player);
		}else{
			Room room = lobby.getRoom(player.getRoomNumber());
			if(room != null){
				room.removePlayerFromRoom(player);
			}
		}
		removePlayer(player);
		System.out.println("ÓÃ»§ÍË³ö:" + player.getName());
	}
	
	public int getPlayerCount(){
		return players.size();
	}
	
	public boolean isFull(){
		return getPlayerCount() >= MAX_PLAYER;
	}
}
