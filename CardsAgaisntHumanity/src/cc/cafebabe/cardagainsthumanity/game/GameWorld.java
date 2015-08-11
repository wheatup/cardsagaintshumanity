package cc.cafebabe.cardagainsthumanity.game;

import cc.cafebabe.cardagainsthumanity.entities.Player;

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
		getLobby().sendPlayerInLobby(player);
	}
	
	public int getPlayerCount(){
		return players.size();
	}
	
	public boolean isFull(){
		return getPlayerCount() >= MAX_PLAYER;
	}
}
